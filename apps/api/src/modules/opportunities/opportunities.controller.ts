import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest, RequestAuth } from '../../common/http/authenticated-request';
import { CsrfGuard } from '../auth/csrf.guard';
import { CurrentAuth } from '../auth/current-auth.decorator';
import { SessionGuard } from '../auth/session.guard';
import { PermissionGuard } from '../authorization/permission.guard';
import { PERMISSIONS } from '../authorization/permissions';
import { RequirePermissions } from '../authorization/require-permissions.decorator';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { ListOpportunitiesDto } from './dto/list-opportunities.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { OpportunitiesService } from './opportunities.service';

@ApiTags('opportunities')
@Controller('opportunities')
@UseGuards(SessionGuard, PermissionGuard)
export class OpportunitiesController {
  constructor(private readonly opportunities: OpportunitiesService) {}

  @Get()
  list(@CurrentAuth() auth: RequestAuth, @Query() query: ListOpportunitiesDto) {
    return this.opportunities.list(auth, query);
  }

  @Get('reference-data')
  referenceData(@CurrentAuth() auth: RequestAuth) {
    return this.opportunities.referenceData(auth);
  }

  @Get(':id')
  detail(@CurrentAuth() auth: RequestAuth, @Param('id') id: string) {
    return this.opportunities.detail(auth, id);
  }

  @Post()
  @UseGuards(CsrfGuard)
  @RequirePermissions(PERMISSIONS.OPPORTUNITIES_CREATE)
  create(
    @CurrentAuth() auth: RequestAuth,
    @Body() input: CreateOpportunityDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.opportunities.create(auth, input, request.requestId);
  }

  @Patch(':id')
  @UseGuards(CsrfGuard)
  update(
    @CurrentAuth() auth: RequestAuth,
    @Param('id') id: string,
    @Body() input: UpdateOpportunityDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.opportunities.update(auth, id, input, request.requestId);
  }
}
