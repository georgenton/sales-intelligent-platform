import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import type { DashboardData } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export default async function AnalyticsPage() {
  const dashboard = await apiFetch<DashboardData>('/analytics/dashboard');
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-primary">Performance</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.035em]">Seller analytics</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pipeline and commit posture for {dashboard.period.label}.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Seller performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-3">Seller</th>
                  <th>Opportunities</th>
                  <th>Pipeline</th>
                  <th>Commit</th>
                  <th>Commit mix</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dashboard.sellerPerformance.map((seller) => (
                  <tr key={seller.seller}>
                    <td className="py-4 font-semibold">{seller.seller}</td>
                    <td>{seller.opportunities}</td>
                    <td>{formatCurrency(seller.pipeline, dashboard.currency)}</td>
                    <td>{formatCurrency(seller.commit, dashboard.currency)}</td>
                    <td>
                      {seller.pipeline
                        ? `${((seller.commit / seller.pipeline) * 100).toFixed(1)}%`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
