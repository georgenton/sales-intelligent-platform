import { Camera, History } from 'lucide-react';
import { CreateSnapshotButton } from '@/components/forecast/create-snapshot-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import { formatDateOnly } from '@/lib/utils';

interface Snapshot {
  id: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  _count: { items: number };
}

export default async function ForecastPage() {
  const snapshots = await apiFetch<Snapshot[]>('/forecast/snapshots');
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Forecast control</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.035em]">Snapshots</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Immutable portfolio positions for historical comparison.
          </p>
        </div>
        <CreateSnapshotButton />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Snapshot history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {snapshots.map((snapshot) => (
            <div key={snapshot.id} className="flex items-center gap-4 rounded-xl border p-4">
              <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
                <Camera className="size-5" />
              </span>
              <div className="flex-1">
                <p className="font-semibold">
                  {formatDateOnly(snapshot.periodStart)} – {formatDateOnly(snapshot.periodEnd)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Captured {new Date(snapshot.createdAt).toLocaleString()}
                </p>
              </div>
              <Badge>{snapshot._count.items} opportunities</Badge>
            </div>
          ))}
          {!snapshots.length && (
            <div className="py-16 text-center">
              <History className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                No snapshots yet. Capture the current quarter to establish a baseline.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
