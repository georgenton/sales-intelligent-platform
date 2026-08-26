import React from 'react';

const fmt = (n, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: Math.abs(n) >= 1000000 ? 'compact' : 'standard', minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(n);

/** The management interpretation: how far short, what drives it, what to do. */
export function QuotaGap({ gap, currency = 'USD', interpretation, drivers = [], action, onAction, style, ...rest }) {
  const short = gap > 0;
  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)', padding: 'var(--pad-card)', borderRadius: 'var(--radius-lg)', border: '1px solid', borderColor: short ? 'var(--danger)' : 'var(--success)', background: short ? 'var(--danger-soft)' : 'var(--success-soft)', ...style }} {...rest}>
      <div>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: short ? 'var(--danger)' : 'var(--success)' }}>
          {short ? 'Quota gap' : 'Above quota'}
        </span>
        <p className="tnum" style={{ margin: 'var(--space-2) 0 0', font: 'var(--type-kpi-hero)', letterSpacing: 'var(--tracking-display)', color: short ? 'var(--danger)' : 'var(--success)' }}>{fmt(Math.abs(gap), currency)}</p>
      </div>
      {interpretation ? <p style={{ margin: 0, font: 'var(--type-body)', color: 'var(--text-primary)', textWrap: 'pretty' }}>{interpretation}</p> : null}
      {drivers.length ? (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 'var(--space-2)' }}>
          {drivers.map((d) => (
            <li key={d.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', font: 'var(--type-meta)', padding: 'var(--space-2) var(--space-3)', background: 'var(--surface)', borderRadius: 'var(--radius-sm)' }}>
              <span>{d.label}</span>
              <b className="tnum">{fmt(d.amount, currency)}</b>
            </li>
          ))}
        </ul>
      ) : null}
      {action ? (
        <button onClick={onAction} style={{ justifySelf: 'start', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', height: 'var(--control-h-sm)', padding: '0 var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', cursor: 'pointer' }}>{action}</button>
      ) : null}
    </div>
  );
}
