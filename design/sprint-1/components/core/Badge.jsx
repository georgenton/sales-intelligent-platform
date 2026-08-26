import React from 'react';

const badgeTones = {
  neutral: { background: 'var(--surface-muted)', color: 'var(--text-primary)', borderColor: 'var(--border)' },
  brand: { background: 'var(--surface-brand-soft)', color: 'var(--teal-800)', borderColor: 'transparent' },
  positive: { background: 'var(--success-soft)', color: 'var(--success)', borderColor: 'transparent' },
  warning: { background: 'var(--warning-soft)', color: 'oklch(0.48 0.11 78)', borderColor: 'transparent' },
  risk: { background: 'var(--danger-soft)', color: 'var(--danger)', borderColor: 'transparent' },
  critical: { background: 'var(--critical-soft)', color: 'var(--critical)', borderColor: 'transparent' },
  outline: { background: 'transparent', color: 'var(--text-muted)', borderColor: 'var(--border-strong)' },
};

/** Small status token. Pill, 12px, medium weight — matches the source Badge. */
export function Badge({ tone = 'neutral', icon, uppercase, style, children, ...rest }) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)',
        border: '1px solid', borderRadius: 'var(--radius-pill)',
        padding: '2px var(--space-2)', fontSize: 'var(--text-xs)',
        fontWeight: 'var(--weight-medium)', lineHeight: 1.5, whiteSpace: 'nowrap',
        textTransform: uppercase ? 'uppercase' : 'none',
        letterSpacing: uppercase ? 'var(--tracking-label)' : 0,
        ...badgeTones[tone], ...style,
      }}
      {...rest}
    >
      {icon}
      <span style={{ display: 'inline' }}>{children}</span>
    </span>
  );
}
