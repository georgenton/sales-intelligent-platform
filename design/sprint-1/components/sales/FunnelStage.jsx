import React from 'react';

const fmt = (n, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: Math.abs(n) >= 1000000 ? 'compact' : 'standard', minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(n);

const stageToken = {
  discovery: 'var(--pipeline-discovery)', qualified: 'var(--pipeline-qualified)',
  proposal: 'var(--pipeline-proposal)', commit: 'var(--pipeline-commit)',
  backlog: 'var(--pipeline-backlog)', billed: 'var(--pipeline-billed)',
};

/** One narrowing band of the funnel. Hover reveals stage mechanics; click selects. */
export function FunnelStage({ name, token = 'commit', amount, count, widthPct = 100, probability, avgAmount, atRisk = 0, atRiskAmount, avgDaysInStage, likelyToSlip, conversion, currency = 'USD', selected, onSelect, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  // Priority order: amount, count, at-risk amount, average days in stage, likely slippage.
  const primary = [
    ['Amount', fmt(amount, currency)],
    ['Opportunities', String(count)],
    atRiskAmount !== undefined ? ['At risk', `${fmt(atRiskAmount, currency)}${atRisk ? ` · ${atRisk} deals` : ''}`]
      : atRisk ? ['At risk', `${atRisk} deals`] : null,
    avgDaysInStage !== undefined ? ['Avg days in stage', `${avgDaysInStage}d`] : null,
    likelyToSlip !== undefined ? ['Likely slippage', fmt(likelyToSlip, currency)] : null,
  ].filter(Boolean);
  const secondary = [
    conversion !== undefined ? `${conversion}% conversion` : null,
    probability !== undefined ? `${probability}% probability` : null,
    avgAmount !== undefined ? `avg deal ${fmt(avgAmount, currency)}` : null,
  ].filter(Boolean);
  return (
    <div style={{ position: 'relative', ...style }} {...rest}>
      <button
        type="button"
        aria-pressed={!!selected}
        aria-label={`${name}: ${fmt(amount, currency)} across ${count} opportunities`}
        onClick={onSelect}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: 'block', width: `${widthPct}%`, margin: '0 auto', border: 'none', cursor: 'pointer',
          background: stageToken[token] || stageToken.commit,
          padding: 'var(--space-3) var(--space-4)', color: '#fff', textAlign: 'left',
          borderRadius: 'var(--radius-sm)', transition: 'filter var(--dur-fast) var(--ease-standard), outline-color var(--dur-fast)',
          filter: hover ? 'brightness(1.08)' : 'none',
          outline: selected ? '2px solid var(--text-primary)' : '2px solid transparent', outlineOffset: 2,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>{name}</span>
          <span className="tnum" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>{fmt(amount, currency)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 2, fontSize: 'var(--text-11)', opacity: 0.85 }}>
          <span className="tnum">{count} opportunities</span>
          {atRisk ? <span className="tnum">· {atRisk} at risk</span> : null}
        </div>
      </button>
      {hover ? (
        <div role="tooltip" style={{ position: 'absolute', top: '50%', left: 'calc(100% + 8px)', transform: 'translateY(-50%)', zIndex: 5, minWidth: 214, padding: 'var(--space-3)', background: 'var(--surface-inverse)', color: 'var(--text-inverse)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-overlay)', display: 'grid', gap: 5 }}>
          {primary.map(([k, v]) => (
            <span key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)', fontSize: 'var(--text-11)' }}>
              <span style={{ color: 'var(--text-inverse-muted)' }}>{k}</span>
              <b className="tnum" style={{ color: k === 'At risk' || k === 'Likely slippage' ? 'oklch(0.78 0.14 30)' : 'var(--text-inverse)' }}>{v}</b>
            </span>
          ))}
          {secondary.length ? (
            <span style={{ marginTop: 2, paddingTop: 5, borderTop: '1px solid var(--border-inverse)', fontSize: 'var(--text-10)', color: 'var(--text-inverse-muted)' }}>
              {secondary.join(' · ')}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
