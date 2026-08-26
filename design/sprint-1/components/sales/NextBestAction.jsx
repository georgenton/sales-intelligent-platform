import React from 'react';

const fmt = (n, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: Math.abs(n) >= 1000000 ? 'compact' : 'standard', minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(n);

/** One commercially relevant action, with the reason it matters. Seller Home's core unit. */
export function NextBestAction({ customer, amount, currency = 'USD', category, risk, suggestion, severity = 'WARNING', primaryLabel = 'Do it', onPrimary, onOpen, style, ...rest }) {
  const tone = severity === 'CRITICAL' ? 'var(--critical)' : severity === 'HIGH' ? 'var(--orange-600)' : 'var(--warning)';
  return (
    <div style={{ display: 'grid', gap: 'var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', padding: 'var(--pad-card-compact)', ...style }} {...rest}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <div style={{ minWidth: 0 }}>
          <button type="button" onClick={onOpen} style={{ padding: 0, border: 'none', background: 'none', font: 'inherit', fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left' }}>{customer}</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 2 }}>
            <span className="tnum" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>{fmt(amount, currency)}</span>
            {category ? <span style={{ font: 'var(--type-meta)', color: 'var(--text-muted)' }}>· {category}</span> : null}
          </div>
        </div>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: tone, marginTop: 6 }} aria-hidden="true" />
      </div>
      {risk ? (
        <p style={{ margin: 0, font: 'var(--type-body)', color: 'var(--text-primary)', textWrap: 'pretty' }}>
          <b style={{ color: tone }}>Risk · </b>{risk}
        </p>
      ) : null}
      {suggestion ? <p style={{ margin: 0, font: 'var(--type-meta)', color: 'var(--text-muted)' }}>Suggested · {suggestion}</p> : null}
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button type="button" onClick={onPrimary} style={{ height: 'var(--control-h-sm)', padding: '0 var(--space-3)', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--brand)', color: 'var(--text-on-brand)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', cursor: 'pointer' }}>{primaryLabel}</button>
        <button type="button" onClick={onOpen} style={{ height: 'var(--control-h-sm)', padding: '0 var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', cursor: 'pointer' }}>Open deal</button>
      </div>
    </div>
  );
}
