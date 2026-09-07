import { describe, expect, it } from 'vitest';
import { FEATURE_CATALOG, isTenantFeatureKey } from './feature-catalog';

describe('future feature catalog', () => {
  it('keeps the optional catalog intentionally small', () => {
    expect(FEATURE_CATALOG).toHaveLength(5);
    expect(isTenantFeatureKey('AI_CONTEXTUAL_REAL')).toBe(true);
    expect(isTenantFeatureKey('UNKNOWN_FEATURE')).toBe(false);
  });
});
