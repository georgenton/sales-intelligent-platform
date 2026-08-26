import React from 'react';
import { OpportunityHealth } from '../sales/OpportunityHealth.jsx';
import { RiskBadge } from '../sales/RiskBadge.jsx';
import { StageVelocity } from '../sales/StageVelocity.jsx';

const fmt = (n, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: Math.abs(n) >= 1000000 ? 'compact' : 'standard', minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(n);

/** Right-side contextual drawer. The default way to inspect a deal — no page change. */
export function OpportunityDrawer({ open, opportunity, onClose, onOpenFull, quickActions = [], onQuickAction, footer, style, ...rest }) {
  React.useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open || !opportunity) return null;
  const o = opportunity;
  const facts = [
    ['Customer', o.customer], ['Seller', o.seller], ['Partner', o.partner || '—'],
    ['Brand', o.brand || '—'], ['Stage', o.stage], ['Forecast category', o.forecastCategory],
    ['Close date', o.closeDate], ['Billing date', o.billingDate || '—'],
    ['Margin', o.margin !== undefined && o.margin !== null ? `${o.margin}%` : '—'],
  ];
  return (
    <div role="presentation" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'var(--scrim)', zIndex: 70, display: 'flex', justifyContent: 'flex-end', ...style }} {...rest}>
      <aside role="dialog" aria-modal="true" aria-label={o.title} onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(var(--drawer-w), 96vw)', height: '100%', background: 'var(--surface)', borderLeft: '1px solid var(--border)', boxShadow: 'var(--shadow-overlay)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ padding: 'var(--pad-card)', borderBottom: '1px solid var(--border)', display: 'grid', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, font: 'var(--type-meta)', color: 'var(--text-muted)' }}>{o.customer}</p>
              <h2 style={{ margin: '2px 0 0', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-display)' }}>{o.title}</h2>
            </div>
            <button type="button" onClick={onClose} aria-label="Close"
              style={{ display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <span className="tnum" style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-semibold)' }}>{fmt(o.amount, o.currency || 'USD')}</span>
            <OpportunityHealth score={o.health?.score ?? 0} status={o.health?.status} size="sm" />
          </div>
          {o.alerts && o.alerts.length ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {o.alerts.map((a) => <RiskBadge key={a.code} severity={a.severity} code={a.code} />)}
            </div>
          ) : null}
          {quickActions.length ? (
            <div role="group" aria-label="Quick actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {quickActions.map((a) => {
                const label = typeof a === 'string' ? a : a.label;
                const primary = typeof a === 'object' && a.primary;
                return (
                  <button key={label} type="button" onClick={() => onQuickAction && onQuickAction(label)}
                    style={{ minHeight: 32, padding: '0 var(--space-3)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', border: '1px solid', borderColor: primary ? 'transparent' : 'var(--border)', background: primary ? 'var(--brand)' : 'var(--surface)', color: primary ? 'var(--text-on-brand)' : 'var(--text-primary)', transition: 'var(--transition-color)' }}>{label}</button>
                );
              })}
            </div>
          ) : null}
        </header>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--pad-card)', display: 'grid', gap: 'var(--space-5)' }}>
          {o.nextStep ? (
            <div style={{ padding: 'var(--pad-card-compact)', borderRadius: 'var(--radius-md)', border: '1px solid var(--brand)', background: 'var(--surface-brand-soft)' }}>
              <p style={{ margin: 0, font: 'var(--type-meta)', color: 'var(--teal-800)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', fontWeight: 'var(--weight-semibold)' }}>Next step</p>
              <p style={{ margin: '4px 0 0', fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', textWrap: 'pretty' }}>{o.nextStep.text}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                <span className="tnum" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: 'var(--type-meta)', color: o.nextStep.overdue ? 'var(--danger)' : 'var(--teal-800)', fontWeight: 'var(--weight-semibold)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" /></svg>
                  {o.nextStep.date}{o.nextStep.overdue ? ' · overdue' : ''}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: 'var(--type-meta)', color: 'var(--teal-800)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
                  {o.nextStep.owner}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ padding: 'var(--pad-card-compact)', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger)', background: 'var(--danger-soft)' }}>
              <p style={{ margin: 0, font: 'var(--type-meta)', color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', fontWeight: 'var(--weight-semibold)' }}>No next step</p>
              <p style={{ margin: '4px 0 0', font: 'var(--type-body)' }}>Deals without a dated next step slip far more often. Add one before the forecast call.</p>
            </div>
          )}
          {o.lastActivity ? (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', padding: 'var(--pad-card-compact)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <span style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: 'var(--radius-sm)', background: o.lastActivity.stale ? 'var(--danger-soft)' : 'var(--success-soft)', color: o.lastActivity.stale ? 'var(--danger)' : 'var(--success)', flex: 'none' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              </span>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, font: 'var(--type-meta)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', fontWeight: 'var(--weight-semibold)' }}>Last meaningful customer activity</p>
                <p style={{ margin: '3px 0 0', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>{o.lastActivity.what}</p>
                <p style={{ margin: '2px 0 0', font: 'var(--type-meta)', color: o.lastActivity.stale ? 'var(--danger)' : 'var(--text-muted)' }}>{o.lastActivity.when}{o.lastActivity.who ? ` · ${o.lastActivity.who}` : ''}</p>
              </div>
            </div>
          ) : null}
          {o.evidence ? (
            <div>
              <h3 style={{ margin: '0 0 var(--space-3)', font: 'var(--type-card-title)' }}>Why is this {o.forecastCategory}?</h3>
              <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                {(o.evidence.present || []).map((e) => (
                  <span key={e} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start', font: 'var(--type-meta)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginTop: 2, flex: 'none' }}><path d="M20 6 9 17l-5-5" /></svg>
                    <span>{e}</span>
                  </span>
                ))}
                {(o.evidence.missing || []).map((e) => (
                  <span key={e} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start', font: 'var(--type-meta)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true" style={{ marginTop: 2, flex: 'none' }}><path d="M18 6 6 18M6 6l12 12" /></svg>
                    <span style={{ color: 'var(--text-muted)' }}>{e} <b style={{ color: 'var(--danger)' }}>missing</b></span>
                  </span>
                ))}
              </div>
              {o.evidence.verdict ? (
                <p style={{ margin: 'var(--space-3) 0 0', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-sunken)', font: 'var(--type-meta)', textWrap: 'pretty' }}>{o.evidence.verdict}</p>
              ) : null}
            </div>
          ) : null}
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3) var(--space-4)' }}>
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt style={{ font: 'var(--type-meta)', color: 'var(--text-muted)' }}>{k}</dt>
                <dd style={{ margin: '2px 0 0', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>{v}</dd>
              </div>
            ))}
          </dl>
          {o.daysInStage !== undefined ? <StageVelocity stage={o.stage} daysInStage={o.daysInStage} benchmarkDays={o.stageBenchmarkDays} /> : null}
          {o.stageHistory && o.stageHistory.length ? (
            <div>
              <h3 style={{ margin: '0 0 var(--space-3)', font: 'var(--type-card-title)' }}>Recent stage history</h3>
              <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 'var(--space-3)' }}>
                {o.stageHistory.map((h) => (
                  <li key={h.at} style={{ position: 'relative', paddingLeft: 'var(--space-5)', borderLeft: '2px solid var(--surface-brand-soft)' }}>
                    <span style={{ position: 'absolute', left: -5, top: 4, width: 8, height: 8, borderRadius: '50%', background: 'var(--brand)' }} />
                    <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>{h.from ? `${h.from} → ` : ''}{h.to}</p>
                    <p style={{ margin: '2px 0 0', font: 'var(--type-meta)', color: 'var(--text-muted)' }}>{h.by} · {h.at}</p>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
          {footer}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', padding: 'var(--pad-card)', borderTop: '1px solid var(--border)' }}>
          <button type="button" onClick={onOpenFull} style={{ height: 'var(--control-h)', padding: '0 var(--space-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', cursor: 'pointer' }}>Open full record</button>
        </div>
      </aside>
    </div>
  );
}
