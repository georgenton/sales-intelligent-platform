import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: Math.abs(value) >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDateOnly(value: string | Date): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC' }).format(new Date(value));
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
