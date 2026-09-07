import { describe, expect, it } from 'vitest';
import { canCreateOpportunity, canManageForecast, canUpdateOpportunities } from './permissions';

describe('commercial UI permissions', () => {
  it('derives mutation controls from permissions rather than role labels', () => {
    expect(canCreateOpportunity(['opportunities.create'])).toBe(true);
    expect(canUpdateOpportunities(['opportunities.update.team'])).toBe(true);
    expect(canManageForecast(['forecast.manage'])).toBe(true);
  });

  it('keeps read-only principals free of mutation controls', () => {
    const readOnly = ['opportunities.read.all', 'forecast.read', 'analytics.read'];
    expect(canCreateOpportunity(readOnly)).toBe(false);
    expect(canUpdateOpportunities(readOnly)).toBe(false);
    expect(canManageForecast(readOnly)).toBe(false);
  });
});
