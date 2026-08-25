import type { MembershipRole } from '@prisma/client';
import type { Request } from 'express';

export interface RequestAuth {
  userId: string;
  activeTenantId: string;
  membershipId: string;
  role: MembershipRole;
  permissions: ReadonlySet<string>;
  sessionId: string;
  csrfTokenHash: string;
}

export interface AuthenticatedRequest extends Request {
  auth: RequestAuth;
  requestId: string;
}
