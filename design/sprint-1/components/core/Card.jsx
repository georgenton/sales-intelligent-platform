import React from 'react';

/** Bordered 16px-radius surface. Definition comes from the border, not the shadow. */
export function Card({ tone = 'default', pad = false, style, children, ...rest }) {
  const tones = {
    default: { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' },
    inverse: { background: 'var(--surface-inverse-2)', borderColor: 'transparent', color: 'var(--text-inverse)' },
    risk: { background: 'var(--surface)', borderColor: 'var(--danger)', color: 'var(--text-primary)' },
    sunken: { background: 'var(--surface-sunken)', borderColor: 'var(--border)', color: 'var(--text-primary)' },
  };
  return (
    <div
      style={{
        border: '1px solid', borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)', padding: pad ? 'var(--pad-card)' : 0,
        ...tones[tone], ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ action, title, subtitle, icon, style, children, ...rest }) {
  return (
    <div style={{ display: 'flex', alignItems: action ? 'center' : 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)', padding: 'var(--pad-card)', ...style }} {...rest}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0 }}>
        {icon}
        <div style={{ minWidth: 0 }}>
          {title ? <h3 style={{ margin: 0, font: 'var(--type-card-title)', letterSpacing: 'var(--tracking-tight)' }}>{title}</h3> : null}
          {subtitle ? <p style={{ margin: '2px 0 0', font: 'var(--type-meta)', color: 'var(--text-muted)' }}>{subtitle}</p> : null}
          {children}
        </div>
      </div>
      {action}
    </div>
  );
}

export function CardContent({ style, children, ...rest }) {
  return <div style={{ padding: 'var(--pad-card)', paddingTop: 0, ...style }} {...rest}>{children}</div>;
}
