/* Shared: Contextual Copilot showcase, Data Import wizard */

function CopilotRail({ ctx, deal, messages, onAsk }) {
  const suggestions = deal ? D.copilot.deal : D.copilot[ctx] || D.copilot.manager;
  const insights = deal ? (
    <>
      <CopilotInsight tone="risk" defaultOpen headline={`${deal.risks.length} open risk signals`} detail={`${deal.customer} · ${K(deal.amount)} · ${catLabel[deal.forecastCategory]}`}
        items={deal.risks.map((r) => ({ label: r }))} />
      {deal.missing.length ? <CopilotInsight headline={`${deal.missing.length} pieces of evidence missing`} items={deal.missing.map((m) => ({ label: m }))} /> : null}
    </>
  ) : ctx === 'seller' ? (
    <>
      <CopilotInsight tone="risk" defaultOpen headline="3 deals put your quota at risk" detail={`${K(612000)} of your ${K(D.seller.forecast)} forecast`}
        items={D.guidedQueue.map(D.byId).filter((o) => o.seller === D.users.seller.name && o.risks.length).map((o) => ({ label: o.customer, value: K(o.amount), opportunityId: o.id }))} />
      <CopilotInsight headline="Banco Andino has not been touched in 9 days" detail="It carries $240K of your Commit" />
    </>
  ) : (
    <>
      <CopilotInsight tone="risk" defaultOpen headline="4 meaningful changes since Monday" detail={`Net −${K(183000)} on the quarter`}
        items={D.movements.slice(0, 4).map((m) => ({ label: m.reason, value: (m.delta > 0 ? '+' : '−') + K(Math.abs(m.delta)), opportunityId: m.opportunityId }))} />
      <CopilotInsight headline="2 purchase orders missing above 75%" detail={`${K(404000)} of billing exposure this quarter`}
        items={[{ label: 'Banco Andino · core banking renewal', value: K(240000), opportunityId: 'OPP-2041' }, { label: 'Seguros Continental · contact centre', value: K(164000), opportunityId: 'OPP-2158' }]} />
      <CopilotInsight tone="risk" headline="Diego Andrade is at 52.0% likely attainment" detail="1.4× coverage, 6 deals at risk, 8.2% margin" />
    </>
  );
  return (
    <CopilotPanel
      context={deal ? 'Opportunity' : ctx === 'seller' ? 'Seller workspace' : 'Manager dashboard'}
      contextLabel={deal ? `Context · ${deal.customer} · ${K(deal.amount)} · ${catLabel[deal.forecastCategory]}` : `Context · ${ctx === 'seller' ? D.users.seller.name : D.tenant} · ${D.period}`}
      suggestions={suggestions} messages={messages} onAsk={onAsk} insights={insights}
      style={{ height: '100%', minHeight: 0 }} />
  );
}

