import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { ManagerDashboardService } from './manager-dashboard.service';

@Module({
  imports: [AuthModule, AuthorizationModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, ManagerDashboardService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
