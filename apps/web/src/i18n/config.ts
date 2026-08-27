export const SUPPORTED_LOCALES = ['en', 'es'] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'en';
export const LOCALE_COOKIE = 'sip_locale';
export const APP_TIME_ZONE = 'America/Guayaquil';

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && SUPPORTED_LOCALES.includes(value as AppLocale);
}

export function intlLocale(locale: AppLocale): 'en-US' | 'es-EC' {
  return locale === 'es' ? 'es-EC' : 'en-US';
}
