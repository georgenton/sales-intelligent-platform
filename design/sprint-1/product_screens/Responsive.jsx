/* Responsive: Seller mobile, Manager tablet, Opportunity mobile sheet */

function DeviceFrame({ w, h, label, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 10, justifyItems: 'center' }}>
      <div style={{ width: w, height: h, borderRadius: 22, border: '1px solid var(--border-strong)', background: 'var(--surface)', overflow: 'hidden', boxShadow: 'var(--shadow-overlay)', display: 'grid', gridTemplateColumns: 'minmax(0,1fr)' }}>
        {children}
      </div>
      <span style={{ font: 'var(--type-meta)', color: 'var(--text-muted)' }}>{label}</span>
    </div>
  );
}

const MOBILE_TABS = [
  { id: 'today', label: 'Today', icon: 'Sun' },
  { id: 'opps', label: 'Deals', icon: 'Target' },
  { id: 'actions', label: 'Actions', icon: 'ListChecks' },
  { id: 'meetings', label: 'Meetings', icon: 'CalendarDays' },
  { id: 'copilot', label: 'Copilot', icon: 'Bot' },
];

function MobileSheet({ deal, onClose }) {
  if (!deal) return null;
  const rows = [['Stage', `${deal.stage.code}% ${deal.stage.name}`], ['Category', catLabel[deal.forecastCategory]], ['Seller', deal.seller], ['Brand', deal.brand], ['Partner', deal.partner], ['Close', deal.closeDate], ['Billing', deal.billingDate || '—'], ['Margin', deal.margin + '%']];
  return (
    <div role="dialog" aria-modal="true" aria-label={deal.title}
      style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'var(--surface)', display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gridTemplateRows: '52px minmax(0,1fr) auto' }}>
      <header style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', alignItems: 'center', gap: 6, padding: '0 12px', borderBottom: '1px solid var(--border)' }}>
        <button type="button" onClick={onClose} aria-label="Close"
          style={{ display: 'grid', placeItems: 'center', width: 44, height: 44, marginLeft: -10, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Icon name="ChevronLeft" size={20} /></button>
        <b style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{deal.customer}</b>
      </header>
      <div style={{ overflowY: 'auto', padding: 14, display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 12, alignContent: 'start' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, letterSpacing: '-0.03em' }}>{deal.title}</h2>
          <p className="tnum" style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 600, letterSpacing: '-0.04em' }}>{K(deal.amount)}</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {deal.alerts.length ? deal.alerts.map((a) => <RiskBadge key={a.code} severity={a.severity} code={a.code} />) : <Badge tone="positive">No open risks</Badge>}
        </div>
        <Card pad><OpportunityHealth score={deal.health.score} status={deal.health.status} size="lg" showFactors factors={deal.health.factors} /></Card>
        <Card pad><StageVelocity stage={deal.stage.name} daysInStage={deal.daysInStage} benchmarkDays={deal.benchmarkDays} /></Card>
        <Card pad style={{ background: 'var(--surface-brand-soft)', borderColor: 'transparent' }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--teal-800)' }}>Next action</p>
          <p style={{ margin: '5px 0 0', font: 'var(--type-body)' }}>{deal.nextAction}</p>
        </Card>
        <Card><CardHeader title="Details" /><CardContent>
          {rows.map(([k, v], i) => (
            <div key={k} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 10, padding: '10px 0', borderTop: i ? '1px solid var(--border)' : 'none', fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)' }}>{k}</span><b>{v}</b>
            </div>
          ))}
        </CardContent></Card>
        <Card><CardHeader title="Stage history" /><CardContent>
          <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
            {deal.stageHistory.map((h) => (
              <li key={h.at} style={{ paddingLeft: 16, borderLeft: '2px solid var(--surface-brand-soft)', position: 'relative' }}>
                <span style={{ position: 'absolute', left: -5, top: 4, width: 8, height: 8, borderRadius: 999, background: 'var(--brand)' }} />
                <b style={{ fontSize: 12 }}>{h.from ? h.from + ' → ' : ''}{h.to}</b>
                <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)' }}>{h.by} · {h.at}</span>
              </li>
            ))}
          </ol>
        </CardContent></Card>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 8, padding: 12, borderTop: '1px solid var(--border)' }}>
        <Button size="lg" icon={<Icon name="Phone" size={16} />}>Log activity</Button>
        <Button size="lg" variant="outline" aria-label="Ask Copilot"><Icon name="Bot" size={17} /></Button>
      </div>
    </div>
  );
}

