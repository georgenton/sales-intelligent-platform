'use client';

import { Languages } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { setUserLocale } from '@/i18n/actions';
import type { AppLocale } from '@/i18n/config';
import { cn } from '@/lib/utils';

export function LanguageSelector({ className }: { className?: string }) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('common.language');
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label
      className={cn(
        'flex min-h-10 items-center gap-1 rounded-lg border bg-card px-2 text-card-foreground',
        className,
      )}
    >
      <Languages className="size-3.5 text-primary" aria-hidden="true" />
      <span className="sr-only">{t('label')}</span>
      <select
        value={locale}
        disabled={pending}
        aria-label={t('label')}
        aria-busy={pending}
        onChange={(event) => {
          const nextLocale = event.target.value;
          startTransition(async () => {
            await setUserLocale(nextLocale);
            router.refresh();
          });
        }}
        className="h-10 bg-transparent text-xs font-medium outline-none"
      >
        <option value="es">Español</option>
        <option value="en">English</option>
      </select>
    </label>
  );
}
