import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest, RequestAuth } from '../../common/http/authenticated-request';
import { CsrfGuard } from '../auth/csrf.guard';
import { CurrentAuth } from '../auth/current-auth.decorator';
import { SessionGuard } from '../auth/session.guard';
import { PermissionGuard } from '../authorization/permission.guard';
import { UpsertQualificationResponseDto } from './dto/upsert-qualification-response.dto';
import { QualificationService } from './qualification.service';

@ApiTags('qualification')
@Controller('qualification')
@UseGuards(SessionGuard, PermissionGuard)
export class QualificationController {
  constructor(private readonly qualification: QualificationService) {}

  @Get('opportunities/:id')
  detail(@CurrentAuth() auth: RequestAuth, @Param('id') id: string) {
    return this.qualification.detail(auth, id);
  }

  @Put('opportunities/:id/responses')
  @UseGuards(CsrfGuard)
  respond(
    @CurrentAuth() auth: RequestAuth,
    @Param('id') id: string,
    @Body() input: UpsertQualificationResponseDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.qualification.respond(auth, id, input, request.requestId);
  }
}
