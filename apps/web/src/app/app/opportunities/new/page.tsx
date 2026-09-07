import { OpportunityForm, type ReferenceData } from '@/components/opportunities/opportunity-form';
import { apiFetch } from '@/lib/api';
import { canCreateOpportunity } from '@/lib/permissions';
import { redirect } from 'next/navigation';

interface Profile {
  user: { id: string };
  role: string;
  permissions: string[];
}

export default async function NewOpportunityPage() {
  const profile = await apiFetch<Profile>('/auth/me');
  if (!canCreateOpportunity(profile.permissions)) redirect('/app/opportunities');
  const reference = await apiFetch<ReferenceData>('/opportunities/reference-data');
  return <OpportunityForm reference={reference} profile={profile} />;
}
