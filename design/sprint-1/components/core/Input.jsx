import React from 'react';

const fieldBase = {
  height: 'var(--control-h)', width: '100%', borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--input-border)', background: 'var(--surface)',
  color: 'var(--text-primary)', padding: '0 var(--space-3)', fontSize: 'var(--text-sm)',
  fontFamily: 'var(--font-sans)', outline: 'none', transition: 'var(--transition-color)',
};

/** Text field. Optional leading icon (search pattern) and label. */
export function Input({ label, hint, error, icon, borderless, style, id, ...rest }) {
  const inputId = id || `f-${label || 'field'}`.replace(/\s+/g, '-').toLowerCase();
  const field = (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {icon ? <span style={{ position: 'absolute', left: 'var(--space-3)', color: 'var(--text-muted)', display: 'flex' }}>{icon}</span> : null}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        style={{
          ...fieldBase,
          paddingLeft: icon ? '36px' : 'var(--space-3)',
          borderColor: error ? 'var(--danger)' : borderless ? 'transparent' : 'var(--input-border)',
          background: borderless ? 'var(--surface-muted)' : 'var(--surface)',
          ...style,
        }}
        {...rest}
      />
    </div>
  );
  if (!label && !hint && !error) return field;
  return (
    <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
      {label ? <label htmlFor={inputId} style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>{label}</label> : null}
      {field}
      {error ? <p style={{ margin: 0, font: 'var(--type-meta)', color: 'var(--danger)' }}>{error}</p> : null}
      {!error && hint ? <p style={{ margin: 0, font: 'var(--type-meta)', color: 'var(--text-muted)' }}>{hint}</p> : null}
    </div>
  );
}
