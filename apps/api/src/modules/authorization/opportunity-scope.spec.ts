import type { MembershipRole } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import type { RequestAuth } from '../../common/http/authenticated-request';
import { permissionsFor } from './permissions';
import {
  canUpdateOpportunities,
  opportunityReadScope,
  opportunityUpdateScope,
} from './opportunity-scope';

function auth(role: MembershipRole, userId = 'current-user'): RequestAuth {
  return {
    userId,
    activeTenantId: 'tenant',
    membershipId: 'membership',
    role,
    permissions: permissionsFor(role),
    sessionId: 'session',
    csrfTokenHash: 'csrf',
  };
}

describe('opportunity role scope', () => {
  it('limits a manager to opportunities managed or sold by the current user', () => {
    expect(opportunityReadScope(auth('MANAGER'))).toEqual({
      OR: [{ managerId: 'current-user' }, { sellerId: 'current-user' }],
    });
    expect(opportunityUpdateScope(auth('MANAGER'))).toEqual({
      OR: [{ managerId: 'current-user' }, { sellerId: 'current-user' }],
    });
  });

  it('limits a seller to owned opportunities', () => {
    expect(opportunityReadScope(auth('SELLER'))).toEqual({ sellerId: 'current-user' });
    expect(opportunityUpdateScope(auth('SELLER'))).toEqual({ sellerId: 'current-user' });
  });

  it('keeps tenant-wide reads for admins and read-only roles', () => {
    for (const role of ['PLATFORM_ADMIN', 'TENANT_ADMIN', 'EXECUTIVE', 'VIEWER'] as const) {
      expect(opportunityReadScope(auth(role))).toEqual({});
    }
  });

  it('reports mutation capability only for roles with an update permission', () => {
    expect(canUpdateOpportunities(auth('TENANT_ADMIN'))).toBe(true);
    expect(canUpdateOpportunities(auth('MANAGER'))).toBe(true);
    expect(canUpdateOpportunities(auth('SELLER'))).toBe(true);
    expect(canUpdateOpportunities(auth('EXECUTIVE'))).toBe(false);
    expect(canUpdateOpportunities(auth('VIEWER'))).toBe(false);
  });
});
