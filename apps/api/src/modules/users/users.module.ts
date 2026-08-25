import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { UsersController } from './users.controller';

@Module({ imports: [AuthModule, AuthorizationModule], controllers: [UsersController] })
export class UsersModule {}
