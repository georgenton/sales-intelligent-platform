import { SalesWorkspace } from '@/components/dashboard/sales-workspace';
import { apiFetch } from '@/lib/api';
import type { AlertData, DashboardData, OpportunityData } from '@/lib/types';

interface OpportunityList {
  items: OpportunityData[];
  pagination: { total: number };
}

interface Profile {
  user: { id: string; name: string };
  tenant: { name: string };
  role: string;
}

export default async function DashboardPage() {
  const [dashboard, alerts, opportunityList, profile] = await Promise.all([
    apiFetch<DashboardData>('/analytics/dashboard'),
    apiFetch<AlertData[]>('/alerts'),
    apiFetch<OpportunityList>('/opportunities?perPage=100'),
    apiFetch<Profile>('/auth/me'),
  ]);

  return (
    <SalesWorkspace
      data={dashboard}
      alerts={alerts}
      opportunities={opportunityList.items}
      profile={profile}
    />
  );
}
