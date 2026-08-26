import React from 'react';
import { FunnelStage } from './FunnelStage.jsx';

/** Interactive narrowing funnel. Selecting a stage expands detail below, in place. */
export function SalesFunnel({ stages = [], currency = 'USD', selectedStage, onSelectStage, renderDetail, style, ...rest }) {
  const [internal, setInternal] = React.useState(null);
  const selected = selectedStage !== undefined ? selectedStage : internal;
  const max = Math.max(...stages.map((s) => s.amount), 1);
  const select = (name) => {
    const next = selected === name ? null : name;
    if (onSelectStage) onSelectStage(next);
    if (selectedStage === undefined) setInternal(next);
  };
  return (
    <div style={style} {...rest}>
      <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
        {stages.map((s, i) => (
          <FunnelStage
            key={s.name}
            {...s}
            currency={currency}
            widthPct={Math.max(34, 100 - i * (58 / Math.max(1, stages.length - 1)))}
            selected={selected === s.name}
            onSelect={() => select(s.name)}
          />
        ))}
      </div>
      <table style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
        <caption>Pipeline by stage</caption>
        <thead><tr><th>Stage</th><th>Amount</th><th>Opportunities</th></tr></thead>
        <tbody>{stages.map((s) => <tr key={s.name}><td>{s.name}</td><td>{s.amount}</td><td>{s.count}</td></tr>)}</tbody>
      </table>
      {selected && renderDetail ? (
        <div style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)', animation: 'none' }}>
          {renderDetail(stages.find((s) => s.name === selected))}
        </div>
      ) : null}
      <p style={{ margin: 'var(--space-3) 0 0', font: 'var(--type-meta)', color: 'var(--text-muted)' }}>
        {selected ? 'Selected stage expanded below. Select again to collapse.' : 'Select a stage to break it down without leaving this view.'}
      </p>
    </div>
  );
}