function copilotAnswer(q, deal) {
  const s = q.toLowerCase();
  if (deal) {
    if (s.includes('risk')) return `${deal.customer} scores ${deal.health.score}/100. ${deal.risks.join('. ')}. The largest single factor is "${deal.health.factors[0] ? deal.health.factors[0].message : 'no recorded factor'}".`;
    if (s.includes('commit')) return `System confidence is ${deal.confidence}% against a ${catLabel[deal.forecastCategory]} call, and the suggested classification is ${catLabel[deal.suggestedCategory]}. ${deal.missing.length ? 'Missing: ' + deal.missing.join(', ') + '.' : 'Evidence is complete.'}`;
    if (s.includes('missing')) return deal.missing.length ? `Missing for a defensible forecast: ${deal.missing.join(', ')}.` : 'Nothing is missing on this opportunity.';
    if (s.includes('meeting')) return `For the ${deal.customer} meeting: open on the ${deal.stage.name} decision, confirm ${deal.missing[0] || 'the delivery window'}, and close on a dated next step. Margin is ${deal.margin}% — do not concede further.`;
    if (s.includes('draft') || s.includes('follow')) return `Draft: "Thank you for the time today. To keep the ${deal.closeDate} date, we need ${deal.missing[0] || 'the signed schedule'} by Friday. I have attached the revised commercial summary."`;
    if (s.includes('history') || s.includes('summar')) return `${deal.id} entered ${deal.stage.name} on ${deal.stageHistory[0].at} and has been there ${deal.daysInStage} days against a ${deal.benchmarkDays}-day benchmark. Last activity: ${deal.lastActivity}.`;
    return `${deal.customer}: ${K(deal.amount)} at ${deal.stage.code}% ${deal.stage.name}, health ${deal.health.score}/100, ${deal.alerts.length} open alerts. Next action: ${deal.nextAction}`;
  }
  if (s.includes('miss') && s.includes('quota')) return `Forecast is ${K(D.team.forecast)} against a ${K(D.team.quota)} quota — a ${K(D.team.gap)} gap. ${K(590000)} of the risk sits in three Commit deals: Banco Andino (no purchase order, date moved twice), Seguros Continental policy storage (no activity in 16 days) and Seguros Continental contact centre (year-end freeze).`;
  if (s.includes('monday') || s.includes('changed')) return `Four meaningful changes: Banco Andino −${K(240000)} (date moved to 19 Dec), Seguros Continental policy storage −${K(186000)} (competitor evaluation), contact centre −${K(164000)} (spend freeze), RetailNova +${K(275000)} (pilot approved). Net −${K(183000)}.`;
  if (s.includes('interven') || s.includes('seller')) return `Diego Andrade: ${K(520000)} forecast against a ${K(1000000)} quota, 1.4× coverage, 6 deals at risk and 8.2% margin — the weakest position on the team. Andrés Coba is second at 77.8% likely attainment with 4 at-risk deals.`;
  if (s.includes('movement') || s.includes('explain')) return `Movement is driven by dates, not by losses: three deals moved their close date inside the quarter and two lack purchase orders. Only ${K(46000)} was lost outright; ${K(640000)} slipped.`;
  if (s.includes('prepare') || s.includes('meeting')) return `For the forecast call: open with the ${K(D.team.gap)} gap, walk the three at-risk Commit deals, then Diego's coverage. Decisions needed: keep or move Banco Andino and both Seguros Continental deals.`;
  if (s.includes('first') || s.includes('today')) return `Start with Banco Andino: ${K(240000)} in Commit, no purchase order and no activity in 9 days. One call today protects the largest single piece of your gap.`;
  return `${D.period}: forecast ${K(D.team.forecast)}, quota ${K(D.team.quota)}, gap ${K(D.team.gap)}, coverage ${D.team.coverage}×. The gap is concentrated in three Commit deals.`;
}

