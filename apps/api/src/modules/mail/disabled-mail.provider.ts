import { Injectable } from '@nestjs/common';
import type { MailProvider } from './mail-provider';

@Injectable()
export class DisabledMailProvider implements MailProvider {
  async sendPasswordReset(): Promise<void> {
    throw new Error('SMTP delivery is not configured');
  }
}
