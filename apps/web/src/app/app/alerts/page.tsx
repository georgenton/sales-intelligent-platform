import { AlertOctagon, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import type { AlertData } from '@/lib/types';
import { cn } from '@/lib/utils';

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
      <div className="grid gap-3">
        {alerts.map((alert) => (
          <Card key={alert.id}>
            <CardContent className="flex items-start gap-4 p-4">
              <span
                className={cn(
                  'grid size-11 place-items-center rounded-xl',
                  alert.severity === 'CRITICAL'
                    ? 'bg-surface-danger-soft text-danger'
                    : alert.severity === 'HIGH'
                      ? 'bg-surface-danger-soft text-danger'
                      : 'bg-surface-warning-soft text-warning',
                )}
              >
                <AlertOctagon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{alert.opportunity?.title ?? 'Portfolio alert'}</h2>
                  <Badge>{alert.severity}</Badge>
                  <Badge>{alert.code.replaceAll('_', ' ')}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{alert.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Detected {new Date(alert.createdAt).toLocaleString()}
                </p>
              </div>
              {alert.opportunity && (
                <Link
                  aria-label={`Open ${alert.opportunity.title}`}
                  href={`/app/opportunities/${alert.opportunity.id}`}
                  className="grid size-9 place-items-center rounded-lg border"
                >
                  <ArrowUpRight className="size-4" />
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
