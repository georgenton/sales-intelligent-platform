import React from 'react';

const fmt = (n, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: Math.abs(n) >= 1000000 ? 'compact' : 'standard', minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(n);

/** Billed + forecast against quota on one axis, with the quota line as the reference. */
export function QuotaProgress({ quota, billed, forecast, currency = 'USD', label = 'Quota attainment', compact, style, ...rest }) {
  const max = Math.max(quota, billed + forecast) || 1;
  const pct = (n) => `${Math.max(0, Math.min(100, (n / max) * 100))}%`;
  const attainment = quota ? ((billed + forecast) / quota) * 100 : 0;
  const quotaPos = Math.max(0, Math.min(100, (quota / max) * 100));
  const markerAnchor = quotaPos > 92 ? { right: 0, left: 'auto', transform: 'none' }
    : quotaPos < 8 ? { left: 0, transform: 'none' }
    : { left: `${quotaPos}%`, transform: 'translateX(-50%)' };
  const short = attainment < 100;
  return (
    <div style={style} {...rest}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>{label}</span>
        <span className="tnum" style={{ fontSize: compact ? 'var(--text-sm)' : 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: short ? 'var(--warning)' : 'var(--success)' }}>{attainment.toFixed(1)}%</span>
      </div>
      <div role="img" aria-label={`Billed ${fmt(billed, currency)}, forecast ${fmt(forecast, currency)}, quota ${fmt(quota, currency)}`}
        style={{ position: 'relative', marginTop: 'var(--space-3)', height: compact ? 10 : 14, borderRadius: 'var(--radius-pill)', background: 'var(--surface-sunken)', overflow: 'hidden', display: 'flex' }}>
        <div style={{ width: pct(billed), background: 'var(--pipeline-billed)', transition: 'width var(--dur-slow) var(--ease-out)' }} />
        <div style={{ width: pct(forecast), background: 'var(--pipeline-commit)', opacity: 0.55, transition: 'width var(--dur-slow) var(--ease-out)' }} />
      </div>
      <div style={{ position: 'relative', height: 14, marginTop: 2 }}>
        <span style={{ position: 'absolute', ...markerAnchor, maxWidth: '100%', font: 'var(--type-meta)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>│ quota {fmt(quota, currency)}</span>
      </div>
      {compact ? null : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2) var(--space-4)', marginTop: 'var(--space-4)', minWidth: 0 }}>
          {[['Billed', billed, 'var(--pipeline-billed)'], ['Forecast', forecast, 'var(--pipeline-commit)'], ['Remaining', Math.max(0, quota - billed - forecast), 'var(--surface-sunken)']].map(([k, v, c]) => (
            <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', font: 'var(--type-meta)', color: 'var(--text-muted)' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: c, border: c === 'var(--surface-sunken)' ? '1px solid var(--border)' : 'none' }} />
              {k} <b className="tnum" style={{ color: 'var(--text-primary)' }}>{fmt(v, currency)}</b>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
