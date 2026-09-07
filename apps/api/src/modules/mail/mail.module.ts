import { Module } from '@nestjs/common';
import { environment } from '../../config/environment';
import { DisabledMailProvider } from './disabled-mail.provider';
import { InMemoryMailProvider } from './in-memory-mail.provider';
import { MAIL_PROVIDER } from './mail-provider';
import { SmtpMailProvider } from './smtp-mail.provider';

@Module({
  providers: [
    InMemoryMailProvider,
    SmtpMailProvider,
    DisabledMailProvider,
    {
      provide: MAIL_PROVIDER,
      inject: [InMemoryMailProvider, SmtpMailProvider, DisabledMailProvider],
      useFactory: (
        memory: InMemoryMailProvider,
        smtp: SmtpMailProvider,
        disabled: DisabledMailProvider,
      ) => {
        const config = environment();
        if (config.SMTP_HOST) return smtp;
        if (config.NODE_ENV === 'test' || config.APP_ENV === 'local') return memory;
        return disabled;
      },
    },
  ],
  exports: [MAIL_PROVIDER, InMemoryMailProvider],
})
export class MailModule {}
