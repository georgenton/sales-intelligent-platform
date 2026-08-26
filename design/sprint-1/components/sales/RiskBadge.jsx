import React from 'react';

const riskLevels = {
  INFO: { color: 'var(--info)', bg: 'var(--info-soft)', label: 'Info', d: 'M12 16v-4M12 8h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z' },
  WARNING: { color: 'oklch(0.52 0.12 78)', bg: 'var(--warning-soft)', label: 'Warning', d: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z' },
  HIGH: { color: 'var(--orange-600)', bg: 'oklch(0.96 0.04 45)', label: 'High', d: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z' },
  CRITICAL: { color: 'var(--critical)', bg: 'var(--critical-soft)', label: 'Critical', d: 'M12 8v4M12 16h.01M7.9 2h8.2L22 7.9v8.2L16.1 22H7.9L2 16.1V7.9L7.9 2Z' },
};

const ACRONYMS = { po: 'PO', ai: 'AI', crm: 'CRM', id: 'ID', sla: 'SLA' };
const humanise = (code) => code.replace(/_/g, ' ').toLowerCase().split(' ')
  .map((w, i) => (ACRONYMS[w] ? ACRONYMS[w] : i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w)).join(' ');

/** Severity marker: colour + icon + word, always all three. */
export function RiskBadge({ severity = 'WARNING', label, code, style, ...rest }) {
  const r = riskLevels[severity] || riskLevels.WARNING;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', background: r.bg, color: r.color, borderRadius: 'var(--radius-pill)', padding: '2px var(--space-2)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap', ...style }} {...rest}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={r.d} /></svg>
      {label || (code ? humanise(code) : r.label)}
    </span>
  );
}
