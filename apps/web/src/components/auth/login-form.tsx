'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useSyncExternalStore } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LOGIN_FORM_NATIVE_FALLBACK } from './login-contract';
import Link from 'next/link';

const schema = z.object({ email: z.email(), password: z.string().min(10) });
type LoginValues = z.infer<typeof schema>;

let hydrationCommitted = false;
const subscribeToHydrationCommit = (onStoreChange: () => void) => {
  let active = true;
  queueMicrotask(() => {
    if (!active || hydrationCommitted) return;
    hydrationCommitted = true;
    onStoreChange();
  });
  return () => {
    active = false;
  };
};
const getHydrationSnapshot = () => hydrationCommitted;
const getServerSnapshot = () => false;

export function LoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [error, setError] = useState('');
  const hydrationReady = useSyncExternalStore(
    subscribeToHydrationCommit,
    getHydrationSnapshot,
    getServerSnapshot,
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'admin@techdistribution.demo', password: '' },
  });

  const submit = handleSubmit(async (values) => {
    setError('');
    const response = await fetch('/backend/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!response.ok) {
      setError(response.status === 429 ? t('rateLimited') : t('invalidCredentials'));
      return;
    }
    router.replace('/app/dashboard');
    router.refresh();
  });

  return (
    <Card className="w-full max-w-sm border-0 shadow-none">
      <CardHeader className="px-0 pb-6">
        <h2 className="text-3xl font-semibold tracking-[-0.035em]">{t('welcome')}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{t('prompt')}</p>
      </CardHeader>
      <CardContent className="px-0">
        <form
          action={LOGIN_FORM_NATIVE_FALLBACK.action}
          method={LOGIN_FORM_NATIVE_FALLBACK.method}
          className="space-y-4"
          onSubmit={submit}
          noValidate
        >
          <label className="block text-sm font-medium">
            {t('email')}
            <Input className="mt-2" autoComplete="email" {...register('email')} />
          </label>
          {errors.email && <p className="text-sm text-danger">{t('invalidEmail')}</p>}
          <label className="block text-sm font-medium">
            {t('password')}
            <Input
              className="mt-2"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
          </label>
          {errors.password && <p className="text-sm text-danger">{t('shortPassword')}</p>}
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-surface-danger-soft px-3 py-2 text-sm text-danger"
            >
              {error}
            </p>
          )}
          <div className="text-right">
            <Link href="/forgot-password" className="text-sm font-semibold text-primary">
              {t('forgotPassword')}
            </Link>
          </div>
          <Button
            className="h-density-control w-full"
            type="submit"
            disabled={!hydrationReady || isSubmitting}
          >
            {isSubmitting ? (
              t('signingIn')
            ) : (
              <>
                {t('signIn')} <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
