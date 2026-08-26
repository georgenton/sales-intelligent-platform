import React from 'react';

/** Native select styled to match Input. Used for status/stage/forecast-category pickers. */
export function Select({ label, options = [], hint, style, id, ...rest }) {
  const selectId = id || `s-${label || 'select'}`.replace(/\s+/g, '-').toLowerCase();
  const field = (
    <select
      id={selectId}
      style={{
        height: 'var(--control-h)', width: '100%', borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--input-border)', background: 'var(--surface)',
        color: 'var(--text-primary)', padding: '0 var(--space-3)', fontSize: 'var(--text-sm)',
        fontFamily: 'var(--font-sans)', outline: 'none', ...style,
      }}
      {...rest}
    >
      {options.map((o) => {
        const value = typeof o === 'string' ? o : o.value;
        const text = typeof o === 'string' ? o : o.label;
        return <option key={value} value={value}>{text}</option>;
      })}
    </select>
  );
  if (!label && !hint) return field;
  return (
    <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
      {label ? <label htmlFor={selectId} style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>{label}</label> : null}
      {field}
      {hint ? <p style={{ margin: 0, font: 'var(--type-meta)', color: 'var(--text-muted)' }}>{hint}</p> : null}
    </div>
  );
}
