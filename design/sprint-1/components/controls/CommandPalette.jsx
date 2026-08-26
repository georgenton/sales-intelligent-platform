import React from 'react';

/** ⌘K command surface. Keyboard-first entry to any object or action. */
export function CommandPalette({ open, commands = [], onSelect, onClose, placeholder = 'Search or run a command…', style, ...rest }) {
  const [query, setQuery] = React.useState('');
  const [index, setIndex] = React.useState(0);
  const results = commands.filter((c) => (c.label + ' ' + (c.group || '') + ' ' + (c.hint || '')).toLowerCase().includes(query.toLowerCase()));
  React.useEffect(() => { setIndex(0); }, [query, open]);
  if (!open) return null;
  const key = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIndex((i) => Math.min(results.length - 1, i + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setIndex((i) => Math.max(0, i - 1)); }
    if (e.key === 'Enter' && results[index] && onSelect) onSelect(results[index]);
    if (e.key === 'Escape' && onClose) onClose();
  };
  return (
    <div role="presentation" onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'var(--scrim)', display: 'grid', justifyItems: 'center', alignItems: 'start', paddingTop: '12vh', zIndex: 80, ...style }} {...rest}>
      <div role="dialog" aria-modal="true" aria-label="Command palette" onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(620px, 92vw)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-overlay)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--pad-card)', borderBottom: '1px solid var(--border)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={key} placeholder={placeholder} aria-label={placeholder}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: 'var(--text-base)' }} />
          <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-11)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px' }}>esc</kbd>
        </div>
        <ul style={{ margin: 0, padding: 'var(--space-2)', listStyle: 'none', maxHeight: 320, overflowY: 'auto' }}>
          {results.map((c, i) => (
            <li key={c.id}>
              <button type="button" onMouseEnter={() => setIndex(i)} onClick={() => onSelect && onSelect(c)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', textAlign: 'left', background: i === index ? 'var(--surface-brand-soft)' : 'transparent', color: 'var(--text-primary)' }}>
                <span style={{ flex: 1, minWidth: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>{c.label}</span>
                {c.hint ? <span style={{ font: 'var(--type-meta)', color: 'var(--text-muted)' }}>{c.hint}</span> : null}
                {c.group ? <span style={{ font: 'var(--type-meta)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)' }}>{c.group}</span> : null}
              </button>
            </li>
          ))}
          {!results.length ? <li style={{ padding: 'var(--space-4)', font: 'var(--type-meta)', color: 'var(--text-muted)' }}>No matches. Try a customer, seller or opportunity name.</li> : null}
        </ul>
      </div>
    </div>
  );
}
