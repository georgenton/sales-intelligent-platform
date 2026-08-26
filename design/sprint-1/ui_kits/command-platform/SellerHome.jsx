function FocusList({ mode, onOpen }) {
  const deals = SIP.opportunities.filter((o) => o.risk).slice(0, mode === 'Focus' ? 2 : 3);
  return (
    <Card>
      <CardHeader title="Focus today" subtitle={`${deals.length} actions may materially affect your quarter`}
        action={<Badge tone="brand">{SIP.period}</Badge>} />
      <CardContent style={{ display: 'grid', gap: 12 }}>
        {deals.map((d) => (
          <NextBestAction key={d.id} customer={`${d.customer} · ${d.brand}`} amount={d.amount} category={d.forecastCategory}
            severity={d.health.status === 'CRITICAL' ? 'CRITICAL' : 'HIGH'} risk={d.risk} suggestion={d.suggestion}
            primaryLabel="Log activity" onOpen={() => onOpen(d)} />
        ))}
      </CardContent>
    </Card>
  );
}

function MyFunnel({ onOpen }) {
  return (
    <Card>
      <CardHeader title="My funnel" subtitle="Select a stage to break it down here" />
      <CardContent>
        <SalesFunnel stages={SIP.funnel.slice(0, 4)} renderDetail={(stage) => (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 8 }}>
            <p style={{ margin: 0, font: 'var(--type-meta)', color: 'var(--text-muted)' }}>{stage.name} · {stage.count} opportunities · {stage.atRisk || 0} at risk</p>
            {SIP.opportunities.slice(0, 3).map((o) => (
              <button key={o.id} type="button" onClick={() => onOpen(o)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: 12, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer' }}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ display: 'block', fontSize: 14 }}>{o.customer}</b>
                  <span style={{ display: 'block', font: 'var(--type-meta)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.title} · closes {o.closeDate}</span>
                </span>
                <OpportunityHealth score={o.health.score} status={o.health.status} size="sm" />
                <b className="tnum" style={{ fontSize: 14 }}>{'$' + (o.amount / 1000).toFixed(0) + 'K'}</b>
              </button>
            ))}
          </div>
        )} />
      </CardContent>
    </Card>
  );
}

function SellerHome({ mode, onOpen }) {
  const k = SIP.sellerKpis;
  const focus = mode === 'Focus';
  return (
    <div>
      <PageHead eyebrow="My day" title="What should I do today?"
        meta={`${SIP.period} · 1 Jun – 31 Aug 2026 · ${SIP.users.seller.name}`}
        action={<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><PeriodSelector periods={SIP.periods} value={SIP.period} /><Button icon={<Icon name="Plus" />}>New opportunity</Button></div>} />
      <div style={{ display: 'grid', gap: 20 }}>
        <Card pad>
          <div style={{ display: 'grid', gridTemplateColumns: focus ? 'minmax(0,1fr)' : 'minmax(0,1.1fr) minmax(0,1fr)', gap: 24, alignItems: 'center' }}>
            <QuotaProgress quota={k.quota} billed={k.billed} forecast={k.forecast} label="My quota attainment" />
            {focus ? null : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
                <RevenueKPI label="Billed" value={k.billed} detail="44.6% attainment" tone="positive" icon={<Icon name="ReceiptText" />} />
                <RevenueKPI label="Forecast" value={k.forecast} detail="35.0% attainment" delta={-24000} icon={<Icon name="CircleGauge" />} />
                <RevenueKPI label="Remaining gap" value={k.gap} tone="risk" detail="to quota" icon={<Icon name="BadgeDollarSign" />} />
              </div>
            )}
          </div>
        </Card>
        <div style={{ display: 'grid', gridTemplateColumns: focus ? 'minmax(0,1fr)' : 'minmax(0,1.15fr) minmax(0,1fr)', gap: 20, alignItems: 'start' }}>
          <FocusList mode={mode} onOpen={onOpen} />
          {focus ? null : <MyFunnel onOpen={onOpen} />}
        </div>
        {focus ? null : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 20 }}>
            <Card><CardHeader title="Stuck opportunities" subtitle="Longer in stage than the benchmark" /><CardContent style={{ display: 'grid', gap: 16 }}>
              {SIP.opportunities.filter((o) => o.daysInStage > o.stageBenchmarkDays).map((o) => (
                <div key={o.id} style={{ display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <b style={{ fontSize: 14 }}>{o.customer}</b>
                    <RiskBadge severity={o.alerts[0] ? o.alerts[0].severity : 'WARNING'} code={o.alerts[0] ? o.alerts[0].code : 'STAGE_STAGNATION'} />
                  </div>
                  <StageVelocity stage={o.stage} daysInStage={o.daysInStage} benchmarkDays={o.stageBenchmarkDays} />
                </div>
              ))}
            </CardContent></Card>
            <Card><CardHeader title="Customer meetings" subtitle="Next five working days" /><CardContent style={{ display: 'grid', gap: 8 }}>
              {[['Wed 09:30', 'Banco ABC', 'PO review with CFO'], ['Thu 15:00', 'Retail Norte', 'Technical validation'], ['Fri 11:00', 'Telco Andina', 'Budget qualification']].map(([when, who, what]) => (
                <div key={when} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, border: '1px solid var(--border)' }}>
                  <Icon name="CalendarDays" size={16} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ flex: 1 }}><b style={{ display: 'block', fontSize: 14 }}>{who}</b><span style={{ font: 'var(--type-meta)', color: 'var(--text-muted)' }}>{what}</span></span>
                  <span className="tnum" style={{ font: 'var(--type-meta)', color: 'var(--text-muted)' }}>{when}</span>
                </div>
              ))}
            </CardContent></Card>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { SellerHome });
