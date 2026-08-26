function ImportWizard() {
  const steps = ['Upload', 'Detect template', 'Map columns', 'Validate', 'Data quality', 'Preview', 'Import', 'Results'];
  const [step, setStep] = React.useState(3);
  const [mapping, setMapping] = React.useState({ OPPTY: 'Opportunity', VBM: 'Seller', 'End User': 'Customer', 'Sales Stage': 'Stage', Monto: 'Amount', 'Fecha Cierre': '' });
  const fields = ['Opportunity', 'Seller', 'Customer', 'Stage', 'Amount', 'Expected close', 'Partner', 'Brand'];
  const conf = { OPPTY: 99, VBM: 74, 'End User': 96, 'Sales Stage': 91, Monto: 88, 'Fecha Cierre': 41 };
  return (
    <div>
      <PageHead eyebrow="Sales data" title="Import forecast workbook" meta="PROGRAMA VENTAS.xlsx · 194 rows · uploaded 2 minutes ago"
        action={<Button variant="outline" icon={<Icon name="X" />}>Cancel import</Button>} />
      <div style={{ display: 'grid', gridTemplateColumns: '220px minmax(0,1fr)', gap: 24, alignItems: 'start' }}>
        <Card pad>
          <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 4 }}>
            {steps.map((s, i) => {
              const n = i + 1; const done = n < step; const now = n === step;
              return (
                <li key={s}>
                  <button type="button" onClick={() => setStep(n)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, fontWeight: now ? 600 : 500, background: now ? 'var(--surface-brand-soft)' : 'transparent', color: now ? 'var(--teal-800)' : done ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    <span style={{ display: 'grid', placeItems: 'center', width: 20, height: 20, borderRadius: 999, fontSize: 11, fontWeight: 600, background: done ? 'var(--success)' : now ? 'var(--brand)' : 'var(--surface-sunken)', color: done || now ? '#fff' : 'var(--text-muted)' }}>{done ? '✓' : n}</span>
                    {s}
                  </button>
                </li>
              );
            })}
          </ol>
        </Card>
        <div style={{ display: 'grid', gap: 20 }}>
          {step <= 3 ? (
            <Card><CardHeader title="Map columns" subtitle="Confirm every mapping before validation runs" /><CardContent>
              <ImportMapper templateName="TD Forecast Template" templateConfidence={98} fields={fields}
                rows={Object.keys(mapping).map((k) => ({ source: k, target: mapping[k], confidence: conf[k] }))}
                onChange={(src, target) => setMapping((m) => ({ ...m, [src]: target }))} />
            </CardContent></Card>
          ) : (
            <Card><CardHeader title="Data quality" subtitle="Nothing is written until you approve this" /><CardContent>
              <DataQualityPanel counts={{ ready: 182, warnings: 9, invalid: 3, duplicates: 6 }} issues={[
                { row: 41, severity: 'invalid', message: 'Amount is not a number ("N/D")' },
                { row: 58, severity: 'warning', message: 'Stage "Negociación" mapped to Proposal (50%)' },
                { row: 77, severity: 'warning', message: 'Seller not found in this workspace' },
                { row: 91, severity: 'invalid', message: 'Expected close date is before the fiscal period' }]} onReview={() => {}} />
            </CardContent></Card>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={() => setStep((s) => Math.min(8, s + 1))}>{step <= 3 ? 'Validate mapping' : 'Import 182 ready rows'}</Button>
            <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))}>Back</Button>
            <span style={{ marginLeft: 'auto', alignSelf: 'center', font: 'var(--type-meta)', color: 'var(--text-muted)' }}>Saved templates make this a two-click import next quarter.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function GuidedMode({ onDone }) {
  const [step, setStep] = React.useState(1);
  const total = 4;
  const bodies = [
    <div style={{ display: 'grid', gap: 12 }} key="1">
      <ForecastConfidence sellerCategory="COMMIT" confidence={38} rationale="No activity in 9 days and no purchase order at 75%." />
      <Select label="Keep this in Commit?" options={[{ value: 'keep', label: 'Keep Commit' }, { value: 'best', label: 'Move to Best case' }, { value: 'pipe', label: 'Move to Pipeline' }]} />
    </div>,
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 12 }} key="2">
      <Input label="Expected close" type="date" defaultValue="2026-09-30" />
      <Input label="Expected billing" type="date" defaultValue="2026-10-14" />
    </div>,
    <Input key="3" label="Next action" defaultValue="Call the CFO to confirm the purchase order" hint="Every Commit deal needs a dated next step." />,
    <div key="4" style={{ display: 'grid', gap: 12 }}>
      <Input label="Purchase order number" placeholder="PO-…" hint="Required from 90%." />
      <Input label="Gross profit" defaultValue="15120" hint="Margin is currently 8.4%, below the 10% threshold." />
    </div>,
  ];
  const titles = ['Is Commit still justified?', 'Confirm the dates', 'Define the next step', 'Complete the missing evidence'];
  const whys = [
    'This deal carries $180K of your quarter and the system disagrees with the seller call.',
    'Two Commit deals close after the quarter ends. Fixing dates now prevents a week-11 miss.',
    'Deals without a dated next step slip 2.3× more often in this workspace.',
    'Missing purchase orders are the most common reason billing slides into the next quarter.',
  ];
  return (
    <div>
      <PageHead eyebrow="Guided mode" title="Prepare Banco ABC for forecast review" meta="4 steps · about 3 minutes · progress is saved as you go" />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,620px) 1fr', gap: 24, alignItems: 'start' }}>
        <GuidedTask step={step} total={total} title={titles[step - 1]} why={whys[step - 1]}
          primaryLabel={step === total ? 'Finish review' : 'Save and continue'}
          onPrimary={() => (step === total ? onDone() : setStep(step + 1))}
          onBack={step > 1 ? () => setStep(step - 1) : undefined}
          onSkip={step < total ? () => setStep(step + 1) : undefined}>
          {bodies[step - 1]}
        </GuidedTask>
        <Card pad style={{ display: 'grid', gap: 12 }}>
          <p style={{ margin: 0, font: 'var(--type-meta)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', fontWeight: 600 }}>Deal context</p>
          <b style={{ fontSize: 18, letterSpacing: '-0.02em' }}>Banco ABC · $180K</b>
          <OpportunityHealth score={42} status="CRITICAL" showFactors factors={SIP.opportunities[0].health.factors} />
          <StageVelocity stage="Commit" daysInStage={41} benchmarkDays={21} />
        </Card>
      </div>
    </div>
  );
}

