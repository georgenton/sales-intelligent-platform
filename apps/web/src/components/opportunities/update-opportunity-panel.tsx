'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { OpportunityData } from '@/lib/types';
import { csrfToken } from '@/lib/utils';
import type { ReferenceData } from './opportunity-form';

const schema = z.object({
  status: z.enum(['OPEN', 'WON', 'LOST', 'CANCELLED']),
  stageId: z.string().uuid(),
  forecastCategory: z.enum(['PIPELINE', 'BEST_CASE', 'COMMIT', 'CLOSED', 'OMITTED']),
  estimatedAmount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  grossProfit: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional()
    .or(z.literal('')),
  expectedCloseDate: z.string().min(1),
  expectedBillingDate: z.string().optional(),
  poNumber: z.string().optional(),
});
type Values = z.infer<typeof schema>;
const selectClass =
  'mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring';

export function UpdateOpportunityPanel({
  opportunity,
  reference,
}: {
  opportunity: OpportunityData;
  reference: ReferenceData;
}) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: opportunity.status as Values['status'],
      stageId: opportunity.stage.id,
      forecastCategory: opportunity.forecastCategory as Values['forecastCategory'],
      estimatedAmount: String(opportunity.estimatedAmount),
      grossProfit: opportunity.grossProfit === null ? '' : String(opportunity.grossProfit),
      expectedCloseDate: opportunity.expectedCloseDate.slice(0, 10),
      expectedBillingDate: opportunity.expectedBillingDate?.slice(0, 10) ?? '',
      poNumber: opportunity.poNumber ?? '',
    },
  });
  const submit = handleSubmit(async (values) => {
    setMessage('');
    const response = await fetch(`/backend/opportunities/${opportunity.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', 'x-csrf-token': csrfToken() },
      body: JSON.stringify({
        ...values,
        grossProfit: values.grossProfit || undefined,
        expectedBillingDate: values.expectedBillingDate || undefined,
        poNumber: values.poNumber || undefined,
      }),
    });
    setMessage(response.ok ? 'Changes saved.' : 'Changes could not be saved.');
    if (response.ok) router.refresh();
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Update forecast</CardTitle>
        <p className="text-xs text-muted-foreground">Stage changes are recorded automatically.</p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={submit}>
          <label className="block text-sm font-medium">
            Status
            <select className={selectClass} {...register('status')}>
              <option value="OPEN">Open</option>
              <option value="WON">Won</option>
              <option value="LOST">Lost</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            Stage
            <select className={selectClass} {...register('stageId')}>
              {reference.stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.code}% · {stage.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Forecast category
            <select className={selectClass} {...register('forecastCategory')}>
              <option value="PIPELINE">Pipeline</option>
              <option value="BEST_CASE">Best case</option>
              <option value="COMMIT">Commit</option>
              <option value="CLOSED">Closed</option>
              <option value="OMITTED">Omitted</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium">
              Amount
              <Input className="mt-2" {...register('estimatedAmount')} />
            </label>
            <label className="text-sm font-medium">
              Gross profit
              <Input className="mt-2" {...register('grossProfit')} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium">
              Close date
              <Input className="mt-2" type="date" {...register('expectedCloseDate')} />
            </label>
            <label className="text-sm font-medium">
              Billing date
              <Input className="mt-2" type="date" {...register('expectedBillingDate')} />
            </label>
          </div>
          <label className="block text-sm font-medium">
            PO number
            <Input className="mt-2" {...register('poNumber')} />
          </label>
          {message && (
            <p role="status" className="text-sm text-muted-foreground">
              {message}
            </p>
          )}
          <Button className="w-full" disabled={isSubmitting}>
            <Save className="size-4" />
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
