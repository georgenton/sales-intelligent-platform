'use client';

import { CheckCircle2, CircleAlert, Save } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AppLocale } from '@/i18n/config';
import { useQualificationQuery, useUpdateQualificationMutation } from '@/store/api';

export function QualificationPanel({ opportunityId }: { opportunityId: string }) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('qualification');
  const { data, isLoading, isError } = useQualificationQuery(opportunityId);
  const [update, updateState] = useUpdateQualificationMutation();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  if (isLoading)
    return (
      <Card aria-busy="true">
        <CardContent className="p-6 text-sm text-muted-foreground">{t('loading')}</CardContent>
      </Card>
    );
  if (isError || !data)
    return (
      <Card>
        <CardContent className="p-6 text-sm text-danger" role="alert">
          {t('loadError')}
        </CardContent>
      </Card>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <p className="text-xs text-muted-foreground">{t('description')}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {data.gates.map((gate) => (
          <section key={gate.gateCode} aria-labelledby={`gate-${gate.gateCode}`}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 id={`gate-${gate.gateCode}`} className="text-sm font-semibold">
                {t('gate', { code: gate.gateCode })}
              </h3>
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold ${gate.verdict.complete ? 'text-success' : 'text-warning'}`}
              >
                {gate.verdict.complete ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <CircleAlert className="size-4" />
                )}
                {gate.verdict.satisfied}/{gate.verdict.required} {t('satisfied')}
              </span>
            </div>
            <div className="space-y-3">
              {gate.criteria.map((criterion) => {
                const evidence = drafts[criterion.id] ?? criterion.response?.evidence ?? '';
                const answer = criterion.response?.answer ?? 'UNKNOWN';
                return (
                  <div key={criterion.id} className="rounded-xl border p-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold">
                          {locale === 'es' ? criterion.labelEs : criterion.labelEn}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {locale === 'es' ? criterion.descriptionEs : criterion.descriptionEn}
                        </p>
                      </div>
                      <select
                        aria-label={t('answerFor', {
                          criterion: locale === 'es' ? criterion.labelEs : criterion.labelEn,
                        })}
                        className="h-9 rounded-lg border bg-background px-2 text-sm"
                        value={answer}
                        onChange={async (event) => {
                          setMessage('');
                          const next = event.target.value as 'YES' | 'NO' | 'UNKNOWN';
                          try {
                            await update({
                              opportunityId,
                              criterionId: criterion.id,
                              answer: next,
                              evidence: evidence.trim() || undefined,
                            }).unwrap();
                          } catch {
                            setMessage(t('saveError'));
                          }
                        }}
                      >
                        <option value="UNKNOWN">{t('unknown')}</option>
                        <option value="YES">{t('yes')}</option>
                        <option value="NO">{t('no')}</option>
                      </select>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <input
                        className="h-9 min-w-0 flex-1 rounded-lg border bg-background px-3 text-sm"
                        value={evidence}
                        placeholder={
                          criterion.evidenceRequired ? t('evidenceRequired') : t('evidenceOptional')
                        }
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [criterion.id]: event.target.value,
                          }))
                        }
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updateState.isLoading}
                        aria-label={t('saveEvidence')}
                        onClick={async () => {
                          setMessage('');
                          try {
                            await update({
                              opportunityId,
                              criterionId: criterion.id,
                              answer,
                              evidence: evidence.trim() || undefined,
                            }).unwrap();
                          } catch {
                            setMessage(t('saveError'));
                          }
                        }}
                      >
                        <Save className="size-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
        {message && (
          <p role="alert" className="text-sm text-danger">
            {message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
