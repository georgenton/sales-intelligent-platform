import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import pinoHttp from 'pino-http';
import { requestContext } from './common/http/request-context.middleware';
import { PrismaModule } from './common/prisma/prisma.module';
import { environment } from './config/environment';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthorizationModule } from './modules/authorization/authorization.module';
import { HealthModule } from './modules/health/health.module';
import { OpportunitiesModule } from './modules/opportunities/opportunities.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ForecastModule } from './modules/forecast/forecast.module';
import { AiModule } from './modules/ai/ai.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    PrismaModule,
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    AuditModule,
    AuthModule,
    AuthorizationModule,
    HealthModule,
    OpportunitiesModule,
    AlertsModule,
    AnalyticsModule,
    ForecastModule,
    AiModule,
    UsersModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(
        requestContext,
        pinoHttp({
          level: environment().LOG_LEVEL,
          redact: {
            paths: [
              'req.headers.authorization',
              'req.headers.cookie',
              'req.headers.x-csrf-token',
              'req.body.password',
              'res.headers["set-cookie"]',
            ],
            censor: '[REDACTED]',
          },
          customProps: (request) => ({ requestId: (request as { requestId?: string }).requestId }),
        }),
      )
      .forRoutes('*');
  }
}
