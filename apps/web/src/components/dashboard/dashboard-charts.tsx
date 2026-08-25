'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { DashboardData } from '@/lib/types';

export function DashboardCharts({ dashboard }: { dashboard: DashboardData }) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Pipeline funnel</CardTitle>
          <p className="text-xs text-muted-foreground">Open value and opportunity count by stage</p>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboard.funnel} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
              <XAxis
                type="number"
                tickFormatter={(value) => formatCurrency(Number(value), dashboard.currency)}
                tick={{ fontSize: 11 }}
              />
              <YAxis dataKey="stage" type="category" width={92} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value), dashboard.currency)}
                cursor={{ fill: 'var(--muted)' }}
              />
              <Bar dataKey="amount" fill="var(--chart-1)" radius={[0, 7, 7, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pipeline by brand</CardTitle>
          <p className="text-xs text-muted-foreground">
            Line item contribution across the active portfolio
          </p>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboard.byBrand.slice(0, 8)} margin={{ left: 4, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="brand" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(value) => formatCurrency(Number(value), dashboard.currency)}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value), dashboard.currency)}
                cursor={{ fill: 'var(--muted)' }}
              />
              <Bar dataKey="amount" fill="var(--chart-2)" radius={[7, 7, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
