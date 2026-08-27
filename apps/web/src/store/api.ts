import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { AlertData, OpportunityData } from '@/lib/types';
import { csrfToken } from '@/lib/utils';

interface OpportunityList {
  items: OpportunityData[];
  pagination: { total: number; page: number; pages: number };
}

interface ManagerBrief {
  provider: string;
  summary: string;
}

type ManagerBriefIntent = 'RISK' | 'COMMIT' | 'MISSING' | 'MEETING' | 'FOLLOW_UP' | 'CUSTOM';

interface ReferenceData {
  stages: Array<{ id: string; name: string; code: string; probability: number }>;
  brands: Array<{ id: string; name: string }>;
  customers: Array<{ id: string; name: string }>;
  partners: Array<{ id: string; name: string }>;
  users: Array<{ id: string; name: string; role: string }>;
  settings: { currency: string };
}

export const productApi = createApi({
  reducerPath: 'productApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/backend',
    prepareHeaders(headers) {
      const token = csrfToken();
      if (token) headers.set('x-csrf-token', token);
      return headers;
    },
  }),
  tagTypes: ['Opportunity', 'Alerts', 'Forecast'],
  endpoints: (builder) => ({
    opportunities: builder.query<OpportunityList, { search?: string; status?: string } | void>({
      query: (filters) => {
        const params = new URLSearchParams({ perPage: '100' });
        if (filters?.search) params.set('search', filters.search);
        if (filters?.status) params.set('status', filters.status);
        return `/opportunities?${params.toString()}`;
      },
      providesTags: (result) => [
        'Opportunity',
        ...(result?.items.map(({ id }) => ({ type: 'Opportunity' as const, id })) ?? []),
      ],
    }),
    opportunity: builder.query<OpportunityData, string>({
      query: (id) => `/opportunities/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Opportunity', id }],
    }),
    alerts: builder.query<AlertData[], void>({
      query: () => '/alerts',
      providesTags: ['Alerts'],
    }),
    referenceData: builder.query<ReferenceData, void>({
      query: () => '/opportunities/reference-data',
    }),
    createOpportunity: builder.mutation<OpportunityData, object>({
      query: (body) => ({ url: '/opportunities', method: 'POST', body }),
      invalidatesTags: ['Opportunity', 'Alerts'],
    }),
    updateOpportunity: builder.mutation<OpportunityData, { id: string; changes: object }>({
      query: ({ id, changes }) => ({
        url: `/opportunities/${id}`,
        method: 'PATCH',
        body: changes,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Opportunity', id },
        'Opportunity',
        'Alerts',
      ],
    }),
    managerBrief: builder.mutation<
      ManagerBrief,
      { locale: 'en' | 'es'; intentId: ManagerBriefIntent }
    >({
      query: ({ locale, intentId }) => ({
        url: '/ai/manager-brief',
        method: 'POST',
        headers: { 'accept-language': locale },
        body: { intentId },
      }),
    }),
  }),
});

export const {
  useAlertsQuery,
  useManagerBriefMutation,
  useOpportunitiesQuery,
  useOpportunityQuery,
  useReferenceDataQuery,
  useCreateOpportunityMutation,
  useUpdateOpportunityMutation,
} = productApi;
