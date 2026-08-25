import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { AlertsController } from './alerts.controller';

@Module({ imports: [AuthModule, AuthorizationModule], controllers: [AlertsController] })
export class AlertsModule {}
