import { timingSafeEqual } from 'node:crypto';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ForbiddenException, Injectable } from '@nestjs/common';
import type { AuthenticatedRequest } from '../../common/http/authenticated-request';
import { hashToken } from './auth.service';

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.header('x-csrf-token');
    const cookie = request.cookies?.sip_csrf as string | undefined;
    if (
      !header ||
      !cookie ||
      !safeEqual(header, cookie) ||
      !safeEqual(hashToken(header), request.auth.csrfTokenHash)
    ) {
      throw new ForbiddenException({
        code: 'CSRF_VALIDATION_FAILED',
        message: 'CSRF validation failed',
      });
    }
    return true;
  }
}
