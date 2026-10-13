import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  AlertData,
  ManagerDashboardData,
  OpportunityData,
  QualificationData,
  ReviewEvent,
} from '@/lib/types';
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
  tagTypes: ['Opportunity', 'Alerts', 'Forecast', 'Qualification', 'Reviews', 'ManagerDashboard'],
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
    managerDashboard: builder.query<
      ManagerDashboardData,
      {
        period: 'current' | 'next';
        brandId?: string;
        line?: string;
        sellerId?: string;
        weekStart?: string;
      }
    >({
      query: (filters) => {
        const params = new URLSearchParams({ period: filters.period });
        if (filters.brandId) params.set('brandId', filters.brandId);
        if (filters.line) params.set('line', filters.line);
        if (filters.sellerId) params.set('sellerId', filters.sellerId);
        if (filters.weekStart) params.set('weekStart', filters.weekStart);
        return `/analytics/manager-dashboard?${params.toString()}`;
      },
      providesTags: ['ManagerDashboard'],
    }),
    createCustomerVisit: builder.mutation<
      unknown,
      {
        sellerId: string;
        customerId: string;
        visitedAt: string;
        foundOpportunity: boolean;
        opportunityId?: string;
        idempotencyKey: string;
      }
    >({
      query: (body) => ({ url: '/visits', method: 'POST', body }),
      invalidatesTags: ['ManagerDashboard'],
    }),
    linkCustomerVisit: builder.mutation<unknown, { visitId: string; opportunityId: string }>({
      query: ({ visitId, opportunityId }) => ({
        url: `/visits/${visitId}/opportunity`,
        method: 'PATCH',
        body: { opportunityId },
      }),
      invalidatesTags: ['ManagerDashboard'],
    }),
    createOpportunity: builder.mutation<OpportunityData, object>({
      query: (body) => ({ url: '/opportunities', method: 'POST', body }),
      invalidatesTags: ['Opportunity', 'Alerts', 'ManagerDashboard'],
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
        'ManagerDashboard',
      ],
    }),
    qualification: builder.query<QualificationData, string>({
      query: (opportunityId) => `/qualification/opportunities/${opportunityId}`,
      providesTags: (_result, _error, opportunityId) => [
        { type: 'Qualification', id: opportunityId },
      ],
    }),
    updateQualification: builder.mutation<
      unknown,
      {
        opportunityId: string;
        criterionId: string;
        answer: 'YES' | 'NO' | 'UNKNOWN';
        evidence?: string;
      }
    >({
      query: ({ opportunityId, ...body }) => ({
        url: `/qualification/opportunities/${opportunityId}/responses`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { opportunityId }) => [
        { type: 'Qualification', id: opportunityId },
        { type: 'Opportunity', id: opportunityId },
        'Opportunity',
        'Alerts',
        'ManagerDashboard',
      ],
    }),
    reviews: builder.query<ReviewEvent[], { opportunityId?: string; pendingOnly?: boolean } | void>(
      {
        query: (filters) => {
          const params = new URLSearchParams();
          if (filters?.opportunityId) params.set('opportunityId', filters.opportunityId);
          if (filters?.pendingOnly) params.set('pendingOnly', 'true');
          const suffix = params.size ? `?${params.toString()}` : '';
          return `/reviews${suffix}`;
        },
        providesTags: ['Reviews'],
      },
    ),
    createReview: builder.mutation<
      ReviewEvent,
      {
        opportunityId: string;
        type: ReviewEvent['type'];
        body?: string;
        parentEventId?: string;
      }
    >({
      query: (body) => ({ url: '/reviews', method: 'POST', body }),
      invalidatesTags: (_result, _error, { opportunityId }) => [
        'Reviews',
        'Opportunity',
        { type: 'Opportunity', id: opportunityId },
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
  useCreateCustomerVisitMutation,
  useLinkCustomerVisitMutation,
  useManagerDashboardQuery,
  useCreateReviewMutation,
  useQualificationQuery,
  useReviewsQuery,
  useUpdateQualificationMutation,
  useUpdateOpportunityMutation,
} = productApi;
