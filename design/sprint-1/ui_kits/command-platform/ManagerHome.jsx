function BrandBars() {
  const max = Math.max(...SIP.brands.map((b) => b[1]));
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {SIP.brands.map(([name, amount]) => (
        <div key={name} style={{ display: 'grid', gridTemplateColumns: '78px minmax(0,1fr) 68px', alignItems: 'center', gap: 12 }}>
          <span style={{ font: 'var(--type-meta)', color: 'var(--text-muted)' }}>{name}</span>
          <span style={{ height: 10, borderRadius: 999, background: 'var(--surface-sunken)', overflow: 'hidden' }}>
            <span style={{ display: 'block', width: (amount / max) * 100 + '%', height: '100%', background: 'var(--chart-2)' }} />
          </span>
          <b className="tnum" style={{ fontSize: 13, textAlign: 'right' }}>{'$' + (amount / 1000).toFixed(0) + 'K'}</b>
        </div>
      ))}
    </div>
  );
}

function StageBreakdown({ stage, onOpen }) {
  if (!stage) return null;
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Badge tone="brand">{stage.name}</Badge>
        <Badge>{stage.count} opportunities</Badge>
        {stage.atRisk ? <RiskBadge severity="HIGH" label={stage.atRisk + ' at risk'} /> : null}
        {stage.likelyToSlip ? <Badge tone="warning">{'$' + (stage.likelyToSlip / 1000).toFixed(0) + 'K likely to slip'}</Badge> : null}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 8 }}>
          {SIP.opportunities.slice(0, 3).map((o) => (
            <button key={o.id} type="button" onClick={() => onOpen(o)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', padding: 12, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer' }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <b style={{ display: 'block', fontSize: 14 }}>{o.customer}</b>
                <span style={{ display: 'block', font: 'var(--type-meta)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.seller} · {o.brand} · closes {o.closeDate}</span>
              </span>
              <OpportunityHealth score={o.health.score} status={o.health.status} size="sm" />
              <b className="tnum" style={{ fontSize: 14 }}>{'$' + (o.amount / 1000).toFixed(0) + 'K'}</b>
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <p style={{ margin: '0 0 8px', font: 'var(--type-meta)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', fontWeight: 600 }}>By seller</p>
            <SellerPerformance sellers={SIP.sellers.slice(0, 3)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ManagerHome({ mode, onOpen, onReview }) {
  const k = SIP.teamKpis;
  const focus = mode === 'Focus';
  const [stage, setStage] = React.useState(null);
  return (
    <div>
      <PageHead eyebrow="Revenue command center" title="Will the team reach quota?"
        meta={`${SIP.tenant} · ${SIP.period} · 1 Jun – 31 Aug 2026`}
        action={<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><PeriodSelector periods={SIP.periods} value={SIP.period} comparison="last snapshot" /><Button variant="outline" icon={<Icon name="Camera" />}>Snapshot</Button></div>} />
      <div style={{ display: 'grid', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,1fr)', gap: 20, alignItems: 'stretch' }}>
          <Card pad style={{ display: 'grid', gap: 20, alignContent: 'space-between' }}>
            <QuotaProgress quota={k.quota} billed={k.billed} forecast={k.forecast} label="Team quota attainment" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
              <RevenueKPI label="Pipeline" value={k.pipeline} detail={k.coverage.toFixed(1) + '× coverage'} icon={<Icon name="Layers" />} />
              <RevenueKPI label="Commit" value={k.commit} detail="7 opportunities" icon={<Icon name="Handshake" />} />
              <RevenueKPI label="Margin" value={k.margin} format="percent" detail="threshold 10%" tone="positive" icon={<Icon name="Percent" />} />
            </div>
          </Card>
          <QuotaGap gap={k.gap} onAction={onReview} action="Review risks"
            interpretation="Your current forecast is $390K below quota. Three opportunities representing $510K account for most of the quarter risk."
            drivers={[{ label: 'Banco ABC · no activity 9 days', amount: 180000 }, { label: 'Retail Norte · purchase order missing', amount: 210000 }, { label: 'Telco Andina · stalled in Discovery', amount: 120000 }]} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: focus ? 'minmax(0,1fr)' : 'minmax(0,1.35fr) minmax(0,1fr)', gap: 20, alignItems: 'start' }}>
          <Card>
            <CardHeader title="Pipeline funnel" subtitle="Hover for stage mechanics · select to expand in place"
              action={<Badge tone="outline">{k.atRisk} at risk</Badge>} />
            <CardContent><SalesFunnel stages={SIP.funnel} selectedStage={stage} onSelectStage={setStage}
              renderDetail={(s) => <StageBreakdown stage={s} onOpen={onOpen} />} /></CardContent>
          </Card>
          {focus ? null : (
            <div style={{ display: 'grid', gap: 20 }}>
              <Card><CardHeader title="Forecast movement" subtitle="Since Monday's snapshot" /><CardContent>
                <ForecastMovement since="Monday" net={-242000} movements={SIP.movements}
                  onSelect={(m) => onOpen(SIP.opportunities.find((o) => o.id === m.opportunityId))} />
              </CardContent></Card>
              <Card><CardHeader title="Pipeline by brand" subtitle="Line item contribution" /><CardContent><BrandBars /></CardContent></Card>
            </div>
          )}
        </div>
        {focus ? null : (
          <Card>
            <CardHeader title="Team" subtitle="Commit mix under 25% is the intervention cue"
              action={<Button variant="outline" size="sm" onClick={onReview} icon={<Icon name="ClipboardCheck" />}>Open forecast review</Button>} />
            <CardContent><SellerPerformance sellers={SIP.sellers} onSelect={() => onReview()} /></CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { ManagerHome, StageBreakdown, BrandBars });
