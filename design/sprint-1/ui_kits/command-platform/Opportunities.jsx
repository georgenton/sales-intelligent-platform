function Opportunities({ onOpen }) {
  const [query, setQuery] = React.useState('');
  const [applied, setApplied] = React.useState([]);
  const rows = SIP.opportunities.filter((o) => {
    const q = (o.title + o.customer + o.seller).toLowerCase().includes(query.toLowerCase());
    const risky = !applied.includes('at-risk') || o.health.status !== 'HEALTHY';
    const commit = !applied.includes('commit') || o.forecastCategory === 'Commit';
    const margin = !applied.includes('low-margin') || (o.margin !== null && o.margin < 10);
    return q && risky && commit && margin;
  });
  const th = { padding: '12px 16px', font: 'var(--type-meta)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'left' };
  const td = { padding: '16px', fontSize: 14, verticalAlign: 'middle' };
  return (
    <div>
      <PageHead eyebrow="Portfolio" title="Opportunities" meta={`${rows.length} of ${SIP.opportunities.length} commercial motions in ${SIP.period}`}
        action={<div style={{ display: 'flex', gap: 8 }}><Button variant="outline" icon={<Icon name="Download" />}>Export</Button><Button icon={<Icon name="Plus" />}>New opportunity</Button></div>} />
      <Card style={{ overflow: 'hidden' }}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
          <FilterBar search={query} onSearch={setQuery} applied={applied} onClear={() => setApplied([])}
            onToggle={(id) => setApplied((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]))}
            searchPlaceholder="Search title, customer or seller"
            filters={[{ id: 'at-risk', label: 'At risk', count: 4 }, { id: 'commit', label: 'Commit', count: 2 }, { id: 'low-margin', label: 'Margin under 10%', count: 2 }]} />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 940, borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--surface-sunken)' }}>
              <tr><th style={th}>Opportunity</th><th style={th}>Stage</th><th style={th}>Category</th><th style={th}>Seller</th><th style={th}>Brand</th><th style={th}>Amount</th><th style={th}>Close</th><th style={th}>Health</th></tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} onClick={() => onOpen(o)} style={{ borderTop: '1px solid var(--border)', cursor: 'pointer' }}>
                  <td style={td}><b>{o.title}</b><div style={{ font: 'var(--type-meta)', color: 'var(--text-muted)', marginTop: 2 }}>{o.customer}</div></td>
                  <td style={td}><Badge tone="brand">{o.stageCode}% · {o.stage}</Badge></td>
                  <td style={td}><Badge uppercase>{o.forecastCategory}</Badge></td>
                  <td style={td}>{o.seller}</td>
                  <td style={td}>{o.brand}</td>
                  <td style={{ ...td, fontWeight: 600 }} className="tnum">{'$' + (o.amount / 1000).toFixed(0) + 'K'}</td>
                  <td style={td} className="tnum">{o.closeDate}</td>
                  <td style={td}><OpportunityHealth score={o.health.score} status={o.health.status} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--border)', font: 'var(--type-meta)', color: 'var(--text-muted)' }}>
          <span>{rows.length} opportunities · click a row to inspect without leaving this list</span>
          <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>Page 1 of 1
            <Button size="icon" variant="outline" aria-label="Previous page" disabled><Icon name="ChevronLeft" /></Button>
            <Button size="icon" variant="outline" aria-label="Next page" disabled><Icon name="ChevronRight" /></Button>
          </span>
        </div>
      </Card>
    </div>
  );
}

function AlertsScreen({ onOpen }) {
  return (
    <div>
      <PageHead eyebrow="Commercial control" title="Risk alerts" meta={`${SIP.alerts.length} deterministic signals across the active portfolio.`} />
      <div style={{ display: 'grid', gap: 12 }}>
        {SIP.alerts.map((a) => (
          <Card key={a.code + a.title} pad>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <span style={{ display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 12, background: a.severity === 'CRITICAL' ? 'var(--critical-soft)' : 'var(--warning-soft)', color: a.severity === 'CRITICAL' ? 'var(--critical)' : 'oklch(0.52 0.12 78)' }}>
                <Icon name="OctagonAlert" size={20} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{a.title}</h2>
                  <RiskBadge severity={a.severity} code={a.code} />
                </div>
                <p style={{ margin: '8px 0 0', font: 'var(--type-body)', color: 'var(--text-muted)' }}>{a.message}</p>
                <p style={{ margin: '8px 0 0', font: 'var(--type-meta)', color: 'var(--text-muted)' }}>Detected {a.at}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onOpen(SIP.opportunities[0])}>Inspect</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SettingsScreen() {
  const rows = [['Currency', 'USD'], ['Timezone', 'America/Guayaquil'], ['Fiscal year', 'December → November'], ['Minimum margin', '10%'], ['Appearance', 'System']];
  return (
    <div>
      <PageHead eyebrow="Workspace" title="Settings" meta="Tenant-owned commercial and fiscal defaults." />
      <Card style={{ maxWidth: 640 }}>
        <CardHeader title="Commercial defaults" action={<Badge>Tenant scoped</Badge>} />
        <CardContent>
          {rows.map(([k, v], i) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: i ? '1px solid var(--border)' : 'none', fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>{k}</span><b>{v}</b>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

Object.assign(window, { Opportunities, AlertsScreen, SettingsScreen });
