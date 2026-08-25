import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { RequestAuth } from '../../common/http/authenticated-request';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CurrentAuth } from '../auth/current-auth.decorator';
import { SessionGuard } from '../auth/session.guard';
import { PermissionGuard } from '../authorization/permission.guard';
import { PERMISSIONS } from '../authorization/permissions';
import { RequirePermissions } from '../authorization/require-permissions.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(SessionGuard, PermissionGuard)
@RequirePermissions(PERMISSIONS.USERS_MANAGE)
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@CurrentAuth() auth: RequestAuth) {
    return this.prisma.withTenant(auth.activeTenantId, (transaction) =>
      transaction.tenantMembership.findMany({
        where: { tenantId: auth.activeTenantId },
        select: {
          id: true,
          role: true,
          status: true,
          createdAt: true,
          user: { select: { id: true, name: true, email: true, status: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
    );
  }
}
