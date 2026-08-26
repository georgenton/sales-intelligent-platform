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
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/app/dashboard', label: 'Command center', icon: Gauge },
  { href: '/app/opportunities', label: 'Opportunities', icon: Target },
  { href: '/app/forecast', label: 'Forecast', icon: Sparkles },
  { href: '/app/alerts', label: 'Alerts', icon: BellRing },
  { href: '/app/analytics', label: 'Analytics', icon: ChartNoAxesCombined },
  { href: '/app/import', label: 'Import', icon: FileUp },
  { href: '/app/settings', label: 'Settings', icon: Settings },
];

export function SidebarNav({ showAdmin }: { showAdmin: boolean }) {
  const pathname = usePathname();
  const items = showAdmin
    ? [...nav, { href: '/app/admin/users', label: 'Users', icon: UsersRound }]
    : nav;
  return (
    <nav aria-label="Primary" className="space-y-1">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-colors hover:bg-white/5 hover:text-sidebar-foreground',
              active && 'bg-white/10 text-sidebar-foreground',
            )}
          >
            <Icon className="size-[18px]" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
