'use client';

import { Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { csrfToken } from '@/lib/utils';

export function CreateSnapshotButton() {
  const t = useTranslations('forecast');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <Button
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          const response = await fetch('/backend/forecast/snapshots', {
            method: 'POST',
            headers: { 'x-csrf-token': csrfToken() },
          });
          if (response.ok) router.refresh();
        } finally {
          setLoading(false);
        }
      }}
    >
      <Camera className="size-4" />
      {loading ? t('capturing') : t('capture')}
    </Button>
  );
}
