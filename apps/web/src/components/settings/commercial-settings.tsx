'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { AppLocale } from '@/i18n/config';
import type { QualificationCriterion } from '@/lib/types';
import { csrfToken } from '@/lib/utils';

export interface CommercialConfig {
  settings: {
    fiscalYearStartMonth: number;
    fiscalYearEndMonth: number;
    currency: string;
    defaultMarginThreshold: number;
  };
  period: { label: string; start: string; end: string };
  brands: Array<{ id: string; name: string }>;
  sellers: Array<{ id: string; name: string }>;
  quotas: Array<{
    id: string;
    assigneeId: string | null;
    brandId: string | null;
    amount: number;
  }>;
  criteria: QualificationCriterion[];
}

const moneyValue = (value: number | undefined) => (value === undefined ? '' : String(value));

export function CommercialSettings({ initial }: { initial: CommercialConfig }) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('settingsCommercial');
  const total = initial.quotas.find((quota) => !quota.assigneeId && !quota.brandId)?.amount;
  const [currency, setCurrency] = useState(initial.settings.currency);
  const [fiscalStart, setFiscalStart] = useState(String(initial.settings.fiscalYearStartMonth));
  const [margin, setMargin] = useState(String(initial.settings.defaultMarginThreshold));
  const [totalQuota, setTotalQuota] = useState(moneyValue(total));
  const [brandQuotas, setBrandQuotas] = useState<Record<string, string>>(
    Object.fromEntries(
      initial.brands.map((brand) => [
        brand.id,
        moneyValue(
          initial.quotas.find((quota) => !quota.assigneeId && quota.brandId === brand.id)?.amount,
        ),
      ]),
    ),
  );
  const [sellerQuotas, setSellerQuotas] = useState<Record<string, string>>(
    Object.fromEntries(
      initial.sellers.map((seller) => [
        seller.id,
        moneyValue(
          initial.quotas.find((quota) => quota.assigneeId === seller.id && !quota.brandId)?.amount,
        ),
      ]),
    ),
  );
  const [criteria, setCriteria] = useState(initial.criteria);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const put = async (path: string, body: unknown) => {
    const response = await fetch(`/backend/commercial/config/${path}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', 'x-csrf-token': csrfToken() },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`CONFIG_${response.status}`);
  };

  const saveSettings = async () => {
    setBusy(true);
    setMessage('');
    try {
      await put('settings', {
        currency,
        fiscalYearStartMonth: Number(fiscalStart),
        defaultMarginThreshold: margin,
      });
      setMessage(t('saved'));
    } catch {
      setMessage(t('saveError'));
    } finally {
      setBusy(false);
    }
  };

  const saveQuotas = async () => {
    setBusy(true);
    setMessage('');
    try {
      await put('quotas', {
        totalQuota: totalQuota.trim() ? totalQuota : null,
        brandQuotas: Object.entries(brandQuotas)
          .filter(([, amount]) => amount.trim())
          .map(([brandId, amount]) => ({ brandId, amount })),
        sellerQuotas: Object.entries(sellerQuotas)
          .filter(([, amount]) => amount.trim())
          .map(([sellerId, amount]) => ({ sellerId, amount })),
      });
      setMessage(t('saved'));
    } catch {
      setMessage(t('saveError'));
    } finally {
      setBusy(false);
    }
  };

  const toggleCriterion = async (
    criterion: QualificationCriterion,
    field: 'enabled' | 'required' | 'evidenceRequired',
  ) => {
    const value = !criterion[field];
    setCriteria((current) =>
      current.map((item) => (item.id === criterion.id ? { ...item, [field]: value } : item)),
    );
    try {
      await put(`criteria/${criterion.id}`, { [field]: value });
      setMessage(t('saved'));
    } catch {
      setCriteria((current) =>
        current.map((item) => (item.id === criterion.id ? { ...item, [field]: !value } : item)),
      );
      setMessage(t('saveError'));
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-primary">{t('eyebrow')}</p>
        <h1 className="mt-1 text-page-title font-semibold tracking-[-0.035em]">{t('title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('description', { period: initial.period.label })}
        </p>
      </div>
      {message ? (
        <p role="status" className="rounded-xl bg-muted p-3 text-sm">
          {message}
        </p>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>{t('defaults')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm font-medium">
            {t('currency')}
            <Input
              className="mt-2"
              maxLength={3}
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            />
          </label>
          <label className="text-sm font-medium">
            {t('fiscalStart')}
            <select
              className="mt-2 h-density-control w-full rounded-lg border bg-background px-3 text-sm"
              value={fiscalStart}
              onChange={(event) => setFiscalStart(event.target.value)}
            >
              {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            {t('marginThreshold')}
            <Input
              className="mt-2"
              inputMode="decimal"
              value={margin}
              onChange={(e) => setMargin(e.target.value)}
            />
          </label>
          <Button
            className="sm:col-span-3 sm:justify-self-end"
            disabled={busy}
            onClick={() => void saveSettings()}
          >
            {t('saveDefaults')}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('quotas')}</CardTitle>
          <p className="text-xs text-muted-foreground">{t('quotaDescription')}</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <label className="block max-w-sm text-sm font-medium">
            {t('totalQuota')}
            <Input
              className="mt-2"
              inputMode="decimal"
              value={totalQuota}
              onChange={(e) => setTotalQuota(e.target.value)}
            />
          </label>
          <div>
            <h3 className="text-sm font-semibold">{t('brandQuotas')}</h3>
            <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {initial.brands.map((brand) => (
                <label key={brand.id} className="text-xs font-medium">
                  {brand.name}
                  <Input
                    className="mt-1"
                    inputMode="decimal"
                    value={brandQuotas[brand.id] ?? ''}
                    onChange={(event) =>
                      setBrandQuotas((current) => ({ ...current, [brand.id]: event.target.value }))
                    }
                  />
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold">{t('sellerQuotas')}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{t('sellerOptional')}</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {initial.sellers.map((seller) => (
                <label key={seller.id} className="text-xs font-medium">
                  {seller.name}
                  <Input
                    className="mt-1"
                    inputMode="decimal"
                    value={sellerQuotas[seller.id] ?? ''}
                    onChange={(event) =>
                      setSellerQuotas((current) => ({
                        ...current,
                        [seller.id]: event.target.value,
                      }))
                    }
                  />
                </label>
              ))}
            </div>
          </div>
          <Button disabled={busy} onClick={() => void saveQuotas()}>
            {t('saveQuotas')}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('criteria')}</CardTitle>
          <p className="text-xs text-muted-foreground">{t('criteriaDescription')}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {['60', '80'].map((gate) => (
            <section key={gate}>
              <h3 className="mb-2 text-sm font-semibold">{t('gate', { gate })}</h3>
              <div className="space-y-2">
                {criteria
                  .filter((criterion) => criterion.gateCode === gate)
                  .map((criterion) => (
                    <div
                      key={criterion.id}
                      className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <p className="text-sm font-medium">
                        {locale === 'es' ? criterion.labelEs : criterion.labelEn}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs">
                        {(['enabled', 'required', 'evidenceRequired'] as const).map((field) => (
                          <label key={field} className="flex items-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={criterion[field]}
                              onChange={() => void toggleCriterion(criterion, field)}
                            />
                            {t(field)}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
