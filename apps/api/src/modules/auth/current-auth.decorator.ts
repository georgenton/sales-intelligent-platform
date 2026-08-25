import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest, RequestAuth } from '../../common/http/authenticated-request';

export const CurrentAuth = createParamDecorator(
  (_data: unknown, context: ExecutionContext): RequestAuth => {
    return context.switchToHttp().getRequest<AuthenticatedRequest>().auth;
  },
);
