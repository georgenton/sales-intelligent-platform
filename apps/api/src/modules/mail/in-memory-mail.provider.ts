import { Injectable } from '@nestjs/common';
import type { MailProvider, PasswordResetMail } from './mail-provider';

@Injectable()
export class InMemoryMailProvider implements MailProvider {
  readonly passwordResetMessages: PasswordResetMail[] = [];

  async sendPasswordReset(message: PasswordResetMail): Promise<void> {
    this.passwordResetMessages.push(message);
  }

  clear(): void {
    this.passwordResetMessages.length = 0;
  }
}
