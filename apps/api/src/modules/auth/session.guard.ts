import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedRequest } from '../../common/http/authenticated-request';
import { PrismaService } from '../../common/prisma/prisma.service';
import { permissionsFor } from '../authorization/permissions';
import { hashToken } from './auth.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const rawToken = request.cookies?.sip_session as string | undefined;
    if (!rawToken) throw new UnauthorizedException();

    const session = await this.prisma.session.findUnique({
      where: { tokenHash: hashToken(rawToken) },
      include: { user: true, tenant: true, membership: true },
    });
    const invalid =
      !session ||
      session.revokedAt !== null ||
      session.expiresAt <= new Date() ||
      session.user.status !== 'ACTIVE' ||
      session.tenant.status !== 'ACTIVE' ||
      session.membership.status !== 'ACTIVE' ||
      session.membership.userId !== session.userId ||
      session.membership.tenantId !== session.tenantId;
    if (invalid || !session) throw new UnauthorizedException();

    request.auth = {
      userId: session.userId,
      activeTenantId: session.tenantId,
      membershipId: session.membershipId,
      role: session.membership.role,
      permissions: permissionsFor(session.membership.role),
      sessionId: session.id,
      csrfTokenHash: session.csrfTokenHash,
    };
    await this.prisma.session.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    });
    return true;
  }
}
