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
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { OpportunityData } from '@/lib/types';
import { cn, formatCurrency, formatDateOnly } from '@/lib/utils';

const column = createColumnHelper<OpportunityData>();

export function OpportunityTable({ data }: { data: OpportunityData[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const columns = useMemo(
    () => [
      column.accessor('title', {
        header: 'Opportunity',
        cell: ({ row }) => (
          <div>
            <Link
              href={`/app/opportunities/${row.original.id}`}
              className="font-semibold hover:text-primary"
            >
              {row.original.title}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">{row.original.customer.name}</p>
          </div>
        ),
      }),
      column.accessor('stage.probability', {
        header: 'Stage',
        cell: ({ row }) => (
          <Badge className="bg-secondary text-secondary-foreground">
            {row.original.stage.code}% · {row.original.stage.name}
          </Badge>
        ),
      }),
      column.accessor('status', {
        header: 'Status',
        cell: ({ getValue }) => <Badge>{getValue()}</Badge>,
      }),
      column.accessor('seller.name', { header: 'Seller' }),
      column.accessor((row) => row.lineItems[0]?.brand.name ?? '—', {
        id: 'brand',
        header: 'Brand',
      }),
      column.accessor('estimatedAmount', {
        header: 'Amount',
        cell: ({ row }) => (
          <span className="font-semibold tabular-nums">
            {formatCurrency(row.original.estimatedAmount, row.original.currency)}
          </span>
        ),
      }),
      column.accessor('expectedCloseDate', {
        header: 'Expected close',
        cell: ({ getValue }) => formatDateOnly(getValue()),
      }),
      column.accessor('health.score', {
        header: 'Health',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'size-2 rounded-full',
                row.original.health.status === 'HEALTHY'
                  ? 'bg-success'
                  : row.original.health.status === 'AT_RISK'
                    ? 'bg-warning'
                    : 'bg-danger',
              )}
            />
            <span className="font-semibold tabular-nums">{row.original.health.score}</span>
          </div>
        ),
      }),
    ],
    [],
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
            placeholder="Search title, customer or seller"
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
          />
        </div>
        <select
          aria-label="Filter by status"
          className="h-10 rounded-lg border bg-background px-3 text-sm"
          onChange={(event) =>
            table.getColumn('status')?.setFilterValue(event.target.value || undefined)
          }
        >
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="WON">Won</option>
          <option value="LOST">Lost</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 font-semibold">
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
                  <td key={cell.id} className="px-4 py-4 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
        <span>{table.getFilteredRowModel().rows.length} opportunities</span>
        <div className="flex items-center gap-2">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            size="icon"
            variant="outline"
            aria-label="Previous page"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            aria-label="Next page"
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
