import React from 'react';

/** Days in current stage against the stage benchmark — the stagnation signal. */
export function StageVelocity({ stage, daysInStage, benchmarkDays, style, ...rest }) {
  const ratio = benchmarkDays ? daysInStage / benchmarkDays : 0;
  const tone = ratio > 1.5 ? 'var(--danger)' : ratio > 1 ? 'var(--warning)' : 'var(--success)';
  const verdict = ratio > 1.5 ? 'Stalled' : ratio > 1 ? 'Slowing' : 'On pace';
  return (
    <div style={{ display: 'grid', gap: 'var(--space-2)', ...style }} {...rest}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <span style={{ font: 'var(--type-meta)', color: 'var(--text-muted)' }}>{stage} · days in stage</span>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: tone }}>{verdict}</span>
      </div>
      <div style={{ position: 'relative', height: 8, borderRadius: 'var(--radius-pill)', background: 'var(--surface-sunken)' }}>
        <div style={{ width: `${Math.min(100, ratio * 66)}%`, height: '100%', borderRadius: 'var(--radius-pill)', background: tone }} />
        {benchmarkDays ? <span style={{ position: 'absolute', left: '66%', top: -3, width: 2, height: 14, background: 'var(--text-muted)' }} /> : null}
      </div>
      <span className="tnum" style={{ font: 'var(--type-meta)', color: 'var(--text-muted)' }}>
        {daysInStage}d{benchmarkDays ? ` · benchmark ${benchmarkDays}d` : ''}
      </span>
    </div>
  );
}
