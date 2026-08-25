import type { ArgumentsHost } from '@nestjs/common';
import { Catch, HttpException, HttpStatus, type ExceptionFilter } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request & { requestId?: string }>();
    const response = context.getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = exception instanceof HttpException ? exception.getResponse() : undefined;
    const defaultMessage = status === 500 ? 'Internal server error' : 'Request failed';
    const message = this.messageFrom(payload) ?? defaultMessage;
    const code = this.codeFrom(payload) ?? this.statusCode(status);

    response.status(status).json({
      error: { code, message, requestId: request.requestId ?? 'unknown' },
    });
  }

  private messageFrom(payload: unknown): string | undefined {
    if (typeof payload === 'string') return payload;
    if (!payload || typeof payload !== 'object' || !('message' in payload)) return undefined;
    const message = payload.message;
    return Array.isArray(message)
      ? message.join('; ')
      : typeof message === 'string'
        ? message
        : undefined;
  }

  private codeFrom(payload: unknown): string | undefined {
    if (!payload || typeof payload !== 'object' || !('code' in payload)) return undefined;
    return typeof payload.code === 'string' ? payload.code : undefined;
  }

  private statusCode(status: number): string {
    return (
      {
        400: 'VALIDATION_FAILED',
        401: 'AUTHENTICATION_REQUIRED',
        403: 'FORBIDDEN',
        404: 'RESOURCE_NOT_FOUND',
        409: 'CONFLICT',
        429: 'RATE_LIMITED',
      }[status] ?? 'INTERNAL_ERROR'
    );
  }
}