function SellerMobile({ startTab, forceDeal }) {
  const [tab, setTab] = React.useState(startTab || 'today');
  const [deal, setDeal] = React.useState(forceDeal ? D.byId(forceDeal) : null);
  const [msgs, setMsgs] = React.useState([]);
  const s = D.seller;
  const mine = D.opportunities.filter((o) => o.seller === D.users.seller.name);
  const titles = { today: 'Today', opps: 'My deals', actions: 'Actions', meetings: 'Meetings', copilot: 'Copilot' };
  const body = {
    today: (
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 12 }}>
        <Card pad style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 12 }}>
          <div>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>Forecast · {D.period}</p>
            <p className="tnum" style={{ margin: '4px 0 0', fontSize: 32, fontWeight: 600, letterSpacing: '-0.04em' }}>{K(s.forecast)}</p>
            <p style={{ margin: '3px 0 0', font: 'var(--type-meta)', color: 'var(--text-muted)' }}>{s.likelyAttainment.toFixed(1)}% likely · {K(s.gap)} gap</p>
          </div>
          <QuotaProgress quota={s.quota} billed={s.billed} forecast={s.forecast - s.billed} label="My quota" compact />
        </Card>
        <MetricStrip items={[{ label: 'Billed', value: K(s.billed), tone: 'var(--success)' }, { label: 'Commit', value: K(s.commit) }, { label: 'At risk', value: String(s.atRisk), tone: 'var(--danger)' }]} />
        <Card>
          <CardHeader title="Focus today" subtitle="2 actions move your quarter" />
          <CardContent style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 10 }}>
            {mine.filter((o) => o.risks.length).slice(0, 2).map((o) => (
              <NextBestAction key={o.id} customer={o.customer} amount={o.amount} category={catLabel[o.forecastCategory]}
                severity={o.health.status === 'CRITICAL' ? 'CRITICAL' : 'HIGH'} risk={o.risks[0]} suggestion={o.nextAction}
                primaryLabel="Log activity" onOpen={() => setDeal(o)} />
            ))}
          </CardContent>
        </Card>
      </div>
    ),
    opps: (
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 10 }}>
        <Input icon={<Icon name="Search" size={14} />} placeholder="Search customer or deal" />
        {mine.map((o) => (
          <button key={o.id} type="button" onClick={() => setDeal(o)}
            style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 7, textAlign: 'left', padding: 13, borderRadius: 14, border: '1px solid var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>
            <span style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 10 }}>
              <span style={{ minWidth: 0 }}>
                <b style={{ display: 'block', fontSize: 14 }}>{o.customer}</b>
                <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.title}</span>
              </span>
              <b className="tnum" style={{ fontSize: 14 }}>{K(o.amount)}</b>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Badge tone="brand">{o.stage.code}% · {o.stage.name}</Badge>
              {o.alerts[0] ? <RiskBadge severity={o.alerts[0].severity} code={o.alerts[0].code} /> : <Badge tone="positive">On track</Badge>}
              <span style={{ marginLeft: 'auto' }}><OpportunityHealth score={o.health.score} status={o.health.status} size="sm" /></span>
            </span>
          </button>
        ))}
      </div>
    ),
    actions: (
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 10 }}>
        {mine.filter((o) => o.risks.length).map((o) => (
          <NextBestAction key={o.id} customer={o.customer} amount={o.amount} category={catLabel[o.forecastCategory]}
            severity={o.health.status === 'CRITICAL' ? 'CRITICAL' : 'HIGH'} risk={o.risks[0]} suggestion={o.nextAction}
            primaryLabel="Mark done" onOpen={() => setDeal(o)} />
        ))}
      </div>
    ),
    meetings: (
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 14 }}>
        {['Today', 'Tomorrow', 'Thursday'].map((day) => (
          <div key={day} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 7 }}>
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>{day}</span>
            {D.meetings.filter((m) => m.day === day).map((m) => (
              <Card key={m.time + m.who} pad style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', gap: 11 }}>
                <b className="tnum" style={{ fontSize: 12 }}>{m.time}</b>
                <span style={{ minWidth: 0 }}>
                  <b style={{ display: 'block', fontSize: 13 }}>{m.who}</b>
                  <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)' }}>{m.what}</span>
                  {m.ctx ? <span style={{ display: 'block', marginTop: 5 }}><Badge tone="brand">{m.ctx}</Badge></span> : null}
                </span>
              </Card>
            ))}
          </div>
        ))}
      </div>
    ),
    copilot: <div style={{ height: '100%', minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0,1fr)' }}>
      <CopilotRail ctx="seller" messages={msgs} onAsk={(q) => setMsgs((m) => [...m, { role: 'user', text: q }, { role: 'assistant', text: copilotAnswer(q, null) }])} />
    </div>,
  }[tab];
  return (
    <div style={{ position: 'relative', height: '100%', display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gridTemplateRows: '52px minmax(0,1fr) auto', background: 'var(--bg-canvas)' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <span style={{ display: 'grid', placeItems: 'center', width: 28, height: 28, borderRadius: 9, background: 'var(--surface-inverse)', color: 'var(--accent-bright)', fontWeight: 700, fontSize: 10, flex: 'none' }}>SI</span>
        <b style={{ fontSize: 15, letterSpacing: '-0.02em' }}>{titles[tab]}</b>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <Button size="icon" variant="ghost" aria-label="Search"><Icon name="Search" size={16} /></Button>
          <Button size="icon" variant="ghost" aria-label="Alerts"><Icon name="BellRing" size={16} /></Button>
        </span>
      </header>
      <main style={{ overflowY: 'auto', padding: tab === 'copilot' ? 0 : 14, minHeight: 0 }}>{body}</main>
      <nav aria-label="Primary" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0,1fr))', borderTop: '1px solid var(--border)', background: 'var(--surface)', paddingBottom: 4 }}>
        {MOBILE_TABS.map((t) => {
          const on = tab === t.id;
          return (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} aria-current={on ? 'page' : undefined}
              style={{ minHeight: 52, display: 'grid', justifyItems: 'center', gap: 2, border: 'none', background: 'none', cursor: 'pointer', color: on ? 'var(--text-brand)' : 'var(--text-muted)', fontSize: 9.5, fontWeight: 600, padding: '7px 0' }}>
              <Icon name={t.icon} size={18} />{t.label}
            </button>
          );
        })}
      </nav>
      <MobileSheet deal={deal} onClose={() => setDeal(null)} />
    </div>
  );
}

