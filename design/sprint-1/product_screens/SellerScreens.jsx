/* Seller: Standard workspace, Focus mode, Guided mode */

function FocusToday({ onOpen, limit = 3 }) {
  const deals = D.guidedQueue.map(D.byId).filter((o) => o.risks.length).slice(0, limit);
  return (
    <Card>
      <CardHeader title="Focus today" subtitle={`${deals.length} actions may materially affect your quarter`}
        action={<Badge tone="risk">{K(deals.reduce((s, d) => s + d.amount, 0))} exposed</Badge>} />
      <CardContent style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 10 }}>
        {deals.map((o) => (
          <NextBestAction key={o.id} customer={`${o.customer} · ${o.brand}`} amount={o.amount} category={catLabel[o.forecastCategory]}
            severity={o.health.status === 'CRITICAL' ? 'CRITICAL' : o.health.status === 'AT_RISK' ? 'HIGH' : 'WARNING'}
            risk={o.risks[0]} suggestion={o.nextAction} primaryLabel="Log activity" onOpen={() => onOpen(o)} />
        ))}
      </CardContent>
    </Card>
  );
}

function AttentionList({ onOpen }) {
  const deals = D.opportunities.filter((o) => o.seller === D.users.seller.name && o.status === 'OPEN');
  return (
    <Card>
      <CardHeader title="Opportunities requiring attention" subtitle="Your open portfolio, worst health first"
        action={<Button size="sm" variant="ghost" iconAfter={<Icon name="ArrowUpRight" size={14} />}>All 16</Button>} />
      <CardContent style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 8 }}>
        {[...deals].sort((a, b) => a.health.score - b.health.score).map((o) => <OppRow key={o.id} opp={o} onOpen={onOpen} dense />)}
      </CardContent>
    </Card>
  );
}

function MeetingsCard({ onOpen, limit = 5 }) {
  const items = D.meetings.slice(0, limit);
  return (
    <Card>
      <CardHeader title="Customer meetings" subtitle="Next five working days" />
      <CardContent style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 8 }}>
        {items.map((m) => (
          <div key={m.time + m.who} style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr) auto', gap: 11, alignItems: 'center', padding: '9px 11px', borderRadius: 11, border: '1px solid var(--border)' }}>
            <span style={{ textAlign: 'center', flex: 'none' }}>
              <span style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>{m.day.slice(0, 3)}</span>
              <b className="tnum" style={{ fontSize: 12 }}>{m.time}</b>
            </span>
            <span style={{ minWidth: 0 }}>
              <b style={{ display: 'block', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.who}</b>
              <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.what}</span>
            </span>
            {m.ctx ? <button type="button" onClick={() => onOpen(D.byId(m.opportunityId))} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', flex: 'none' }}><Badge tone="brand">{m.ctx}</Badge></button> : <Badge tone="outline">Internal</Badge>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RisksCard({ onOpen }) {
  const rows = D.opportunities.filter((o) => o.seller === D.users.seller.name && o.alerts.length);
  return (
    <Card>
      <CardHeader title="Risks on my deals" subtitle="Deterministic signals · colour, icon and label" />
      <CardContent style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 12 }}>
        {rows.map((o) => (
          <div key={o.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 7 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, justifyContent: 'space-between' }}>
              <button type="button" onClick={() => onOpen(o)} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', minWidth: 0, textAlign: 'left' }}>
                <b style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{o.customer}</b>
              </button>
              <span style={{ display: 'flex', gap: 6, flex: 'none' }}>{o.alerts.map((a) => <RiskBadge key={a.code} severity={a.severity} code={a.code} />)}</span>
            </div>
            <StageVelocity stage={o.stage.name} daysInStage={o.daysInStage} benchmarkDays={o.benchmarkDays} />
          </div>
        ))}
        {!rows.length ? <p style={{ margin: 0, font: 'var(--type-meta)', color: 'var(--text-muted)' }}>No open risks on your deals.</p> : null}
      </CardContent>
    </Card>
  );
}

