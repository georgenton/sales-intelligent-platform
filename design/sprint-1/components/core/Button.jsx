import React from 'react';

const btnBase = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
  borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)',
  fontFamily: 'var(--font-sans)', border: '1px solid transparent', cursor: 'pointer',
  transition: 'var(--transition-color)', whiteSpace: 'nowrap',
};
const btnSizes = {
  sm: { height: 'var(--control-h-sm)', padding: '0 var(--space-3)' },
  md: { height: 'var(--control-h)', padding: '0 var(--space-4)' },
  lg: { height: 'var(--control-h-lg)', padding: '0 var(--space-6)' },
  icon: { height: 'var(--control-h)', width: 'var(--control-h)', padding: 0 },
};
const btnVariants = {
  primary: { background: 'var(--brand)', color: 'var(--text-on-brand)' },
  secondary: { background: 'var(--surface-brand-soft)', color: 'var(--teal-800)' },
  outline: { background: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' },
  ghost: { background: 'transparent', color: 'var(--text-primary)' },
  danger: { background: 'var(--danger)', color: '#fff' },
  onDark: { background: 'var(--accent-bright)', color: '#08242c' },
};

/** Primary action control. Mirrors the source cva button (rounded-lg, semibold, 40px). */
export function Button({ variant = 'primary', size = 'md', icon, iconAfter, disabled, full, style, children, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const v = btnVariants[variant] || btnVariants.primary;
  return (
    <button
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...btnBase, ...btnSizes[size], ...v,
        width: full ? '100%' : undefined,
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : undefined,
        filter: hover && !disabled ? 'brightness(0.94)' : undefined,
        ...style,
      }}
      {...rest}
    >
      {icon ? <span style={{ display: 'flex' }}>{icon}</span> : null}
      {size === 'icon' ? null : children}
      {iconAfter ? <span style={{ display: 'flex' }}>{iconAfter}</span> : null}
      {size === 'icon' ? children : null}
    </button>
  );
}
