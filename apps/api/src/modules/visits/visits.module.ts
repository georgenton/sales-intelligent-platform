import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';

@Module({
  imports: [AuthModule, AuthorizationModule],
  controllers: [VisitsController],
  providers: [VisitsService],
})
export class VisitsModule {}
