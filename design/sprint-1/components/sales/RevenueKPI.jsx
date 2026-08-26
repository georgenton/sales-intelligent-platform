import React from 'react';

const fmt = (n, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: Math.abs(n) >= 1000000 ? 'compact' : 'standard', minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(n);

const kpiTones = {
  default: { value: 'var(--text-primary)', chip: 'var(--text-muted)', bg: 'var(--surface)', border: 'var(--border)' },
  positive: { value: 'var(--success)', chip: 'var(--success)', bg: 'var(--surface)', border: 'var(--border)' },
  warning: { value: 'oklch(0.52 0.12 78)', chip: 'oklch(0.52 0.12 78)', bg: 'var(--warning-soft)', border: 'transparent' },
  risk: { value: 'var(--danger)', chip: 'var(--danger)', bg: 'var(--danger-soft)', border: 'transparent' },
};

/** One measured number with its label, qualifier and optional delta. */
export function RevenueKPI({ label, value, currency = 'USD', format = 'currency', detail, delta, deltaLabel, icon, tone = 'default', hero, style, ...rest }) {
  const t = kpiTones[tone] || kpiTones.default;
  const shown = format === 'currency' ? fmt(Number(value), currency)
    : format === 'percent' ? `${Number(value).toFixed(1)}%`
    : format === 'multiple' ? `${Number(value).toFixed(1)}×`
    : String(value);
  const up = Number(delta) > 0;
  return (
    <div style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: hero ? 'var(--pad-card)' : 'var(--pad-card-compact)', ...style }} {...rest}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: t.chip }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)' }}>{label}</span>
        {icon}
      </div>
      <p className="tnum" style={{ margin: 'var(--space-4) 0 0', font: hero ? 'var(--type-kpi-hero)' : 'var(--type-kpi)', letterSpacing: 'var(--tracking-display)', color: t.value }}>{shown}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
        {detail ? <span style={{ font: 'var(--type-meta)', color: 'var(--text-muted)' }}>{detail}</span> : null}
        {delta !== undefined && delta !== null ? (
          <span className="tnum" style={{ font: 'var(--type-meta)', fontWeight: 'var(--weight-semibold)', color: up ? 'var(--success)' : 'var(--danger)' }}>
            {up ? '▲' : '▼'} {fmt(Math.abs(Number(delta)), currency)}{deltaLabel ? ` ${deltaLabel}` : ''}
          </span>
        ) : null}
      </div>
    </div>
  );
}
