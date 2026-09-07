'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { csrfToken } from '@/lib/utils';
import type { AppLocale } from '@/i18n/config';
import { commercialStageLabel } from '@/lib/commercial';

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
  managerId: z.string().uuid().optional().or(z.literal('')),
  stageId: z.string().uuid(),
  forecastCategory: z.enum(['PIPELINE', 'BEST_CASE', 'COMMIT', 'CLOSED', 'OMITTED']),
  estimatedAmount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  grossMarginPercent: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .refine((value) => Number(value) >= 0 && Number(value) <= 100)
    .optional()
    .or(z.literal('')),
  qualificationOverrideReason: z.string().max(500).optional().or(z.literal('')),
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
  'h-density-control w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring';

export function OpportunityForm({
  reference,
  profile,
}: {
  reference: ReferenceData;
  profile: { user: { id: string }; role: string };
}) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('opportunities.form');
  const tOpportunities = useTranslations('opportunities');
  const tCategory = useTranslations('common.forecastCategory');
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const defaultStage = reference.stages.find((stage) => stage.code === '20') ?? reference.stages[0];
  const sellers = reference.users.filter((user) => user.role === 'SELLER');
  const managers = reference.users.filter((user) => user.role === 'MANAGER');
  const isSeller = profile.role === 'SELLER';
  const isAdmin = ['TENANT_ADMIN', 'PLATFORM_ADMIN'].includes(profile.role);
  const assignedSeller = sellers.find((seller) => seller.id === profile.user.id);
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
      sellerId: isSeller ? assignedSeller?.id : sellers[0]?.id,
      managerId: '',
      stageId: defaultStage?.id,
      forecastCategory: 'PIPELINE',
      estimatedAmount: '',
      grossMarginPercent: '',
      qualificationOverrideReason: '',
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
      managerId: isAdmin && values.managerId ? values.managerId : undefined,
      expectedBillingDate: values.expectedBillingDate || undefined,
      grossMarginPercent: values.grossMarginPercent || undefined,
      qualificationOverrideReason: values.qualificationOverrideReason || undefined,
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
      setServerError(t('createError'));
      return;
    }
    const created = (await response.json()) as { id: string };
    router.push(`/app/opportunities/${created.id}`);
    router.refresh();
  });
  const amount = Number(useWatch({ control, name: 'estimatedAmount' }));
  const margin = Number(useWatch({ control, name: 'grossMarginPercent' }));
  const derivedGrossProfit =
    Number.isFinite(amount) && Number.isFinite(margin) ? (amount * margin) / 100 : null;

  return (
    <form onSubmit={submit} className="space-y-density-section">
      <div className="flex items-center gap-3">
        <Link
          href="/app/opportunities"
          className="grid size-10 place-items-center rounded-lg border"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <p className="text-sm font-semibold text-primary">{t('portfolio')}</p>
          <h1 className="text-page-title font-semibold tracking-tight">{tOpportunities('new')}</h1>
        </div>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>{t('commercialContext')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 text-sm font-medium">
                {t('title')}
                <Input className="mt-2" {...register('title')} />
              </label>
              <label className="text-sm font-medium">
                {t('customer')}
                <select className={`${selectClass} mt-2`} {...register('customerId')}>
                  {reference.customers.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                {t('partner')}
                <select className={`${selectClass} mt-2`} {...register('partnerId')}>
                  <option value="">{t('noPartner')}</option>
                  {reference.partners.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              {isSeller ? (
                <label className="text-sm font-medium">
                  {t('seller')}
                  <input type="hidden" {...register('sellerId')} />
                  <span className="mt-2 flex h-density-control items-center rounded-lg border bg-muted px-3 text-sm">
                    {assignedSeller?.name}
                  </span>
                </label>
              ) : (
                <label className="text-sm font-medium">
                  {t('seller')}
                  <select className={`${selectClass} mt-2`} {...register('sellerId')}>
                    {sellers.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {isAdmin && (
                <label className="text-sm font-medium">
                  {t('manager')}
                  <select className={`${selectClass} mt-2`} {...register('managerId')}>
                    <option value="">{t('noManager')}</option>
                    {managers.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="text-sm font-medium">
                {t('stage')}
                <select className={`${selectClass} mt-2`} {...register('stageId')}>
                  {reference.stages
                    .filter((item) => item.code !== '100')
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.code}% · {commercialStageLabel(item, locale)}
                      </option>
                    ))}
                </select>
              </label>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>{t('lineItems')}</CardTitle>
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
                {t('addItem')}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-3 rounded-xl border p-3 sm:grid-cols-[0.8fr_1.4fr_0.7fr_0.7fr_auto]"
                >
                  <select
                    aria-label={`${t('brand')} ${index + 1}`}
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
                    aria-label={`${t('description')} ${index + 1}`}
                    placeholder={t('productPlaceholder')}
                    {...register(`lineItems.${index}.description`)}
                  />
                  <Input
                    aria-label={`${t('amount')} ${index + 1}`}
                    inputMode="decimal"
                    placeholder={t('amount')}
                    {...register(`lineItems.${index}.amount`)}
                  />
                  <Input
                    aria-label={`${t('cost')} ${index + 1}`}
                    inputMode="decimal"
                    placeholder={t('cost')}
                    {...register(`lineItems.${index}.cost`)}
                  />
                  <Button
                    aria-label={`${t('removeLine')} ${index + 1}`}
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
              <CardTitle>{t('notes')}</CardTitle>
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
            <CardTitle>{t('forecastDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block text-sm font-medium">
              {t('category')}
              <select className={`${selectClass} mt-2`} {...register('forecastCategory')}>
                <option value="PIPELINE">{tCategory('PIPELINE')}</option>
                <option value="BEST_CASE">{tCategory('BEST_CASE')}</option>
                <option value="COMMIT">{tCategory('COMMIT')}</option>
                <option value="CLOSED">{tCategory('CLOSED')}</option>
                <option value="OMITTED">{tCategory('OMITTED')}</option>
              </select>
            </label>
            <label className="block text-sm font-medium">
              {t('estimatedAmount')}
              <Input className="mt-2" inputMode="decimal" {...register('estimatedAmount')} />
            </label>
            <label className="block text-sm font-medium">
              {t('grossMarginPercent')}
              <Input className="mt-2" inputMode="decimal" {...register('grossMarginPercent')} />
            </label>
            <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              {t('derivedGrossProfit')}:{' '}
              {derivedGrossProfit === null ? '—' : derivedGrossProfit.toFixed(2)}
            </p>
            <label className="block text-sm font-medium">
              {t('expectedClose')}
              <Input className="mt-2" type="date" {...register('expectedCloseDate')} />
            </label>
            <label className="block text-sm font-medium">
              {t('expectedBilling')}
              <Input className="mt-2" type="date" {...register('expectedBillingDate')} />
            </label>
            <label className="block text-sm font-medium">
              {t('poNumber')}
              <Input className="mt-2" {...register('poNumber')} />
            </label>
            <label className="block text-sm font-medium">
              {t('overrideReason')}
              <textarea
                className="mt-2 min-h-20 w-full rounded-lg border bg-background p-3 text-sm"
                {...register('qualificationOverrideReason')}
              />
              <span className="mt-1 block text-xs text-muted-foreground">
                {t('overrideReasonHint')}
              </span>
            </label>
            {Object.keys(errors).length > 0 && (
              <p className="text-sm text-danger">{t('reviewFields')}</p>
            )}
            {serverError && (
              <p role="alert" className="text-sm text-danger">
                {serverError}
              </p>
            )}
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('creating') : t('create')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
