import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import type { AuthenticatedRequest, RequestAuth } from '../../common/http/authenticated-request';
import { environment } from '../../config/environment';
import { AuthService } from './auth.service';
import { CsrfGuard } from './csrf.guard';
import { CurrentAuth } from './current-auth.decorator';
import { LoginDto } from './dto/login.dto';
import { SessionGuard } from './session.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(
    @Body() input: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const requestId = (request as AuthenticatedRequest).requestId;
    const result = await this.authService.login(
      input.email,
      input.password,
      requestId,
      request.ip,
      request.header('user-agent'),
    );
    const secure = environment().NODE_ENV === 'production';
    response.cookie('sip_session', result.sessionToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      expires: result.expiresAt,
    });
    response.cookie('sip_csrf', result.csrfToken, {
      httpOnly: false,
      secure,
      sameSite: 'lax',
      path: '/',
      expires: result.expiresAt,
    });
    return {
      user: { id: result.claims.userId, name: result.claims.name, email: result.claims.email },
      tenant: { id: result.claims.tenantId, name: result.claims.tenantName },
      role: result.claims.role,
    };
  }

  @Get('me')
  @UseGuards(SessionGuard)
  me(@CurrentAuth() auth: RequestAuth) {
    return this.authService.profile(auth);
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(SessionGuard, CsrfGuard)
  async logout(
    @CurrentAuth() auth: RequestAuth,
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.logout(auth, request.requestId);
    response.clearCookie('sip_session', { path: '/' });
    response.clearCookie('sip_csrf', { path: '/' });
  }
}
