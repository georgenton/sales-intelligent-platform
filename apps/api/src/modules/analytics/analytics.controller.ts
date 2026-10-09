import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { RequestAuth } from '../../common/http/authenticated-request';
import { CurrentAuth } from '../auth/current-auth.decorator';
import { SessionGuard } from '../auth/session.guard';
import { PermissionGuard } from '../authorization/permission.guard';
import { PERMISSIONS } from '../authorization/permissions';
import { RequirePermissions } from '../authorization/require-permissions.decorator';
import { AnalyticsService } from './analytics.service';
import { ManagerDashboardService } from './manager-dashboard.service';
import { ManagerDashboardQueryDto } from './dto/manager-dashboard-query.dto';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(SessionGuard, PermissionGuard)
@RequirePermissions(PERMISSIONS.ANALYTICS_READ)
export class AnalyticsController {
  constructor(
    private readonly analytics: AnalyticsService,
    private readonly managerDashboard: ManagerDashboardService,
  ) {}

  @Get('dashboard')
  dashboard(@CurrentAuth() auth: RequestAuth) {
    return this.analytics.dashboard(auth);
  }

  @Get('manager-dashboard')
  manager(@CurrentAuth() auth: RequestAuth, @Query() query: ManagerDashboardQueryDto) {
    return this.managerDashboard.get(auth, query);
  }
}
