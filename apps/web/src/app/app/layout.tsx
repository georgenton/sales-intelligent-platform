import { Building2, CircleUserRound, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { LogoutButton } from '@/components/layout/logout-button';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { apiFetch } from '@/lib/api';

interface Profile {
  user: { id: string; name: string; email: string };
  tenant: { id: string; name: string; slug: string };
  role: string;
  permissions: string[];
}

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const profile = await apiFetch<Profile>('/auth/me');
  const admin = ['TENANT_ADMIN', 'PLATFORM_ADMIN'].includes(profile.role);
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="hidden min-h-screen flex-col bg-[#081e25] px-4 py-5 text-white lg:flex">
        <div className="mb-8 flex items-center gap-3 px-2">
          <span className="grid size-10 place-items-center rounded-xl bg-cyan-300 text-sm font-bold text-[#08242c]">
            SI
          </span>
          <div>
            <p className="text-sm font-semibold">Sales Intelligence</p>
            <p className="text-xs text-slate-500">Command platform</p>
          </div>
        </div>
        <SidebarNav showAdmin={admin} />
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-slate-500">Active workspace</p>
          <p className="mt-1 truncate text-sm font-medium">{profile.tenant.name}</p>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/80 bg-background/90 px-5 backdrop-blur lg:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-xs font-bold text-white">
              SI
            </span>
          </div>
          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="border-0 bg-muted pl-9" placeholder="Search opportunities…" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
              <Building2 className="size-4" />
              {profile.tenant.name}
            </div>
            <div className="h-6 w-px bg-border" />
            <CircleUserRound className="size-5 text-primary" />
            <div className="hidden sm:block">
              <p className="text-xs font-semibold">{profile.user.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {profile.role.replaceAll('_', ' ')}
              </p>
            </div>
            <LogoutButton />
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1600px] p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
