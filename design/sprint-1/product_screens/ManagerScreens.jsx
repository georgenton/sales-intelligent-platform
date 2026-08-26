/* Manager: Revenue Command Center, Funnel expanded, Forecast Review, Seller Performance */

function StageDrill({ stage, onOpen }) {
  if (!stage) return null;
  const rows = D.opportunities.filter((o) => o.stage.name === stage.name);
  const sellers = D.sellers.filter((s) => rows.some((r) => r.seller === s.seller));
  const brands = [...new Set(rows.map((r) => r.brand))];
  const [tab, setTab] = React.useState('opps');
  const tabs = [['opps', `Opportunities (${stage.count})`], ['sellers', 'By seller'], ['brands', 'By brand']];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <b style={{ fontSize: 15, letterSpacing: '-0.02em' }}>{stage.name.toUpperCase()} — {stage.count} opportunities</b>
        <Badge tone="brand">{K(stage.amount)}</Badge>
        {stage.atRiskAmount ? <RiskBadge severity="HIGH" label={`${K(stage.atRiskAmount)} at risk · ${stage.atRisk} deals`} /> : stage.atRisk ? <RiskBadge severity="HIGH" label={`${stage.atRisk} at risk`} /> : null}
        {stage.avgDaysInStage ? <Badge tone="neutral">{stage.avgDaysInStage}d avg in stage</Badge> : null}
        {stage.likelyToSlip ? <Badge tone="warning">{K(stage.likelyToSlip)} likely slippage</Badge> : null}
        <Badge tone="outline">{stage.conversion}% conversion</Badge>
      </div>
      <div role="tablist" aria-label="Breakdown" style={{ display: 'inline-flex', gap: 2, padding: 3, borderRadius: 8, background: 'var(--surface-muted)', width: 'fit-content' }}>
        {tabs.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} type="button" onClick={() => setTab(id)}
            style={{ height: 28, padding: '0 11px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: tab === id ? 'var(--surface)' : 'transparent', color: tab === id ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: tab === id ? 'var(--shadow-card)' : 'none' }}>{label}</button>
        ))}
      </div>
      {tab === 'opps' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 8 }}>
          {rows.length ? rows.map((o) => <OppRow key={o.id} opp={o} onOpen={onOpen} dense />)
            : <p style={{ margin: 0, font: 'var(--type-meta)', color: 'var(--text-muted)' }}>No sampled opportunities in this stage — the aggregate above covers {stage.count} records.</p>}
          <p style={{ margin: 0, font: 'var(--type-meta)', color: 'var(--text-muted)' }}>Showing {rows.length} of {stage.count}. Click any row to open the drawer — the dashboard stays behind it.</p>
        </div>
      ) : null}
      {tab === 'sellers' ? <SellerPerformance sellers={sellers.length ? sellers : D.sellers} onSelect={() => {}} /> : null}
      {tab === 'brands' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 8 }}>
          {(brands.length ? brands : D.brands.map((b) => b.brand)).map((b) => {
            const meta = D.brands.find((x) => x.brand === b) || { amount: 0, margin: 0, deals: 0 };
            const share = Math.round((meta.amount / D.brands[0].amount) * 100);
            return (
              <div key={b} style={{ display: 'grid', gridTemplateColumns: '92px minmax(0,1fr) 74px 62px', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{b}</span>
                <span style={{ height: 9, borderRadius: 999, background: 'var(--surface-sunken)', overflow: 'hidden' }}>
                  <span style={{ display: 'block', width: share + '%', height: '100%', background: 'var(--chart-2)' }} />
                </span>
                <b className="tnum" style={{ fontSize: 12, textAlign: 'right' }}>{K(meta.amount)}</b>
                <span className="tnum" style={{ fontSize: 12, textAlign: 'right', color: meta.margin < 10 ? 'var(--danger)' : 'var(--text-muted)' }}>{meta.margin}%</span>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function FunnelCard({ onOpen, initial, subtitle }) {
  const [stage, setStage] = React.useState(initial || null);
  return (
    <Card>
      <CardHeader title="Sales funnel" subtitle={subtitle || 'Hover a stage for mechanics · click to expand below, without leaving the dashboard'}
        action={<Badge tone="outline">{D.team.atRisk} at risk</Badge>} />
      <CardContent>
        <SalesFunnel stages={D.funnel} selectedStage={stage} onSelectStage={setStage}
          renderDetail={(s) => <StageDrill stage={s} onOpen={onOpen} />} />
      </CardContent>
    </Card>
  );
}

function ManagerCommand({ onOpen, onScreen }) {
  const t = D.team;
  return (
    <div>
      <ScreenHead eyebrow="Revenue command center" title="Will the team reach quota?"
        meta={`${D.tenant} · ${D.period} · ${D.periodRange} · ${D.week} · 5 sellers`}
        action={<><Button variant="outline" size="sm" icon={<Icon name="Camera" size={15} />}>Snapshot</Button><Button size="sm" icon={<Icon name="ClipboardCheck" size={15} />} onClick={() => onScreen('manager-review')}>Forecast review</Button></>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.55fr) minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
          <LeadMetrics forecast={t.forecast} quota={t.quota} gap={t.gap} likely={t.likelyAttainment}
            delta={t.deltaSinceReview} deltaLabel={'since ' + t.lastReview}
            confidence={t.confidence} confidenceBand={t.confidenceBand}
            secondary={<>
              <QuotaProgress quota={t.quota} billed={t.billed} forecast={t.forecast - t.billed} label="Team quota attainment" />
              <MetricStrip items={[
                { label: 'Billed', value: K(t.billed), detail: '44.6% of quota', tone: 'var(--success)' },
                { label: 'Commit', value: K(t.commit), detail: '22 opportunities' },
                { label: 'Backlog', value: K(t.backlog), detail: '9 awaiting billing' },
                { label: 'Coverage', value: t.coverage.toFixed(1) + '×', detail: 'pipeline / gap' },
                { label: 'Margin', value: t.margin.toFixed(1) + '%', detail: 'threshold 10%' },
                { label: 'Accuracy', value: t.forecastAccuracy + '%', detail: 'last 4 quarters' },
              ]} />
            </>} />
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 16 }}>
            <InsightBanner onAction={(a) => (a === 'Open forecast review' ? onScreen('manager-review') : onOpen(D.byId('OPP-2041')))} />
            <Card>
              <CardHeader title="Forecast movement" subtitle={`Since Monday's snapshot · ${K(t.slippage)} slipped`} />
              <CardContent>
                <ForecastMovement since="Monday" net={-183000} movements={D.movements}
                  onSelect={(m) => onOpen(D.byId(m.opportunityId))} />
              </CardContent>
            </Card>
          </div>
        </div>
        <FunnelCard onOpen={onOpen} />
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
          <Card>
            <CardHeader title="High-risk opportunities" subtitle="Open Commit and Backlog deals with signals"
              action={<Button size="sm" variant="ghost" onClick={() => onScreen('manager-review')}>Review all</Button>} />
            <CardContent style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 8 }}>
              {D.opportunities.filter((o) => o.alerts.length && o.stage.code >= 50).map((o) => <OppRow key={o.id} opp={o} onOpen={onOpen} dense />)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader title="Brands" subtitle="Pipeline contribution and margin" />
            <CardContent style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 9 }}>
              {D.brands.map((b) => (
                <div key={b.brand} style={{ display: 'grid', gridTemplateColumns: '72px minmax(0,1fr) 62px 50px', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{b.brand}</span>
                  <span style={{ height: 9, borderRadius: 999, background: 'var(--surface-sunken)', overflow: 'hidden' }}>
                    <span style={{ display: 'block', width: Math.round((b.amount / D.brands[0].amount) * 100) + '%', height: '100%', background: 'var(--chart-2)' }} />
                  </span>
                  <b className="tnum" style={{ fontSize: 12, textAlign: 'right' }}>{K(b.amount)}</b>
                  <span className="tnum" style={{ fontSize: 11, textAlign: 'right', color: b.margin < 10 ? 'var(--danger)' : 'var(--text-muted)' }}>{b.margin}%</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader title="Sellers" subtitle="Attainment, coverage and risk — click a seller to expand"
            action={<Button size="sm" variant="ghost" onClick={() => onScreen('manager-sellers')}>Full performance view</Button>} />
          <CardContent><SellerTable onOpen={onOpen} compact /></CardContent>
        </Card>
      </div>
    </div>
  );
}

function SellerTable({ onOpen, compact }) {
  const [open, setOpen] = React.useState(null);
  const th = { padding: '8px 10px', fontSize: 10, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right', whiteSpace: 'nowrap' };
  const td = { padding: '11px 10px', fontSize: 13, textAlign: 'right', whiteSpace: 'nowrap' };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 10 }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...th, textAlign: 'left' }}>Seller</th>
              <th style={th}>Quota</th><th style={th}>Billed</th><th style={th}>Forecast</th>
              <th style={th}>Attainment</th><th style={th}>Coverage</th><th style={th}>At risk</th>
              <th style={th}>Margin</th>{compact ? null : <th style={th}>Accuracy</th>}<th style={th}>Trend</th>
            </tr>
          </thead>
          <tbody>
            {D.sellers.map((s) => {
              const att = (s.forecast / s.quota) * 100;
              const on = open === s.seller;
              return (
                <React.Fragment key={s.seller}>
                  <tr onClick={() => setOpen(on ? null : s.seller)} style={{ borderTop: '1px solid var(--border)', cursor: 'pointer', background: on ? 'var(--surface-brand-soft)' : 'transparent' }}>
                    <td style={{ ...td, textAlign: 'left', fontWeight: 600 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <Icon name={on ? 'ChevronDown' : 'ChevronRight'} size={14} style={{ color: 'var(--text-muted)' }} />{s.seller}
                      </span>
                    </td>
                    <td style={td} className="tnum">{K(s.quota)}</td>
                    <td style={td} className="tnum">{K(s.billed)}</td>
                    <td style={td} className="tnum">{K(s.forecast)}</td>
                    <td style={{ ...td, fontWeight: 600, color: att < 70 ? 'var(--danger)' : att < 90 ? 'var(--warning)' : 'var(--success)' }} className="tnum">{att.toFixed(1)}%</td>
                    <td style={{ ...td, color: s.coverage < 1.8 ? 'var(--danger)' : 'inherit' }} className="tnum">{s.coverage.toFixed(1)}×</td>
                    <td style={td} className="tnum">{s.atRisk}</td>
                    <td style={{ ...td, color: s.margin < 10 ? 'var(--danger)' : 'inherit' }} className="tnum">{s.margin}%</td>
                    {compact ? null : <td style={td} className="tnum">{s.accuracy}%</td>}
                    <td style={{ ...td, color: s.trend >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }} className="tnum">{s.trend >= 0 ? '▲' : '▼'} {Math.abs(s.trend)}pt</td>
                  </tr>
                  {on ? (
                    <tr style={{ background: 'var(--surface-sunken)' }}>
                      <td colSpan={compact ? 9 : 10} style={{ padding: 14 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 10 }}>
                            <QuotaProgress quota={s.quota} billed={s.billed} forecast={s.forecast - s.billed} label={`${s.seller.split(' ')[0]} · attainment`} />
                            <MetricStrip items={[
                              { label: 'Commit', value: K(s.commit) },
                              { label: 'Accuracy', value: s.accuracy + '%', detail: 'last 4 quarters' },
                              { label: 'Opportunities', value: String(s.opportunities) },
                            ]} />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 8 }}>
                            <p style={{ margin: 0, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>Deals at risk</p>
                            {D.opportunities.filter((o) => o.seller === s.seller && o.alerts.length).map((o) => <OppRow key={o.id} opp={o} onOpen={onOpen} dense />)}
                            {!D.opportunities.some((o) => o.seller === s.seller && o.alerts.length) ? <p style={{ margin: 0, font: 'var(--type-meta)', color: 'var(--text-muted)' }}>No deals with open signals.</p> : null}
                            <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                              <Button size="sm" variant="outline" icon={<Icon name="MessageSquare" size={14} />}>Ask seller</Button>
                              <Button size="sm" variant="ghost" icon={<Icon name="ClipboardCheck" size={14} />}>Review their forecast</Button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <p style={{ margin: 0, font: 'var(--type-meta)', color: 'var(--text-muted)' }}>Rows expand inline — no navigation. Amber attainment is under 90%, red under 70%.</p>
    </div>
  );
}

function ManagerSellers({ onOpen }) {
  return (
    <div>
      <ScreenHead eyebrow="Team" title="Where should I intervene?"
        meta={`5 sellers · ${D.period} · team attainment ${D.team.likelyAttainment.toFixed(1)}% · forecast accuracy ${D.team.forecastAccuracy}%`}
        action={<Button size="sm" variant="outline" icon={<Icon name="Download" size={15} />}>Export</Button>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <RevenueKPI label="Below 70% attainment" value={2} format="raw" tone="risk" detail="Diego Andrade, Andrés Coba" icon={<Icon name="TrendingDown" size={15} />} />
          <RevenueKPI label="Coverage under 1.8×" value={1} format="raw" tone="warning" detail="Diego Andrade" icon={<Icon name="Layers" size={15} />} />
          <RevenueKPI label="Margin under threshold" value={1} format="raw" tone="warning" detail="Diego Andrade at 8.2%" icon={<Icon name="Percent" size={15} />} />
          <RevenueKPI label="Team forecast accuracy" value={D.team.forecastAccuracy} format="percent" detail="last 4 quarters" icon={<Icon name="Target" size={15} />} />
        </div>
        <Card>
          <CardHeader title="Seller performance" subtitle="Quota, billed, forecast, attainment, coverage, risk, margin, accuracy and trend" />
          <CardContent><SellerTable onOpen={onOpen} /></CardContent>
        </Card>
      </div>
    </div>
  );
}

function ForecastReview({ onOpen, onAskCopilot, onExit }) {
  const queue = D.reviewQueue.map(D.byId);
  const [i, setI] = React.useState(0);
  const [decisions, setDecisions] = React.useState({});
  const [note, setNote] = React.useState('');
  const o = queue[i];
  const decide = (label) => {
    setDecisions((d) => ({ ...d, [o.id]: label }));
    setNote('');
    if (i < queue.length - 1) setI(i + 1);
  };
  const decided = Object.keys(decisions).length;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-brand)' }}>Forecast review</p>
          <h1 style={{ margin: '5px 0 0', fontSize: 26, fontWeight: 600, letterSpacing: '-0.035em' }}>{D.period} · {D.week}</h1>
          <p style={{ margin: '6px 0 0', font: 'var(--type-meta)', color: 'var(--text-muted)' }}>{decided} of {queue.length} decided · {K(queue.reduce((s, q) => s + q.amount, 0))} under review</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="sm" variant="ghost" onClick={onExit}>Leave review</Button>
          <Button size="sm" variant="outline" icon={<Icon name="Camera" size={15} />}>Snapshot decisions</Button>
        </div>
      </div>
      <ModeBanner mode="Review" progress={`${decided} of ${queue.length} decided`} />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
        <Card>
          <CardHeader
            title={`${o.customer} · ${o.title}`}
            subtitle={`${i + 1} of ${queue.length} · ${o.id} · ${o.seller} · ${o.brand} via ${o.partner}`}
            action={<div style={{ textAlign: 'right' }}>
              <b className="tnum" style={{ display: 'block', fontSize: 28, fontWeight: 600, letterSpacing: '-0.035em' }}>{K(o.amount)}</b>
              <span style={{ font: 'var(--type-meta)', color: 'var(--text-muted)' }}>closes {o.closeDate}</span>
            </div>} />
          <CardContent style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 15 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12 }}>
              <div style={{ padding: 12, borderRadius: 11, border: '1px solid var(--border)' }}>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>Seller forecast</p>
                <p style={{ margin: '5px 0 0', fontSize: 18, fontWeight: 600 }}>{catLabel[o.forecastCategory]}</p>
                <p style={{ margin: '3px 0 0', font: 'var(--type-meta)', color: 'var(--text-muted)' }}>{o.stage.code}% · {o.stage.name}</p>
              </div>
              <div style={{ padding: 12, borderRadius: 11, border: '1px solid var(--border)' }}>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>System confidence</p>
                <p className="tnum" style={{ margin: '5px 0 0', fontSize: 18, fontWeight: 600, color: o.confidence >= 65 ? 'var(--success)' : o.confidence >= 40 ? 'var(--warning)' : 'var(--danger)' }}>{o.confidence}%</p>
                <div style={{ marginTop: 6, height: 6, borderRadius: 999, background: 'var(--surface-sunken)', overflow: 'hidden' }}>
                  <div style={{ width: o.confidence + '%', height: '100%', background: o.confidence >= 65 ? 'var(--success)' : o.confidence >= 40 ? 'var(--warning)' : 'var(--danger)' }} />
                </div>
              </div>
              <div style={{ padding: 12, borderRadius: 11, border: '1px solid var(--border)', background: o.suggestedCategory !== o.forecastCategory ? 'var(--warning-soft)' : 'var(--success-soft)' }}>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>Suggested classification</p>
                <p style={{ margin: '5px 0 0', fontSize: 18, fontWeight: 600 }}>{catLabel[o.suggestedCategory]}</p>
                <p style={{ margin: '3px 0 0', font: 'var(--type-meta)', color: 'var(--text-muted)' }}>{o.suggestedCategory === o.forecastCategory ? 'Agrees with the seller' : 'Disagrees with the seller call'}</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 7 }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--success)' }}>Evidence</p>
                {o.evidence.length ? o.evidence.map((e) => (
                  <span key={e} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', font: 'var(--type-meta)' }}>
                    <Icon name="Check" size={13} style={{ color: 'var(--success)', marginTop: 2 }} /><span>{e}</span>
                  </span>
                )) : <span style={{ font: 'var(--type-meta)', color: 'var(--text-muted)' }}>No evidence recorded.</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 7 }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--danger)' }}>Risks</p>
                {o.risks.length ? o.risks.map((r) => (
                  <span key={r} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', font: 'var(--type-meta)' }}>
                    <Icon name="TriangleAlert" size={13} style={{ color: 'var(--danger)', marginTop: 2 }} /><span>{r}</span>
                  </span>
                )) : <span style={{ font: 'var(--type-meta)', color: 'var(--text-muted)' }}>No open risks.</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 7 }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>Missing evidence</p>
                {o.missing.length ? o.missing.map((m) => (
                  <span key={m} style={{ display: 'flex', gap: 7, alignItems: 'center', font: 'var(--type-meta)' }}>
                    <Icon name="CircleDashed" size={13} style={{ color: 'var(--text-muted)' }} />{m}
                  </span>
                )) : <span style={{ font: 'var(--type-meta)', color: 'var(--text-muted)' }}>Complete.</span>}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 14 }}>
              <div>
                <p style={{ margin: '0 0 7px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>Stage history</p>
                <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
                  {o.stageHistory.map((h) => (
                    <li key={h.at} style={{ position: 'relative', paddingLeft: 17, borderLeft: '2px solid var(--surface-brand-soft)' }}>
                      <span style={{ position: 'absolute', left: -5, top: 4, width: 8, height: 8, borderRadius: 999, background: 'var(--brand)' }} />
                      <b style={{ fontSize: 12 }}>{h.from ? h.from + ' → ' : ''}{h.to}</b>
                      <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)' }}>{h.by} · {h.at}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <p style={{ margin: '0 0 7px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>Previous forecast changes</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 6 }}>
                  {(D.movements.filter((m) => m.opportunityId === o.id).length ? D.movements.filter((m) => m.opportunityId === o.id) : [{ label: 'No forecast changes recorded', delta: 0, reason: 'Category unchanged since the last snapshot' }]).map((m) => (
                    <div key={m.label} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 9, alignItems: 'center', padding: '8px 10px', borderRadius: 9, border: '1px solid var(--border)' }}>
                      <span style={{ minWidth: 0, fontSize: 11, color: 'var(--text-muted)' }}>{m.reason}</span>
                      {m.delta ? <b className="tnum" style={{ fontSize: 12, color: m.delta > 0 ? 'var(--success)' : 'var(--danger)' }}>{m.delta > 0 ? '+' : '−'}{K(Math.abs(m.delta))}</b> : null}
                    </div>
                  ))}
                </div>
                <Input style={{ marginTop: 9 }} placeholder="Add a note for the seller…" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 14, alignItems: 'center' }}>
              <Button size="sm" onClick={() => decide('Commit kept')}>Keep Commit</Button>
              <Button size="sm" variant="outline" onClick={() => decide('Moved to Upside')}>Move to Upside</Button>
              <Button size="sm" variant="outline" onClick={() => decide('Question sent')} icon={<Icon name="MessageSquare" size={14} />}>Ask seller</Button>
              <Button size="sm" variant="ghost" disabled={!note} onClick={() => decide('Note added')}>Add note</Button>
              <span style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                {decisions[o.id] ? <Badge tone="positive">{decisions[o.id]}</Badge> : null}
                <Button size="sm" variant="outline" onClick={() => setI((i + 1) % queue.length)} iconAfter={<Icon name="ChevronRight" size={15} />}>Next</Button>
              </span>
            </div>
          </CardContent>
        </Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 16 }}>
          <Card pad><OpportunityHealth score={o.health.score} status={o.health.status} size="lg" showFactors factors={o.health.factors} /></Card>
          <Card pad style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 12 }}>
            <StageVelocity stage={o.stage.name} daysInStage={o.daysInStage} benchmarkDays={o.benchmarkDays} />
            <MetricStrip items={[
              { label: 'Margin', value: o.margin + '%', tone: o.margin < 10 ? 'var(--danger)' : 'var(--success)' },
              { label: 'Billing', value: o.billingDate ? o.billingDate.split(' ').slice(1).join(' ') : '—' },
              { label: 'Alerts', value: String(o.alerts.length), tone: o.alerts.length ? 'var(--danger)' : 'inherit' },
            ]} />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="sm" variant="outline" onClick={() => onOpen(o)} icon={<Icon name="PanelRight" size={14} />}>Open drawer</Button>
              <Button size="sm" variant="ghost" onClick={() => onAskCopilot('Is Commit justified?', o)} icon={<Icon name="Bot" size={14} />}>Ask Copilot</Button>
            </div>
          </Card>
          <Card>
            <CardHeader title="Review queue" subtitle={`${queue.length - decided} still to decide`} />
            <CardContent style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 5, maxHeight: 300, overflowY: 'auto' }}>
              {queue.map((q, ix) => (
                <button key={q.id} type="button" onClick={() => setI(ix)}
                  style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr) auto auto', gap: 8, alignItems: 'center', textAlign: 'left', padding: '7px 9px', borderRadius: 9, cursor: 'pointer', border: '1px solid', borderColor: ix === i ? 'var(--brand)' : 'transparent', background: ix === i ? 'var(--surface-brand-soft)' : 'transparent' }}>
                  <span className="tnum" style={{ fontSize: 11, color: 'var(--text-muted)', width: 16 }}>{ix + 1}</span>
                  <span style={{ minWidth: 0, fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.customer}</span>
                  {decisions[q.id] ? <Icon name="Check" size={13} style={{ color: 'var(--success)' }} /> : <span style={{ width: 13 }} />}
                  <span className="tnum" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{K(q.amount)}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ManagerCommand, ManagerSellers, ForecastReview, FunnelCard, StageDrill, SellerTable });
