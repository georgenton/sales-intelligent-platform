'use client';

import { AlertOctagon, PanelRightOpen } from 'lucide-react';
import { RiskBadge } from '@/components/sales/sales-components';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { AlertData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/store/hooks';
import { selectOpportunity } from '@/store/ui-slice';

export function AlertList({ alerts }: { alerts: AlertData[] }) {
  const dispatch = useAppDispatch();

  return (
    <div className="grid gap-3">
      {alerts.map((alert) => (
        <Card key={alert.id}>
          <CardContent className="flex flex-col items-start gap-4 p-4 sm:flex-row">
            <span
              className={cn(
                'grid size-11 shrink-0 place-items-center rounded-xl',
                alert.severity === 'CRITICAL' || alert.severity === 'HIGH'
                  ? 'bg-surface-danger-soft text-danger'
                  : 'bg-surface-warning-soft text-warning',
              )}
            >
              <AlertOctagon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">{alert.opportunity?.title ?? 'Portfolio alert'}</h2>
                <RiskBadge severity={alert.severity} code={alert.code} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{alert.message}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Detected {new Date(alert.createdAt).toLocaleString()}
              </p>
            </div>
            {alert.opportunity ? (
              <Button
                variant="outline"
                size="sm"
                aria-label={`Inspect ${alert.opportunity.title}`}
                onClick={() => dispatch(selectOpportunity(alert.opportunity?.id ?? null))}
              >
                <PanelRightOpen className="size-4" />
                Inspect
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ))}
      {alerts.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No active risk signals.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
