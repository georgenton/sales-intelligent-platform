import React from 'react';

const catLabel = { PIPELINE: 'Pipeline', BEST_CASE: 'Best case', COMMIT: 'Commit', CLOSED: 'Closed', OMITTED: 'Omitted' };

/** Seller's forecast call vs the system's confidence — the disagreement is the signal. */
export function ForecastConfidence({ sellerCategory = 'COMMIT', confidence = 0, rationale, style, ...rest }) {
  const agree = (sellerCategory === 'COMMIT' && confidence >= 65) || (sellerCategory !== 'COMMIT' && confidence < 65);
  return (
    <div style={{ display: 'grid', gap: 'var(--space-3)', padding: 'var(--pad-card-compact)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', ...style }} {...rest}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>Forecast confidence</span>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: agree ? 'var(--success)' : 'var(--warning)' }}>{agree ? 'Aligned' : 'Disagreement'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div>
          <p style={{ margin: 0, font: 'var(--type-meta)', color: 'var(--text-muted)' }}>Seller call</p>
          <p style={{ margin: '2px 0 0', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>{catLabel[sellerCategory] || sellerCategory}</p>
        </div>
        <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--border)' }} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, font: 'var(--type-meta)', color: 'var(--text-muted)' }}>System confidence</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 4 }}>
            <div style={{ flex: 1, height: 8, borderRadius: 'var(--radius-pill)', background: 'var(--surface-sunken)', overflow: 'hidden' }}>
              <div style={{ width: `${confidence}%`, height: '100%', background: confidence >= 65 ? 'var(--success)' : confidence >= 40 ? 'var(--warning)' : 'var(--danger)' }} />
            </div>
            <span className="tnum" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>{confidence}%</span>
          </div>
        </div>
      </div>
      {rationale ? <p style={{ margin: 0, font: 'var(--type-meta)', color: 'var(--text-muted)', textWrap: 'pretty' }}>{rationale}</p> : null}
    </div>
  );
}
