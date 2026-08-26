const shellNav = [
  { id: 'home', label: 'My day', icon: 'Sun', roles: ['seller'] },
  { id: 'command', label: 'Command center', icon: 'Gauge', roles: ['manager'] },
  { id: 'opportunities', label: 'Opportunities', icon: 'Target', roles: ['seller', 'manager'] },
  { id: 'review', label: 'Forecast review', icon: 'Sparkles', roles: ['manager'] },
  { id: 'guided', label: 'Guided review', icon: 'ListChecks', roles: ['seller'] },
  { id: 'alerts', label: 'Alerts', icon: 'BellRing', roles: ['seller', 'manager'] },
  { id: 'import', label: 'Import', icon: 'FileSpreadsheet', roles: ['seller', 'manager'] },
  { id: 'settings', label: 'Settings', icon: 'Settings', roles: ['seller', 'manager'] },
];

function NavItem({ item, active, onClick, compact }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button type="button" onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      aria-current={active ? 'page' : undefined} aria-label={compact ? item.label : undefined} title={compact ? item.label : undefined}
      style={{ display: 'flex', alignItems: 'center', justifyContent: compact ? 'center' : 'flex-start', gap: 12, width: '100%', minHeight: 44, padding: compact ? '10px 0' : '10px 12px', borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 14, fontWeight: 500,
        background: active ? 'oklch(0.865 0.127 207 / 0.1)' : hover ? 'oklch(1 0 0 / 0.05)' : 'transparent',
        color: active ? 'var(--accent-bright)' : hover ? '#fff' : 'oklch(0.68 0.02 220)', transition: 'var(--transition-color)' }}>
      <Icon name={item.icon} size={18} />
      {compact ? null : item.label}
    </button>
  );
}

function ModeSwitch({ mode, onChange }) {
  const modes = ['Standard', 'Focus', 'Guided', 'Review'];
  return (
    <div role="group" aria-label="Cognitive mode" style={{ display: 'inline-flex', gap: 2, padding: 3, borderRadius: 8, background: 'var(--surface-muted)' }}>
      {modes.map((m) => (
        <button key={m} type="button" aria-pressed={mode === m} onClick={() => onChange(m)}
          style={{ height: 28, padding: '0 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            background: mode === m ? 'var(--surface)' : 'transparent', color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
            boxShadow: mode === m ? 'var(--shadow-card)' : 'none', transition: 'var(--transition-color)' }}>{m}</button>
      ))}
    </div>
  );
}

const DOCK_MIN = 1280;