function ManagerTablet({ onOpen }) {
  const t = D.team;
  const [stage, setStage] = React.useState(null);
  const [copilot, setCopilot] = React.useState(false);
  return (
    <div style={{ position: 'relative', height: '100%', display: 'grid', gridTemplateColumns: '72px minmax(0,1fr)', background: 'var(--bg-canvas)' }}>
      <aside style={{ background: 'var(--surface-inverse)', padding: '16px 10px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 6, alignContent: 'start', justifyItems: 'center' }}>
        <span style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 10, background: 'var(--accent-bright)', color: '#08242c', fontWeight: 700, fontSize: 12, marginBottom: 8 }}>SI</span>
        {NAV.manager.map((i, ix) => (
          <button key={i.id} type="button" aria-label={i.label} title={i.label}
            style={{ display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 11, border: 'none', cursor: 'pointer', background: ix === 0 ? 'oklch(0.865 0.127 207 / 0.12)' : 'transparent', color: ix === 0 ? 'var(--accent-bright)' : 'oklch(0.68 0.02 220)' }}>
            <Icon name={i.icon} size={19} />
          </button>
        ))}
      </aside>
      <div style={{ minWidth: 0, display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gridTemplateRows: '52px minmax(0,1fr)' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <b style={{ fontSize: 14, letterSpacing: '-0.02em' }}>Command center</b>
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <PeriodSelector periods={['FY26 Q3', 'FY26 Q4']} value={D.period} />
            <Button size="sm" variant="outline" icon={<Icon name="Bot" size={15} />} onClick={() => setCopilot(true)}>Copilot</Button>
          </span>
        </header>
        <main style={{ padding: 16, overflowY: 'auto', minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 14, alignContent: 'start' }}>
          <Card pad style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr) minmax(0,1fr)', gap: 14, alignItems: 'end' }}>
              <div>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>Forecast</p>
                <p className="tnum" style={{ margin: '4px 0 0', fontSize: 34, fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1 }}>{K(t.forecast)}</p>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>{t.likelyAttainment.toFixed(1)}% likely</p>
              </div>
              <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: 14 }}>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>Quota</p>
                <p className="tnum" style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em' }}>{K(t.quota)}</p>
              </div>
              <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: 14 }}>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--danger)' }}>Gap</p>
                <p className="tnum" style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--danger)' }}>{K(t.gap)}</p>
              </div>
            </div>
            <QuotaProgress quota={t.quota} billed={t.billed} forecast={t.forecast - t.billed} label="Team attainment" compact />
          </Card>
          <InsightBanner compact onAction={() => onOpen(D.byId('OPP-2041'))} />
          <Card>
            <CardHeader title="Sales funnel" subtitle="Tap a stage to expand below" />
            <CardContent>
              <SalesFunnel stages={D.funnel} selectedStage={stage} onSelectStage={setStage}
                renderDetail={(s) => (
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 8 }}>
                    <b style={{ fontSize: 13 }}>{s.name.toUpperCase()} — {s.count} opportunities</b>
                    {D.opportunities.filter((o) => o.stage.name === s.name).map((o) => <OppRow key={o.id} opp={o} onOpen={onOpen} dense />)}
                  </div>
                )} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader title="Sellers" subtitle="Attainment and coverage" />
            <CardContent><SellerPerformance sellers={D.sellers} onSelect={() => {}} /></CardContent>
          </Card>
        </main>
      </div>
      {copilot ? (
        <div role="presentation" onClick={() => setCopilot(false)} style={{ position: 'absolute', inset: 0, background: 'var(--scrim)', display: 'flex', justifyContent: 'flex-end', zIndex: 30 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 380, height: '100%', background: 'var(--surface)', borderLeft: '1px solid var(--border)', padding: 14, display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gridTemplateRows: 'auto minmax(0,1fr)', gap: 10 }}>
            <Button size="sm" variant="outline" style={{ justifySelf: 'end' }} onClick={() => setCopilot(false)}>Close</Button>
            <CopilotRail ctx="manager" messages={[]} onAsk={() => {}} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ResponsiveScreen({ kind, onOpen }) {
  if (kind === 'seller-mobile') {
    return (
      <div>
        <ScreenHead eyebrow="Responsive" title="Seller mobile"
          meta="390 × 844 · Today, Deals, Actions, Meetings, Copilot. Dashboards, brand analytics and import are deliberately absent." />
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
          <DeviceFrame w={390} h={780} label="Today — quota, then the two moves that matter"><SellerMobile startTab="today" /></DeviceFrame>
          <DeviceFrame w={390} h={780} label="Deals — cards, never a table"><SellerMobile startTab="opps" /></DeviceFrame>
          <DeviceFrame w={390} h={780} label="Copilot — full screen, seller context"><SellerMobile startTab="copilot" /></DeviceFrame>
        </div>
      </div>
    );
  }
  if (kind === 'opportunity-mobile') {
    return (
      <div>
        <ScreenHead eyebrow="Responsive" title="Opportunity mobile sheet"
          meta="The drawer becomes a full-screen sheet: same content, same order, swipe or back to dismiss." />
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
          <DeviceFrame w={390} h={780} label="Banco Andino · $240K · Commit at risk"><SellerMobile startTab="opps" forceDeal="OPP-2041" /></DeviceFrame>
          <DeviceFrame w={390} h={780} label="Grupo Pacífico · $310K · healthy"><SellerMobile startTab="opps" forceDeal="OPP-2088" /></DeviceFrame>
        </div>
      </div>
    );
  }
  return (
    <div>
      <ScreenHead eyebrow="Responsive" title="Manager tablet"
        meta="1024 × 768 · 72px icon rail, Copilot as a launcher, funnel and sellers kept. The KPI cluster drops to Forecast / Quota / Gap." />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <DeviceFrame w={1024} h={768} label="Landscape tablet — full funnel drill-down retained"><ManagerTablet onOpen={onOpen} /></DeviceFrame>
      </div>
    </div>
  );
}

Object.assign(window, { ResponsiveScreen, SellerMobile, ManagerTablet, MobileSheet, DeviceFrame });
