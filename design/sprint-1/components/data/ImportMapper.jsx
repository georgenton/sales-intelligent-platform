import React from 'react';

/** Column → platform field mapping with per-row confidence. Step 3 of the import wizard. */
export function ImportMapper({ rows = [], fields = [], templateName, templateConfidence, onChange, style, ...rest }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)', ...style }} {...rest}>
      {templateName ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--pad-card-compact)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-brand-soft)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--teal-800)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
          <span style={{ font: 'var(--type-body)', color: 'var(--teal-800)' }}>
            <b>{templateName}</b> detected{templateConfidence !== undefined ? ` — ${templateConfidence}% mapping confidence` : ''}.
          </span>
        </div>
      ) : null}
      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 24px 1.2fr 120px', gap: 'var(--space-3)', padding: 'var(--space-3) var(--pad-card-compact)', background: 'var(--surface-sunken)', font: 'var(--type-meta)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)', fontWeight: 'var(--weight-semibold)' }}>
          <span>Existing column</span><span /><span>Platform field</span><span>Confidence</span>
        </div>
        {rows.map((r) => {
          const conf = r.confidence ?? 0;
          const tone = conf >= 90 ? 'var(--success)' : conf >= 60 ? 'var(--warning)' : 'var(--danger)';
          return (
            <div key={r.source} style={{ display: 'grid', gridTemplateColumns: '1.1fr 24px 1.2fr 120px', gap: 'var(--space-3)', alignItems: 'center', padding: 'var(--space-3) var(--pad-card-compact)', borderTop: '1px solid var(--border)' }}>
              <span className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>{r.source}</span>
              <span aria-hidden="true" style={{ color: 'var(--text-muted)', textAlign: 'center' }}>→</span>
              <select value={r.target || ''} onChange={onChange ? (e) => onChange(r.source, e.target.value) : undefined}
                aria-label={`Map ${r.source}`}
                style={{ height: 'var(--control-h-sm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--input-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)', padding: '0 var(--space-2)' }}>
                <option value="">— Ignore column —</option>
                {fields.map((fl) => <option key={fl} value={fl}>{fl}</option>)}
              </select>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ flex: 1, height: 6, borderRadius: 'var(--radius-pill)', background: 'var(--surface-sunken)', overflow: 'hidden' }}>
                  <span style={{ display: 'block', width: `${conf}%`, height: '100%', background: tone }} />
                </span>
                <span className="tnum" style={{ font: 'var(--type-meta)', color: 'var(--text-muted)' }}>{conf}%</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
