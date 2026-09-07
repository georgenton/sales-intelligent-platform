import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { environment } from '../../config/environment';
import type { MailProvider, PasswordResetMail } from './mail-provider';

@Injectable()
export class SmtpMailProvider implements MailProvider {
  async sendPasswordReset(message: PasswordResetMail): Promise<void> {
    const config = environment();
    if (!config.SMTP_HOST || !config.SMTP_FROM) throw new Error('SMTP delivery is not configured');
    const transport = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_SECURE,
      ...(config.SMTP_USER && config.SMTP_PASSWORD
        ? { auth: { user: config.SMTP_USER, pass: config.SMTP_PASSWORD } }
        : {}),
    });
    await transport.sendMail({
      from: config.SMTP_FROM,
      to: message.to,
      subject: 'Reset your Sales Intelligence password',
      text: `Use this one-time link within ${message.expiresInMinutes} minutes: ${message.resetUrl}`,
      html: `<p>Use this one-time link within ${message.expiresInMinutes} minutes:</p><p><a href="${message.resetUrl}">Reset password</a></p>`,
    });
  }
}
