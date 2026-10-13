import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest, RequestAuth } from '../../common/http/authenticated-request';
import { CsrfGuard } from '../auth/csrf.guard';
import { CurrentAuth } from '../auth/current-auth.decorator';
import { SessionGuard } from '../auth/session.guard';
import { PermissionGuard } from '../authorization/permission.guard';
import { PERMISSIONS } from '../authorization/permissions';
import { RequirePermissions } from '../authorization/require-permissions.decorator';
import { CreateCustomerVisitDto } from './dto/create-customer-visit.dto';
import { LinkCustomerVisitDto } from './dto/link-customer-visit.dto';
import { VisitsService } from './visits.service';

@ApiTags('visits')
@Controller('visits')
@UseGuards(SessionGuard, PermissionGuard, CsrfGuard)
export class VisitsController {
  constructor(private readonly visits: VisitsService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.OPPORTUNITIES_CREATE)
  create(
    @CurrentAuth() auth: RequestAuth,
    @Body() input: CreateCustomerVisitDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.visits.create(auth, input, request.requestId);
  }

  @Patch(':id/opportunity')
  @RequirePermissions(PERMISSIONS.OPPORTUNITIES_CREATE)
  linkOpportunity(
    @CurrentAuth() auth: RequestAuth,
    @Param('id', new ParseUUIDPipe()) visitId: string,
    @Body() input: LinkCustomerVisitDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.visits.linkOpportunity(auth, visitId, input.opportunityId, request.requestId);
  }
}
