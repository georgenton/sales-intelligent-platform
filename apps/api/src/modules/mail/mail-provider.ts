export const MAIL_PROVIDER = Symbol('MAIL_PROVIDER');

export interface PasswordResetMail {
  to: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export interface MailProvider {
  sendPasswordReset(message: PasswordResetMail): Promise<void>;
}
