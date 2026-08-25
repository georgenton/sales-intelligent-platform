import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { RequestAuth } from '../../common/http/authenticated-request';
import { CurrentAuth } from '../auth/current-auth.decorator';
import { SessionGuard } from '../auth/session.guard';
import { PermissionGuard } from '../authorization/permission.guard';
import { PERMISSIONS } from '../authorization/permissions';
import { RequirePermissions } from '../authorization/require-permissions.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';

@ApiTags('alerts')
@Controller('alerts')
@UseGuards(SessionGuard, PermissionGuard)
@RequirePermissions(PERMISSIONS.ALERTS_READ)
export class AlertsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@CurrentAuth() auth: RequestAuth) {
    return this.prisma.withTenant(auth.activeTenantId, (transaction) =>
      transaction.alert.findMany({
        where: { tenantId: auth.activeTenantId, resolvedAt: null },
        include: { opportunity: { select: { id: true, title: true } } },
        orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
        take: 100,
      }),
    );
  }
}
