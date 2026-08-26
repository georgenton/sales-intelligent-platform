import React from 'react';

/** A proactive Copilot finding. Collapsed by default; expands to its evidence. */
export function CopilotInsight({ headline, detail, items = [], tone = 'neutral', defaultOpen = false, onItemSelect, style, ...rest }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const accent = tone === 'risk' ? 'var(--danger)' : tone === 'positive' ? 'var(--success)' : 'var(--accent-bright)';
  return (
    <div style={{ border: '1px solid var(--border-inverse)', borderRadius: 'var(--radius-md)', background: 'oklch(1 0 0 / 0.04)', ...style }} {...rest}>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'none', border: 'none', color: 'inherit', textAlign: 'left', cursor: 'pointer' }}>
        <span style={{ width: 6, alignSelf: 'stretch', borderRadius: 3, background: accent }} aria-hidden="true" />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>{headline}</span>
          {detail ? <span style={{ display: 'block', font: 'var(--type-meta)', color: 'var(--text-inverse-muted)', marginTop: 2 }}>{detail}</span> : null}
        </span>
        <span aria-hidden="true" style={{ color: 'var(--text-inverse-muted)', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform var(--dur-fast) var(--ease-standard)' }}>›</span>
      </button>
      {open && items.length ? (
        <ul style={{ margin: 0, padding: '0 var(--space-3) var(--space-3)', listStyle: 'none', display: 'grid', gap: 'var(--space-2)' }}>
          {items.map((it) => (
            <li key={it.label}>
              <button type="button" onClick={onItemSelect ? () => onItemSelect(it) : undefined}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--border-inverse)', borderRadius: 'var(--radius-sm)', background: 'transparent', color: 'inherit', font: 'var(--type-meta)', cursor: onItemSelect ? 'pointer' : 'default', textAlign: 'left' }}>
                <span>{it.label}</span>
                {it.value ? <b className="tnum" style={{ color: accent }}>{it.value}</b> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
