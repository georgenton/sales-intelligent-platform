import { AlertList } from '@/components/alerts/alert-list';
import { apiFetch } from '@/lib/api';
import type { AlertData } from '@/lib/types';

export default async function AlertsPage() {
  const alerts = await apiFetch<AlertData[]>('/alerts');
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-primary">Commercial control</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.035em]">Risk alerts</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {alerts.length} deterministic signals across the active portfolio.
        </p>
      </div>
      <AlertList alerts={alerts} />
    </div>
  );
}
