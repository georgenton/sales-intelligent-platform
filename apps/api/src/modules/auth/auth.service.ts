import { createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { environment } from '../../config/environment';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { LocalIdentityProvider } from './local-identity.provider';
import type { RequestAuth } from '../../common/http/authenticated-request';
import type { IdentityClaims } from './identity-provider';

export function hashToken(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly identityProvider: LocalIdentityProvider,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
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
      return {
        user: { id: membership.user.id, name: membership.user.name, email: membership.user.email },
        tenant: {
          id: membership.tenant.id,
          name: membership.tenant.name,
          slug: membership.tenant.slug,
        },
        role: membership.role,
        permissions: [...auth.permissions],
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
}
