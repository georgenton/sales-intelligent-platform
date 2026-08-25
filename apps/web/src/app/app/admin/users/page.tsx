import { UserPlus } from 'lucide-react';
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
  const memberships = await apiFetch<Membership[]>('/users');
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Administration</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.035em]">Users and roles</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Identity is global; access is granted by tenant membership.
          </p>
        </div>
        <button className="inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-semibold">
          <UserPlus className="size-4" />
          Invite user
        </button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Active memberships</CardTitle>
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
                <Badge>{membership.role.replaceAll('_', ' ')}</Badge>
                <Badge>{membership.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
