'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const schema = z.object({ email: z.email(), password: z.string().min(10) });
type LoginValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
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
      setError(
        response.status === 429
          ? 'Too many attempts. Try again shortly.'
          : 'Email or password is incorrect.',
      );
      return;
    }
    router.replace('/app/dashboard');
    router.refresh();
  });

  return (
    <Card className="w-full max-w-md border-0 shadow-none">
      <CardHeader className="px-0 pb-8">
        <div className="mb-7 grid size-12 place-items-center rounded-2xl bg-secondary text-primary lg:hidden">
          <LockKeyhole />
        </div>
        <p className="text-sm font-semibold text-primary">Secure workspace</p>
        <h2 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">Welcome back</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Sign in to review your team&apos;s commercial position.
        </p>
      </CardHeader>
      <CardContent className="px-0">
        <form className="space-y-5" onSubmit={submit} noValidate>
          <label className="block text-sm font-medium">
            Email
            <Input className="mt-2" autoComplete="email" {...register('email')} />
          </label>
          {errors.email && <p className="text-sm text-danger">Enter a valid email.</p>}
          <label className="block text-sm font-medium">
            Password
            <Input
              className="mt-2"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
          </label>
          {errors.password && (
            <p className="text-sm text-danger">Password must have at least 10 characters.</p>
          )}
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}
          <Button className="h-12 w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              'Signing in…'
            ) : (
              <>
                Sign in <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