function CopilotShowcase({ onOpen }) {
  const [ctx, setCtx] = React.useState('manager');
  const [msgs, setMsgs] = React.useState({ manager: [], seller: [], deal: [] });
  const deal = ctx === 'deal' ? D.byId('OPP-2041') : null;
  const ask = (q) => {
    const key = ctx;
    setMsgs((m) => ({ ...m, [key]: [...m[key], { role: 'user', text: q }, { role: 'assistant', text: copilotAnswer(q, deal) }] }));
  };
  const contexts = [['manager', 'Manager dashboard'], ['seller', 'Seller workspace'], ['deal', 'Opportunity — Banco Andino']];
  return (
    <div>
      <ScreenHead eyebrow="Contextual sales Copilot" title="The same panel, three contexts"
        meta="Suggestions, proactive insights and answers all change with what the user is looking at. This is not a generic chat window." />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 16 }}>
        <div role="group" aria-label="Copilot context" style={{ display: 'inline-flex', gap: 2, padding: 3, borderRadius: 9, background: 'var(--surface-muted)', width: 'fit-content' }}>
          {contexts.map(([id, label]) => (
            <button key={id} type="button" aria-pressed={ctx === id} onClick={() => setCtx(id)}
              style={{ height: 30, padding: '0 13px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: ctx === id ? 'var(--surface)' : 'transparent', color: ctx === id ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: ctx === id ? 'var(--shadow-card)' : 'none' }}>{label}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,380px)', gap: 16, alignItems: 'start' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 16 }}>
            <Card pad style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 12 }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>What the Copilot can see right now</p>
              {ctx === 'manager' ? <MetricStrip items={[{ label: 'Forecast', value: K(D.team.forecast) }, { label: 'Quota', value: K(D.team.quota) }, { label: 'Gap', value: K(D.team.gap), tone: 'var(--danger)' }, { label: 'At risk', value: String(D.team.atRisk) }]} /> : null}
              {ctx === 'seller' ? <MetricStrip items={[{ label: 'Forecast', value: K(D.seller.forecast) }, { label: 'Quota', value: K(D.seller.quota) }, { label: 'Gap', value: K(D.seller.gap), tone: 'var(--danger)' }, { label: 'Meetings', value: '5' }]} /> : null}
              {ctx === 'deal' ? <MetricStrip items={[{ label: 'Amount', value: K(deal.amount) }, { label: 'Stage', value: deal.stage.code + '%' }, { label: 'Health', value: String(deal.health.score), tone: 'var(--warning)' }, { label: 'Confidence', value: deal.confidence + '%', tone: 'var(--warning)' }]} /> : null}
              <p style={{ margin: 0, font: 'var(--type-meta)', color: 'var(--text-muted)' }}>
                {ctx === 'deal' ? 'On an opportunity the Copilot answers about evidence, justification and preparation.' : ctx === 'seller' ? 'On the seller workspace it answers about today, priorities and the personal gap.' : 'On the manager dashboard it answers about quota risk, movement and intervention.'}
              </p>
            </Card>
            {ctx === 'deal' ? (
              <Card>
                <CardHeader title="Opportunity in context" subtitle="The Copilot reads the same record the drawer shows"
                  action={<Button size="sm" variant="outline" onClick={() => onOpen(deal)}>Open drawer</Button>} />
                <CardContent style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 12 }}>
                  <OppRow opp={deal} onOpen={onOpen} />
                  <OpportunityHealth score={deal.health.score} status={deal.health.status} showFactors factors={deal.health.factors} />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader title="Proactive insights are pinned, not asked for" subtitle="The panel opens with findings, never with a greeting" />
                <CardContent style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 8 }}>
                  {D.movements.slice(0, 3).map((m) => (
                    <button key={m.label} type="button" onClick={() => onOpen(D.byId(m.opportunityId))}
                      style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 10, alignItems: 'center', textAlign: 'left', padding: '10px 12px', borderRadius: 11, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer' }}>
                      <span style={{ minWidth: 0 }}>
                        <b style={{ display: 'block', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.label}</b>
                        <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.reason}</span>
                      </span>
                      <b className="tnum" style={{ fontSize: 13, color: m.delta > 0 ? 'var(--success)' : 'var(--danger)' }}>{m.delta > 0 ? '+' : '−'}{K(Math.abs(m.delta))}</b>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
          <div style={{ height: 620, minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0,1fr)' }}>
            <CopilotRail ctx={ctx} deal={deal} messages={msgs[ctx]} onAsk={ask} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Import wizard ---------- */
const IMPORT_STEPS = ['Upload', 'Template detection', 'Column mapping', 'Data validation', 'Data quality', 'Preview', 'Import', 'Results'];

function ImportWizardScreen() {
  const [step, setStep] = React.useState(5);
  const [mapping, setMapping] = React.useState(() => Object.fromEntries(D.import.mapping.map((m) => [m.source, m.target])));
  const im = D.import;
  const conf = Object.fromEntries(im.mapping.map((m) => [m.source, m.confidence]));
  const rows = im.mapping.map((m) => ({ source: m.source, target: mapping[m.source], confidence: conf[m.source] }));
  const primary = ['Detect template', 'Confirm template', 'Validate mapping', 'Review data quality', 'Preview 438 rows', 'Import 438 rows', 'View results', 'Done'][step - 1];
  return (
    <div>
      <ScreenHead eyebrow="Sales data import" title={im.file}
        meta={`${im.rows} rows · uploaded 4 minutes ago by ${D.users.manager.name} · ${D.period}`}
        action={<><Button size="sm" variant="ghost">Cancel</Button><Button size="sm" onClick={() => setStep(Math.min(8, step + 1))}>{primary}</Button></>} />
      <div style={{ display: 'grid', gridTemplateColumns: '208px minmax(0,1fr)', gap: 20, alignItems: 'start' }}>
        <Card pad>
          <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 2 }}>
            {IMPORT_STEPS.map((s, ix) => {
              const n = ix + 1; const done = n < step; const now = n === step;
              return (
                <li key={s}>
                  <button type="button" onClick={() => setStep(n)}
                    style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', alignItems: 'center', gap: 9, width: '100%', minHeight: 36, padding: '0 8px', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 12.5, fontWeight: now ? 600 : 500, background: now ? 'var(--surface-brand-soft)' : 'transparent', color: now ? 'var(--teal-800)' : done ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    <span style={{ display: 'grid', placeItems: 'center', width: 19, height: 19, borderRadius: 999, fontSize: 10, fontWeight: 700, background: done ? 'var(--success)' : now ? 'var(--brand)' : 'var(--surface-sunken)', color: done || now ? '#fff' : 'var(--text-muted)' }}>{done ? '✓' : n}</span>
                    <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 16 }}>
          {step === 1 ? (
            <Card pad style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 14, justifyItems: 'center', padding: 48, textAlign: 'center' }}>
              <Icon name="FileSpreadsheet" size={34} style={{ color: 'var(--brand)' }} />
              <b style={{ fontSize: 17 }}>Drop a forecast workbook</b>
              <p style={{ margin: 0, font: 'var(--type-body)', color: 'var(--text-muted)', maxWidth: 420 }}>Excel or CSV. Sheets named Oppty, Facturado Daily, Resumen and Canales Proceso are recognised automatically. Nothing is written until you approve the data-quality review.</p>
              <Button onClick={() => setStep(2)}>Choose file</Button>
            </Card>
          ) : null}
          {step === 2 ? (
            <Card>
              <CardHeader title="Template detection" subtitle="Matched against your saved import templates" />
              <CardContent style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr) auto', gap: 12, alignItems: 'center', padding: 14, borderRadius: 12, border: '1px solid var(--brand)', background: 'var(--surface-brand-soft)' }}>
                  <Icon name="Check" size={18} style={{ color: 'var(--teal-800)' }} />
                  <span style={{ minWidth: 0 }}>
                    <b style={{ display: 'block', fontSize: 14, color: 'var(--teal-800)' }}>{im.template.name} detected — {im.template.confidence}% mapping confidence</b>
                    <span style={{ font: 'var(--type-meta)', color: 'var(--teal-800)' }}>Last used 12 Nov 2026 · 8 of 8 columns recognised · 2 need confirmation</span>
                  </span>
                  <Button size="sm" onClick={() => setStep(3)}>Use template</Button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 6 }}>
                  {[['Sheet "Oppty"', '477 rows'], ['Sheet "Facturado Daily"', 'present — used for billed reconciliation'], ['Sheet "Resumen"', 'present — ignored'], ['Sheet "Canales Proceso"', 'present — partner mapping']].map(([a, b]) => (
                    <div key={a} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 10, padding: '9px 11px', borderRadius: 9, border: '1px solid var(--border)', font: 'var(--type-meta)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{a}</span><span style={{ color: 'var(--text-muted)' }}>{b}</span>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" style={{ justifySelf: 'start' }}>Start from a blank mapping instead</Button>
              </CardContent>
            </Card>
          ) : null}
          {step === 3 || step === 4 ? (
            <Card>
              <CardHeader title="Column mapping" subtitle="Workbook column → platform field, with detector confidence"
                action={<Badge tone="warning">2 below 65%</Badge>} />
              <CardContent>
                <ImportMapper templateName={im.template.name} templateConfidence={im.template.confidence} fields={im.fields}
                  rows={rows} onChange={(src, target) => setMapping((m) => ({ ...m, [src]: target }))} />
                {step === 4 ? (
                  <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 8 }}>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>Validation running</p>
                    {['Stage values resolved against the tenant ladder', 'Amounts normalised (thousands separators, currency symbols)', 'Spanish and English months parsed', 'Fingerprints derived for rows without an external id'].map((v) => (
                      <span key={v} style={{ display: 'flex', gap: 8, alignItems: 'center', font: 'var(--type-meta)' }}><Icon name="Check" size={13} style={{ color: 'var(--success)' }} />{v}</span>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
          {step === 5 ? (
            <>
              <Card>
                <CardHeader title="Data quality" subtitle={`${im.rows} rows analysed · nothing is written until you approve`}
                  action={<Badge tone="risk">{im.review} need review</Badge>} />
                <CardContent>
                  <DataQualityPanel counts={{ ready: im.ready, warnings: im.warnings, invalid: im.review, duplicates: im.duplicates }} issues={im.issues} onReview={() => {}} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader title="Inconsistencies by type" subtitle="Grouped so a whole class can be resolved at once" />
                <CardContent style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
                  {[['Duplicate customer names', 6, 'Banco Andino / BANCO ANDINO S.A.'], ['Seller name inconsistencies', 11, '"D. Andrade", "VBM: SOFIA T."'], ['Opportunities without amount', 3, 'Rows 88, 254, 401'], ['Invalid months', 2, '"13/2026", "feb-25"'], ['Stage / value inconsistencies', 9, 'Billed at 0 amount']].map(([label, count, eg]) => (
                    <div key={label} style={{ padding: 12, borderRadius: 11, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                        <b style={{ fontSize: 12.5 }}>{label}</b>
                        <b className="tnum" style={{ fontSize: 15, color: 'var(--warning)' }}>{count}</b>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{eg}</p>
                      <Button size="sm" variant="ghost" style={{ marginTop: 6, paddingLeft: 0 }}>Resolve all</Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          ) : null}
          {step === 6 ? (
            <Card>
              <CardHeader title="Preview" subtitle="First rows exactly as they will be written" action={<Badge tone="positive">{im.ready} ready</Badge>} />
              <CardContent style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead><tr>{['Opportunity', 'Customer', 'Seller', 'Stage', 'Amount', 'Close'].map((h) => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>{h}</th>))}</tr></thead>
                  <tbody>
                    {D.opportunities.slice(0, 6).map((o) => (
                      <tr key={o.id} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px' }}>{o.title}</td>
                        <td style={{ padding: '10px' }}>{o.customer}</td>
                        <td style={{ padding: '10px' }}>{o.seller}</td>
                        <td style={{ padding: '10px' }}>{o.stage.code}% {o.stage.name}</td>
                        <td style={{ padding: '10px' }} className="tnum">{K(o.amount)}</td>
                        <td style={{ padding: '10px' }} className="tnum">{o.closeDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ) : null}
          {step === 7 ? (
            <Card pad style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 14, justifyItems: 'center', padding: 48, textAlign: 'center' }}>
              <Icon name="Loader" size={30} style={{ color: 'var(--brand)' }} />
              <b style={{ fontSize: 17 }}>Importing 438 rows…</b>
              <div style={{ width: 320, height: 8, borderRadius: 999, background: 'var(--surface-sunken)', overflow: 'hidden' }}>
                <div style={{ width: '72%', height: '100%', background: 'var(--brand)' }} />
              </div>
              <p style={{ margin: 0, font: 'var(--type-meta)', color: 'var(--text-muted)' }}>Idempotent by fingerprint — re-running this file will not duplicate records.</p>
            </Card>
          ) : null}
          {step === 8 ? (
            <>
              <Card pad>
                <MetricStrip items={[
                  { label: 'Created', value: '311', tone: 'var(--success)' },
                  { label: 'Updated', value: '127' },
                  { label: 'Skipped (duplicate)', value: '6' },
                  { label: 'Failed', value: '8', tone: 'var(--danger)' },
                  { label: 'Elapsed', value: '11s' },
                ]} />
              </Card>
              <Card>
                <CardHeader title="Results" subtitle="Failures are downloadable as a correction workbook"
                  action={<Button size="sm" variant="outline" icon={<Icon name="Download" size={14} />}>Download 8 failed rows</Button>} />
                <CardContent style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 8 }}>
                  {im.issues.filter((i) => i.severity === 'invalid').map((i) => (
                    <div key={i.row} style={{ display: 'grid', gridTemplateColumns: 'auto auto minmax(0,1fr)', gap: 10, alignItems: 'baseline', padding: '9px 11px', borderRadius: 9, border: '1px solid var(--border)', font: 'var(--type-meta)' }}>
                      <span className="tnum" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Row {i.row}</span>
                      <RiskBadge severity="CRITICAL" label="Failed" />
                      <span>{i.message}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <Button size="sm" variant="outline" icon={<Icon name="Save" size={14} />}>Save as import template</Button>
                    <Button size="sm" variant="ghost">Open the imported pipeline</Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CopilotRail, CopilotShowcase, ImportWizardScreen, copilotAnswer });
