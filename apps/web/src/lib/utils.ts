import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { AppLocale } from '@/i18n/config';
import {
  formatRelativeTime as formatRelativeTimeValue,
  formatSalesCurrency,
  formatSalesDate,
  formatSalesNumber,
} from '@/i18n/formatters';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = 'USD', locale: AppLocale = 'en'): string {
  return formatSalesCurrency(value, locale, currency);
}

export function formatDateOnly(value: string | Date, locale: AppLocale = 'en'): string {
  return formatSalesDate(value, locale);
}

export function formatDateTime(value: string | Date, locale: AppLocale = 'en'): string {
  return formatSalesDate(value, locale, { dateStyle: 'medium', timeStyle: 'short' });
}

export function formatNumber(
  value: number,
  locale: AppLocale = 'en',
  options?: Intl.NumberFormatOptions,
): string {
  return formatSalesNumber(value, locale, options);
}

export function formatRelativeTime(
  value: string | Date,
  locale: AppLocale = 'en',
  now?: Date,
): string {
  return formatRelativeTimeValue(value, locale, now);
}

export function csrfToken(): string {
  if (typeof document === 'undefined') return '';
  return decodeURIComponent(
    document.cookie
      .split('; ')
      .find((entry) => entry.startsWith('sip_csrf='))
      ?.split('=')[1] ?? '',
  );
}
