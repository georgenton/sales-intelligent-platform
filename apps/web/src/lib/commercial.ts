import type { AppLocale } from '@/i18n/config';

const canonicalStageLabels: Record<string, Record<AppLocale, string>> = {
  '20': { en: 'Prospecting', es: 'Prospección' },
  '40': { en: 'Qualification', es: 'Calificación' },
  '60': { en: 'Proposal', es: 'Propuesta' },
  '80': { en: 'Negotiation', es: 'Negociación' },
  '90': { en: 'Closing', es: 'Cierre' },
  '100': { en: 'Billed', es: 'Facturado' },
};

export function commercialStageLabel(
  stage: { code: string; name: string },
  locale: AppLocale,
): string {
  return canonicalStageLabels[stage.code]?.[locale] ?? stage.name;
}
