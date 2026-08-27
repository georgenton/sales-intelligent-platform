import { Injectable } from '@nestjs/common';
import type { AiProvider, ManagerBriefContext } from './ai-provider';

@Injectable()
export class MockAiProvider implements AiProvider {
  async generateManagerBrief(
    context: ManagerBriefContext,
    locale: 'en' | 'es' = 'en',
  ): Promise<string> {
    const intlLocale = locale === 'es' ? 'es-EC' : 'en-US';
    const formatter = new Intl.NumberFormat(intlLocale, { maximumFractionDigits: 1 });
    const attainment = formatter.format(context.quota ? (context.billed / context.quota) * 100 : 0);
    const riskMessage = context.topRisks.length
      ? locale === 'es'
        ? context.topRisks.length === 1
          ? `1 riesgo prioritario requiere revisión: ${context.topRisks[0]?.title}.`
          : `${context.topRisks.length} riesgos prioritarios requieren revisión; el principal es ${context.topRisks[0]?.title}.`
        : context.topRisks.length === 1
          ? `1 priority risk requires review, led by ${context.topRisks[0]?.title}.`
          : `${context.topRisks.length} priority risks require review, led by ${context.topRisks[0]?.title}.`
      : locale === 'es'
        ? 'No hay riesgos prioritarios abiertos actualmente.'
        : 'No priority risks are currently open.';
    return locale === 'es'
      ? `${context.period}: el cumplimiento facturado es ${attainment} %, con ${formatter.format(context.forecast)} en el pronóstico y una brecha de ${formatter.format(context.gap)} para la cuota. ${riskMessage}`
      : `${context.period}: billed attainment is ${attainment}% with ${formatter.format(context.forecast)} in forecast and a ${formatter.format(context.gap)} gap to quota. ${riskMessage}`;
  }
}
