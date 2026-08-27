import { APP_TIME_ZONE, intlLocale, type AppLocale } from './config';

export function formatSalesCurrency(value: number, locale: AppLocale, currency = 'USD'): string {
  const compact = Math.abs(value) >= 1_000_000;
  return new Intl.NumberFormat(intlLocale(locale), {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 0,
  }).format(value);
}

export function formatSalesNumber(
  value: number,
  locale: AppLocale,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(intlLocale(locale), options).format(value);
}

export function formatSalesDate(
  value: string | Date,
  locale: AppLocale,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: APP_TIME_ZONE,
    ...options,
  }).format(new Date(value));
}

export function formatRelativeTime(
  value: string | Date,
  locale: AppLocale,
  now = new Date(),
): string {
  const deltaSeconds = (new Date(value).getTime() - now.getTime()) / 1_000;
  const absoluteSeconds = Math.abs(deltaSeconds);
  const [amount, unit]: [number, Intl.RelativeTimeFormatUnit] =
    absoluteSeconds < 60
      ? [deltaSeconds, 'second']
      : absoluteSeconds < 3_600
        ? [deltaSeconds / 60, 'minute']
        : absoluteSeconds < 86_400
          ? [deltaSeconds / 3_600, 'hour']
          : [deltaSeconds / 86_400, 'day'];

  return new Intl.RelativeTimeFormat(intlLocale(locale), { numeric: 'auto' }).format(
    Math.round(amount),
    unit,
  );
}
