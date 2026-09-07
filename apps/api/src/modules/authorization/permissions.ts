import type { MembershipRole } from '@prisma/client';

export const PERMISSIONS = {
  OPPORTUNITIES_READ_OWN: 'opportunities.read.own',
  OPPORTUNITIES_READ_TEAM: 'opportunities.read.team',
  OPPORTUNITIES_READ_ALL: 'opportunities.read.all',
  OPPORTUNITIES_CREATE: 'opportunities.create',
  OPPORTUNITIES_UPDATE_OWN: 'opportunities.update.own',
  OPPORTUNITIES_UPDATE_TEAM: 'opportunities.update.team',
  OPPORTUNITIES_UPDATE_ALL: 'opportunities.update.all',
  FORECAST_READ: 'forecast.read',
  FORECAST_MANAGE: 'forecast.manage',
  USERS_MANAGE: 'users.manage',
  TENANT_MANAGE: 'tenant.manage',
  ALERTS_READ: 'alerts.read',
  ANALYTICS_READ: 'analytics.read',
  IMPORT_MANAGE: 'imports.manage',
} as const;

const allPermissions = Object.values(PERMISSIONS);

const ROLE_PERMISSIONS: Record<MembershipRole, readonly string[]> = {
  PLATFORM_ADMIN: allPermissions,
  TENANT_ADMIN: allPermissions,
  MANAGER: [
    PERMISSIONS.OPPORTUNITIES_READ_TEAM,
    PERMISSIONS.OPPORTUNITIES_CREATE,
    PERMISSIONS.OPPORTUNITIES_UPDATE_TEAM,
    PERMISSIONS.FORECAST_READ,
    PERMISSIONS.FORECAST_MANAGE,
    PERMISSIONS.ALERTS_READ,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.IMPORT_MANAGE,
  ],
  SELLER: [
    PERMISSIONS.OPPORTUNITIES_READ_OWN,
    PERMISSIONS.OPPORTUNITIES_CREATE,
    PERMISSIONS.OPPORTUNITIES_UPDATE_OWN,
    PERMISSIONS.FORECAST_READ,
    PERMISSIONS.ALERTS_READ,
    PERMISSIONS.ANALYTICS_READ,
  ],
  EXECUTIVE: [
    PERMISSIONS.OPPORTUNITIES_READ_ALL,
    PERMISSIONS.FORECAST_READ,
    PERMISSIONS.ALERTS_READ,
    PERMISSIONS.ANALYTICS_READ,
  ],
  VIEWER: [
    PERMISSIONS.OPPORTUNITIES_READ_ALL,
    PERMISSIONS.FORECAST_READ,
    PERMISSIONS.ANALYTICS_READ,
  ],
};

export function permissionsFor(role: MembershipRole): ReadonlySet<string> {
  return new Set(ROLE_PERMISSIONS[role]);
}
