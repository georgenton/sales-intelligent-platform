const OPPORTUNITY_UPDATE_PERMISSIONS = [
  'opportunities.update.all',
  'opportunities.update.team',
  'opportunities.update.own',
] as const;

export function hasPermission(permissions: readonly string[], permission: string) {
  return permissions.includes(permission);
}

export function canCreateOpportunity(permissions: readonly string[]) {
  return hasPermission(permissions, 'opportunities.create');
}

export function canUpdateOpportunities(permissions: readonly string[]) {
  return OPPORTUNITY_UPDATE_PERMISSIONS.some((permission) => permissions.includes(permission));
}

export function canManageForecast(permissions: readonly string[]) {
  return hasPermission(permissions, 'forecast.manage');
}
