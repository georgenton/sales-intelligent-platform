import { ForecastCategory, OpportunityStatus } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import {
  calculateFinancials,
  commercialStateIssue,
  defaultForecastCategory,
  requiredQualificationGates,
} from './commercial-domain';

describe('commercial opportunity domain', () => {
  it('uses the approved category defaults without deriving every update', () => {
    expect(defaultForecastCategory('20')).toBe(ForecastCategory.PIPELINE);
    expect(defaultForecastCategory('40')).toBe(ForecastCategory.PIPELINE);
    expect(defaultForecastCategory('60')).toBe(ForecastCategory.BEST_CASE);
    expect(defaultForecastCategory('80')).toBe(ForecastCategory.COMMIT);
    expect(defaultForecastCategory('100')).toBe(ForecastCategory.CLOSED);
  });

  it('rejects logically impossible stage/category/status combinations', () => {
    expect(
      commercialStateIssue({
        stageCode: '20',
        status: OpportunityStatus.OPEN,
        forecastCategory: ForecastCategory.COMMIT,
      }),
    ).toMatch(/incompatible/);
    expect(
      commercialStateIssue({
        stageCode: '40',
        status: OpportunityStatus.OPEN,
        forecastCategory: ForecastCategory.BEST_CASE,
      }),
    ).toMatch(/incompatible/);
    expect(
      commercialStateIssue({
        stageCode: '90',
        status: OpportunityStatus.OPEN,
        forecastCategory: ForecastCategory.CLOSED,
      }),
    ).toMatch(/WON/);
    expect(
      commercialStateIssue({
        stageCode: '80',
        status: OpportunityStatus.LOST,
        forecastCategory: ForecastCategory.COMMIT,
      }),
    ).toBeNull();
  });

  it('calculates GM consistently and rejects conflicting financial truths', () => {
    expect(calculateFinancials({ estimatedAmount: 200, grossMarginPercent: 12.5 })).toEqual({
      grossProfit: 25,
      grossMarginPercent: 12.5,
    });
    expect(() =>
      calculateFinancials({ estimatedAmount: 200, grossMarginPercent: 12.5, grossProfit: 30 }),
    ).toThrow(/inconsistent/);
  });

  it('requires both qualification gates for negotiation and terminal stages', () => {
    expect(requiredQualificationGates('40')).toEqual([]);
    expect(requiredQualificationGates('60')).toEqual(['60']);
    expect(requiredQualificationGates('80')).toEqual(['60', '80']);
    expect(requiredQualificationGates('100')).toEqual(['60', '80']);
  });
});