function SellerFunnelCard({ onOpen }) {
  const [stage, setStage] = React.useState(null);
  return (
    <Card>
      <CardHeader title="My funnel" subtitle="Select a stage to break it down here" />
      <CardContent>
        <SalesFunnel stages={D.sellerFunnel} selectedStage={stage} onSelectStage={setStage} renderDetail={(s) => (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 8 }}>
            <p style={{ margin: 0, font: 'var(--type-meta)', color: 'var(--text-muted)' }}>{s.name.toUpperCase()} — {s.count} opportunities · {K(s.amount)} · {s.conversion}% historical conversion</p>
            {D.opportunities.filter((o) => o.seller === D.users.seller.name && o.stage.name === s.name).map((o) => <OppRow key={o.id} opp={o} onOpen={onOpen} dense />)}
          </div>
        )} />
      </CardContent>
    </Card>
  );
}

function SellerStandard({ onOpen }) {
  const s = D.seller;
  return (
    <div>
      <ScreenHead eyebrow="My sales workspace" title="What should I do today?"
        meta={`${D.users.seller.name} · ${D.users.seller.team} · ${D.period} · ${D.periodRange} · ${D.week}`}
        action={<><Button variant="outline" size="sm" icon={<Icon name="Upload" size={15} />}>Update forecast</Button><Button size="sm" icon={<Icon name="Plus" size={15} />}>New opportunity</Button></>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 16 }}>
        <SellerLead quota={s.quota} billed={s.billed} forecast={s.forecast} gap={s.gap} likely={s.likelyAttainment}
          confidence={s.confidence} delta={s.deltaSinceReview}
          secondary={<>
            <QuotaProgress quota={s.quota} billed={s.billed} forecast={s.forecast - s.billed} label="My quota attainment" />
            <MetricStrip items={[
              { label: 'Commit', value: K(s.commit), detail: '4 opportunities' },
              { label: 'Backlog', value: K(s.backlog), detail: '1 awaiting billing' },
              { label: 'Pipeline coverage', value: s.coverage.toFixed(1) + '×', detail: 'of remaining gap' },
              { label: 'Margin', value: s.margin.toFixed(1) + '%', detail: 'threshold 10%', tone: 'var(--success)' },
              { label: 'At risk', value: String(s.atRisk), detail: 'deals with signals', tone: 'var(--danger)' },
            ]} />
          </>} />
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
          <FocusToday onOpen={onOpen} />
          <SellerFunnelCard onOpen={onOpen} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
          <AttentionList onOpen={onOpen} />
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 16 }}>
            <MeetingsCard onOpen={onOpen} />
            <RisksCard onOpen={onOpen} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SellerFocus({ onOpen }) {
  const s = D.seller;
  const critical = D.opportunities.filter((o) => o.seller === D.users.seller.name && o.health.status !== 'HEALTHY' && o.status === 'OPEN');
  const priorities = D.guidedQueue.map(D.byId).filter((o) => o.risks.length).slice(0, 3);
  const [done, setDone] = React.useState([]);
  const toggle = (id) => setDone((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
  const secured = priorities.filter((o) => done.includes(o.id)).reduce((t, o) => t + o.amount, 0);
  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <ScreenHead eyebrow="Focus mode" title="Close the gap"
        meta={`${K(s.gap)} to quota · ${D.period} · 7 weeks left`} />
      <ModeBanner mode="Focus" progress={`${done.length} of ${priorities.length} committed`} />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 16 }}>
        <Card pad style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 18 }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>Objective · likely attainment</p>
            <p className="tnum" style={{ margin: '6px 0 0', fontSize: 52, fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--warning)' }}>{s.likelyAttainment.toFixed(1)}%</p>
            <p style={{ margin: '7px 0 0', font: 'var(--type-body)', color: 'var(--text-muted)' }}>{K(s.gap)} remaining against a {K(s.quota)} quota</p>
          </div>
          <QuotaProgress quota={s.quota} billed={s.billed} forecast={s.forecast - s.billed} label="Progress" />
        </Card>
        <Card>
          <CardHeader title="Today's commitments" subtitle="Three moves, in order — tick each one as you make it"
            action={<Badge tone={done.length === priorities.length ? 'positive' : 'brand'}>{done.length} of {priorities.length} done{secured ? ' · ' + K(secured) + ' worked' : ''}</Badge>} />
          <CardContent style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 10 }}>
            {priorities.map((o, i) => {
              const isDone = done.includes(o.id);
              return (
                <div key={o.id} style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', gap: 12, alignItems: 'start', opacity: isDone ? 0.55 : 1, transition: 'opacity var(--dur-base) var(--ease-standard)' }}>
                  <button type="button" onClick={() => toggle(o.id)} aria-pressed={isDone} aria-label={isDone ? 'Mark not done' : 'Mark done'}
                    style={{ display: 'grid', placeItems: 'center', width: 26, height: 26, borderRadius: 999, marginTop: 4, flex: 'none', cursor: 'pointer', border: '1px solid', borderColor: isDone ? 'transparent' : 'var(--border-strong)', background: isDone ? 'var(--success)' : 'var(--surface)', color: isDone ? '#fff' : 'var(--text-muted)', fontSize: 12, fontWeight: 700 }}>
                    {isDone ? <Icon name="Check" size={14} /> : <span className="tnum">{i + 1}</span>}
                  </button>
                  <NextBestAction customer={`${o.customer} · ${o.brand}`} amount={o.amount} category={catLabel[o.forecastCategory]}
                    severity={o.health.status === 'CRITICAL' ? 'CRITICAL' : 'HIGH'} risk={o.risks[0]} suggestion={o.nextAction}
                    primaryLabel={isDone ? 'Logged' : 'Log activity'} onPrimary={() => toggle(o.id)} onOpen={() => onOpen(o)} />
                </div>
              );
            })}
            {done.length === priorities.length ? (
              <p style={{ margin: 0, padding: 12, borderRadius: 11, background: 'var(--success-soft)', color: 'var(--success)', font: 'var(--type-body)', fontWeight: 600 }}>
                All three committed. {K(secured)} of exposed pipeline worked today.
              </p>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Critical opportunities" subtitle={`${critical.length} deals need evidence before the forecast call`} />
          <CardContent style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 8 }}>
            {critical.map((o) => <OppRow key={o.id} opp={o} onOpen={onOpen} dense />)}
          </CardContent>
        </Card>
        <p style={{ margin: 0, font: 'var(--type-meta)', color: 'var(--text-muted)', textAlign: 'center' }}>Funnel, brand analytics, meetings and portfolio tables are hidden in Focus mode. Switch to Standard to see them.</p>
      </div>
    </div>
  );
}

