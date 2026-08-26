import React from 'react';

/** Contextual Copilot. Suggestions are derived from where the user is, not generic. */
export function CopilotPanel({ context = 'Dashboard', contextLabel, suggestions = [], insights, messages = [], onAsk, placeholder = 'Ask about this view…', style, ...rest }) {
  const [draft, setDraft] = React.useState('');
  const submit = (text) => { if (text && onAsk) onAsk(text); setDraft(''); };
  return (
    <section aria-label="Sales Copilot" style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface-inverse-2)', color: 'var(--text-inverse)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', minHeight: 0, ...style }} {...rest}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--pad-card)' }}>
        <span style={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'oklch(0.865 0.127 207 / 0.15)', color: 'var(--accent-bright)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2M20 14h2M15 13v2M9 13v2" /></svg>
        </span>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ margin: 0, font: 'var(--type-card-title)' }}>Copilot</h2>
          <p style={{ margin: '2px 0 0', font: 'var(--type-meta)', color: 'var(--text-inverse-muted)' }}>{contextLabel || `Context · ${context}`}</p>
        </div>
      </header>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 var(--pad-card)', display: 'grid', gap: 'var(--space-3)', alignContent: 'start' }}>
        {insights}
        {messages.map((m, i) => (
          <div key={i} style={{ justifySelf: m.role === 'user' ? 'end' : 'start', maxWidth: '92%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: m.role === 'user' ? 'var(--accent-bright)' : 'oklch(1 0 0 / 0.06)', color: m.role === 'user' ? '#08242c' : 'var(--text-inverse)', font: 'var(--type-body)' }}>{m.text}</div>
        ))}
      </div>
      {suggestions.length ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', padding: 'var(--pad-card)', paddingBottom: 'var(--space-3)' }}>
          {suggestions.map((s) => (
            <button key={s} type="button" onClick={() => submit(s)}
              style={{ padding: '6px var(--space-3)', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-inverse)', background: 'transparent', color: 'var(--text-inverse)', font: 'var(--type-meta)', cursor: 'pointer' }}>{s}</button>
          ))}
        </div>
      ) : null}
      <form onSubmit={(e) => { e.preventDefault(); submit(draft); }}
        style={{ display: 'flex', gap: 'var(--space-2)', padding: 'var(--pad-card)', paddingTop: 0 }}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder} aria-label="Ask Copilot"
          style={{ flex: 1, height: 'var(--control-h)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-inverse)', background: 'oklch(1 0 0 / 0.06)', color: 'var(--text-inverse)', padding: '0 var(--space-3)', fontSize: 'var(--text-sm)', outline: 'none' }} />
        <button type="submit" style={{ height: 'var(--control-h)', padding: '0 var(--space-4)', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent-bright)', color: '#08242c', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', cursor: 'pointer' }}>Ask</button>
      </form>
    </section>
  );
}
