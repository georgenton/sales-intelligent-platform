'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { csrfToken } from '@/lib/utils';

export interface ReferenceData {
  stages: Array<{ id: string; code: string; name: string; probability: number }>;
  brands: Array<{ id: string; name: string }>;
  partners: Array<{ id: string; name: string }>;
  customers: Array<{ id: string; name: string }>;
  users: Array<{ id: string; name: string; role: string }>;
  settings: { currency: string };
}

const schema = z.object({
  title: z.string().min(3).max(200),
  customerId: z.string().uuid(),
  partnerId: z.string().optional(),
  sellerId: z.string().uuid(),
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
  poNumber: z.string().max(100).optional(),
  notes: z.string().max(5000).optional(),
  lineItems: z
    .array(
      z.object({
        brandId: z.string().uuid(),
        description: z.string().min(2),
        amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
        cost: z.string().optional(),
      }),
    )
    .max(20),
});
type Values = z.infer<typeof schema>;
const selectClass =
  'h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring';

export function OpportunityForm({ reference }: { reference: ReferenceData }) {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const defaultStage = reference.stages.find((stage) => stage.code === '25') ?? reference.stages[0];
  const sellers = reference.users.filter((user) => user.role === 'SELLER');
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      customerId: reference.customers[0]?.id,
      partnerId: '',
      sellerId: sellers[0]?.id,
      stageId: defaultStage?.id,
      forecastCategory: 'PIPELINE',
      estimatedAmount: '',
      grossProfit: '',
      expectedCloseDate: '',
      expectedBillingDate: '',
      poNumber: '',
      notes: '',
      lineItems: [
        { brandId: reference.brands[0]?.id ?? '', description: '', amount: '', cost: '' },
      ],
    },
  });
  const items = useFieldArray({ control, name: 'lineItems' });
  const submit = handleSubmit(async (values) => {
    setServerError('');
    const payload = {
      ...values,
      currency: reference.settings.currency,
      partnerId: values.partnerId || undefined,
      expectedBillingDate: values.expectedBillingDate || undefined,
      grossProfit: values.grossProfit || undefined,
      poNumber: values.poNumber || undefined,
      notes: values.notes || undefined,
      lineItems: values.lineItems.map((item) => ({ ...item, cost: item.cost || undefined })),
    };
    const response = await fetch('/backend/opportunities', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-csrf-token': csrfToken() },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;
      setServerError(body?.error?.message ?? 'Opportunity could not be created.');
      return;
    }
    const created = (await response.json()) as { id: string };
    router.push(`/app/opportunities/${created.id}`);
    router.refresh();
  });

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/app/opportunities"
          className="grid size-10 place-items-center rounded-lg border"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <p className="text-sm font-semibold text-primary">Portfolio</p>
          <h1 className="text-3xl font-semibold tracking-tight">New opportunity</h1>
        </div>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Commercial context</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 text-sm font-medium">
                Title
                <Input className="mt-2" {...register('title')} />
              </label>
              <label className="text-sm font-medium">
                Customer
                <select className={`${selectClass} mt-2`} {...register('customerId')}>
                  {reference.customers.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Partner
                <select className={`${selectClass} mt-2`} {...register('partnerId')}>
                  <option value="">No partner</option>
                  {reference.partners.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Seller
                <select className={`${selectClass} mt-2`} {...register('sellerId')}>
                  {sellers.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Stage
                <select className={`${selectClass} mt-2`} {...register('stageId')}>
                  {reference.stages.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.code}% · {item.name}
                    </option>
                  ))}
                </select>
              </label>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Line items</CardTitle>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  items.append({
                    brandId: reference.brands[0]?.id ?? '',
                    description: '',
                    amount: '',
                    cost: '',
                  })
                }
              >
                <Plus className="size-4" />
                Add item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-3 rounded-xl border p-3 sm:grid-cols-[0.8fr_1.4fr_0.7fr_0.7fr_auto]"
                >
                  <select
                    aria-label={`Brand ${index + 1}`}
                    className={selectClass}
                    {...register(`lineItems.${index}.brandId`)}
                  >
                    {reference.brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    aria-label={`Description ${index + 1}`}
                    placeholder="Product or service"
                    {...register(`lineItems.${index}.description`)}
                  />
                  <Input
                    aria-label={`Amount ${index + 1}`}
                    inputMode="decimal"
                    placeholder="Amount"
                    {...register(`lineItems.${index}.amount`)}
                  />
                  <Input
                    aria-label={`Cost ${index + 1}`}
                    inputMode="decimal"
                    placeholder="Cost"
                    {...register(`lineItems.${index}.cost`)}
                  />
                  <Button
                    aria-label={`Remove item ${index + 1}`}
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={items.fields.length === 1}
                    onClick={() => items.remove(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="min-h-28 w-full rounded-lg border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                {...register('notes')}
              />
            </CardContent>
          </Card>
        </div>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Forecast details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block text-sm font-medium">
              Category
              <select className={`${selectClass} mt-2`} {...register('forecastCategory')}>
                <option value="PIPELINE">Pipeline</option>
                <option value="BEST_CASE">Best case</option>
                <option value="COMMIT">Commit</option>
                <option value="CLOSED">Closed</option>
                <option value="OMITTED">Omitted</option>
              </select>
            </label>
            <label className="block text-sm font-medium">
              Estimated amount
              <Input className="mt-2" inputMode="decimal" {...register('estimatedAmount')} />
            </label>
            <label className="block text-sm font-medium">
              Gross profit
              <Input className="mt-2" inputMode="decimal" {...register('grossProfit')} />
            </label>
            <label className="block text-sm font-medium">
              Expected close
              <Input className="mt-2" type="date" {...register('expectedCloseDate')} />
            </label>
            <label className="block text-sm font-medium">
              Expected billing
              <Input className="mt-2" type="date" {...register('expectedBillingDate')} />
            </label>
            <label className="block text-sm font-medium">
              PO number
              <Input className="mt-2" {...register('poNumber')} />
            </label>
            {Object.keys(errors).length > 0 && (
              <p className="text-sm text-danger">Review the required fields and numeric values.</p>
            )}
            {serverError && (
              <p role="alert" className="text-sm text-danger">
                {serverError}
              </p>
            )}
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create opportunity'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
