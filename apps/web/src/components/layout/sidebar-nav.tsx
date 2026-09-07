'use client';

import {
  BellRing,
  ChartNoAxesCombined,
  FileUp,
  Gauge,
  Settings,
  Sparkles,
  Target,
  UsersRound,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function SidebarNav({
  showAdmin,
  canImport,
  canReadAlerts,
}: {
  showAdmin: boolean;
  canImport: boolean;
  canReadAlerts: boolean;
}) {
  const t = useTranslations('navigation');
  const pathname = usePathname();
  const nav = [
    { href: '/app/dashboard', label: t('commandCenter'), icon: Gauge },
    { href: '/app/opportunities', label: t('opportunities'), icon: Target },
    { href: '/app/forecast', label: t('forecast'), icon: Sparkles },
    ...(canReadAlerts ? [{ href: '/app/alerts', label: t('alerts'), icon: BellRing }] : []),
    { href: '/app/analytics', label: t('analytics'), icon: ChartNoAxesCombined },
  ];
  const withImport = canImport
    ? [...nav, { href: '/app/import', label: t('import'), icon: FileUp }]
    : nav;
  const items = showAdmin
    ? [
        ...withImport,
        { href: '/app/settings', label: t('settings'), icon: Settings },
        { href: '/app/admin/users', label: t('users'), icon: UsersRound },
      ]
    : withImport;
  return (
    <nav aria-label={t('primary')} className="space-y-1">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            title={item.label}
            className={cn(
              'flex items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-colors hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground xl:justify-start',
              active && 'bg-sidebar-foreground/10 text-sidebar-foreground',
            )}
          >
            <Icon className="size-[18px]" />
            <span className="hidden xl:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
