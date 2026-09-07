export const FEATURE_CATALOG = [
  'CRM_PROCESS_INTELLIGENCE',
  'CHANNEL_CUTOFF_INTELLIGENCE',
  'AI_CONTEXTUAL_REAL',
  'AI_MANAGER_BRIEF',
  'AI_PREDICTIVE',
] as const;

export type TenantFeatureKey = (typeof FEATURE_CATALOG)[number];

export function isTenantFeatureKey(value: string): value is TenantFeatureKey {
  return (FEATURE_CATALOG as readonly string[]).includes(value);
}
