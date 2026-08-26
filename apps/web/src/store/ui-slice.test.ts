import { describe, expect, it } from 'vitest';
import {
  productUiReducer,
  recordForecastDecision,
  recordGuidedDecision,
  selectOpportunity,
  setAppearanceMode,
  setExpandedFunnelStage,
  setExperienceMode,
  setImportWizardState,
  togglePriority,
} from './ui-slice';

describe('product interaction state', () => {
  it('keeps cognitive mode and appearance independent', () => {
    const focused = productUiReducer(undefined, setExperienceMode('FOCUS'));
    const dark = productUiReducer(focused, setAppearanceMode('DARK'));
    expect(dark.experienceMode).toBe('FOCUS');
    expect(dark.appearanceMode).toBe('DARK');
  });

  it('tracks drawer, funnel and session-only decisions', () => {
    let state = productUiReducer(undefined, selectOpportunity('opp-1'));
    state = productUiReducer(state, setExpandedFunnelStage('Commit'));
    state = productUiReducer(
      state,
      recordGuidedDecision({ opportunityId: 'opp-1', action: 'Contact customer' }),
    );
    state = productUiReducer(
      state,
      recordForecastDecision({ opportunityId: 'opp-1', action: 'Keep Commit' }),
    );
    expect(state.selectedOpportunityId).toBe('opp-1');
    expect(state.copilotContext.opportunityId).toBe('opp-1');
    expect(state.expandedFunnelStage).toBe('Commit');
    expect(state.guidedReviewProgress['opp-1']).toBe('Contact customer');
    expect(state.forecastReviewProgress['opp-1']).toBe('Keep Commit');
  });

  it('toggles focus priorities and advances import progress without storing file contents', () => {
    let state = productUiReducer(undefined, togglePriority('opp-1'));
    state = productUiReducer(
      state,
      setImportWizardState({ step: 4, fileName: 'opportunities.csv' }),
    );
    expect(state.completedPriorities).toEqual(['opp-1']);
    expect(state.importWizardState).toEqual({
      step: 4,
      fileName: 'opportunities.csv',
      template: 'Opportunity CSV',
    });
    expect(JSON.stringify(state)).not.toContain('password');
  });
});
