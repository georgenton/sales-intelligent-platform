import { Injectable, UnauthorizedException, type OnModuleInit } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { IdentityClaims, IdentityProvider } from './identity-provider';

@Injectable()
export class LocalIdentityProvider implements IdentityProvider, OnModuleInit {
  private dummyHash = '';

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    this.dummyHash = await argon2.hash('timing-protection-only', { type: argon2.argon2id });
  }

  async authenticate(rawEmail: string, password: string): Promise<IdentityClaims> {
    const email = rawEmail.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        localCredential: true,
        memberships: {
          where: { status: 'ACTIVE', tenant: { status: 'ACTIVE' } },
          include: { tenant: true },
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });

    const hash = user?.localCredential?.passwordHash ?? this.dummyHash;
    const validPassword = await argon2.verify(hash, password);
    const membership = user?.memberships[0];
    const locked = Boolean(user?.lockedUntil && user.lockedUntil > new Date());

    if (!user || !membership || !validPassword || user.status !== 'ACTIVE' || locked) {
      if (user && !validPassword) {
        const attempts = user.failedLoginAttempts + 1;
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: attempts,
            lockedUntil: attempts >= 5 ? new Date(Date.now() + 15 * 60_000) : null,
          },
        });
      }
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials',
      });
    }

    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }

    return {
      userId: user.id,
      tenantId: membership.tenantId,
      membershipId: membership.id,
      role: membership.role,
      name: user.name,
      email: user.email,
      tenantName: membership.tenant.name,
    };
  }
}
