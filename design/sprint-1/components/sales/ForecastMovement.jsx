import React from 'react';

const fmt = (n, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: Math.abs(n) >= 1000000 ? 'compact' : 'standard', minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(n);

/** What changed since the last forecast snapshot, and by how much. */
export function ForecastMovement({ since = 'Monday', net = 0, currency = 'USD', movements = [], onSelect, style, ...rest }) {
  const up = net >= 0;
  return (
    <div style={{ display: 'grid', gap: 'var(--space-3)', ...style }} {...rest}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <span style={{ font: 'var(--type-meta)', color: 'var(--text-muted)' }}>Net movement since {since}</span>
        <span className="tnum" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: up ? 'var(--success)' : 'var(--danger)' }}>{up ? '+' : '−'}{fmt(Math.abs(net), currency)}</span>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 'var(--space-2)' }}>
        {movements.map((m) => {
          const pos = m.delta >= 0;
          return (
            <li key={m.label}>
              <button type="button" onClick={onSelect ? () => onSelect(m) : undefined}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', textAlign: 'left', border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', cursor: onSelect ? 'pointer' : 'default', transition: 'var(--transition-color)' }}>
                <span aria-hidden="true" style={{ color: pos ? 'var(--success)' : 'var(--danger)', fontSize: 'var(--text-xs)' }}>{pos ? '▲' : '▼'}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>{m.label}</span>
                  {m.reason ? <span style={{ display: 'block', font: 'var(--type-meta)', color: 'var(--text-muted)' }}>{m.reason}</span> : null}
                </span>
                <span className="tnum" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: pos ? 'var(--success)' : 'var(--danger)' }}>{pos ? '+' : '−'}{fmt(Math.abs(m.delta), currency)}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {!movements.length ? <p style={{ margin: 0, font: 'var(--type-meta)', color: 'var(--text-muted)' }}>No forecast changes since {since}.</p> : null}
    </div>
  );
}
