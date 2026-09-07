'use client';

import { Bot, Building2, CircleUserRound, Moon, Search, Sun, WandSparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CommandPalette } from '@/components/layout/command-palette';
import { LanguageSelector } from '@/components/layout/language-selector';
import { LogoutButton } from '@/components/layout/logout-button';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { CopilotPanel } from '@/components/copilot/copilot-panel';
import { applyAppearance, ProductProvider } from '@/components/providers/product-provider';
import { OpportunityDrawer } from '@/components/opportunities/opportunity-drawer';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setAppearanceMode,
  setCommandPaletteOpen,
  setCopilotPanelOpen,
  setExperienceMode,
  type AppearanceMode,
  type ExperienceMode,
} from '@/store/ui-slice';

export interface AppProfile {
  user: { id: string; name: string; email: string };
  tenant: { id: string; name: string; slug: string };
  role: string;
  permissions: string[];
  capabilities: string[];
}

function Shell({ profile, children }: { profile: AppProfile; children: React.ReactNode }) {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const mode = useAppSelector((state) => state.productUi.experienceMode);
  const appearance = useAppSelector((state) => state.productUi.appearanceMode);
  const copilotOpen = useAppSelector((state) => state.productUi.copilotPanelOpen);
  const seller = profile.role === 'SELLER';
  const admin = ['TENANT_ADMIN', 'PLATFORM_ADMIN'].includes(profile.role);
  const modes: Array<{ value: ExperienceMode; label: string }> = seller
    ? [
        { value: 'STANDARD', label: t('common.mode.STANDARD') },
        { value: 'FOCUS', label: t('common.mode.FOCUS') },
        { value: 'GUIDED', label: t('common.mode.GUIDED') },
      ]
    : [
        { value: 'STANDARD', label: t('common.mode.STANDARD') },
        { value: 'REVIEW', label: t('common.mode.REVIEW') },
      ];
  const appearanceModes: Array<{ value: AppearanceMode; label: string }> = [
    { value: 'LIGHT', label: t('common.appearance.LIGHT') },
    { value: 'DARK', label: t('common.appearance.DARK') },
    { value: 'SYSTEM', label: t('common.appearance.SYSTEM') },
  ];
  const mobile: Array<{ href: string; label: string }> = seller
    ? [
        { href: '/app/dashboard', label: t('navigation.today') },
        { href: '/app/opportunities', label: t('navigation.opportunities') },
        { href: '/app/alerts', label: t('navigation.actions') },
        { href: '/app/forecast', label: t('navigation.meetings') },
      ]
    : [
        { href: '/app/dashboard', label: t('navigation.command') },
        { href: '/app/opportunities', label: t('navigation.pipeline') },
        { href: '/app/forecast', label: t('navigation.forecast') },
        { href: '/app/analytics', label: t('navigation.team') },
      ];

  return (
    <div
      className={`min-h-screen bg-background lg:grid lg:grid-cols-[72px_minmax(0,1fr)] xl:grid-cols-[248px_minmax(0,1fr)] ${copilotOpen ? 'xl:grid-cols-[248px_minmax(0,1fr)_330px]' : ''}`}
    >
      <aside className="hidden min-h-screen flex-col bg-sidebar px-2 py-5 text-sidebar-foreground lg:flex xl:px-4">
        <div className="mb-6 flex items-center justify-center gap-3 px-2 xl:justify-start">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
            SI
          </span>
          <div className="hidden xl:block">
            <p className="text-sm font-semibold">{t('common.brand')}</p>
            <p className="text-xs text-sidebar-muted">{t('common.commandPlatform')}</p>
          </div>
        </div>
        <SidebarNav showAdmin={admin} canImport={profile.permissions.includes('imports.manage')} />
        <div className="mt-auto hidden rounded-2xl border border-sidebar-foreground/10 bg-sidebar-foreground/5 p-3 xl:block">
          <p className="text-xs text-sidebar-muted">{t('common.activeWorkspace')}</p>
          <p className="mt-1 truncate text-sm font-medium">{profile.tenant.name}</p>
        </div>
      </aside>
      <div className="min-w-0 pb-20 lg:pb-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/90 px-3 backdrop-blur sm:gap-3 sm:px-4 lg:px-5">
          <Link
            href="/app/dashboard"
            className="grid size-9 place-items-center rounded-xl bg-primary text-xs font-bold text-primary-foreground lg:hidden"
            aria-label={t('navigation.home')}
          >
            SI
          </Link>
          <button
            onClick={() => dispatch(setCommandPaletteOpen(true))}
            className="hidden h-9 max-w-sm flex-1 items-center gap-2 rounded-lg bg-muted px-3 text-left text-sm text-muted-foreground md:flex"
          >
            <Search className="size-4" />
            <span className="flex-1">{t('navigation.findAnything')}</span>
            <kbd className="rounded border bg-card px-1.5 py-0.5 text-[10px]">⌘ K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <label className="hidden items-center gap-2 rounded-lg border bg-card px-2 text-xs font-medium sm:flex">
              <WandSparkles className="size-3.5 text-primary" />
              <span className="sr-only">{t('common.mode.label')}</span>
              <select
                value={mode}
                onChange={(event) =>
                  dispatch(setExperienceMode(event.target.value as ExperienceMode))
                }
                className="h-8 bg-transparent outline-none"
              >
                {modes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="hidden items-center gap-1 rounded-lg border bg-card px-2 sm:flex">
              {appearance === 'DARK' ? (
                <Moon className="size-3.5 text-primary" />
              ) : (
                <Sun className="size-3.5 text-primary" />
              )}
              <span className="sr-only">{t('common.appearance.label')}</span>
              <select
                value={appearance}
                onChange={(event) => {
                  const nextAppearance = event.target.value as AppearanceMode;
                  applyAppearance(nextAppearance);
                  dispatch(setAppearanceMode(nextAppearance));
                }}
                className="h-8 bg-transparent text-xs font-medium outline-none"
              >
                {appearanceModes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="hidden h-9 items-center gap-2 rounded-lg border bg-card px-3 text-xs font-semibold lg:flex xl:hidden"
              aria-label={t('navigation.openCopilot')}
              onClick={() => dispatch(setCopilotPanelOpen(true))}
            >
              <Bot className="size-4 text-primary" />
              {t('navigation.copilot')}
            </button>
            <div className="hidden items-center gap-2 text-xs text-muted-foreground xl:flex">
              <Building2 className="size-4" />
              {profile.tenant.name}
            </div>
            <LanguageSelector />
            <div className="hidden h-6 w-px bg-border md:block" />
            <CircleUserRound className="size-5 text-primary" />
            <div className="hidden 2xl:block">
              <p className="text-xs font-semibold">{profile.user.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {seller ? t('common.role.SELLER') : t('common.role.SALES_MANAGER')}
              </p>
            </div>
            <LogoutButton />
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1600px] p-3 sm:p-4 lg:p-5 xl:p-6">{children}</main>
      </div>
      <CopilotPanel compactByDefault={seller} />
      <nav
        aria-label={t('navigation.mobile')}
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-card px-1 pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {mobile.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`px-1 py-3 text-center text-[10px] font-semibold ${pathname.startsWith(href) ? 'text-primary' : 'text-muted-foreground'}`}
          >
            {label}
          </Link>
        ))}
        <button
          onClick={() => dispatch(setCopilotPanelOpen(true))}
          className="px-1 py-3 text-[10px] font-semibold text-muted-foreground"
        >
          {t('navigation.copilot')}
        </button>
      </nav>
      <CommandPalette />
      <OpportunityDrawer />
    </div>
  );
}

export function AppShell(props: { profile: AppProfile; children: React.ReactNode }) {
  return (
    <ProductProvider>
      <Shell {...props} />
    </ProductProvider>
  );
}
