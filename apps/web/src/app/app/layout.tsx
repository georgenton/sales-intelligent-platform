import { AppShell, type AppProfile } from '@/components/layout/app-shell';
import { apiFetch } from '@/lib/api';

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const profile = await apiFetch<AppProfile>('/auth/me');
  return <AppShell profile={profile}>{children}</AppShell>;
}
