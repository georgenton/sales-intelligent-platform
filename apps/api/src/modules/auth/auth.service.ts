import { createHash, randomBytes } from 'node:crypto';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { environment } from '../../config/environment';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { LocalIdentityProvider } from './local-identity.provider';
import type { RequestAuth } from '../../common/http/authenticated-request';
import type { IdentityClaims } from './identity-provider';
import { MAIL_PROVIDER, type MailProvider } from '../mail/mail-provider';

export function hashToken(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly identityProvider: LocalIdentityProvider,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    @Inject(MAIL_PROVIDER) private readonly mail: MailProvider,
  ) {}

  async login(email: string, password: string, requestId: string, ip?: string, userAgent?: string) {
    let claims: IdentityClaims;
    try {
      claims = await this.identityProvider.authenticate(email, password);
    } catch (error) {
      const knownUser = await this.prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
        select: {
          id: true,
          memberships: { where: { status: 'ACTIVE' }, select: { tenantId: true }, take: 1 },
        },
      });
      const membership = knownUser?.memberships[0];
      if (knownUser && membership) {
        await this.audit.record({
          tenantId: membership.tenantId,
          actorId: knownUser.id,
          action: 'LOGIN_FAILED',
          entity: 'User',
          entityId: knownUser.id,
          requestId,
          metadata: { reason: 'INVALID_CREDENTIALS' },
        });
      }
      throw error;
    }
    const sessionToken = randomBytes(32).toString('base64url');
    const csrfToken = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + environment().SESSION_TTL_HOURS * 60 * 60_000);
    const session = await this.prisma.session.create({
      data: {
        userId: claims.userId,
        tenantId: claims.tenantId,
        membershipId: claims.membershipId,
        tokenHash: hashToken(sessionToken),
        csrfTokenHash: hashToken(csrfToken),
        expiresAt,
        ipAddress: ip,
        userAgent: userAgent?.slice(0, 500),
      },
    });

    await this.audit.record({
      tenantId: claims.tenantId,
      actorId: claims.userId,
      action: 'LOGIN_SUCCESS',
      entity: 'Session',
      entityId: session.id,
      requestId,
    });

    return { claims, sessionToken, csrfToken, expiresAt };
  }

  async profile(auth: RequestAuth) {
    return this.prisma.withTenant(auth.activeTenantId, async (transaction) => {
      const membership = await transaction.tenantMembership.findFirstOrThrow({
        where: {
          id: auth.membershipId,
          tenantId: auth.activeTenantId,
          userId: auth.userId,
          status: 'ACTIVE',
        },
        include: { user: true, tenant: true },
      });
      const entitlements = await transaction.tenantFeatureEntitlement.findMany({
        where: { tenantId: auth.activeTenantId, enabled: true },
        select: { featureKey: true },
      });
      return {
        user: { id: membership.user.id, name: membership.user.name, email: membership.user.email },
        tenant: {
          id: membership.tenant.id,
          name: membership.tenant.name,
          slug: membership.tenant.slug,
        },
        role: membership.role,
        permissions: [...auth.permissions],
        capabilities: entitlements.map((entitlement) => entitlement.featureKey),
      };
    });
  }

  async logout(auth: RequestAuth, requestId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { id: auth.sessionId, userId: auth.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await this.audit.record({
      tenantId: auth.activeTenantId,
      actorId: auth.userId,
      action: 'LOGOUT',
      entity: 'Session',
      entityId: auth.sessionId,
      requestId,
    });
  }

  async forgotPassword(email: string, requestId: string): Promise<{ accepted: true }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        localCredential: { select: { userId: true } },
        memberships: { where: { status: 'ACTIVE' }, select: { tenantId: true } },
      },
    });
    if (!user?.localCredential || user.status !== 'ACTIVE' || !user.memberships.length) {
      return { accepted: true };
    }

    const token = randomBytes(32).toString('base64url');
    const config = environment();
    const expiresAt = new Date(Date.now() + config.PASSWORD_RESET_TTL_MINUTES * 60_000);
    await this.prisma.$transaction(async (transaction) => {
      await transaction.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      await transaction.passwordResetToken.create({
        data: { userId: user.id, tokenHash: hashToken(token), expiresAt },
      });
    });

    let delivered = true;
    try {
      const resetUrl = new URL('/reset-password', config.APP_URL);
      resetUrl.searchParams.set('token', token);
      await this.mail.sendPasswordReset({
        to: normalizedEmail,
        resetUrl: resetUrl.toString(),
        expiresInMinutes: config.PASSWORD_RESET_TTL_MINUTES,
      });
    } catch {
      delivered = false;
    }
    for (const membership of user.memberships) {
      await this.audit.record({
        tenantId: membership.tenantId,
        actorId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        entity: 'User',
        entityId: user.id,
        requestId,
        metadata: { deliveryConfigured: delivered },
      });
    }
    return { accepted: true };
  }

  async resetPassword(
    token: string,
    newPassword: string,
    requestId: string,
  ): Promise<{ reset: true }> {
    const now = new Date();
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(token) },
      include: {
        user: {
          include: {
            memberships: { where: { status: 'ACTIVE' }, select: { tenantId: true } },
          },
        },
      },
    });
    if (!record || record.usedAt || record.expiresAt <= now || record.user.status !== 'ACTIVE') {
      throw new BadRequestException({
        code: 'PASSWORD_RESET_TOKEN_INVALID',
        message: 'The reset link is invalid or expired',
      });
    }
    const passwordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: 19_456,
      timeCost: 2,
      parallelism: 1,
    });
    await this.prisma.$transaction(async (transaction) => {
      const claimed = await transaction.passwordResetToken.updateMany({
        where: { id: record.id, usedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now },
      });
      if (claimed.count !== 1) {
        throw new BadRequestException({
          code: 'PASSWORD_RESET_TOKEN_INVALID',
          message: 'The reset link is invalid or expired',
        });
      }
      await transaction.localCredential.update({
        where: { userId: record.userId },
        data: { passwordHash, passwordChangedAt: now },
      });
      await transaction.user.update({
        where: { id: record.userId },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
      await transaction.session.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: now },
      });
      await transaction.passwordResetToken.updateMany({
        where: { userId: record.userId, usedAt: null },
        data: { usedAt: now },
      });
    });
    for (const membership of record.user.memberships) {
      await this.audit.record({
        tenantId: membership.tenantId,
        actorId: record.userId,
        action: 'PASSWORD_RESET_COMPLETED',
        entity: 'User',
        entityId: record.userId,
        requestId,
        metadata: { sessionsRevoked: true },
      });
    }
    return { reset: true };
  }
}
