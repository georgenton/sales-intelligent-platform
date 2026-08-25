import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { MockAiProvider } from './mock-ai.provider';

@Module({
  imports: [AnalyticsModule, AuthModule, AuthorizationModule],
  controllers: [AiController],
  providers: [AiService, MockAiProvider],
})
export class AiModule {}
