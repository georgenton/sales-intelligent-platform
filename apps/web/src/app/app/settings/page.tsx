import {
  CommercialSettings,
  type CommercialConfig,
} from '@/components/settings/commercial-settings';
import { apiFetch } from '@/lib/api';

export default async function SettingsPage() {
  const config = await apiFetch<CommercialConfig>('/commercial/config');
  return <CommercialSettings initial={config} />;
}
