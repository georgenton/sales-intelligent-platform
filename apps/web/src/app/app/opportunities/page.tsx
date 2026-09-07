import { Download, Plus } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { OpportunityTable } from '@/components/opportunities/opportunity-table';
import { Card } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import { canCreateOpportunity } from '@/lib/permissions';
import type { OpportunityData } from '@/lib/types';

interface OpportunityList {
  items: OpportunityData[];
  pagination: { total: number };
}

interface Profile {
  permissions: string[];
}

export default async function OpportunitiesPage() {
  const t = await getTranslations('opportunities');
  const tCommon = await getTranslations('common.action');
  const [data, profile] = await Promise.all([
    apiFetch<OpportunityList>('/opportunities?perPage=100'),
    apiFetch<Profile>('/auth/me'),
  ]);
  return (
    <div className="space-y-density-section">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">{t('eyebrow')}</p>
          <h1 className="mt-1 text-page-title font-semibold tracking-[-0.035em]">{t('title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('summary', { count: data.pagination.total })}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-semibold">
            <Download className="size-4" />
            {tCommon('export')}
          </button>
          {canCreateOpportunity(profile.permissions) && (
            <Link
              href="/app/opportunities/new"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="size-4" />
              {t('new')}
            </Link>
          )}
        </div>
      </div>
      <Card className="overflow-hidden">
        <OpportunityTable data={data.items} />
      </Card>
    </div>
  );
}
