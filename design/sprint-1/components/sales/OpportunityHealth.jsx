import React from 'react';

const healthMap = {
  HEALTHY: { color: 'var(--success)', label: 'Healthy', icon: 'M20 6 9 17l-5-5' },
  AT_RISK: { color: 'var(--warning)', label: 'At risk', icon: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z' },
  CRITICAL: { color: 'var(--critical)', label: 'Critical', icon: 'M12 8v4M12 16h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z' },
};

/** Explainable 0–100 forecast health: score, status, and the factors that moved it. */
export function OpportunityHealth({ score, status = 'HEALTHY', factors = [], showFactors, size = 'md', style, ...rest }) {
  const h = healthMap[status] || healthMap.HEALTHY;
  const dim = size === 'lg' ? 64 : size === 'sm' ? 34 : 46;
  const r = (dim - 6) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ display: 'grid', gap: 'var(--space-3)', ...style }} {...rest}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} role="img" aria-label={`Forecast health ${score} of 100, ${h.label}`}>
          <circle cx={dim / 2} cy={dim / 2} r={r} fill="none" stroke="var(--surface-sunken)" strokeWidth="5" />
          <circle cx={dim / 2} cy={dim / 2} r={r} fill="none" stroke={h.color} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={`${(c * Math.max(0, Math.min(100, score))) / 100} ${c}`}
            transform={`rotate(-90 ${dim / 2} ${dim / 2})`} />
        </svg>
        <div>
          <div className="tnum" style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: size === 'lg' ? 'var(--text-3xl)' : 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', color: h.color }}>{score}</span>
            <span style={{ font: 'var(--type-meta)', color: 'var(--text-muted)' }}>/ 100</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 2, color: h.color }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={h.icon} /></svg>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)' }}>{h.label}</span>
          </div>
        </div>
      </div>
      {showFactors && factors.length ? (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 'var(--space-2)' }}>
          {factors.map((fx) => (
            <li key={fx.code} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'baseline', font: 'var(--type-meta)' }}>
              <b className="tnum" style={{ minWidth: 34, color: fx.impact < 0 ? 'var(--danger)' : 'var(--success)' }}>{fx.impact > 0 ? `+${fx.impact}` : fx.impact}</b>
              <span style={{ color: 'var(--text-muted)' }}>{fx.message}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
