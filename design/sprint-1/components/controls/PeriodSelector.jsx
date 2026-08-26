import React from 'react';

/** Fiscal period switcher. The period is global state — never per-widget. */
export function PeriodSelector({ periods = [], value, onChange, comparison, style, ...rest }) {
  return (
    <div role="group" aria-label="Fiscal period" style={{ display: 'inline-flex', alignItems: 'center', gap: 2, padding: 3, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', ...style }} {...rest}>
      {periods.map((p) => {
        const active = p === value;
        return (
          <button key={p} type="button" aria-pressed={active} onClick={() => onChange && onChange(p)}
            style={{ height: 30, padding: '0 var(--space-3)', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', background: active ? 'var(--brand)' : 'transparent', color: active ? 'var(--text-on-brand)' : 'var(--text-muted)', transition: 'var(--transition-color)' }}>{p}</button>
        );
      })}
      {comparison ? <span style={{ padding: '0 var(--space-2)', font: 'var(--type-meta)', color: 'var(--text-muted)', borderLeft: '1px solid var(--border)', marginLeft: 4 }}>vs {comparison}</span> : null}
    </div>
  );
}