function SellerGuided({ onOpen, onAskCopilot, onExit }) {
  const queue = D.guidedQueue.map(D.byId);
  const [i, setI] = React.useState(0);
  const [log, setLog] = React.useState([]);
  const [nextStep, setNextStep] = React.useState('');
  const [custom, setCustom] = React.useState('');
  const [otherOpen, setOtherOpen] = React.useState(false);
  const o = queue[i];
  React.useEffect(() => { setOtherOpen(false); setCustom(''); }, [i]);
  const record = (what) => {
    setLog((l) => [...l, `${o.customer}: ${what}`]);
    setNextStep('');
    setCustom('');
    setOtherOpen(false);
    if (i < queue.length - 1) setI(i + 1); else onExit();
  };
  const choices = ['Call the economic buyer', 'Request the purchase order', 'Book a technical session', 'Send the revised proposal', 'Re-qualify the budget'];
  // The system's recommendation, derived from the deal's missing evidence.
  const recommended = o.missing.some((m) => /purchase order/i.test(m)) ? 'Request the purchase order'
    : o.missing.some((m) => /buyer/i.test(m)) ? 'Call the economic buyer'
    : o.missing.some((m) => /budget/i.test(m)) ? 'Re-qualify the budget'
    : o.missing.some((m) => /scope|requirement|criteria/i.test(m)) ? 'Book a technical session'
    : 'Send the revised proposal';
  const chosen = otherOpen ? custom.trim() : nextStep;
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-brand)' }}>Guided review</p>
          <h1 style={{ margin: '5px 0 0', fontSize: 26, fontWeight: 600, letterSpacing: '-0.035em' }}>{queue.length} opportunities require review</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={onExit}>Leave review</Button>
      </div>
      <ModeBanner mode="Guided" progress={`${log.length} recorded`} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span className="tnum" style={{ fontSize: 13, fontWeight: 600, flex: 'none' }}>{i + 1} of {queue.length}</span>
        <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'var(--surface-sunken)', minWidth: 0 }}>
          <div style={{ width: `${((i + 1) / queue.length) * 100}%`, height: '100%', borderRadius: 999, background: 'var(--brand)', transition: 'width var(--dur-base) var(--ease-out)' }} />
        </div>
        <span style={{ font: 'var(--type-meta)', color: 'var(--text-muted)', flex: 'none' }}>{log.length} decisions recorded</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.35fr) minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
        <Card>
          <CardHeader title={`${o.customer} · ${o.title}`} subtitle={`${o.id} · ${o.brand} via ${o.partner} · ${o.seller}`}
            action={<b className="tnum" style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.03em' }}>{K(o.amount)}</b>} />
          <CardContent style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 16 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <Badge tone="brand">{o.stage.code}% · {o.stage.name}</Badge>
              <Badge uppercase>{catLabel[o.forecastCategory]}</Badge>
              {o.alerts.map((a) => <RiskBadge key={a.code} severity={a.severity} code={a.code} />)}
              <span style={{ marginLeft: 'auto', font: 'var(--type-meta)', color: 'var(--text-muted)' }}>Last activity {o.lastActivity}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 8 }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--danger)' }}>Missing information</p>
                {o.missing.length ? o.missing.map((m) => (
                  <span key={m} style={{ display: 'flex', gap: 8, alignItems: 'center', font: 'var(--type-meta)' }}>
                    <Icon name="CircleDashed" size={13} style={{ color: 'var(--danger)' }} />{m}
                  </span>
                )) : <span style={{ font: 'var(--type-meta)', color: 'var(--text-muted)' }}>Nothing missing.</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 8 }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>Current risk</p>
                {o.risks.length ? o.risks.map((r) => (
                  <span key={r} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', font: 'var(--type-meta)' }}>
                    <Icon name="TriangleAlert" size={13} style={{ color: 'var(--warning)', marginTop: 2 }} /><span>{r}</span>
                  </span>
                )) : <span style={{ font: 'var(--type-meta)', color: 'var(--text-muted)' }}>No open risk signals.</span>}
              </div>
            </div>
            <div style={{ padding: 13, borderRadius: 11, background: 'var(--surface-brand-soft)' }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--teal-800)' }}>Suggested action</p>
              <p style={{ margin: '5px 0 0', font: 'var(--type-body)' }}>{o.nextAction}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 9 }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>Choose the next step</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {choices.map((c) => {
                  const on = !otherOpen && nextStep === c;
                  const rec = c === recommended;
                  return (
                    <button key={c} type="button" onClick={() => { setOtherOpen(false); setNextStep(c); }} aria-pressed={on}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 34, padding: '0 12px', borderRadius: 999, cursor: 'pointer', fontSize: 12, fontWeight: 600, border: rec && !on ? '1px solid var(--brand)' : '1px solid', borderColor: on ? 'transparent' : rec ? 'var(--brand)' : 'var(--border)', background: on ? 'var(--brand)' : rec ? 'var(--surface-brand-soft)' : 'var(--surface)', color: on ? 'var(--text-on-brand)' : rec ? 'var(--teal-800)' : 'var(--text-primary)' }}>
                      {rec ? <Icon name="Sparkles" size={12} /> : null}
                      {c}
                      {rec ? <span style={{ fontSize: 10, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)' }}>rec</span> : null}
                    </button>
                  );
                })}
                <button type="button" onClick={() => { setOtherOpen(true); setNextStep(''); }} aria-pressed={otherOpen}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 34, padding: '0 12px', borderRadius: 999, cursor: 'pointer', fontSize: 12, fontWeight: 600, border: '1px dashed', borderColor: otherOpen ? 'var(--brand)' : 'var(--border-strong)', background: otherOpen ? 'var(--surface-brand-soft)' : 'var(--surface)', color: otherOpen ? 'var(--teal-800)' : 'var(--text-muted)' }}>
                  <Icon name="Pencil" size={12} />Other…
                </button>
              </div>
              {otherOpen ? (
                <Input autoFocus value={custom} onChange={(e) => setCustom(e.target.value)}
                  placeholder="Describe the next step in your own words" hint="Custom steps are recorded the same way as the structured options." />
              ) : null}
              <p style={{ margin: 0, font: 'var(--type-meta)', color: 'var(--text-muted)' }}>
                Recommended: <b style={{ color: 'var(--text-brand)' }}>{recommended}</b> — derived from what this deal is missing.
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <Button size="sm" disabled={!chosen} onClick={() => record(`next step — ${chosen}`)} icon={<Icon name="Check" size={15} />}>Add next step</Button>
              <Button size="sm" variant="outline" onClick={() => record('follow-up scheduled')} icon={<Icon name="CalendarPlus" size={15} />}>Schedule follow-up</Button>
              <Button size="sm" variant="outline" onClick={() => record('stage updated')} icon={<Icon name="ArrowUpDown" size={15} />}>Update stage</Button>
              <Button size="sm" variant="outline" onClick={() => onAskCopilot(`Why is ${o.customer} at risk?`, o)} icon={<Icon name="Bot" size={15} />}>Ask Copilot</Button>
              <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <Button size="sm" variant="ghost" onClick={() => (i < queue.length - 1 ? setI(i + 1) : onExit())}>Skip</Button>
                <Button size="sm" variant="outline" onClick={() => (i < queue.length - 1 ? setI(i + 1) : onExit())} iconAfter={<Icon name="ChevronRight" size={15} />}>Next</Button>
              </span>
            </div>
          </CardContent>
        </Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 16 }}>
          <Card pad><OpportunityHealth score={o.health.score} status={o.health.status} size="lg" showFactors factors={o.health.factors} /></Card>
          <Card pad><StageVelocity stage={o.stage.name} daysInStage={o.daysInStage} benchmarkDays={o.benchmarkDays} /></Card>
          <Card>
            <CardHeader title="Review queue" subtitle={`${queue.length - i - 1} remaining after this one`} />
            <CardContent style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 6 }}>
              {queue.map((q, ix) => (
                <button key={q.id} type="button" onClick={() => setI(ix)}
                  style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr) auto', gap: 9, alignItems: 'center', textAlign: 'left', padding: '7px 9px', borderRadius: 9, cursor: 'pointer', border: '1px solid', borderColor: ix === i ? 'var(--brand)' : 'transparent', background: ix === i ? 'var(--surface-brand-soft)' : 'transparent' }}>
                  <span className="tnum" style={{ fontSize: 11, color: 'var(--text-muted)', width: 14 }}>{ix + 1}</span>
                  <span style={{ minWidth: 0, fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.customer}</span>
                  <span className="tnum" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{K(q.amount)}</span>
                </button>
              ))}
            </CardContent>
          </Card>
          {log.length ? (
            <Card pad>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>Recorded this session</p>
              <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 5 }}>
                {log.map((l, ix) => <li key={ix} style={{ font: 'var(--type-meta)', display: 'flex', gap: 7 }}><Icon name="Check" size={13} style={{ color: 'var(--success)', marginTop: 2 }} />{l}</li>)}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SellerStandard, SellerFocus, SellerGuided, FocusToday, MeetingsCard, AttentionList, SellerFunnelCard, RisksCard });
