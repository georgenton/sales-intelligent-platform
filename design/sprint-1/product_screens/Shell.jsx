const D = window.SIP2;
const money = (n, opts) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: Math.abs(n) >= 1000000 ? 'compact' : 'standard', minimumFractionDigits: 0, maximumFractionDigits: 1, ...opts }).format(n);
const K = (n) => (Math.abs(n) >= 1000000 ? '$' + (n / 1000000).toFixed(2) + 'M' : '$' + Math.round(n / 1000) + 'K');
const catLabel = { PIPELINE: 'Pipeline', BEST_CASE: 'Best case', COMMIT: 'Commit', UPSIDE: 'Upside', CLOSED: 'Closed', OMITTED: 'Omitted' };

const SCREENS = [
  { section: 'Seller', items: [
    { id: 'seller-standard', label: 'Seller Standard' },
    { id: 'seller-focus', label: 'Seller Focus' },
    { id: 'seller-guided', label: 'Seller Guided' },
    { id: 'opportunity-drawer', label: 'Opportunity Drawer' },
  ] },
  { section: 'Manager', items: [
    { id: 'manager-command', label: 'Revenue Command Center' },
    { id: 'manager-funnel', label: 'Funnel Expanded' },
    { id: 'manager-review', label: 'Forecast Review' },
    { id: 'manager-sellers', label: 'Seller Performance' },
  ] },
  { section: 'Shared', items: [
    { id: 'shared-copilot', label: 'Contextual Copilot' },
    { id: 'shared-import', label: 'Data Import' },
  ] },
  { section: 'Responsive', items: [
    { id: 'seller-mobile', label: 'Seller Mobile' },
    { id: 'manager-tablet', label: 'Manager Tablet' },
    { id: 'opportunity-mobile', label: 'Opportunity Mobile Sheet' },
  ] },
];

