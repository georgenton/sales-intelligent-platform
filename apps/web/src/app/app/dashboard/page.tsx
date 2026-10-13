import { SalesWorkspace } from '@/components/dashboard/sales-workspace';
import { ManagerDashboardEdgar } from '@/components/dashboard/manager-dashboard-edgar';
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
  permissions: string[];
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[] }>;
}) {
  const profile = await apiFetch<Profile>('/auth/me');
  const view = (await searchParams).view;
  const reviewRequested =
    view === 'review' && ['TENANT_ADMIN', 'PLATFORM_ADMIN', 'MANAGER'].includes(profile.role);
  if (profile.role !== 'SELLER' && !reviewRequested) {
    return <ManagerDashboardEdgar profile={profile} />;
  }
  const [dashboard, alerts, opportunityList] = await Promise.all([
    apiFetch<DashboardData>('/analytics/dashboard'),
    profile.permissions.includes('alerts.read')
      ? apiFetch<AlertData[]>('/alerts')
      : Promise.resolve([]),
    apiFetch<OpportunityList>('/opportunities?perPage=100'),
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
