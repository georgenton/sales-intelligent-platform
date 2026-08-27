import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest, RequestAuth } from '../../common/http/authenticated-request';
import { CsrfGuard } from '../auth/csrf.guard';
import { CurrentAuth } from '../auth/current-auth.decorator';
import { SessionGuard } from '../auth/session.guard';
import { PermissionGuard } from '../authorization/permission.guard';
import { PERMISSIONS } from '../authorization/permissions';
import { RequirePermissions } from '../authorization/require-permissions.decorator';
import { AiService } from './ai.service';

@ApiTags('ai')
@Controller('ai')
@UseGuards(SessionGuard, PermissionGuard)
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('manager-brief')
  @UseGuards(CsrfGuard)
  @RequirePermissions(PERMISSIONS.ANALYTICS_READ)
  managerBrief(@CurrentAuth() auth: RequestAuth, @Req() request: AuthenticatedRequest) {
    const requestedLocale = request.headers['accept-language'];
    const locale =
      typeof requestedLocale === 'string' && requestedLocale.startsWith('es') ? 'es' : 'en';
    return this.ai.managerBrief(auth, request.requestId, locale);
  }
}