/* ---------- prototype chrome: the Product Screens navigator ---------- */
function ScreenNav({ screen, onScreen }) {
  return (
    <div style={{ background: 'var(--surface-inverse)', color: '#fff', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', borderBottom: '1px solid var(--border-inverse)' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 'none' }}>
        <span style={{ display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: 7, background: 'var(--accent-bright)', color: '#08242c', fontWeight: 700, fontSize: 10 }}>SI</span>
        <b style={{ fontSize: 12, letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase' }}>Product screens</b>
      </span>
      {SCREENS.map((g) => (
        <span key={g.section} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 'none' }}>
          <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-inverse-muted)', flex: 'none' }}>{g.section}</span>
          {g.items.map((i) => {
            const on = screen === i.id;
            return (
              <button key={i.id} type="button" onClick={() => onScreen(i.id)} aria-pressed={on}
                style={{ height: 26, padding: '0 10px', borderRadius: 999, cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', border: '1px solid', borderColor: on ? 'transparent' : 'var(--border-inverse)', background: on ? 'var(--accent-bright)' : 'transparent', color: on ? '#08242c' : 'var(--text-inverse-muted)', transition: 'var(--transition-color)' }}>{i.label}</button>
            );
          })}
        </span>
      ))}
    </div>
  );
}

/* ---------- product chrome ---------- */
const NAV = {
  seller: [ { id: 'seller-standard', label: 'My workspace', icon: 'Sun' }, { id: 'opportunity-drawer', label: 'Opportunities', icon: 'Target' }, { id: 'seller-guided', label: 'Guided review', icon: 'ListChecks' }, { id: 'shared-import', label: 'Import', icon: 'FileSpreadsheet' } ],
  manager: [ { id: 'manager-command', label: 'Command center', icon: 'Gauge' }, { id: 'manager-funnel', label: 'Pipeline', icon: 'Filter' }, { id: 'manager-review', label: 'Forecast review', icon: 'ClipboardCheck' }, { id: 'manager-sellers', label: 'Team', icon: 'UsersRound' }, { id: 'shared-import', label: 'Import', icon: 'FileSpreadsheet' } ],
};

function SideNav({ persona, screen, onScreen, mode }) {
  const items = NAV[persona];
  const user = D.users[persona];
  return (
    <aside style={{ background: 'var(--surface-inverse)', color: '#fff', padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 22, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px' }}>
        <span style={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: 11, background: 'var(--accent-bright)', color: '#08242c', fontWeight: 700, fontSize: 13, flex: 'none' }}>SI</span>
        <span style={{ minWidth: 0 }}><b style={{ display: 'block', fontSize: 13 }}>Sales Intelligence</b><span style={{ display: 'block', fontSize: 11, color: 'var(--text-inverse-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{D.tenant}</span></span>
      </div>
      <nav aria-label="Primary" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 3 }}>
        {items.map((i) => {
          const on = screen === i.id;
          return (
            <button key={i.id} type="button" onClick={() => onScreen(i.id)} aria-current={on ? 'page' : undefined}
              style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 40, padding: '0 10px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, fontWeight: 500, background: on ? 'oklch(0.865 0.127 207 / 0.1)' : 'transparent', color: on ? 'var(--accent-bright)' : 'oklch(0.68 0.02 220)', transition: 'var(--transition-color)' }}>
              <Icon name={i.icon} size={17} />
              <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.label}</span>
            </button>
          );
        })}
      </nav>
      <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 10 }}>
        {mode && mode !== 'Standard' ? (
          <div style={{ borderRadius: 12, background: 'oklch(0.865 0.127 207 / 0.12)', border: '1px solid var(--border-inverse)', padding: 10 }}>
            <p style={{ margin: 0, fontSize: 10, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--accent-bright)', fontWeight: 600 }}>{mode} mode</p>
            <p style={{ margin: '3px 0 0', fontSize: 11, color: 'var(--text-inverse-muted)' }}>{mode === 'Focus' ? 'Secondary analytics hidden.' : mode === 'Guided' ? 'Step workflow in progress.' : 'Sequential review in progress.'}</p>
          </div>
        ) : null}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, borderRadius: 12, border: '1px solid var(--border-inverse)', background: 'oklch(1 0 0 / 0.05)', padding: 10 }}>
          <span style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: 999, background: 'var(--accent-bright)', color: '#08242c', fontSize: 11, fontWeight: 700, flex: 'none' }}>{user.name.split(' ').map((p) => p[0]).join('')}</span>
          <span style={{ minWidth: 0 }}><b style={{ display: 'block', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</b><span style={{ display: 'block', fontSize: 11, color: 'var(--text-inverse-muted)' }}>{user.role}</span></span>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ mode, onMode, onCommand, period, onPeriod, right }) {
  return (
    <header style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
      <button type="button" onClick={onCommand}
        style={{ display: 'flex', alignItems: 'center', gap: 9, height: 34, flex: '0 1 260px', minWidth: 0, padding: '0 11px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-muted)', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', overflow: 'hidden' }}>
        <Icon name="Search" size={15} />
        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Search or run a command</span>
        <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: 10, border: '1px solid var(--border)', borderRadius: 4, padding: '1px 4px', flex: 'none' }}>⌘K</kbd>
      </button>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, flex: 'none' }}>
        {right}
        <PeriodSelector periods={D.periods} value={period} onChange={onPeriod} />
        {onMode ? (
          <div role="group" aria-label="Cognitive mode" style={{ display: 'inline-flex', gap: 2, padding: 3, borderRadius: 8, background: 'var(--surface-muted)' }}>
            {['Standard', 'Focus', 'Guided', 'Review'].map((m) => (
              <button key={m} type="button" aria-pressed={mode === m} onClick={() => onMode(m)}
                style={{ height: 26, padding: '0 9px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: mode === m ? 'var(--surface)' : 'transparent', color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: mode === m ? 'var(--shadow-card)' : 'none' }}>{m}</button>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
}

function CollapsedRail({ onExpand, count }) {
  return (
    <div style={{ borderLeft: '1px solid var(--border)', background: 'var(--surface)', display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', alignContent: 'start', justifyItems: 'center', padding: '12px 6px', gap: 10 }}>
      <button type="button" onClick={onExpand} aria-label="Expand Copilot" title="Expand Copilot"
        style={{ position: 'relative', display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: 11, border: '1px solid var(--border)', background: 'var(--surface-inverse-2)', color: 'var(--accent-bright)', cursor: 'pointer' }}>
        <Icon name="Bot" size={18} />
        {count ? <span className="tnum" style={{ position: 'absolute', top: -5, right: -5, minWidth: 17, height: 17, borderRadius: 999, background: 'var(--danger)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'grid', placeItems: 'center', padding: '0 4px' }}>{count}</span> : null}
      </button>
      <span style={{ writingMode: 'vertical-rl', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>Copilot</span>
    </div>
  );
}

function Workspace({ persona, screen, onScreen, mode, onMode, period, onPeriod, onCommand, copilot, copilotOpen = true, onToggleCopilot, copilotCount, headerRight, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '232px minmax(0,1fr)', gridTemplateRows: 'minmax(0,1fr)', minHeight: 0, height: '100%', background: 'var(--bg-canvas)' }}>
      <SideNav persona={persona} screen={screen} onScreen={onScreen} mode={mode} />
      <div style={{ minWidth: 0, display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gridTemplateRows: '56px minmax(0,1fr)' }}>
        <TopBar mode={onMode ? mode : null} onMode={onMode} onCommand={onCommand} period={period} onPeriod={onPeriod} right={headerRight} />
        <div style={{ minWidth: 0, minHeight: 0, display: 'grid', gridTemplateColumns: copilot ? (copilotOpen ? 'minmax(0,1fr) 348px' : 'minmax(0,1fr) 56px') : 'minmax(0,1fr)' }}>
          <main style={{ padding: 24, minWidth: 0, overflowY: 'auto' }}>{children}</main>
          {copilot && copilotOpen ? (
            <div style={{ borderLeft: '1px solid var(--border)', background: 'var(--surface)', padding: 16, minWidth: 0, minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gridTemplateRows: 'auto minmax(0,1fr)', gap: 8 }}>
              <button type="button" onClick={onToggleCopilot}
                style={{ justifySelf: 'end', display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 28, padding: '0 9px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                <Icon name="PanelRightClose" size={13} />Collapse
              </button>
              {copilot}
            </div>
          ) : copilot ? <CollapsedRail onExpand={onToggleCopilot} count={copilotCount} /> : null}
        </div>
      </div>
    </div>
  );
}

function ScreenHead({ eyebrow, title, meta, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--text-brand)' }}>{eyebrow}</p>
        <h1 style={{ margin: '5px 0 0', fontSize: 26, fontWeight: 600, letterSpacing: '-0.035em' }}>{title}</h1>
        {meta ? <p style={{ margin: '6px 0 0', font: 'var(--type-meta)', color: 'var(--text-muted)' }}>{meta}</p> : null}
      </div>
      {action ? <div style={{ display: 'flex', gap: 8, flex: 'none' }}>{action}</div> : null}
    </div>
  );
}

/* Dominant metric block — Forecast / Quota / Gap outrank everything else. */
function LeadMetrics({ forecast, quota, gap, likely, delta, deltaLabel, confidence, confidenceBand, secondary }) {
  return (
    <Card pad style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr)', gap: 20, alignItems: 'end' }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>Forecast</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <p className="tnum" style={{ margin: '6px 0 0', fontSize: 44, fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1 }}>{K(forecast)}</p>
            {delta !== undefined && delta !== null ? (
              <span className="tnum" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: delta < 0 ? 'var(--danger-soft)' : 'var(--success-soft)', color: delta < 0 ? 'var(--danger)' : 'var(--success)' }}>
                {delta < 0 ? '▼' : '▲'} {K(Math.abs(delta))}
              </span>
            ) : null}
          </div>
          <p style={{ margin: '6px 0 0', font: 'var(--type-meta)', color: 'var(--text-muted)' }}>
            {likely.toFixed(1)}% likely attainment{delta !== undefined && delta !== null ? ' · ' + (deltaLabel || 'since the last forecast review') : ''}
          </p>
          {confidence !== undefined ? (
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 5, maxWidth: 300 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>Forecast confidence</span>
                <b className="tnum" style={{ fontSize: 13, color: confidence >= 65 ? 'var(--success)' : confidence >= 40 ? 'var(--warning)' : 'var(--danger)' }}>{confidence}%</b>
              </div>
              <div style={{ height: 7, borderRadius: 999, background: 'var(--surface-sunken)', overflow: 'hidden' }}>
                <div style={{ width: confidence + '%', height: '100%', background: confidence >= 65 ? 'var(--success)' : confidence >= 40 ? 'var(--warning)' : 'var(--danger)' }} />
              </div>
              {confidenceBand ? (
                <span className="tnum" style={{ fontSize: 11, color: 'var(--text-muted)' }}>Range {K(confidenceBand.low)} – {K(confidenceBand.high)} at 80% confidence</span>
              ) : null}
            </div>
          ) : null}
        </div>
        <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: 20 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>Quota</p>
          <p className="tnum" style={{ margin: '6px 0 0', fontSize: 30, fontWeight: 600, letterSpacing: '-0.035em', lineHeight: 1 }}>{K(quota)}</p>
          <p style={{ margin: '6px 0 0', font: 'var(--type-meta)', color: 'var(--text-muted)' }}>{D.period} · {D.periodRange.split(' – ')[1]}</p>
        </div>
        <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: 20 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--danger)' }}>Gap</p>
          <p className="tnum" style={{ margin: '6px 0 0', fontSize: 30, fontWeight: 600, letterSpacing: '-0.035em', lineHeight: 1, color: 'var(--danger)' }}>{K(gap)}</p>
          <p style={{ margin: '6px 0 0', font: 'var(--type-meta)', color: 'var(--text-muted)' }}>to close before {D.periodRange.split(' – ')[1]}</p>
        </div>
      </div>
      {secondary}
    </Card>
  );
}

/* Seller hierarchy: likely attainment and remaining gap lead; forecast and billed support. */
function SellerLead({ quota, billed, forecast, gap, likely, confidence, delta, secondary }) {
  const short = likely < 100;
  return (
    <Card pad style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1fr)', gap: 20 }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>Likely attainment</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <p className="tnum" style={{ margin: '6px 0 0', fontSize: 52, fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1, color: short ? 'var(--warning)' : 'var(--success)' }}>{likely.toFixed(1)}%</p>
            {delta !== undefined && delta !== null ? (
              <span className="tnum" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: delta < 0 ? 'var(--danger-soft)' : 'var(--success-soft)', color: delta < 0 ? 'var(--danger)' : 'var(--success)' }}>
                {delta < 0 ? '▼' : '▲'} {K(Math.abs(delta))}
              </span>
            ) : null}
          </div>
          <p style={{ margin: '7px 0 0', font: 'var(--type-body)', color: 'var(--text-muted)' }}>
            of your {K(quota)} quota{confidence !== undefined ? ' · ' + confidence + '% forecast confidence' : ''}
          </p>
        </div>
        <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: 20 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--danger)' }}>Remaining gap</p>
          <p className="tnum" style={{ margin: '6px 0 0', fontSize: 40, fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--danger)' }}>{K(gap)}</p>
          <p style={{ margin: '7px 0 0', font: 'var(--type-body)', color: 'var(--text-muted)' }}>to close before {D.periodRange.split(' – ')[1]}</p>
          <div style={{ marginTop: 12, display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            <span>
              <span style={{ display: 'block', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>Forecast</span>
              <b className="tnum" style={{ fontSize: 16 }}>{K(forecast)}</b>
            </span>
            <span>
              <span style={{ display: 'block', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)' }}>Billed</span>
              <b className="tnum" style={{ fontSize: 16, color: 'var(--success)' }}>{K(billed)}</b>
            </span>
          </div>
        </div>
      </div>
      {secondary}
    </Card>
  );
}

/* States the cognitive contract of the active mode — modes are workflows, not skins. */
const MODE_CONTRACT = {
  Standard: { icon: 'LayoutDashboard', what: 'Explore', why: 'Full working surface. Everything is available; nothing is sequenced for you.' },
  Focus: { icon: 'Crosshair', what: 'Commit to today', why: 'One goal, three moves, marked done as you go. Analytics, funnel and portfolio tables are withheld.' },
  Guided: { icon: 'ListChecks', what: 'Work a queue', why: 'One opportunity at a time, one decision per step, every decision recorded.' },
  Review: { icon: 'ClipboardCheck', what: 'Decide sequentially', why: 'Seller call against system confidence, evidence against risk, then a recorded verdict per deal. Built to run a live forecast call.' },
};

function ModeBanner({ mode, progress }) {
  const c = MODE_CONTRACT[mode];
  if (!c || mode === 'Standard') return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr) auto', gap: 12, alignItems: 'center', padding: '10px 14px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface)', marginBottom: 14 }}>
      <span style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: 9, background: 'var(--surface-brand-soft)', color: 'var(--teal-800)', flex: 'none' }}>
        <Icon name={c.icon} size={16} />
      </span>
      <span style={{ minWidth: 0 }}>
        <b style={{ fontSize: 12.5 }}>{mode} mode · {c.what}</b>
        <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)' }}>{c.why}</span>
      </span>
      {progress ? <Badge tone="brand">{progress}</Badge> : null}
    </div>
  );
}

/* The prototype is drawn at one reference size; production stays fluid. */
function ViewportNote() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', gap: 10, alignItems: 'center', padding: '9px 20px', background: 'var(--surface-muted)', borderBottom: '1px solid var(--border)' }}>
      <Icon name="Info" size={14} style={{ color: 'var(--text-muted)' }} />
      <span style={{ fontSize: 11.5, color: 'var(--text-muted)', textWrap: 'pretty' }}>
        <b style={{ color: 'var(--text-primary)' }}>1440 × 1024 is a reference design viewport only — production must remain fluid.</b>
        {' '}Every layout here is built on minmax(0,1fr) and auto-fit tracks rather than fixed pixel columns; see Responsive → Manager Tablet (1024) and Seller Mobile (390) for the same screens at other widths.
      </span>
    </div>
  );
}

function MetricStrip({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(104px, 1fr))', gap: 1, background: 'var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      {items.map((i) => (
        <div key={i.label} style={{ background: 'var(--surface)', padding: '11px 13px' }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.label}</p>
          <p className="tnum" style={{ margin: '4px 0 0', fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em', color: i.tone || 'var(--text-primary)' }}>{i.value}</p>
          {i.detail ? <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.detail}</p> : null}
        </div>
      ))}
    </div>
  );
}

function InsightBanner({ onAction, compact }) {
  const i = D.insight;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 10, padding: 16, borderRadius: 14, border: '1px solid var(--danger)', background: 'var(--danger-soft)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <Icon name="TriangleAlert" size={15} style={{ color: 'var(--danger)' }} />
        <b style={{ fontSize: 15, letterSpacing: '-0.02em' }}>{i.headline}</b>
      </div>
      {compact ? null : <p style={{ margin: 0, font: 'var(--type-body)', textWrap: 'pretty' }}>{i.body}</p>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {i.actions.map((a, ix) => (
          <Button key={a} size="sm" variant={ix ? 'outline' : 'primary'} onClick={() => onAction && onAction(a)}>{a}</Button>
        ))}
      </div>
      <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>Rule-based interpretation · recalculated 08:04 today</p>
    </div>
  );
}

function OppRow({ opp, onOpen, dense }) {
  return (
    <button type="button" onClick={() => onOpen(opp)}
      style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto auto', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: dense ? '9px 11px' : '12px 13px', borderRadius: 11, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', transition: 'var(--transition-color)' }}>
      <span style={{ minWidth: 0 }}>
        <b style={{ display: 'block', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opp.customer} · {opp.title}</b>
        <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opp.seller} · {opp.brand} · closes {opp.closeDate}</span>
      </span>
      {opp.alerts.length ? <RiskBadge severity={opp.alerts[0].severity} code={opp.alerts[0].code} /> : <Badge tone="positive">On track</Badge>}
      <span style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 'none' }}>
        <OpportunityHealth score={opp.health.score} status={opp.health.status} size="sm" />
        <b className="tnum" style={{ fontSize: 13, minWidth: 52, textAlign: 'right' }}>{K(opp.amount)}</b>
      </span>
    </button>
  );
}

Object.assign(window, { D, money, K, catLabel, SCREENS, ScreenNav, SideNav, TopBar, Workspace, CollapsedRail, ScreenHead, LeadMetrics, SellerLead, MetricStrip, InsightBanner, OppRow, ModeBanner, ModeContract: MODE_CONTRACT, ViewportNote });
