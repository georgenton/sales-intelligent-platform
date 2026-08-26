'use client';

import { Building2, CircleUserRound, Moon, Search, Sun, WandSparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CommandPalette } from '@/components/layout/command-palette';
import { LogoutButton } from '@/components/layout/logout-button';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { CopilotPanel } from '@/components/copilot/copilot-panel';
import { ProductProvider } from '@/components/providers/product-provider';
import { OpportunityDrawer } from '@/components/opportunities/opportunity-drawer';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setAppearanceMode,
  setCommandPaletteOpen,
  setExperienceMode,
  type AppearanceMode,
  type ExperienceMode,
} from '@/store/ui-slice';

export interface AppProfile {
  user: { id: string; name: string; email: string };
  tenant: { id: string; name: string; slug: string };
  role: string;
  permissions: string[];
}

function Shell({ profile, children }: { profile: AppProfile; children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const mode = useAppSelector((state) => state.productUi.experienceMode);
  const appearance = useAppSelector((state) => state.productUi.appearanceMode);
  const copilotOpen = useAppSelector((state) => state.productUi.copilotPanelOpen);
  const seller = profile.role === 'SELLER';
  const admin = ['TENANT_ADMIN', 'PLATFORM_ADMIN'].includes(profile.role);
  const modes: Array<{ value: ExperienceMode; label: string }> = seller
    ? [
        { value: 'STANDARD', label: 'Standard' },
        { value: 'FOCUS', label: 'Focus' },
        { value: 'GUIDED', label: 'Guided' },
      ]
    : [
        { value: 'STANDARD', label: 'Standard' },
        { value: 'REVIEW', label: 'Review' },
      ];
  const appearanceModes: Array<{ value: AppearanceMode; label: string }> = [
    { value: 'LIGHT', label: 'Light' },
    { value: 'DARK', label: 'Dark' },
    { value: 'SYSTEM', label: 'System' },
  ];
  const mobile: Array<{ href: string; label: string }> = seller
    ? [
        { href: '/app/dashboard', label: 'Today' },
        { href: '/app/opportunities', label: 'Opportunities' },
        { href: '/app/alerts', label: 'Actions' },
        { href: '/app/forecast', label: 'Meetings' },
      ]
    : [
        { href: '/app/dashboard', label: 'Command' },
        { href: '/app/opportunities', label: 'Pipeline' },
        { href: '/app/forecast', label: 'Forecast' },
        { href: '/app/analytics', label: 'Team' },
      ];

  return (
    <div
      className={`min-h-screen bg-background lg:grid lg:grid-cols-[248px_minmax(0,1fr)] ${copilotOpen ? 'xl:grid-cols-[248px_minmax(0,1fr)_330px]' : ''}`}
    >
      <aside className="hidden min-h-screen flex-col bg-sidebar px-4 py-5 text-sidebar-foreground lg:flex">
        <div className="mb-8 flex items-center gap-3 px-2">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
            SI
          </span>
          <div>
            <p className="text-sm font-semibold">Sales Intelligence</p>
            <p className="text-xs text-sidebar-muted">Command platform</p>
          </div>
        </div>
        <SidebarNav showAdmin={admin} />
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-sidebar-muted">Active workspace</p>
          <p className="mt-1 truncate text-sm font-medium">{profile.tenant.name}</p>
        </div>
      </aside>
      <div className="min-w-0 pb-20 lg:pb-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur lg:px-6">
          <Link
            href="/app/dashboard"
            className="grid size-9 place-items-center rounded-xl bg-primary text-xs font-bold text-primary-foreground lg:hidden"
            aria-label="Sales Intelligence home"
          >
            SI
          </Link>
          <button
            onClick={() => dispatch(setCommandPaletteOpen(true))}
            className="hidden h-9 max-w-sm flex-1 items-center gap-2 rounded-lg bg-muted px-3 text-left text-sm text-muted-foreground md:flex"
          >
            <Search className="size-4" />
            <span className="flex-1">Find anything…</span>
            <kbd className="rounded border bg-card px-1.5 py-0.5 text-[10px]">⌘ K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <label className="hidden items-center gap-2 rounded-lg border bg-card px-2 text-xs font-medium sm:flex">
              <WandSparkles className="size-3.5 text-primary" />
              <span className="sr-only">Cognitive mode</span>
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
              <span className="sr-only">Appearance</span>
              <select
                value={appearance}
                onChange={(event) =>
                  dispatch(setAppearanceMode(event.target.value as AppearanceMode))
                }
                className="h-8 bg-transparent text-xs font-medium outline-none"
              >
                {appearanceModes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="hidden items-center gap-2 text-xs text-muted-foreground xl:flex">
              <Building2 className="size-4" />
              {profile.tenant.name}
            </div>
            <div className="hidden h-6 w-px bg-border sm:block" />
            <CircleUserRound className="size-5 text-primary" />
            <div className="hidden 2xl:block">
              <p className="text-xs font-semibold">{profile.user.name}</p>
              <p className="text-[11px] text-muted-foreground">{seller ? 'Seller' : 'Manager'}</p>
            </div>
            <LogoutButton />
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-5 lg:p-6 xl:p-8">{children}</main>
      </div>
      <CopilotPanel compactByDefault={seller} />
      <nav
        aria-label="Mobile workspace"
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
          onClick={() => dispatch(setCommandPaletteOpen(true))}
          className="px-1 py-3 text-[10px] font-semibold text-muted-foreground"
        >
          Copilot
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
