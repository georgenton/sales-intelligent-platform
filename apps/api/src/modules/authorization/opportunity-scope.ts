import type { Prisma } from '@prisma/client';
import type { RequestAuth } from '../../common/http/authenticated-request';
import { PERMISSIONS } from './permissions';

export function opportunityReadScope(auth: RequestAuth): Prisma.OpportunityWhereInput {
  if (auth.permissions.has(PERMISSIONS.OPPORTUNITIES_READ_ALL)) return {};
  if (auth.permissions.has(PERMISSIONS.OPPORTUNITIES_READ_TEAM)) {
    return { OR: [{ managerId: auth.userId }, { sellerId: auth.userId }] };
  }
  return { sellerId: auth.userId };
}

export function opportunityUpdateScope(auth: RequestAuth): Prisma.OpportunityWhereInput {
  if (auth.permissions.has(PERMISSIONS.OPPORTUNITIES_UPDATE_ALL)) return {};
  if (auth.permissions.has(PERMISSIONS.OPPORTUNITIES_UPDATE_TEAM)) {
    return { OR: [{ managerId: auth.userId }, { sellerId: auth.userId }] };
  }
  return { sellerId: auth.userId };
}

export function canUpdateOpportunities(auth: RequestAuth): boolean {
  return (
    auth.permissions.has(PERMISSIONS.OPPORTUNITIES_UPDATE_ALL) ||
    auth.permissions.has(PERMISSIONS.OPPORTUNITIES_UPDATE_TEAM) ||
    auth.permissions.has(PERMISSIONS.OPPORTUNITIES_UPDATE_OWN)
  );
}
