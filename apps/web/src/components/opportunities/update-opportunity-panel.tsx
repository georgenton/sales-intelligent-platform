'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { OpportunityData } from '@/lib/types';
import { csrfToken } from '@/lib/utils';
import type { AppLocale } from '@/i18n/config';
import { commercialStageLabel } from '@/lib/commercial';
import type { ReferenceData } from './opportunity-form';

const schema = z.object({
  status: z.enum(['OPEN', 'WON', 'LOST', 'CANCELLED']),
  stageId: z.string().uuid(),
  forecastCategory: z.enum(['PIPELINE', 'BEST_CASE', 'COMMIT', 'CLOSED', 'OMITTED']),
  estimatedAmount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  grossMarginPercent: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .refine((value) => Number(value) >= 0 && Number(value) <= 100)
    .optional()
    .or(z.literal('')),
  expectedCloseDate: z.string().min(1),
  expectedBillingDate: z.string().optional(),
  poNumber: z.string().optional(),
  qualificationOverrideReason: z.string().max(500).optional().or(z.literal('')),
});
type Values = z.infer<typeof schema>;
const selectClass =
  'mt-2 h-density-control w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring';

export function UpdateOpportunityPanel({
  opportunity,
  reference,
}: {
  opportunity: OpportunityData;
  reference: ReferenceData;
}) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('opportunities.update');
  const tStatus = useTranslations('common.status');
  const tCategory = useTranslations('common.forecastCategory');
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
      grossMarginPercent:
        opportunity.grossMarginPercent === null ? '' : String(opportunity.grossMarginPercent),
      expectedCloseDate: opportunity.expectedCloseDate.slice(0, 10),
      expectedBillingDate: opportunity.expectedBillingDate?.slice(0, 10) ?? '',
      poNumber: opportunity.poNumber ?? '',
      qualificationOverrideReason: '',
    },
  });
  const submit = handleSubmit(async (values) => {
    setMessage('');
    const response = await fetch(`/backend/opportunities/${opportunity.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', 'x-csrf-token': csrfToken() },
      body: JSON.stringify({
        ...values,
        grossMarginPercent: values.grossMarginPercent || undefined,
        qualificationOverrideReason: values.qualificationOverrideReason || undefined,
        expectedBillingDate: values.expectedBillingDate || undefined,
        poNumber: values.poNumber || undefined,
      }),
    });
    setMessage(response.ok ? t('saved') : t('error'));
    if (response.ok) router.refresh();
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <p className="text-xs text-muted-foreground">{t('description')}</p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={submit}>
          <label className="block text-sm font-medium">
            {t('status')}
            <select className={selectClass} {...register('status')}>
              <option value="OPEN">{tStatus('OPEN')}</option>
              <option value="WON">{tStatus('WON')}</option>
              <option value="LOST">{tStatus('LOST')}</option>
              <option value="CANCELLED">{tStatus('CANCELLED')}</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            {t('stage')}
            <select className={selectClass} {...register('stageId')}>
              {reference.stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.code}% · {commercialStageLabel(stage, locale)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            {t('forecastCategory')}
            <select className={selectClass} {...register('forecastCategory')}>
              <option value="PIPELINE">{tCategory('PIPELINE')}</option>
              <option value="BEST_CASE">{tCategory('BEST_CASE')}</option>
              <option value="COMMIT">{tCategory('COMMIT')}</option>
              <option value="CLOSED">{tCategory('CLOSED')}</option>
              <option value="OMITTED">{tCategory('OMITTED')}</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium">
              {t('amount')}
              <Input className="mt-2" {...register('estimatedAmount')} />
            </label>
            <label className="text-sm font-medium">
              {t('grossMarginPercent')}
              <Input className="mt-2" {...register('grossMarginPercent')} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium">
              {t('closeDate')}
              <Input className="mt-2" type="date" {...register('expectedCloseDate')} />
            </label>
            <label className="text-sm font-medium">
              {t('billingDate')}
              <Input className="mt-2" type="date" {...register('expectedBillingDate')} />
            </label>
          </div>
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
          {message && (
            <p role="status" className="text-sm text-muted-foreground">
              {message}
            </p>
          )}
          <Button className="w-full" disabled={isSubmitting}>
            <Save className="size-4" />
            {isSubmitting ? t('saving') : t('save')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
