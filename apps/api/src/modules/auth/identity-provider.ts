import type { MembershipRole } from '@prisma/client';

export interface IdentityClaims {
  userId: string;
  tenantId: string;
  membershipId: string;
  role: MembershipRole;
  name: string;
  email: string;
  tenantName: string;
}

export interface IdentityProvider {
  authenticate(email: string, password: string): Promise<IdentityClaims>;
}
