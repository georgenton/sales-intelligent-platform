import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import type { ReferenceData } from '@/components/opportunities/opportunity-form';

export default async function SettingsPage() {
  const reference = await apiFetch<ReferenceData>('/opportunities/reference-data');
  const settings = reference.settings as ReferenceData['settings'] & {
    timezone?: string;
    fiscalYearStartMonth?: number;
    fiscalYearEndMonth?: number;
    defaultMarginThreshold?: string;
  };
  const rows = [
    ['Currency', settings.currency],
    ['Timezone', settings.timezone ?? '—'],
    [
      'Fiscal year',
      `${settings.fiscalYearStartMonth ?? '—'} → ${settings.fiscalYearEndMonth ?? '—'}`,
    ],
    ['Minimum margin', `${settings.defaultMarginThreshold ?? '—'}%`],
  ];
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-primary">Workspace</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.035em]">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tenant-owned commercial and fiscal defaults.
        </p>
      </div>
      <Card className="max-w-2xl">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Commercial defaults</CardTitle>
          <Badge>Tenant scoped</Badge>
        </CardHeader>
        <CardContent className="divide-y">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-4 text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-semibold">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
