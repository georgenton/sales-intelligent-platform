import React from 'react';

/** Filter chips + search. Applied filters stay visible and individually removable. */
export function FilterBar({ filters = [], applied = [], onToggle, onClear, search, onSearch, searchPlaceholder = 'Search…', style, ...rest }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-2)', ...style }} {...rest}>
      {onSearch !== undefined ? (
        <span style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: 220, flex: '0 1 280px' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ position: 'absolute', left: 12 }}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          <input value={search || ''} onChange={(e) => onSearch(e.target.value)} placeholder={searchPlaceholder} aria-label={searchPlaceholder}
            style={{ height: 'var(--control-h-sm)', width: '100%', paddingLeft: 34, paddingRight: 'var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--input-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)', outline: 'none' }} />
        </span>
      ) : null}
      {filters.map((fl) => {
        const on = applied.includes(fl.id);
        return (
          <button key={fl.id} type="button" aria-pressed={on} onClick={() => onToggle && onToggle(fl.id)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', height: 'var(--control-h-sm)', padding: '0 var(--space-3)', borderRadius: 'var(--radius-pill)', cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', transition: 'var(--transition-color)', border: '1px solid', borderColor: on ? 'transparent' : 'var(--border)', background: on ? 'var(--surface-brand-soft)' : 'var(--surface)', color: on ? 'var(--teal-800)' : 'var(--text-muted)' }}>
            {fl.label}
            {fl.count !== undefined ? <span className="tnum" style={{ opacity: 0.7 }}>{fl.count}</span> : null}
            {on ? <span aria-hidden="true">×</span> : null}
          </button>
        );
      })}
      {applied.length && onClear ? (
        <button type="button" onClick={onClear} style={{ height: 'var(--control-h-sm)', padding: '0 var(--space-2)', border: 'none', background: 'none', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', cursor: 'pointer', textDecoration: 'underline' }}>Clear all</button>
      ) : null}
    </div>
  );
}
