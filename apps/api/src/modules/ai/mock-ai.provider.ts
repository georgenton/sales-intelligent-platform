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
    const attainment =
      context.quota !== null && context.quota > 0
        ? formatter.format((context.billed / context.quota) * 100)
        : null;
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
    const positionMessage =
      attainment !== null && context.projectedGap !== null
        ? locale === 'es'
          ? `${context.period}: el cumplimiento facturado es ${attainment} %, con ${formatter.format(context.openForecast)} en el pronóstico abierto y una brecha proyectada de ${formatter.format(context.projectedGap)} para la cuota.`
          : `${context.period}: billed attainment is ${attainment}% with ${formatter.format(context.openForecast)} in open forecast and a ${formatter.format(context.projectedGap)} projected gap to quota.`
        : locale === 'es'
          ? `${context.period}: la cuota no está configurada; el cumplimiento facturado y la brecha proyectada no están disponibles. El pronóstico abierto es ${formatter.format(context.openForecast)}.`
          : `${context.period}: quota is not configured; billed attainment and projected gap are unavailable. Open forecast is ${formatter.format(context.openForecast)}.`;
    return `${positionMessage} ${riskMessage}`;
  }
}
