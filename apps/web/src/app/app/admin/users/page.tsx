import { UserPlus } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';

interface Membership {
  id: string;
  role: string;
  status: string;
  createdAt: string;
  user: { id: string; name: string; email: string; status: string };
}

export default async function UsersPage() {
  const t = await getTranslations('admin');
  const tRole = await getTranslations('common.role');
  const tStatus = await getTranslations('common.status');
  const memberships = await apiFetch<Membership[]>('/users');
  return (
    <div className="space-y-density-section">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">{t('eyebrow')}</p>
          <h1 className="mt-1 text-page-title font-semibold tracking-[-0.035em]">{t('title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('description')}</p>
        </div>
        <button className="inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-semibold">
          <UserPlus className="size-4" />
          {t('invite')}
        </button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('memberships')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {memberships.map((membership) => (
              <div
                key={membership.id}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center"
              >
                <div className="grid size-10 place-items-center rounded-full bg-secondary font-semibold text-primary">
                  {membership.user.name
                    .split(' ')
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{membership.user.name}</p>
                  <p className="text-xs text-muted-foreground">{membership.user.email}</p>
                </div>
                <Badge>{tRole(membership.role)}</Badge>
                <Badge>{tStatus(membership.status)}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
