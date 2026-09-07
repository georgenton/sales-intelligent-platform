import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest, RequestAuth } from '../../common/http/authenticated-request';
import { CsrfGuard } from '../auth/csrf.guard';
import { CurrentAuth } from '../auth/current-auth.decorator';
import { SessionGuard } from '../auth/session.guard';
import { PermissionGuard } from '../authorization/permission.guard';
import { PERMISSIONS } from '../authorization/permissions';
import { RequirePermissions } from '../authorization/require-permissions.decorator';
import { ForecastService } from './forecast.service';

@ApiTags('forecast')
@Controller('forecast/snapshots')
@UseGuards(SessionGuard, PermissionGuard)
export class ForecastController {
  constructor(private readonly forecast: ForecastService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.FORECAST_READ)
  list(@CurrentAuth() auth: RequestAuth) {
    return this.forecast.list(auth);
  }

  @Get('latest-diff')
  @RequirePermissions(PERMISSIONS.FORECAST_READ)
  latestDiff(@CurrentAuth() auth: RequestAuth) {
    return this.forecast.latestDiff(auth);
  }

  @Post()
  @UseGuards(CsrfGuard)
  @RequirePermissions(PERMISSIONS.FORECAST_MANAGE)
  create(@CurrentAuth() auth: RequestAuth, @Req() request: AuthenticatedRequest) {
    return this.forecast.create(auth, request.requestId);
  }
}
