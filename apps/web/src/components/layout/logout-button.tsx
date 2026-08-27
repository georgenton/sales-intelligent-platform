'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { csrfToken } from '@/lib/utils';

export function LogoutButton() {
  const t = useTranslations('navigation');
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t('signOut')}
      onClick={async () => {
        await fetch('/backend/auth/logout', {
          method: 'POST',
          headers: { 'x-csrf-token': csrfToken() },
        });
        router.replace('/login');
        router.refresh();
      }}
    >
      <LogOut className="size-4" />
    </Button>
  );
}
