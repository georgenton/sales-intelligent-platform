'use client';

import { ArrowLeft, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function PasswordRecoveryForm({ token }: { token?: string }) {
  const t = useTranslations('passwordRecovery');
  const reset = Boolean(token);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (reset && password !== confirm) {
      setError(t('passwordMismatch'));
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(
        reset ? '/backend/auth/reset-password' : '/backend/auth/forgot-password',
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(reset ? { token, newPassword: password } : { email }),
        },
      );
      if (!response.ok) throw new Error(String(response.status));
      setComplete(true);
    } catch {
      setError(reset ? t('resetError') : t('requestError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background p-5">
      <Card className="w-full max-w-md">
        <CardHeader>
          <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
            <KeyRound className="size-5" />
          </span>
          <h1 className="mt-3 text-2xl font-semibold">
            {t(reset ? 'resetTitle' : 'requestTitle')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t(reset ? 'resetDescription' : 'requestDescription')}
          </p>
        </CardHeader>
        <CardContent>
          {complete ? (
            <div role="status" className="space-y-4">
              <p className="rounded-xl bg-surface-success-soft p-3 text-sm text-success">
                {t(reset ? 'resetComplete' : 'requestComplete')}
              </p>
              <Link
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                href="/login"
              >
                <ArrowLeft className="size-4" /> {t('backToLogin')}
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={(event) => void submit(event)}>
              {reset ? (
                <>
                  <label className="block text-sm font-medium">
                    {t('newPassword')}
                    <Input
                      className="mt-2"
                      type="password"
                      autoComplete="new-password"
                      minLength={12}
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </label>
                  <p className="text-xs text-muted-foreground">{t('passwordRules')}</p>
                  <label className="block text-sm font-medium">
                    {t('confirmPassword')}
                    <Input
                      className="mt-2"
                      type="password"
                      autoComplete="new-password"
                      minLength={12}
                      required
                      value={confirm}
                      onChange={(event) => setConfirm(event.target.value)}
                    />
                  </label>
                </>
              ) : (
                <label className="block text-sm font-medium">
                  {t('email')}
                  <Input
                    className="mt-2"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>
              )}
              {error ? (
                <p
                  role="alert"
                  className="rounded-xl bg-surface-danger-soft p-3 text-sm text-danger"
                >
                  {error}
                </p>
              ) : null}
              <Button className="w-full" disabled={busy || (reset && !token)}>
                {busy ? t('working') : t(reset ? 'resetAction' : 'requestAction')}
              </Button>
              <Link
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                href="/login"
              >
                <ArrowLeft className="size-4" /> {t('backToLogin')}
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
