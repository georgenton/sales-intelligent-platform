import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CsrfGuard } from './csrf.guard';
import { LocalIdentityProvider } from './local-identity.provider';
import { SessionGuard } from './session.guard';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [AuditModule, MailModule],
  controllers: [AuthController],
  providers: [AuthService, LocalIdentityProvider, SessionGuard, CsrfGuard],
  exports: [SessionGuard, CsrfGuard],
})
export class AuthModule {}
