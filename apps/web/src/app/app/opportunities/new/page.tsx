import { OpportunityForm, type ReferenceData } from '@/components/opportunities/opportunity-form';
import { apiFetch } from '@/lib/api';

export default async function NewOpportunityPage() {
  const reference = await apiFetch<ReferenceData>('/opportunities/reference-data');
  return <OpportunityForm reference={reference} />;
}
