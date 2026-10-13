import { describe, expect, it } from 'vitest';
import {
  compareWeeklyPipeline,
  distinctCustomersVisited,
  fourToOneCoverage,
  managerCommercialBuckets,
  outstandingBacklogAmount,
  stalledOpportunity,
  weightedGrossMargin,
} from './manager-dashboard.metrics';

describe('Edgar manager dashboard commercial rules', () => {
  it('uses 20/40 as pipeline, 60/80 as full-value forecast, and 90 as backlog', () => {
    const base = {
      grossProfit: null,
      expectedBillingDate: null,
      lastStageChangedAt: null,
    };
    expect(
      managerCommercialBuckets([
        { ...base, id: '20', amount: 100, stageCode: '20', status: 'OPEN' },
        { ...base, id: '40', amount: 200, stageCode: '40', status: 'OPEN' },
        { ...base, id: '60', amount: 300, stageCode: '60', status: 'OPEN' },
        { ...base, id: '80', amount: 400, stageCode: '80', status: 'OPEN' },
        { ...base, id: '90', amount: 500, stageCode: '90', status: 'WON' },
        { ...base, id: 'lost', amount: 900, stageCode: '40', status: 'LOST' },
      ]),
    ).toEqual({ pipeline: 300, forecast: 700, backlog: 500, forecastAndBacklog: 1200 });
  });

  it('weights aggregate margin and does not treat unknown margin as zero', () => {
    expect(
      weightedGrossMargin([
        { amount: 100, grossProfit: 10 },
        { amount: 300, grossProfit: 60 },
        { amount: 900, grossProfit: null },
      ]),
    ).toEqual({ amount: 70, percent: 17.5, knownRevenue: 400 });
    expect(weightedGrossMargin([{ amount: 100, grossProfit: null }]).percent).toBeNull();
  });

  it('expresses the 4:1 working rule from an explicit base', () => {
    expect(fourToOneCoverage({ baseAmount: 500_000, availablePipeline: 2_000_000 })).toMatchObject({
      requiredPipeline: 2_000_000,
      status: 'SUFFICIENT',
    });
    expect(fourToOneCoverage({ baseAmount: 250_000, availablePipeline: 900_000 })).toMatchObject({
      requiredPipeline: 1_000_000,
      difference: -100_000,
      status: 'INSUFFICIENT',
    });
    expect(fourToOneCoverage({ baseAmount: null, availablePipeline: 1 })).toMatchObject({
      requiredPipeline: null,
      status: 'NOT_EVALUABLE',
    });
  });

  it('applies a strict pipeline drop threshold and explains 40 to 60 progression', () => {
    const previous = [
      { opportunityId: 'a', amount: 100, stageCode: '40', status: 'OPEN' as const },
    ];
    const exactTen = compareWeeklyPipeline(
      [{ opportunityId: 'a', amount: 90, stageCode: '40', status: 'OPEN' }],
      previous,
    );
    expect(exactTen.droppedMoreThanTenPercent).toBe(false);
    expect(
      compareWeeklyPipeline(
        [{ opportunityId: 'a', amount: 88, stageCode: '40', status: 'OPEN' }],
        previous,
      ).droppedMoreThanTenPercent,
    ).toBe(true);
    const advanced = compareWeeklyPipeline(
      [{ opportunityId: 'a', amount: 100, stageCode: '60', status: 'OPEN' }],
      previous,
    );
    expect(advanced.movements).toEqual([
      { opportunityId: 'a', kind: 'ADVANCED_TO_FORECAST', delta: -100 },
    ]);
    expect(compareWeeklyPipeline(null, previous).status).toBe('NO_COMPARISON');
  });

  it('keeps partial billing outstanding and counts distinct visited customers', () => {
    expect(outstandingBacklogAmount({ opportunityAmount: 1_000, billedAmount: 350 })).toBe(650);
    expect(
      distinctCustomersVisited([{ customerId: 'a' }, { customerId: 'a' }, { customerId: 'b' }]),
    ).toBe(2);
  });

  it('only flags open opportunities with reliable stage dates as stalled', () => {
    const now = new Date('2026-10-08T00:00:00Z');
    expect(
      stalledOpportunity({
        status: 'OPEN',
        stageCode: '40',
        lastStageChangedAt: new Date('2026-09-01T00:00:00Z'),
        thresholdDays: 30,
        now,
      }),
    ).toMatchObject({ evaluable: true, stalled: true, daysWithoutProgress: 37 });
    expect(
      stalledOpportunity({
        status: 'LOST',
        stageCode: '40',
        lastStageChangedAt: new Date('2026-09-01T00:00:00Z'),
        thresholdDays: 30,
        now,
      }).stalled,
    ).toBe(false);
    expect(
      stalledOpportunity({
        status: 'OPEN',
        stageCode: '40',
        lastStageChangedAt: null,
        thresholdDays: 30,
        now,
      }),
    ).toEqual({ evaluable: false, stalled: false, daysWithoutProgress: null });
  });
});
