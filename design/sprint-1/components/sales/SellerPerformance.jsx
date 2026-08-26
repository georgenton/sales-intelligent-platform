import React from 'react';

const fmt = (n, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: Math.abs(n) >= 1000000 ? 'compact' : 'standard', minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(n);

/** Team roster with commit mix and attainment — where a manager picks who to help. */
export function SellerPerformance({ sellers = [], currency = 'USD', onSelect, style, ...rest }) {
  return (
    <div style={{ overflowX: 'auto', ...style }} {...rest}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)', textAlign: 'left' }}>
        <thead>
          <tr style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)' }}>
            <th style={{ padding: 'var(--space-2) var(--space-3)', fontWeight: 'var(--weight-semibold)' }}>Seller</th>
            <th style={{ padding: 'var(--space-2) var(--space-3)', fontWeight: 'var(--weight-semibold)' }}>Opps</th>
            <th style={{ padding: 'var(--space-2) var(--space-3)', fontWeight: 'var(--weight-semibold)' }}>Pipeline</th>
            <th style={{ padding: 'var(--space-2) var(--space-3)', fontWeight: 'var(--weight-semibold)' }}>Commit</th>
            <th style={{ padding: 'var(--space-2) var(--space-3)', fontWeight: 'var(--weight-semibold)', minWidth: 160 }}>Commit mix</th>
          </tr>
        </thead>
        <tbody>
          {sellers.map((s) => {
            const mix = s.pipeline ? (s.commit / s.pipeline) * 100 : 0;
            return (
              <tr key={s.seller} onClick={onSelect ? () => onSelect(s) : undefined}
                style={{ borderTop: '1px solid var(--border)', cursor: onSelect ? 'pointer' : 'default' }}>
                <td style={{ padding: 'var(--space-3)', fontWeight: 'var(--weight-semibold)' }}>{s.seller}</td>
                <td className="tnum" style={{ padding: 'var(--space-3)' }}>{s.opportunities}</td>
                <td className="tnum" style={{ padding: 'var(--space-3)' }}>{fmt(s.pipeline, currency)}</td>
                <td className="tnum" style={{ padding: 'var(--space-3)' }}>{fmt(s.commit, currency)}</td>
                <td style={{ padding: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ flex: 1, height: 8, borderRadius: 'var(--radius-pill)', background: 'var(--surface-sunken)', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, mix)}%`, height: '100%', background: mix < 25 ? 'var(--warning)' : 'var(--pipeline-commit)' }} />
                    </div>
                    <span className="tnum" style={{ font: 'var(--type-meta)', color: 'var(--text-muted)', minWidth: 44 }}>{mix.toFixed(1)}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!sellers.length ? <p style={{ margin: 'var(--space-4)', font: 'var(--type-meta)', color: 'var(--text-muted)' }}>No sellers in this team yet.</p> : null}
    </div>
  );
}