function AppShell({ persona, onPersona, view, onView, mode, onMode, theme, onTheme, onCommand, copilot, children }) {
  const user = SIP.users[persona];
  const items = shellNav.filter((i) => i.roles.includes(persona));
  const [wide, setWide] = React.useState(() => (typeof window === 'undefined' ? true : window.innerWidth >= DOCK_MIN));
  const iconRail = !wide;
  const [railOpen, setRailOpen] = React.useState(false);
  React.useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= DOCK_MIN);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const docked = wide && !!copilot;
  const overlay = !wide && !!copilot;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: (iconRail ? '72px' : '248px') + ' minmax(0,1fr)', minHeight: '100%', background: 'var(--bg-canvas)' }}>
      <aside style={{ background: 'var(--surface-inverse)', padding: iconRail ? '20px 12px' : '20px 16px', display: 'flex', flexDirection: 'column', gap: 24, color: '#fff', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: iconRail ? 0 : '0 8px', justifyContent: iconRail ? 'center' : 'flex-start' }}>
          <span style={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: 12, background: 'var(--accent-bright)', color: '#08242c', fontWeight: 700, fontSize: 14, flex: 'none' }}>SI</span>
          {iconRail ? null : <span><b style={{ display: 'block', fontSize: 14 }}>Sales Intelligence</b><span style={{ fontSize: 12, color: 'var(--text-inverse-muted)' }}>Command platform</span></span>}
        </div>
        <nav aria-label="Primary" style={{ display: 'grid', gap: 4 }}>
          {items.map((i) => <NavItem key={i.id} item={i} active={view === i.id} onClick={() => onView(i.id)} compact={iconRail} />)}
        </nav>
        <div style={{ marginTop: 'auto', display: iconRail ? 'none' : 'grid', gap: 12 }}>
          <div style={{ borderRadius: 16, border: '1px solid var(--border-inverse)', background: 'oklch(1 0 0 / 0.05)', padding: 12 }}>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-inverse-muted)' }}>Active workspace</p>
            <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{SIP.tenant}</p>
          </div>
          <div role="group" aria-label="Persona" style={{ display: iconRail ? 'none' : 'grid', gap: 4 }}>
            <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)', color: 'var(--text-inverse-muted)', fontWeight: 600 }}>Preview as</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[['seller', 'Seller'], ['manager', 'Manager']].map(([id, label]) => (
                <button key={id} type="button" aria-pressed={persona === id} onClick={() => onPersona(id)}
                  style={{ flex: 1, height: 30, borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, border: '1px solid var(--border-inverse)',
                    background: persona === id ? 'var(--accent-bright)' : 'transparent', color: persona === id ? '#08242c' : 'var(--text-inverse-muted)' }}>{label}</button>
              ))}
            </div>
          </div>
        </div>
      </aside>
      <div style={{ minWidth: 0, display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gridTemplateRows: '64px 1fr' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '0 32px', borderBottom: '1px solid var(--border)', background: 'color-mix(in oklab, var(--surface) 90%, transparent)', backdropFilter: 'var(--blur-header)' }}>
          <button type="button" onClick={onCommand}
            style={{ display: 'flex', alignItems: 'center', gap: 10, height: 36, minWidth: 0, flex: '0 1 300px', padding: '0 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-muted)', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', overflow: 'hidden' }}>
            <Icon name="Search" size={15} />
            <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Search or run a command</span>
            <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: 11, border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px' }}>⌘K</kbd>
          </button>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16, flex: 'none' }}>
            <ModeSwitch mode={mode} onChange={onMode} />
            {overlay ? (
              <button type="button" onClick={() => setRailOpen(true)} aria-expanded={railOpen}
                style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                <Icon name="Bot" size={16} />Copilot
              </button>
            ) : null}
            <button type="button" onClick={onTheme} aria-label="Toggle appearance"
              style={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={16} />
            </button>
            <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="CircleUserRound" size={20} style={{ color: 'var(--brand)' }} />
              <span><b style={{ display: 'block', fontSize: 12 }}>{user.name}</b><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.roleLabel}</span></span>
            </div>
          </div>
        </header>
        <div style={{ minWidth: 0, display: 'grid', gridTemplateColumns: docked ? 'minmax(0,1fr) 380px' : 'minmax(0,1fr)' }}>
          <main style={{ padding: 32, minWidth: 0 }}>{children}</main>
          {docked ? <div style={{ borderLeft: '1px solid var(--border)', padding: 20, background: 'var(--surface)', minWidth: 0 }}>{copilot}</div> : null}
        </div>
        {overlay && railOpen ? (
          <div role="presentation" onClick={() => setRailOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'var(--scrim)', display: 'flex', justifyContent: 'flex-end' }}>
            <div onClick={(e) => e.stopPropagation()}
              style={{ width: 'min(420px, 94vw)', height: '100%', background: 'var(--surface)', borderLeft: '1px solid var(--border)', boxShadow: 'var(--shadow-overlay)', padding: 20, display: 'grid', gridTemplateRows: 'auto minmax(0,1fr)', gap: 12 }}>
              <button type="button" onClick={() => setRailOpen(false)} aria-label="Close Copilot"
                style={{ justifySelf: 'end', display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)', cursor: 'pointer' }}>×</button>
              <div style={{ minHeight: 0 }}>{copilot}</div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PageHead({ eyebrow, title, meta, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
      <div>
        <p style={{ margin: 0, font: 'var(--type-eyebrow)', color: 'var(--text-brand)' }}>{eyebrow}</p>
        <h1 style={{ margin: '4px 0 0', fontSize: 30, fontWeight: 600, letterSpacing: '-0.035em' }}>{title}</h1>
        {meta ? <p style={{ margin: '8px 0 0', font: 'var(--type-body)', color: 'var(--text-muted)' }}>{meta}</p> : null}
      </div>
      {action}
    </div>
  );
}

Object.assign(window, { AppShell, PageHead, ModeSwitch });