function ReviewMode({ onOpen }) {
  const deals = SIP.opportunities;
  const [i, setI] = React.useState(0);
  const o = deals[i];
  const [decision, setDecision] = React.useState(null);
  const decide = (d) => { setDecision(d); setTimeout(() => { setDecision(null); setI((x) => (x + 1) % deals.length); }, 350); };
  return (
    <div>
      <PageHead eyebrow="Review mode" title="Weekly forecast review" meta={`Opportunity ${i + 1} of ${deals.length} · ${SIP.period} · reviewed sequentially, no page changes`}
        action={<Badge tone={decision ? 'positive' : 'outline'}>{decision ? decision + ' recorded' : 'Awaiting decision'}</Badge>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 20, alignItems: 'start' }}>
        <Card>
          <CardHeader title={o.customer + ' · ' + o.title} subtitle={o.seller + ' · ' + o.brand + ' · closes ' + o.closeDate}
            action={<b className="tnum" style={{ fontSize: 24, fontWeight: 600 }}>{'$' + (o.amount / 1000).toFixed(0) + 'K'}</b>} />
          <CardContent style={{ display: 'grid', gap: 16 }}>
            <ForecastConfidence sellerCategory={o.forecastCategory === 'Commit' ? 'COMMIT' : 'BEST_CASE'} confidence={o.confidence}
              rationale={o.risk || 'No open risk signals on this opportunity.'} />
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16 }}>
              <OpportunityHealth score={o.health.score} status={o.health.status} showFactors factors={o.health.factors} />
              <div style={{ display: 'grid', gap: 12 }}>
                <StageVelocity stage={o.stage} daysInStage={o.daysInStage} benchmarkDays={o.stageBenchmarkDays || 20} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {o.alerts.length ? o.alerts.map((a) => <RiskBadge key={a.code} severity={a.severity} code={a.code} />) : <Badge tone="positive">No open risks</Badge>}
                </div>
              </div>
            </div>
            <div>
              <p style={{ margin: '0 0 8px', font: 'var(--type-card-title)' }}>Stage history</p>
              <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
                {o.stageHistory.map((h) => (
                  <li key={h.at} style={{ position: 'relative', paddingLeft: 20, borderLeft: '2px solid var(--surface-brand-soft)' }}>
                    <span style={{ position: 'absolute', left: -5, top: 4, width: 8, height: 8, borderRadius: 999, background: 'var(--brand)' }} />
                    <b style={{ fontSize: 14 }}>{h.from ? h.from + ' → ' : ''}{h.to}</b>
                    <div style={{ font: 'var(--type-meta)', color: 'var(--text-muted)' }}>{h.by} · {h.at}</div>
                  </li>
                ))}
              </ol>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <Button onClick={() => decide('Commit kept')}>Keep Commit</Button>
              <Button variant="outline" onClick={() => decide('Category moved')}>Move category</Button>
              <Button variant="outline" onClick={() => decide('Question sent')}>Ask seller</Button>
              <Button variant="ghost" onClick={() => decide('Note added')}>Add note</Button>
              <Button variant="outline" style={{ marginLeft: 'auto' }} iconAfter={<Icon name="ChevronRight" />} onClick={() => setI((x) => (x + 1) % deals.length)}>Next</Button>
            </div>
          </CardContent>
        </Card>
        <div style={{ display: 'grid', gap: 12 }}>
          {deals.map((d, ix) => (
            <button key={d.id} type="button" onClick={() => setI(ix)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', padding: 12, borderRadius: 12, cursor: 'pointer', border: '1px solid', borderColor: ix === i ? 'var(--brand)' : 'var(--border)', background: 'var(--surface)' }}>
              <span className="tnum" style={{ font: 'var(--type-meta)', color: 'var(--text-muted)', width: 16 }}>{ix + 1}</span>
              <span style={{ flex: 1, minWidth: 0 }}><b style={{ display: 'block', fontSize: 13 }}>{d.customer}</b><span style={{ font: 'var(--type-meta)', color: 'var(--text-muted)' }}>{d.forecastCategory}</span></span>
              <OpportunityHealth score={d.health.score} status={d.health.status} size="sm" />
            </button>
          ))}
          <Button variant="outline" onClick={() => onOpen(o)} icon={<Icon name="PanelRight" />}>Open drawer</Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ImportWizard, GuidedMode, ReviewMode });
