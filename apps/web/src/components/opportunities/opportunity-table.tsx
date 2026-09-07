'use client';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { OpportunityHealth, RiskBadge } from '@/components/sales/sales-components';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AppLocale } from '@/i18n/config';
import { commercialStageLabel } from '@/lib/commercial';
import type { OpportunityData } from '@/lib/types';
import { cn, formatCurrency, formatDateOnly } from '@/lib/utils';
import { useAppDispatch } from '@/store/hooks';
import { selectOpportunity } from '@/store/ui-slice';

const column = createColumnHelper<OpportunityData>();
const tabletHiddenColumns = new Set(['status', 'seller', 'brand', 'expectedCloseDate']);

export function OpportunityTable({ data }: { data: OpportunityData[] }) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('opportunities');
  const tCommon = useTranslations('common');
  const tStatus = useTranslations('common.status');
  const dispatch = useAppDispatch();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const columns = useMemo(
    () => [
      column.accessor('title', {
        header: t('columns.opportunity'),
        cell: ({ row }) => (
          <div>
            <button
              onClick={() => dispatch(selectOpportunity(row.original.id))}
              className="font-semibold hover:text-primary"
            >
              {row.original.title}
            </button>
            <p className="mt-1 text-xs text-muted-foreground">{row.original.customer.name}</p>
          </div>
        ),
      }),
      column.accessor('stage.probability', {
        id: 'stage',
        header: t('columns.stage'),
        cell: ({ row }) => (
          <Badge className="bg-secondary text-secondary-foreground">
            {row.original.stage.code}% · {commercialStageLabel(row.original.stage, locale)}
          </Badge>
        ),
      }),
      column.accessor('status', {
        header: t('columns.status'),
        cell: ({ getValue }) => <Badge>{tStatus(getValue())}</Badge>,
      }),
      column.accessor('seller.name', { id: 'seller', header: t('columns.seller') }),
      column.accessor((row) => row.lineItems[0]?.brand.name ?? '—', {
        id: 'brand',
        header: t('columns.brand'),
      }),
      column.accessor('estimatedAmount', {
        header: t('columns.amount'),
        cell: ({ row }) => (
          <span className="font-semibold tabular-nums">
            {formatCurrency(row.original.estimatedAmount, row.original.currency, locale)}
          </span>
        ),
      }),
      column.accessor('expectedCloseDate', {
        header: t('columns.expectedClose'),
        cell: ({ getValue }) => formatDateOnly(getValue(), locale),
      }),
      column.accessor('health.score', {
        header: t('columns.health'),
        cell: ({ row }) => (
          <OpportunityHealth
            score={row.original.health.score}
            status={row.original.health.status}
            size="sm"
          />
        ),
      }),
    ],
    [dispatch, locale, t, tStatus],
  );
  // TanStack Table intentionally returns mutable table helpers; React Compiler skips this component.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div>
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t('search')}
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
          />
        </div>
        <select
          aria-label={t('filterStatus')}
          className="h-density-control rounded-lg border bg-background px-3 text-sm"
          onChange={(event) =>
            table.getColumn('status')?.setFilterValue(event.target.value || undefined)
          }
        >
          <option value="">{t('allStatuses')}</option>
          <option value="OPEN">{tStatus('OPEN')}</option>
          <option value="WON">{tStatus('WON')}</option>
          <option value="LOST">{tStatus('LOST')}</option>
        </select>
      </div>
      <div className="grid gap-2 p-3 sm:hidden">
        {table.getRowModel().rows.map(({ original }) => (
          <button
            key={original.id}
            onClick={() => dispatch(selectOpportunity(original.id))}
            className="rounded-xl border p-3 text-left"
          >
            <span className="flex items-start justify-between gap-3">
              <span>
                <b className="block text-sm">{original.title}</b>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {original.customer.name}
                </span>
              </span>
              <b className="tnum text-sm">
                {formatCurrency(original.estimatedAmount, original.currency, locale)}
              </b>
            </span>
            <span className="mt-3 flex flex-wrap items-center gap-2">
              <Badge className="bg-secondary text-secondary-foreground">
                {original.stage.code}% · {commercialStageLabel(original.stage, locale)}
              </Badge>
              {original.alerts[0] && (
                <RiskBadge severity={original.alerts[0].severity} code={original.alerts[0].code} />
              )}
              <OpportunityHealth
                score={original.health.score}
                status={original.health.status}
                size="sm"
              />
            </span>
          </button>
        ))}
      </div>
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[620px] text-left text-sm xl:min-w-[960px]">
          <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      'h-density-row px-4 py-2 font-semibold',
                      tabletHiddenColumns.has(header.column.id) && 'hidden xl:table-cell',
                    )}
                  >
                    <button
                      className="inline-flex items-center gap-1"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && <ArrowUpDown className="size-3" />}
                    </button>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-muted/40">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={cn(
                      'h-density-row px-4 py-2 align-middle',
                      tabletHiddenColumns.has(cell.column.id) && 'hidden xl:table-cell',
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
        <span>
          {tCommon('opportunityCount', { count: table.getFilteredRowModel().rows.length })}
        </span>
        <div className="flex items-center gap-2">
          <span>
            {t('page', {
              current: table.getState().pagination.pageIndex + 1,
              total: table.getPageCount(),
            })}
          </span>
          <Button
            size="icon"
            variant="outline"
            aria-label={t('previousPage')}
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            aria-label={t('nextPage')}
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
