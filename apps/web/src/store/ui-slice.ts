import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ExperienceMode = 'STANDARD' | 'FOCUS' | 'GUIDED' | 'REVIEW';
export type AppearanceMode = 'LIGHT' | 'DARK' | 'SYSTEM';
export type CopilotContext = {
  page: string;
  activePeriod?: string;
  opportunityId?: string;
  filters?: Record<string, string>;
};

interface ProductUiState {
  experienceMode: ExperienceMode;
  appearanceMode: AppearanceMode;
  selectedOpportunityId: string | null;
  expandedFunnelStage: string | null;
  commandPaletteOpen: boolean;
  copilotPanelOpen: boolean;
  copilotContext: CopilotContext;
  guidedReviewProgress: Record<string, string>;
  forecastReviewProgress: Record<string, string>;
  dashboardFilters: { search: string; seller: string; brand: string };
  activeFiscalPeriod: string;
  completedPriorities: string[];
  importWizardState: { step: number; fileName: string; template: string };
}

const initialState: ProductUiState = {
  experienceMode: 'STANDARD',
  appearanceMode: 'SYSTEM',
  selectedOpportunityId: null,
  expandedFunnelStage: null,
  commandPaletteOpen: false,
  copilotPanelOpen: false,
  copilotContext: { page: 'dashboard' },
  guidedReviewProgress: {},
  forecastReviewProgress: {},
  dashboardFilters: { search: '', seller: '', brand: '' },
  activeFiscalPeriod: '',
  completedPriorities: [],
  importWizardState: { step: 0, fileName: '', template: 'Opportunity CSV' },
};

const uiSlice = createSlice({
  name: 'productUi',
  initialState,
  reducers: {
    setExperienceMode: (state, action: PayloadAction<ExperienceMode>) => {
      state.experienceMode = action.payload;
    },
    setAppearanceMode: (state, action: PayloadAction<AppearanceMode>) => {
      state.appearanceMode = action.payload;
    },
    selectOpportunity: (state, action: PayloadAction<string | null>) => {
      state.selectedOpportunityId = action.payload;
      if (action.payload) {
        state.copilotContext.opportunityId = action.payload;
      } else {
        delete state.copilotContext.opportunityId;
      }
    },
    setExpandedFunnelStage: (state, action: PayloadAction<string | null>) => {
      state.expandedFunnelStage = action.payload;
    },
    setCommandPaletteOpen: (state, action: PayloadAction<boolean>) => {
      state.commandPaletteOpen = action.payload;
    },
    setCopilotPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.copilotPanelOpen = action.payload;
    },
    setCopilotContext: (state, action: PayloadAction<CopilotContext>) => {
      state.copilotContext = action.payload;
    },
    recordGuidedDecision: (
      state,
      action: PayloadAction<{ opportunityId: string; action: string }>,
    ) => {
      state.guidedReviewProgress[action.payload.opportunityId] = action.payload.action;
    },
    recordForecastDecision: (
      state,
      action: PayloadAction<{ opportunityId: string; action: string }>,
    ) => {
      state.forecastReviewProgress[action.payload.opportunityId] = action.payload.action;
    },
    setDashboardFilter: (
      state,
      action: PayloadAction<{ key: keyof ProductUiState['dashboardFilters']; value: string }>,
    ) => {
      state.dashboardFilters[action.payload.key] = action.payload.value;
    },
    setActiveFiscalPeriod: (state, action: PayloadAction<string>) => {
      state.activeFiscalPeriod = action.payload;
    },
    togglePriority: (state, action: PayloadAction<string>) => {
      const index = state.completedPriorities.indexOf(action.payload);
      if (index >= 0) state.completedPriorities.splice(index, 1);
      else state.completedPriorities.push(action.payload);
    },
    setImportWizardState: (
      state,
      action: PayloadAction<Partial<ProductUiState['importWizardState']>>,
    ) => {
      Object.assign(state.importWizardState, action.payload);
    },
  },
});

export const {
  recordForecastDecision,
  recordGuidedDecision,
  selectOpportunity,
  setActiveFiscalPeriod,
  setAppearanceMode,
  setCommandPaletteOpen,
  setCopilotContext,
  setCopilotPanelOpen,
  setDashboardFilter,
  setExpandedFunnelStage,
  setExperienceMode,
  togglePriority,
  setImportWizardState,
} = uiSlice.actions;
export const productUiReducer = uiSlice.reducer;
