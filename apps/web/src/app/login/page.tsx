import { LoginForm } from '@/components/auth/login-form';
import { getTranslations } from 'next-intl/server';

export default async function LoginPage() {
  const t = await getTranslations('auth');
  return (
    <main className="relative grid min-h-screen overflow-hidden bg-sidebar lg:grid-cols-[1.15fr_0.85fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden p-14 text-sidebar-foreground lg:flex">
        <div className="login-visual absolute inset-0" />
        <div className="relative flex items-center gap-3 text-sm font-semibold tracking-[0.16em] uppercase">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            SI
          </span>
          Sales Intelligence
        </div>
        <div className="relative max-w-2xl">
          <p className="mb-5 text-sm font-semibold tracking-[0.24em] text-copilot-accent uppercase">
            {t('eyebrow')}
          </p>
          <h1 className="text-6xl leading-[1.02] font-semibold tracking-[-0.045em]">
            {t('headline')}
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-sidebar-muted">{t('description')}</p>
        </div>
        <p className="relative text-sm text-sidebar-muted">{t('environment')}</p>
      </div>
      <div className="flex items-center justify-center bg-background px-6 py-14">
        <LoginForm />
      </div>
    </main>
  );
}
