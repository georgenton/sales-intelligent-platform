import { Injectable } from '@nestjs/common';
import type { AiProvider, ManagerBriefContext } from './ai-provider';

@Injectable()
export class MockAiProvider implements AiProvider {
  async generateManagerBrief(context: ManagerBriefContext): Promise<string> {
    const attainment = context.quota ? ((context.billed / context.quota) * 100).toFixed(1) : '0.0';
    const riskMessage = context.topRisks.length
      ? `${context.topRisks.length} priority risks require review, led by ${context.topRisks[0]?.title}.`
      : 'No priority risks are currently open.';
    return `${context.period}: billed attainment is ${attainment}% with ${context.forecast.toLocaleString('en-US')} in forecast and a ${context.gap.toLocaleString('en-US')} gap to quota. ${riskMessage}`;
  }
}
