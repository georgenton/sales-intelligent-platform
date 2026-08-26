import React from 'react';

const qualityTones = {
  ready: { color: 'var(--success)', bg: 'var(--success-soft)', label: 'Ready to import' },
  warnings: { color: 'oklch(0.52 0.12 78)', bg: 'var(--warning-soft)', label: 'Warnings' },
  invalid: { color: 'var(--danger)', bg: 'var(--danger-soft)', label: 'Invalid rows' },
  duplicates: { color: 'var(--text-muted)', bg: 'var(--surface-sunken)', label: 'Duplicates' },
};

/** Pre-import verdict: how many rows are safe, and what is wrong with the rest. */
export function DataQualityPanel({ counts = {}, issues = [], onReview, style, ...rest }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)', ...style }} {...rest}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 'var(--gap-kpi)' }}>
        {['ready', 'warnings', 'invalid', 'duplicates'].map((k) => {
          const t = qualityTones[k];
          return (
            <div key={k} style={{ padding: 'var(--pad-card-compact)', borderRadius: 'var(--radius-md)', background: t.bg }}>
              <p className="tnum" style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-semibold)', color: t.color }}>{counts[k] ?? 0}</p>
              <p style={{ margin: '2px 0 0', font: 'var(--type-meta)', color: 'var(--text-muted)' }}>{t.label}</p>
            </div>
          );
        })}
      </div>
      {issues.length ? (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 'var(--space-2)' }}>
          {issues.map((i) => (
            <li key={`${i.row}-${i.message}`} style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', font: 'var(--type-meta)' }}>
              <span className="tnum" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Row {i.row}</span>
              <span style={{ color: i.severity === 'invalid' ? 'var(--danger)' : 'oklch(0.52 0.12 78)', fontWeight: 'var(--weight-semibold)' }}>{i.severity === 'invalid' ? 'Invalid' : 'Warning'}</span>
              <span style={{ color: 'var(--text-primary)' }}>{i.message}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {onReview ? (
        <button type="button" onClick={onReview} style={{ justifySelf: 'start', height: 'var(--control-h-sm)', padding: '0 var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', cursor: 'pointer' }}>Review rows before import</button>
      ) : null}
    </div>
  );
}
