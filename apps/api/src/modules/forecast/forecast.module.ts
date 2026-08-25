import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { ForecastController } from './forecast.controller';
import { ForecastService } from './forecast.service';

@Module({
  imports: [AuthModule, AuthorizationModule],
  controllers: [ForecastController],
  providers: [ForecastService],
})
export class ForecastModule {}
