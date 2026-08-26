import React from 'react';

/** One step of a guided workflow: what to do, why, and the fields to complete. */
export function GuidedTask({ step, total, title, why, children, primaryLabel = 'Save and continue', onPrimary, onSkip, onBack, style, ...rest }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--space-4)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', padding: 'var(--pad-card)', boxShadow: 'var(--shadow-card)', ...style }} {...rest}>
      <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span className="tnum" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-brand)' }}>Step {step} of {total}</span>
          <div style={{ flex: 1, height: 4, borderRadius: 'var(--radius-pill)', background: 'var(--surface-sunken)' }}>
            <div style={{ width: `${(step / total) * 100}%`, height: '100%', borderRadius: 'var(--radius-pill)', background: 'var(--brand)', transition: 'width var(--dur-base) var(--ease-out)' }} />
          </div>
        </div>
        <h2 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-display)' }}>{title}</h2>
        {why ? <p style={{ margin: 0, font: 'var(--type-body)', color: 'var(--text-muted)', textWrap: 'pretty' }}>{why}</p> : null}
      </div>
      {children ? <div style={{ display: 'grid', gap: 'var(--space-3)' }}>{children}</div> : null}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <button type="button" onClick={onPrimary} style={{ height: 'var(--control-h)', padding: '0 var(--space-4)', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--brand)', color: 'var(--text-on-brand)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', cursor: 'pointer' }}>{primaryLabel}</button>
        {onSkip ? <button type="button" onClick={onSkip} style={{ height: 'var(--control-h)', padding: '0 var(--space-3)', borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', cursor: 'pointer' }}>Skip</button> : null}
        {onBack ? <button type="button" onClick={onBack} style={{ marginLeft: 'auto', height: 'var(--control-h)', padding: '0 var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', cursor: 'pointer' }}>Back</button> : null}
      </div>
    </section>
  );
}
