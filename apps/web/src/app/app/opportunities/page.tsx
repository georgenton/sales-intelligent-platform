import { Download, Plus } from 'lucide-react';
import Link from 'next/link';
import { OpportunityTable } from '@/components/opportunities/opportunity-table';
import { Card } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import type { OpportunityData } from '@/lib/types';

interface OpportunityList {
  items: OpportunityData[];
  pagination: { total: number };
}

export default async function OpportunitiesPage() {
  const data = await apiFetch<OpportunityList>('/opportunities?perPage=100');
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Portfolio</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.035em]">Opportunities</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {data.pagination.total} active and historical commercial motions.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-semibold">
            <Download className="size-4" />
            Export
          </button>
          <Link
            href="/app/opportunities/new"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="size-4" />
            New opportunity
          </Link>
        </div>
      </div>
      <Card className="overflow-hidden">
        <OpportunityTable data={data.items} />
      </Card>
    </div>
  );
}
