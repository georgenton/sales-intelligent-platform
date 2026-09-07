import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest, RequestAuth } from '../../common/http/authenticated-request';
import { CsrfGuard } from '../auth/csrf.guard';
import { CurrentAuth } from '../auth/current-auth.decorator';
import { SessionGuard } from '../auth/session.guard';
import { PermissionGuard } from '../authorization/permission.guard';
import { PERMISSIONS } from '../authorization/permissions';
import { RequirePermissions } from '../authorization/require-permissions.decorator';
import { CommercialService } from './commercial.service';
import { UpdateCommercialSettingsDto } from './dto/update-commercial-settings.dto';
import { UpdateCriterionDto } from './dto/update-criterion.dto';
import { UpdateQuotasDto } from './dto/update-quotas.dto';

@ApiTags('commercial')
@Controller('commercial/config')
@UseGuards(SessionGuard, PermissionGuard)
export class CommercialController {
  constructor(private readonly commercial: CommercialService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.TENANT_MANAGE)
  getConfig(@CurrentAuth() auth: RequestAuth) {
    return this.commercial.getConfig(auth);
  }

  @Put('settings')
  @UseGuards(CsrfGuard)
  @RequirePermissions(PERMISSIONS.TENANT_MANAGE)
  updateSettings(
    @CurrentAuth() auth: RequestAuth,
    @Body() input: UpdateCommercialSettingsDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.commercial.updateSettings(auth, input, request.requestId);
  }

  @Put('quotas')
  @UseGuards(CsrfGuard)
  @RequirePermissions(PERMISSIONS.TENANT_MANAGE)
  updateQuotas(
    @CurrentAuth() auth: RequestAuth,
    @Body() input: UpdateQuotasDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.commercial.updateQuotas(auth, input, request.requestId);
  }

  @Put('criteria/:id')
  @UseGuards(CsrfGuard)
  @RequirePermissions(PERMISSIONS.TENANT_MANAGE)
  updateCriterion(
    @CurrentAuth() auth: RequestAuth,
    @Param('id') id: string,
    @Body() input: UpdateCriterionDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.commercial.updateCriterion(auth, id, input, request.requestId);
  }
}
