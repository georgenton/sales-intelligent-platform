import { describe, expect, it } from 'vitest';
import type { ManagerBriefContext } from './ai-provider';
import { MockAiProvider } from './mock-ai.provider';

const context: ManagerBriefContext = {
  period: 'Q3 2026',
  quota: 1_000_000,
  billed: 456_000,
  openForecast: 780_000,
  projectedGap: 220_000,
  commit: 500_000,
  backlog: 100_000,
  topRisks: [{ title: 'Renewal', severity: 'HIGH', message: 'Risk' }],
  topOpportunities: [],
  sellerSummary: [],
};

describe('MockAiProvider locale contract', () => {
  it('returns the deterministic manager brief in English', async () => {
    const answer = await new MockAiProvider().generateManagerBrief(context, 'en');
    expect(answer).toContain('billed attainment is 45.6%');
    expect(answer).toContain('1 priority risk requires review');
  });

  it('returns the deterministic manager brief in Spanish', async () => {
    const answer = await new MockAiProvider().generateManagerBrief(context, 'es');
    expect(answer).toContain('el cumplimiento facturado es 45,6 %');
    expect(answer).toContain('1 riesgo prioritario requiere revisión');
  });

  it('does not invent zero attainment or gap when quota is not configured', async () => {
    const answer = await new MockAiProvider().generateManagerBrief(
      { ...context, quota: null, projectedGap: null },
      'en',
    );
    expect(answer).toContain('quota is not configured');
    expect(answer).toContain('billed attainment and projected gap are unavailable');
    expect(answer).not.toContain('attainment is 0');
  });
});
