import { LoginForm } from '@/components/auth/login-form';
import { LanguageSelector } from '@/components/layout/language-selector';
import { getTranslations } from 'next-intl/server';

export default async function LoginPage() {
  const t = await getTranslations('auth');
  const valuePoints = ['forecast', 'opportunities', 'assistance'] as const;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background lg:grid lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative overflow-hidden bg-sidebar px-5 py-5 text-sidebar-foreground sm:px-8 sm:py-7 lg:flex lg:min-h-screen lg:flex-col lg:justify-between lg:p-10 xl:p-12">
        <div className="login-visual absolute inset-0" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs font-semibold tracking-[0.14em] uppercase sm:text-sm">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground sm:size-10">
              SI
            </span>
            <span>Sales Intelligence</span>
          </div>
          <LanguageSelector className="shrink-0 border-white/15 shadow-none" />
        </div>
        <div className="relative mt-7 max-w-3xl lg:my-auto lg:py-5 xl:py-12">
          <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-copilot-accent uppercase sm:text-sm">
            {t('eyebrow')}
          </p>
          <h1 className="max-w-2xl text-[clamp(1.75rem,7vw,2.25rem)] leading-[1.08] font-semibold tracking-[-0.035em] lg:text-[clamp(2.25rem,3.1vw,2.75rem)]">
            {t('headline')}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-sidebar-muted sm:text-[0.9375rem] lg:mt-4 lg:text-base lg:leading-7">
            {t('description')}
          </p>
          <div className="mt-7 hidden gap-4 lg:grid lg:grid-cols-1 xl:grid-cols-3">
            {valuePoints.map((point) => (
              <article key={point} className="border-t border-white/15 pt-3">
                <h2 className="text-sm font-semibold text-sidebar-foreground">
                  {t(`values.${point}.title`)}
                </h2>
                <p className="mt-1 text-[0.8125rem] leading-5 text-sidebar-muted">
                  {t(`values.${point}.description`)}
                </p>
              </article>
            ))}
          </div>
        </div>
        <p className="relative hidden text-xs text-sidebar-muted lg:block">{t('environment')}</p>
      </section>
      <section className="flex items-start justify-center bg-background px-5 py-7 sm:px-8 sm:py-10 lg:items-center lg:px-10 lg:py-12">
        <LoginForm />
      </section>
    </main>
  );
}
