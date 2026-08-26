/* @ds-bundle: {"format":4,"namespace":"SalesIntelligenceDesignSystem_3dfbfd","components":[{"name":"CommandPalette","sourcePath":"components/controls/CommandPalette.jsx"},{"name":"FilterBar","sourcePath":"components/controls/FilterBar.jsx"},{"name":"PeriodSelector","sourcePath":"components/controls/PeriodSelector.jsx"},{"name":"CopilotInsight","sourcePath":"components/copilot/CopilotInsight.jsx"},{"name":"CopilotPanel","sourcePath":"components/copilot/CopilotPanel.jsx"},{"name":"GuidedTask","sourcePath":"components/copilot/GuidedTask.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"CardHeader","sourcePath":"components/core/Card.jsx"},{"name":"CardContent","sourcePath":"components/core/Card.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"Select","sourcePath":"components/core/Select.jsx"},{"name":"DataQualityPanel","sourcePath":"components/data/DataQualityPanel.jsx"},{"name":"ImportMapper","sourcePath":"components/data/ImportMapper.jsx"},{"name":"OpportunityDrawer","sourcePath":"components/overlay/OpportunityDrawer.jsx"},{"name":"ForecastConfidence","sourcePath":"components/sales/ForecastConfidence.jsx"},{"name":"ForecastMovement","sourcePath":"components/sales/ForecastMovement.jsx"},{"name":"FunnelStage","sourcePath":"components/sales/FunnelStage.jsx"},{"name":"NextBestAction","sourcePath":"components/sales/NextBestAction.jsx"},{"name":"OpportunityHealth","sourcePath":"components/sales/OpportunityHealth.jsx"},{"name":"QuotaGap","sourcePath":"components/sales/QuotaGap.jsx"},{"name":"QuotaProgress","sourcePath":"components/sales/QuotaProgress.jsx"},{"name":"RevenueKPI","sourcePath":"components/sales/RevenueKPI.jsx"},{"name":"RiskBadge","sourcePath":"components/sales/RiskBadge.jsx"},{"name":"SalesFunnel","sourcePath":"components/sales/SalesFunnel.jsx"},{"name":"SellerPerformance","sourcePath":"components/sales/SellerPerformance.jsx"},{"name":"StageVelocity","sourcePath":"components/sales/StageVelocity.jsx"}],"sourceHashes":{"components/controls/CommandPalette.jsx":"42f7fe66e661","components/controls/FilterBar.jsx":"9af9f76f1de2","components/controls/PeriodSelector.jsx":"dcf870385309","components/copilot/CopilotInsight.jsx":"895e7814b00a","components/copilot/CopilotPanel.jsx":"be1eaf299f1f","components/copilot/GuidedTask.jsx":"6997ae6f01c5","components/core/Badge.jsx":"7db709066cdf","components/core/Button.jsx":"296538a7e981","components/core/Card.jsx":"f62a058c2719","components/core/Icon.jsx":"76782f87bf90","components/core/Input.jsx":"e2464cd7e040","components/core/Select.jsx":"d01b0ef094b2","components/data/DataQualityPanel.jsx":"751f2c806077","components/data/ImportMapper.jsx":"5f53bd015d63","components/overlay/OpportunityDrawer.jsx":"2fafe8c4e41c","components/sales/ForecastConfidence.jsx":"344124f07773","components/sales/ForecastMovement.jsx":"1abe539485b3","components/sales/FunnelStage.jsx":"c1b031891708","components/sales/NextBestAction.jsx":"e48cf2699306","components/sales/OpportunityHealth.jsx":"80d5a9b4577d","components/sales/QuotaGap.jsx":"bfa964d184dd","components/sales/QuotaProgress.jsx":"4eeaf2ecc724","components/sales/RevenueKPI.jsx":"f54358471ba8","components/sales/RiskBadge.jsx":"742476a6f3d9","components/sales/SalesFunnel.jsx":"33b62a966f00","components/sales/SellerPerformance.jsx":"a73be7d20858","components/sales/StageVelocity.jsx":"ff55ec3d21df","product_screens/ManagerScreens.jsx":"7c471abf7d28","product_screens/Responsive.jsx":"747ac3967dac","product_screens/SellerScreens.jsx":"7220f1f5af30","product_screens/SharedScreens.jsx":"80ca240c76ba","product_screens/Shell.jsx":"00dcbf17a830","product_screens/data.js":"9d5c93c902c0","ui_kits/command-platform/AppShell.jsx":"d89c852c92d6","ui_kits/command-platform/ManagerHome.jsx":"03e9827745f6","ui_kits/command-platform/Opportunities.jsx":"ea3c61870aa8","ui_kits/command-platform/SellerHome.jsx":"59bf39f8c7d0","ui_kits/command-platform/Workflows.jsx":"9edf1b56f0da","ui_kits/command-platform/data.js":"8841b0046f20"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.SalesIntelligenceDesignSystem_3dfbfd = window.SalesIntelligenceDesignSystem_3dfbfd || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/controls/CommandPalette.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** ⌘K command surface. Keyboard-first entry to any object or action. */
function CommandPalette({
  open,
  commands = [],
  onSelect,
  onClose,
  placeholder = 'Search or run a command…',
  style,
  ...rest
}) {
  const [query, setQuery] = React.useState('');
  const [index, setIndex] = React.useState(0);
  const results = commands.filter(c => (c.label + ' ' + (c.group || '') + ' ' + (c.hint || '')).toLowerCase().includes(query.toLowerCase()));
  React.useEffect(() => {
    setIndex(0);
  }, [query, open]);
  if (!open) return null;
  const key = e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndex(i => Math.min(results.length - 1, i + 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex(i => Math.max(0, i - 1));
    }
    if (e.key === 'Enter' && results[index] && onSelect) onSelect(results[index]);
    if (e.key === 'Escape' && onClose) onClose();
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "presentation",
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      background: 'var(--scrim)',
      display: 'grid',
      justifyItems: 'center',
      alignItems: 'start',
      paddingTop: '12vh',
      zIndex: 80,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Command palette",
    onClick: e => e.stopPropagation(),
    style: {
      width: 'min(620px, 92vw)',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-overlay)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      padding: 'var(--space-3) var(--pad-card)',
      borderBottom: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--text-muted)",
    strokeWidth: "2",
    strokeLinecap: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m21 21-4.3-4.3"
  })), /*#__PURE__*/React.createElement("input", {
    autoFocus: true,
    value: query,
    onChange: e => setQuery(e.target.value),
    onKeyDown: key,
    placeholder: placeholder,
    "aria-label": placeholder,
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      color: 'var(--text-primary)',
      fontSize: 'var(--text-base)'
    }
  }), /*#__PURE__*/React.createElement("kbd", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-11)',
      color: 'var(--text-muted)',
      border: '1px solid var(--border)',
      borderRadius: 4,
      padding: '2px 6px'
    }
  }, "esc")), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 'var(--space-2)',
      listStyle: 'none',
      maxHeight: 320,
      overflowY: 'auto'
    }
  }, results.map((c, i) => /*#__PURE__*/React.createElement("li", {
    key: c.id
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onMouseEnter: () => setIndex(i),
    onClick: () => onSelect && onSelect(c),
    style: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      padding: 'var(--space-2) var(--space-3)',
      borderRadius: 'var(--radius-sm)',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      background: i === index ? 'var(--surface-brand-soft)' : 'transparent',
      color: 'var(--text-primary)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-medium)'
    }
  }, c.label), c.hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, c.hint) : null, c.group ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-meta)',
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)'
    }
  }, c.group) : null))), !results.length ? /*#__PURE__*/React.createElement("li", {
    style: {
      padding: 'var(--space-4)',
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, "No matches. Try a customer, seller or opportunity name.") : null)));
}
Object.assign(__ds_scope, { CommandPalette });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/controls/CommandPalette.jsx", error: String((e && e.message) || e) }); }

// components/controls/FilterBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Filter chips + search. Applied filters stay visible and individually removable. */
function FilterBar({
  filters = [],
  applied = [],
  onToggle,
  onClear,
  search,
  onSearch,
  searchPlaceholder = 'Search…',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 'var(--space-2)',
      ...style
    }
  }, rest), onSearch !== undefined ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      minWidth: 220,
      flex: '0 1 280px'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--text-muted)",
    strokeWidth: "2",
    strokeLinecap: "round",
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      left: 12
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m21 21-4.3-4.3"
  })), /*#__PURE__*/React.createElement("input", {
    value: search || '',
    onChange: e => onSearch(e.target.value),
    placeholder: searchPlaceholder,
    "aria-label": searchPlaceholder,
    style: {
      height: 'var(--control-h-sm)',
      width: '100%',
      paddingLeft: 34,
      paddingRight: 'var(--space-3)',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--input-border)',
      background: 'var(--surface)',
      color: 'var(--text-primary)',
      fontSize: 'var(--text-sm)',
      outline: 'none'
    }
  })) : null, filters.map(fl => {
    const on = applied.includes(fl.id);
    return /*#__PURE__*/React.createElement("button", {
      key: fl.id,
      type: "button",
      "aria-pressed": on,
      onClick: () => onToggle && onToggle(fl.id),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        height: 'var(--control-h-sm)',
        padding: '0 var(--space-3)',
        borderRadius: 'var(--radius-pill)',
        cursor: 'pointer',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--weight-semibold)',
        transition: 'var(--transition-color)',
        border: '1px solid',
        borderColor: on ? 'transparent' : 'var(--border)',
        background: on ? 'var(--surface-brand-soft)' : 'var(--surface)',
        color: on ? 'var(--teal-800)' : 'var(--text-muted)'
      }
    }, fl.label, fl.count !== undefined ? /*#__PURE__*/React.createElement("span", {
      className: "tnum",
      style: {
        opacity: 0.7
      }
    }, fl.count) : null, on ? /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "\xD7") : null);
  }), applied.length && onClear ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClear,
    style: {
      height: 'var(--control-h-sm)',
      padding: '0 var(--space-2)',
      border: 'none',
      background: 'none',
      color: 'var(--text-muted)',
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-semibold)',
      cursor: 'pointer',
      textDecoration: 'underline'
    }
  }, "Clear all") : null);
}
Object.assign(__ds_scope, { FilterBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/controls/FilterBar.jsx", error: String((e && e.message) || e) }); }

// components/controls/PeriodSelector.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Fiscal period switcher. The period is global state — never per-widget. */
function PeriodSelector({
  periods = [],
  value,
  onChange,
  comparison,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "group",
    "aria-label": "Fiscal period",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 2,
      padding: 3,
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      ...style
    }
  }, rest), periods.map(p => {
    const active = p === value;
    return /*#__PURE__*/React.createElement("button", {
      key: p,
      type: "button",
      "aria-pressed": active,
      onClick: () => onChange && onChange(p),
      style: {
        height: 30,
        padding: '0 var(--space-3)',
        borderRadius: 6,
        border: 'none',
        cursor: 'pointer',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--weight-semibold)',
        background: active ? 'var(--brand)' : 'transparent',
        color: active ? 'var(--text-on-brand)' : 'var(--text-muted)',
        transition: 'var(--transition-color)'
      }
    }, p);
  }), comparison ? /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '0 var(--space-2)',
      font: 'var(--type-meta)',
      color: 'var(--text-muted)',
      borderLeft: '1px solid var(--border)',
      marginLeft: 4
    }
  }, "vs ", comparison) : null);
}
Object.assign(__ds_scope, { PeriodSelector });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/controls/PeriodSelector.jsx", error: String((e && e.message) || e) }); }

// components/copilot/CopilotInsight.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** A proactive Copilot finding. Collapsed by default; expands to its evidence. */
function CopilotInsight({
  headline,
  detail,
  items = [],
  tone = 'neutral',
  defaultOpen = false,
  onItemSelect,
  style,
  ...rest
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const accent = tone === 'risk' ? 'var(--danger)' : tone === 'positive' ? 'var(--success)' : 'var(--accent-bright)';
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      border: '1px solid var(--border-inverse)',
      borderRadius: 'var(--radius-md)',
      background: 'oklch(1 0 0 / 0.04)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-expanded": open,
    onClick: () => setOpen(!open),
    style: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      padding: 'var(--space-3)',
      background: 'none',
      border: 'none',
      color: 'inherit',
      textAlign: 'left',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      alignSelf: 'stretch',
      borderRadius: 3,
      background: accent
    },
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)'
    }
  }, headline), detail ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: 'var(--type-meta)',
      color: 'var(--text-inverse-muted)',
      marginTop: 2
    }
  }, detail) : null), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      color: 'var(--text-inverse-muted)',
      transform: open ? 'rotate(90deg)' : 'none',
      transition: 'transform var(--dur-fast) var(--ease-standard)'
    }
  }, "\u203A")), open && items.length ? /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: '0 var(--space-3) var(--space-3)',
      listStyle: 'none',
      display: 'grid',
      gap: 'var(--space-2)'
    }
  }, items.map(it => /*#__PURE__*/React.createElement("li", {
    key: it.label
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onItemSelect ? () => onItemSelect(it) : undefined,
    style: {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      gap: 'var(--space-3)',
      padding: 'var(--space-2) var(--space-3)',
      border: '1px solid var(--border-inverse)',
      borderRadius: 'var(--radius-sm)',
      background: 'transparent',
      color: 'inherit',
      font: 'var(--type-meta)',
      cursor: onItemSelect ? 'pointer' : 'default',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("span", null, it.label), it.value ? /*#__PURE__*/React.createElement("b", {
    className: "tnum",
    style: {
      color: accent
    }
  }, it.value) : null)))) : null);
}
Object.assign(__ds_scope, { CopilotInsight });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/copilot/CopilotInsight.jsx", error: String((e && e.message) || e) }); }

// components/copilot/CopilotPanel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Contextual Copilot. Suggestions are derived from where the user is, not generic. */
function CopilotPanel({
  context = 'Dashboard',
  contextLabel,
  suggestions = [],
  insights,
  messages = [],
  onAsk,
  placeholder = 'Ask about this view…',
  style,
  ...rest
}) {
  const [draft, setDraft] = React.useState('');
  const submit = text => {
    if (text && onAsk) onAsk(text);
    setDraft('');
  };
  return /*#__PURE__*/React.createElement("section", _extends({
    "aria-label": "Sales Copilot",
    style: {
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-inverse-2)',
      color: 'var(--text-inverse)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      minHeight: 0,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      padding: 'var(--pad-card)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 36,
      height: 36,
      borderRadius: 'var(--radius-md)',
      background: 'oklch(0.865 0.127 207 / 0.15)',
      color: 'var(--accent-bright)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 8V4H8"
  }), /*#__PURE__*/React.createElement("rect", {
    width: "16",
    height: "12",
    x: "4",
    y: "8",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M2 14h2M20 14h2M15 13v2M9 13v2"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: 'var(--type-card-title)'
    }
  }, "Copilot"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 0',
      font: 'var(--type-meta)',
      color: 'var(--text-inverse-muted)'
    }
  }, contextLabel || `Context · ${context}`))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      padding: '0 var(--pad-card)',
      display: 'grid',
      gap: 'var(--space-3)',
      alignContent: 'start'
    }
  }, insights, messages.map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      justifySelf: m.role === 'user' ? 'end' : 'start',
      maxWidth: '92%',
      padding: 'var(--space-3)',
      borderRadius: 'var(--radius-md)',
      background: m.role === 'user' ? 'var(--accent-bright)' : 'oklch(1 0 0 / 0.06)',
      color: m.role === 'user' ? '#08242c' : 'var(--text-inverse)',
      font: 'var(--type-body)'
    }
  }, m.text))), suggestions.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--space-2)',
      padding: 'var(--pad-card)',
      paddingBottom: 'var(--space-3)'
    }
  }, suggestions.map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    type: "button",
    onClick: () => submit(s),
    style: {
      padding: '6px var(--space-3)',
      borderRadius: 'var(--radius-pill)',
      border: '1px solid var(--border-inverse)',
      background: 'transparent',
      color: 'var(--text-inverse)',
      font: 'var(--type-meta)',
      cursor: 'pointer'
    }
  }, s))) : null, /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      submit(draft);
    },
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      padding: 'var(--pad-card)',
      paddingTop: 0
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: draft,
    onChange: e => setDraft(e.target.value),
    placeholder: placeholder,
    "aria-label": "Ask Copilot",
    style: {
      flex: 1,
      height: 'var(--control-h)',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border-inverse)',
      background: 'oklch(1 0 0 / 0.06)',
      color: 'var(--text-inverse)',
      padding: '0 var(--space-3)',
      fontSize: 'var(--text-sm)',
      outline: 'none'
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    style: {
      height: 'var(--control-h)',
      padding: '0 var(--space-4)',
      borderRadius: 'var(--radius-sm)',
      border: 'none',
      background: 'var(--accent-bright)',
      color: '#08242c',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)',
      cursor: 'pointer'
    }
  }, "Ask")));
}
Object.assign(__ds_scope, { CopilotPanel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/copilot/CopilotPanel.jsx", error: String((e && e.message) || e) }); }

// components/copilot/GuidedTask.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** One step of a guided workflow: what to do, why, and the fields to complete. */
function GuidedTask({
  step,
  total,
  title,
  why,
  children,
  primaryLabel = 'Save and continue',
  onPrimary,
  onSkip,
  onBack,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("section", _extends({
    style: {
      display: 'grid',
      gap: 'var(--space-4)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      background: 'var(--surface)',
      padding: 'var(--pad-card)',
      boxShadow: 'var(--shadow-card)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-semibold)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-brand)'
    }
  }, "Step ", step, " of ", total), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 4,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--surface-sunken)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${step / total * 100}%`,
      height: '100%',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--brand)',
      transition: 'width var(--dur-base) var(--ease-out)'
    }
  }))), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 'var(--text-xl)',
      fontWeight: 'var(--weight-semibold)',
      letterSpacing: 'var(--tracking-display)'
    }
  }, title), why ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-body)',
      color: 'var(--text-muted)',
      textWrap: 'pretty'
    }
  }, why) : null), children ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-3)'
    }
  }, children) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onPrimary,
    style: {
      height: 'var(--control-h)',
      padding: '0 var(--space-4)',
      borderRadius: 'var(--radius-sm)',
      border: 'none',
      background: 'var(--brand)',
      color: 'var(--text-on-brand)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)',
      cursor: 'pointer'
    }
  }, primaryLabel), onSkip ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onSkip,
    style: {
      height: 'var(--control-h)',
      padding: '0 var(--space-3)',
      borderRadius: 'var(--radius-sm)',
      border: 'none',
      background: 'transparent',
      color: 'var(--text-muted)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)',
      cursor: 'pointer'
    }
  }, "Skip") : null, onBack ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onBack,
    style: {
      marginLeft: 'auto',
      height: 'var(--control-h)',
      padding: '0 var(--space-3)',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      color: 'var(--text-primary)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)',
      cursor: 'pointer'
    }
  }, "Back") : null));
}
Object.assign(__ds_scope, { GuidedTask });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/copilot/GuidedTask.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const badgeTones = {
  neutral: {
    background: 'var(--surface-muted)',
    color: 'var(--text-primary)',
    borderColor: 'var(--border)'
  },
  brand: {
    background: 'var(--surface-brand-soft)',
    color: 'var(--teal-800)',
    borderColor: 'transparent'
  },
  positive: {
    background: 'var(--success-soft)',
    color: 'var(--success)',
    borderColor: 'transparent'
  },
  warning: {
    background: 'var(--warning-soft)',
    color: 'oklch(0.48 0.11 78)',
    borderColor: 'transparent'
  },
  risk: {
    background: 'var(--danger-soft)',
    color: 'var(--danger)',
    borderColor: 'transparent'
  },
  critical: {
    background: 'var(--critical-soft)',
    color: 'var(--critical)',
    borderColor: 'transparent'
  },
  outline: {
    background: 'transparent',
    color: 'var(--text-muted)',
    borderColor: 'var(--border-strong)'
  }
};

/** Small status token. Pill, 12px, medium weight — matches the source Badge. */
function Badge({
  tone = 'neutral',
  icon,
  uppercase,
  style,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-1)',
      border: '1px solid',
      borderRadius: 'var(--radius-pill)',
      padding: '2px var(--space-2)',
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-medium)',
      lineHeight: 1.5,
      whiteSpace: 'nowrap',
      textTransform: uppercase ? 'uppercase' : 'none',
      letterSpacing: uppercase ? 'var(--tracking-label)' : 0,
      ...badgeTones[tone],
      ...style
    }
  }, rest), icon, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline'
    }
  }, children));
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const btnBase = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-2)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--weight-semibold)',
  fontFamily: 'var(--font-sans)',
  border: '1px solid transparent',
  cursor: 'pointer',
  transition: 'var(--transition-color)',
  whiteSpace: 'nowrap'
};
const btnSizes = {
  sm: {
    height: 'var(--control-h-sm)',
    padding: '0 var(--space-3)'
  },
  md: {
    height: 'var(--control-h)',
    padding: '0 var(--space-4)'
  },
  lg: {
    height: 'var(--control-h-lg)',
    padding: '0 var(--space-6)'
  },
  icon: {
    height: 'var(--control-h)',
    width: 'var(--control-h)',
    padding: 0
  }
};
const btnVariants = {
  primary: {
    background: 'var(--brand)',
    color: 'var(--text-on-brand)'
  },
  secondary: {
    background: 'var(--surface-brand-soft)',
    color: 'var(--teal-800)'
  },
  outline: {
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    borderColor: 'var(--border)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-primary)'
  },
  danger: {
    background: 'var(--danger)',
    color: '#fff'
  },
  onDark: {
    background: 'var(--accent-bright)',
    color: '#08242c'
  }
};

/** Primary action control. Mirrors the source cva button (rounded-lg, semibold, 40px). */
function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconAfter,
  disabled,
  full,
  style,
  children,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const v = btnVariants[variant] || btnVariants.primary;
  return /*#__PURE__*/React.createElement("button", _extends({
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      ...btnBase,
      ...btnSizes[size],
      ...v,
      width: full ? '100%' : undefined,
      opacity: disabled ? 0.5 : 1,
      pointerEvents: disabled ? 'none' : undefined,
      filter: hover && !disabled ? 'brightness(0.94)' : undefined,
      ...style
    }
  }, rest), icon ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex'
    }
  }, icon) : null, size === 'icon' ? null : children, iconAfter ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex'
    }
  }, iconAfter) : null, size === 'icon' ? children : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Bordered 16px-radius surface. Definition comes from the border, not the shadow. */
function Card({
  tone = 'default',
  pad = false,
  style,
  children,
  ...rest
}) {
  const tones = {
    default: {
      background: 'var(--surface)',
      borderColor: 'var(--border)',
      color: 'var(--text-primary)'
    },
    inverse: {
      background: 'var(--surface-inverse-2)',
      borderColor: 'transparent',
      color: 'var(--text-inverse)'
    },
    risk: {
      background: 'var(--surface)',
      borderColor: 'var(--danger)',
      color: 'var(--text-primary)'
    },
    sunken: {
      background: 'var(--surface-sunken)',
      borderColor: 'var(--border)',
      color: 'var(--text-primary)'
    }
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      border: '1px solid',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-card)',
      padding: pad ? 'var(--pad-card)' : 0,
      ...tones[tone],
      ...style
    }
  }, rest), children);
}
function CardHeader({
  action,
  title,
  subtitle,
  icon,
  style,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      alignItems: action ? 'center' : 'flex-start',
      justifyContent: 'space-between',
      gap: 'var(--space-3)',
      padding: 'var(--pad-card)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      minWidth: 0
    }
  }, icon, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, title ? /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      font: 'var(--type-card-title)',
      letterSpacing: 'var(--tracking-tight)'
    }
  }, title) : null, subtitle ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 0',
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, subtitle) : null, children)), action);
}
function CardContent({
  style,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      padding: 'var(--pad-card)',
      paddingTop: 0,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card, CardHeader, CardContent });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
const DEFAULT_SVG = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
};
const RENAME = {
  class: 'className',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
  'stroke-dasharray': 'strokeDasharray'
};
function reactAttrs(attrs) {
  const out = {};
  Object.keys(attrs || {}).forEach(k => {
    out[RENAME[k] || k] = attrs[k];
  });
  return out;
}
function toEl(node, key) {
  if (!Array.isArray(node)) return null;
  const [tag, attrs, children] = node;
  const kids = Array.isArray(children) ? children.map((c, i) => toEl(c, i)) : null;
  return React.createElement(tag, {
    key,
    ...reactAttrs(attrs)
  }, kids);
}
function lookup(name) {
  const l = typeof window !== 'undefined' ? window.lucide : null;
  if (!l) return null;
  const kebab = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  return l.icons && (l.icons[name] || l.icons[kebab]) || l[name] || null;
}

/** Lucide glyph wrapper. Lucide 0.577 is the source repo's icon library. */
function Icon({
  name,
  size = 16,
  strokeWidth = 2,
  label,
  style,
  ...rest
}) {
  const icon = lookup(name);
  const children = !icon ? [] : (typeof icon[0] === 'string' ? [icon] : icon).map((n, i) => toEl(n, i));
  const flat = children.length === 1 && children[0] && children[0].type === 'svg' ? children[0].props.children : children;
  return React.createElement('svg', {
    ...DEFAULT_SVG,
    strokeWidth,
    width: size,
    height: size,
    'aria-hidden': label ? undefined : 'true',
    role: label ? 'img' : undefined,
    'aria-label': label,
    style: {
      display: 'block',
      flex: 'none',
      ...style
    },
    ...rest
  }, [label ? React.createElement('title', {
    key: 't'
  }, label) : null, flat]);
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const fieldBase = {
  height: 'var(--control-h)',
  width: '100%',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--input-border)',
  background: 'var(--surface)',
  color: 'var(--text-primary)',
  padding: '0 var(--space-3)',
  fontSize: 'var(--text-sm)',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  transition: 'var(--transition-color)'
};

/** Text field. Optional leading icon (search pattern) and label. */
function Input({
  label,
  hint,
  error,
  icon,
  borderless,
  style,
  id,
  ...rest
}) {
  const inputId = id || `f-${label || 'field'}`.replace(/\s+/g, '-').toLowerCase();
  const field = /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    }
  }, icon ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 'var(--space-3)',
      color: 'var(--text-muted)',
      display: 'flex'
    }
  }, icon) : null, /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    "aria-invalid": error ? true : undefined,
    style: {
      ...fieldBase,
      paddingLeft: icon ? '36px' : 'var(--space-3)',
      borderColor: error ? 'var(--danger)' : borderless ? 'transparent' : 'var(--input-border)',
      background: borderless ? 'var(--surface-muted)' : 'var(--surface)',
      ...style
    }
  }, rest)));
  if (!label && !hint && !error) return field;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-2)'
    }
  }, label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-medium)'
    }
  }, label) : null, field, error ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-meta)',
      color: 'var(--danger)'
    }
  }, error) : null, !error && hint ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Native select styled to match Input. Used for status/stage/forecast-category pickers. */
function Select({
  label,
  options = [],
  hint,
  style,
  id,
  ...rest
}) {
  const selectId = id || `s-${label || 'select'}`.replace(/\s+/g, '-').toLowerCase();
  const field = /*#__PURE__*/React.createElement("select", _extends({
    id: selectId,
    style: {
      height: 'var(--control-h)',
      width: '100%',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--input-border)',
      background: 'var(--surface)',
      color: 'var(--text-primary)',
      padding: '0 var(--space-3)',
      fontSize: 'var(--text-sm)',
      fontFamily: 'var(--font-sans)',
      outline: 'none',
      ...style
    }
  }, rest), options.map(o => {
    const value = typeof o === 'string' ? o : o.value;
    const text = typeof o === 'string' ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: value,
      value: value
    }, text);
  }));
  if (!label && !hint) return field;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-2)'
    }
  }, label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: selectId,
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-medium)'
    }
  }, label) : null, field, hint ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Select.jsx", error: String((e && e.message) || e) }); }

// components/data/DataQualityPanel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const qualityTones = {
  ready: {
    color: 'var(--success)',
    bg: 'var(--success-soft)',
    label: 'Ready to import'
  },
  warnings: {
    color: 'oklch(0.52 0.12 78)',
    bg: 'var(--warning-soft)',
    label: 'Warnings'
  },
  invalid: {
    color: 'var(--danger)',
    bg: 'var(--danger-soft)',
    label: 'Invalid rows'
  },
  duplicates: {
    color: 'var(--text-muted)',
    bg: 'var(--surface-sunken)',
    label: 'Duplicates'
  }
};

/** Pre-import verdict: how many rows are safe, and what is wrong with the rest. */
function DataQualityPanel({
  counts = {},
  issues = [],
  onReview,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'grid',
      gap: 'var(--space-4)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))',
      gap: 'var(--gap-kpi)'
    }
  }, ['ready', 'warnings', 'invalid', 'duplicates'].map(k => {
    const t = qualityTones[k];
    return /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        padding: 'var(--pad-card-compact)',
        borderRadius: 'var(--radius-md)',
        background: t.bg
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "tnum",
      style: {
        margin: 0,
        fontSize: 'var(--text-2xl)',
        fontWeight: 'var(--weight-semibold)',
        color: t.color
      }
    }, counts[k] ?? 0), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '2px 0 0',
        font: 'var(--type-meta)',
        color: 'var(--text-muted)'
      }
    }, t.label));
  })), issues.length ? /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'grid',
      gap: 'var(--space-2)'
    }
  }, issues.map(i => /*#__PURE__*/React.createElement("li", {
    key: `${i.row}-${i.message}`,
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 'var(--space-3)',
      padding: 'var(--space-2) var(--space-3)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      font: 'var(--type-meta)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      fontFamily: 'var(--font-mono)',
      color: 'var(--text-muted)'
    }
  }, "Row ", i.row), /*#__PURE__*/React.createElement("span", {
    style: {
      color: i.severity === 'invalid' ? 'var(--danger)' : 'oklch(0.52 0.12 78)',
      fontWeight: 'var(--weight-semibold)'
    }
  }, i.severity === 'invalid' ? 'Invalid' : 'Warning'), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-primary)'
    }
  }, i.message)))) : null, onReview ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onReview,
    style: {
      justifySelf: 'start',
      height: 'var(--control-h-sm)',
      padding: '0 var(--space-3)',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      color: 'var(--text-primary)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)',
      cursor: 'pointer'
    }
  }, "Review rows before import") : null);
}
Object.assign(__ds_scope, { DataQualityPanel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DataQualityPanel.jsx", error: String((e && e.message) || e) }); }

// components/data/ImportMapper.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Column → platform field mapping with per-row confidence. Step 3 of the import wizard. */
function ImportMapper({
  rows = [],
  fields = [],
  templateName,
  templateConfidence,
  onChange,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'grid',
      gap: 'var(--space-4)',
      ...style
    }
  }, rest), templateName ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      padding: 'var(--space-3) var(--pad-card-compact)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-brand-soft)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--teal-800)",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-body)',
      color: 'var(--teal-800)'
    }
  }, /*#__PURE__*/React.createElement("b", null, templateName), " detected", templateConfidence !== undefined ? ` — ${templateConfidence}% mapping confidence` : '', ".")) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.1fr 24px 1.2fr 120px',
      gap: 'var(--space-3)',
      padding: 'var(--space-3) var(--pad-card-compact)',
      background: 'var(--surface-sunken)',
      font: 'var(--type-meta)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)',
      fontWeight: 'var(--weight-semibold)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Existing column"), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null, "Platform field"), /*#__PURE__*/React.createElement("span", null, "Confidence")), rows.map(r => {
    const conf = r.confidence ?? 0;
    const tone = conf >= 90 ? 'var(--success)' : conf >= 60 ? 'var(--warning)' : 'var(--danger)';
    return /*#__PURE__*/React.createElement("div", {
      key: r.source,
      style: {
        display: 'grid',
        gridTemplateColumns: '1.1fr 24px 1.2fr 120px',
        gap: 'var(--space-3)',
        alignItems: 'center',
        padding: 'var(--space-3) var(--pad-card-compact)',
        borderTop: '1px solid var(--border)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "tnum",
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-primary)'
      }
    }, r.source), /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      style: {
        color: 'var(--text-muted)',
        textAlign: 'center'
      }
    }, "\u2192"), /*#__PURE__*/React.createElement("select", {
      value: r.target || '',
      onChange: onChange ? e => onChange(r.source, e.target.value) : undefined,
      "aria-label": `Map ${r.source}`,
      style: {
        height: 'var(--control-h-sm)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--input-border)',
        background: 'var(--surface)',
        color: 'var(--text-primary)',
        fontSize: 'var(--text-sm)',
        padding: '0 var(--space-2)'
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "\u2014 Ignore column \u2014"), fields.map(fl => /*#__PURE__*/React.createElement("option", {
      key: fl,
      value: fl
    }, fl))), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        height: 6,
        borderRadius: 'var(--radius-pill)',
        background: 'var(--surface-sunken)',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        width: `${conf}%`,
        height: '100%',
        background: tone
      }
    })), /*#__PURE__*/React.createElement("span", {
      className: "tnum",
      style: {
        font: 'var(--type-meta)',
        color: 'var(--text-muted)'
      }
    }, conf, "%")));
  })));
}
Object.assign(__ds_scope, { ImportMapper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ImportMapper.jsx", error: String((e && e.message) || e) }); }

// components/sales/ForecastConfidence.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const catLabel = {
  PIPELINE: 'Pipeline',
  BEST_CASE: 'Best case',
  COMMIT: 'Commit',
  CLOSED: 'Closed',
  OMITTED: 'Omitted'
};

/** Seller's forecast call vs the system's confidence — the disagreement is the signal. */
function ForecastConfidence({
  sellerCategory = 'COMMIT',
  confidence = 0,
  rationale,
  style,
  ...rest
}) {
  const agree = sellerCategory === 'COMMIT' && confidence >= 65 || sellerCategory !== 'COMMIT' && confidence < 65;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'grid',
      gap: 'var(--space-3)',
      padding: 'var(--pad-card-compact)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-semibold)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, "Forecast confidence"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-semibold)',
      color: agree ? 'var(--success)' : 'var(--warning)'
    }
  }, agree ? 'Aligned' : 'Disagreement')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, "Seller call"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 0',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)'
    }
  }, catLabel[sellerCategory] || sellerCategory)), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      alignSelf: 'stretch',
      background: 'var(--border)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, "System confidence"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 8,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--surface-sunken)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${confidence}%`,
      height: '100%',
      background: confidence >= 65 ? 'var(--success)' : confidence >= 40 ? 'var(--warning)' : 'var(--danger)'
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)'
    }
  }, confidence, "%")))), rationale ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-meta)',
      color: 'var(--text-muted)',
      textWrap: 'pretty'
    }
  }, rationale) : null);
}
Object.assign(__ds_scope, { ForecastConfidence });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/sales/ForecastConfidence.jsx", error: String((e && e.message) || e) }); }

// components/sales/ForecastMovement.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const fmt = (n, currency = 'USD') => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency,
  notation: Math.abs(n) >= 1000000 ? 'compact' : 'standard',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1
}).format(n);

/** What changed since the last forecast snapshot, and by how much. */
function ForecastMovement({
  since = 'Monday',
  net = 0,
  currency = 'USD',
  movements = [],
  onSelect,
  style,
  ...rest
}) {
  const up = net >= 0;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'grid',
      gap: 'var(--space-3)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, "Net movement since ", since), /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      fontSize: 'var(--text-lg)',
      fontWeight: 'var(--weight-semibold)',
      color: up ? 'var(--success)' : 'var(--danger)'
    }
  }, up ? '+' : '−', fmt(Math.abs(net), currency))), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'grid',
      gap: 'var(--space-2)'
    }
  }, movements.map(m => {
    const pos = m.delta >= 0;
    return /*#__PURE__*/React.createElement("li", {
      key: m.label
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onSelect ? () => onSelect(m) : undefined,
      style: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        textAlign: 'left',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3)',
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'var(--transition-color)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      style: {
        color: pos ? 'var(--success)' : 'var(--danger)',
        fontSize: 'var(--text-xs)'
      }
    }, pos ? '▲' : '▼'), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--weight-semibold)'
      }
    }, m.label), m.reason ? /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        font: 'var(--type-meta)',
        color: 'var(--text-muted)'
      }
    }, m.reason) : null), /*#__PURE__*/React.createElement("span", {
      className: "tnum",
      style: {
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--weight-semibold)',
        color: pos ? 'var(--success)' : 'var(--danger)'
      }
    }, pos ? '+' : '−', fmt(Math.abs(m.delta), currency))));
  })), !movements.length ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, "No forecast changes since ", since, ".") : null);
}
Object.assign(__ds_scope, { ForecastMovement });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/sales/ForecastMovement.jsx", error: String((e && e.message) || e) }); }

// components/sales/FunnelStage.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const fmt = (n, currency = 'USD') => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency,
  notation: Math.abs(n) >= 1000000 ? 'compact' : 'standard',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1
}).format(n);
const stageToken = {
  discovery: 'var(--pipeline-discovery)',
  qualified: 'var(--pipeline-qualified)',
  proposal: 'var(--pipeline-proposal)',
  commit: 'var(--pipeline-commit)',
  backlog: 'var(--pipeline-backlog)',
  billed: 'var(--pipeline-billed)'
};

/** One narrowing band of the funnel. Hover reveals stage mechanics; click selects. */
function FunnelStage({
  name,
  token = 'commit',
  amount,
  count,
  widthPct = 100,
  probability,
  avgAmount,
  atRisk = 0,
  atRiskAmount,
  avgDaysInStage,
  likelyToSlip,
  conversion,
  currency = 'USD',
  selected,
  onSelect,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  // Priority order: amount, count, at-risk amount, average days in stage, likely slippage.
  const primary = [['Amount', fmt(amount, currency)], ['Opportunities', String(count)], atRiskAmount !== undefined ? ['At risk', `${fmt(atRiskAmount, currency)}${atRisk ? ` · ${atRisk} deals` : ''}`] : atRisk ? ['At risk', `${atRisk} deals`] : null, avgDaysInStage !== undefined ? ['Avg days in stage', `${avgDaysInStage}d`] : null, likelyToSlip !== undefined ? ['Likely slippage', fmt(likelyToSlip, currency)] : null].filter(Boolean);
  const secondary = [conversion !== undefined ? `${conversion}% conversion` : null, probability !== undefined ? `${probability}% probability` : null, avgAmount !== undefined ? `avg deal ${fmt(avgAmount, currency)}` : null].filter(Boolean);
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      position: 'relative',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-pressed": !!selected,
    "aria-label": `${name}: ${fmt(amount, currency)} across ${count} opportunities`,
    onClick: onSelect,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'block',
      width: `${widthPct}%`,
      margin: '0 auto',
      border: 'none',
      cursor: 'pointer',
      background: stageToken[token] || stageToken.commit,
      padding: 'var(--space-3) var(--space-4)',
      color: '#fff',
      textAlign: 'left',
      borderRadius: 'var(--radius-sm)',
      transition: 'filter var(--dur-fast) var(--ease-standard), outline-color var(--dur-fast)',
      filter: hover ? 'brightness(1.08)' : 'none',
      outline: selected ? '2px solid var(--text-primary)' : '2px solid transparent',
      outlineOffset: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)'
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)'
    }
  }, fmt(amount, currency))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      marginTop: 2,
      fontSize: 'var(--text-11)',
      opacity: 0.85
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "tnum"
  }, count, " opportunities"), atRisk ? /*#__PURE__*/React.createElement("span", {
    className: "tnum"
  }, "\xB7 ", atRisk, " at risk") : null)), hover ? /*#__PURE__*/React.createElement("div", {
    role: "tooltip",
    style: {
      position: 'absolute',
      top: '50%',
      left: 'calc(100% + 8px)',
      transform: 'translateY(-50%)',
      zIndex: 5,
      minWidth: 214,
      padding: 'var(--space-3)',
      background: 'var(--surface-inverse)',
      color: 'var(--text-inverse)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-overlay)',
      display: 'grid',
      gap: 5
    }
  }, primary.map(([k, v]) => /*#__PURE__*/React.createElement("span", {
    key: k,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 'var(--space-4)',
      fontSize: 'var(--text-11)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-inverse-muted)'
    }
  }, k), /*#__PURE__*/React.createElement("b", {
    className: "tnum",
    style: {
      color: k === 'At risk' || k === 'Likely slippage' ? 'oklch(0.78 0.14 30)' : 'var(--text-inverse)'
    }
  }, v))), secondary.length ? /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: 2,
      paddingTop: 5,
      borderTop: '1px solid var(--border-inverse)',
      fontSize: 'var(--text-10)',
      color: 'var(--text-inverse-muted)'
    }
  }, secondary.join(' · ')) : null) : null);
}
Object.assign(__ds_scope, { FunnelStage });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/sales/FunnelStage.jsx", error: String((e && e.message) || e) }); }

// components/sales/NextBestAction.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const fmt = (n, currency = 'USD') => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency,
  notation: Math.abs(n) >= 1000000 ? 'compact' : 'standard',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1
}).format(n);

/** One commercially relevant action, with the reason it matters. Seller Home's core unit. */
function NextBestAction({
  customer,
  amount,
  currency = 'USD',
  category,
  risk,
  suggestion,
  severity = 'WARNING',
  primaryLabel = 'Do it',
  onPrimary,
  onOpen,
  style,
  ...rest
}) {
  const tone = severity === 'CRITICAL' ? 'var(--critical)' : severity === 'HIGH' ? 'var(--orange-600)' : 'var(--warning)';
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'grid',
      gap: 'var(--space-3)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface)',
      padding: 'var(--pad-card-compact)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onOpen,
    style: {
      padding: 0,
      border: 'none',
      background: 'none',
      font: 'inherit',
      fontSize: 'var(--text-base)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-primary)',
      cursor: 'pointer',
      textAlign: 'left'
    }
  }, customer), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)'
    }
  }, fmt(amount, currency)), category ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, "\xB7 ", category) : null)), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: tone,
      marginTop: 6
    },
    "aria-hidden": "true"
  })), risk ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-body)',
      color: 'var(--text-primary)',
      textWrap: 'pretty'
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      color: tone
    }
  }, "Risk \xB7 "), risk) : null, suggestion ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, "Suggested \xB7 ", suggestion) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onPrimary,
    style: {
      height: 'var(--control-h-sm)',
      padding: '0 var(--space-3)',
      borderRadius: 'var(--radius-sm)',
      border: 'none',
      background: 'var(--brand)',
      color: 'var(--text-on-brand)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)',
      cursor: 'pointer'
    }
  }, primaryLabel), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onOpen,
    style: {
      height: 'var(--control-h-sm)',
      padding: '0 var(--space-3)',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      color: 'var(--text-primary)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)',
      cursor: 'pointer'
    }
  }, "Open deal")));
}
Object.assign(__ds_scope, { NextBestAction });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/sales/NextBestAction.jsx", error: String((e && e.message) || e) }); }

// components/sales/OpportunityHealth.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const healthMap = {
  HEALTHY: {
    color: 'var(--success)',
    label: 'Healthy',
    icon: 'M20 6 9 17l-5-5'
  },
  AT_RISK: {
    color: 'var(--warning)',
    label: 'At risk',
    icon: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z'
  },
  CRITICAL: {
    color: 'var(--critical)',
    label: 'Critical',
    icon: 'M12 8v4M12 16h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z'
  }
};

/** Explainable 0–100 forecast health: score, status, and the factors that moved it. */
function OpportunityHealth({
  score,
  status = 'HEALTHY',
  factors = [],
  showFactors,
  size = 'md',
  style,
  ...rest
}) {
  const h = healthMap[status] || healthMap.HEALTHY;
  const dim = size === 'lg' ? 64 : size === 'sm' ? 34 : 46;
  const r = (dim - 6) / 2;
  const c = 2 * Math.PI * r;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'grid',
      gap: 'var(--space-3)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: dim,
    height: dim,
    viewBox: `0 0 ${dim} ${dim}`,
    role: "img",
    "aria-label": `Forecast health ${score} of 100, ${h.label}`
  }, /*#__PURE__*/React.createElement("circle", {
    cx: dim / 2,
    cy: dim / 2,
    r: r,
    fill: "none",
    stroke: "var(--surface-sunken)",
    strokeWidth: "5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: dim / 2,
    cy: dim / 2,
    r: r,
    fill: "none",
    stroke: h.color,
    strokeWidth: "5",
    strokeLinecap: "round",
    strokeDasharray: `${c * Math.max(0, Math.min(100, score)) / 100} ${c}`,
    transform: `rotate(-90 ${dim / 2} ${dim / 2})`
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "tnum",
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: size === 'lg' ? 'var(--text-3xl)' : 'var(--text-xl)',
      fontWeight: 'var(--weight-semibold)',
      color: h.color
    }
  }, score), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, "/ 100")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      marginTop: 2,
      color: h.color
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: h.icon
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-semibold)'
    }
  }, h.label)))), showFactors && factors.length ? /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'grid',
      gap: 'var(--space-2)'
    }
  }, factors.map(fx => /*#__PURE__*/React.createElement("li", {
    key: fx.code,
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      alignItems: 'baseline',
      font: 'var(--type-meta)'
    }
  }, /*#__PURE__*/React.createElement("b", {
    className: "tnum",
    style: {
      minWidth: 34,
      color: fx.impact < 0 ? 'var(--danger)' : 'var(--success)'
    }
  }, fx.impact > 0 ? `+${fx.impact}` : fx.impact), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, fx.message)))) : null);
}
Object.assign(__ds_scope, { OpportunityHealth });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/sales/OpportunityHealth.jsx", error: String((e && e.message) || e) }); }

// components/sales/QuotaGap.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const fmt = (n, currency = 'USD') => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency,
  notation: Math.abs(n) >= 1000000 ? 'compact' : 'standard',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1
}).format(n);

/** The management interpretation: how far short, what drives it, what to do. */
function QuotaGap({
  gap,
  currency = 'USD',
  interpretation,
  drivers = [],
  action,
  onAction,
  style,
  ...rest
}) {
  const short = gap > 0;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'grid',
      gap: 'var(--space-4)',
      padding: 'var(--pad-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid',
      borderColor: short ? 'var(--danger)' : 'var(--success)',
      background: short ? 'var(--danger-soft)' : 'var(--success-soft)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-semibold)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: short ? 'var(--danger)' : 'var(--success)'
    }
  }, short ? 'Quota gap' : 'Above quota'), /*#__PURE__*/React.createElement("p", {
    className: "tnum",
    style: {
      margin: 'var(--space-2) 0 0',
      font: 'var(--type-kpi-hero)',
      letterSpacing: 'var(--tracking-display)',
      color: short ? 'var(--danger)' : 'var(--success)'
    }
  }, fmt(Math.abs(gap), currency))), interpretation ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-body)',
      color: 'var(--text-primary)',
      textWrap: 'pretty'
    }
  }, interpretation) : null, drivers.length ? /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'grid',
      gap: 'var(--space-2)'
    }
  }, drivers.map(d => /*#__PURE__*/React.createElement("li", {
    key: d.label,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 'var(--space-3)',
      font: 'var(--type-meta)',
      padding: 'var(--space-2) var(--space-3)',
      background: 'var(--surface)',
      borderRadius: 'var(--radius-sm)'
    }
  }, /*#__PURE__*/React.createElement("span", null, d.label), /*#__PURE__*/React.createElement("b", {
    className: "tnum"
  }, fmt(d.amount, currency))))) : null, action ? /*#__PURE__*/React.createElement("button", {
    onClick: onAction,
    style: {
      justifySelf: 'start',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      height: 'var(--control-h-sm)',
      padding: '0 var(--space-3)',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      color: 'var(--text-primary)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)',
      cursor: 'pointer'
    }
  }, action) : null);
}
Object.assign(__ds_scope, { QuotaGap });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/sales/QuotaGap.jsx", error: String((e && e.message) || e) }); }

// components/sales/QuotaProgress.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const fmt = (n, currency = 'USD') => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency,
  notation: Math.abs(n) >= 1000000 ? 'compact' : 'standard',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1
}).format(n);

/** Billed + forecast against quota on one axis, with the quota line as the reference. */
function QuotaProgress({
  quota,
  billed,
  forecast,
  currency = 'USD',
  label = 'Quota attainment',
  compact,
  style,
  ...rest
}) {
  const max = Math.max(quota, billed + forecast) || 1;
  const pct = n => `${Math.max(0, Math.min(100, n / max * 100))}%`;
  const attainment = quota ? (billed + forecast) / quota * 100 : 0;
  const quotaPos = Math.max(0, Math.min(100, quota / max * 100));
  const markerAnchor = quotaPos > 92 ? {
    right: 0,
    left: 'auto',
    transform: 'none'
  } : quotaPos < 8 ? {
    left: 0,
    transform: 'none'
  } : {
    left: `${quotaPos}%`,
    transform: 'translateX(-50%)'
  };
  const short = attainment < 100;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: style
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-semibold)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      fontSize: compact ? 'var(--text-sm)' : 'var(--text-lg)',
      fontWeight: 'var(--weight-semibold)',
      color: short ? 'var(--warning)' : 'var(--success)'
    }
  }, attainment.toFixed(1), "%")), /*#__PURE__*/React.createElement("div", {
    role: "img",
    "aria-label": `Billed ${fmt(billed, currency)}, forecast ${fmt(forecast, currency)}, quota ${fmt(quota, currency)}`,
    style: {
      position: 'relative',
      marginTop: 'var(--space-3)',
      height: compact ? 10 : 14,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--surface-sunken)',
      overflow: 'hidden',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: pct(billed),
      background: 'var(--pipeline-billed)',
      transition: 'width var(--dur-slow) var(--ease-out)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: pct(forecast),
      background: 'var(--pipeline-commit)',
      opacity: 0.55,
      transition: 'width var(--dur-slow) var(--ease-out)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: 14,
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      ...markerAnchor,
      maxWidth: '100%',
      font: 'var(--type-meta)',
      color: 'var(--text-muted)',
      whiteSpace: 'nowrap'
    }
  }, "\u2502 quota ", fmt(quota, currency))), compact ? null : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--space-2) var(--space-4)',
      marginTop: 'var(--space-4)',
      minWidth: 0
    }
  }, [['Billed', billed, 'var(--pipeline-billed)'], ['Forecast', forecast, 'var(--pipeline-commit)'], ['Remaining', Math.max(0, quota - billed - forecast), 'var(--surface-sunken)']].map(([k, v, c]) => /*#__PURE__*/React.createElement("span", {
    key: k,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 2,
      background: c,
      border: c === 'var(--surface-sunken)' ? '1px solid var(--border)' : 'none'
    }
  }), k, " ", /*#__PURE__*/React.createElement("b", {
    className: "tnum",
    style: {
      color: 'var(--text-primary)'
    }
  }, fmt(v, currency))))));
}
Object.assign(__ds_scope, { QuotaProgress });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/sales/QuotaProgress.jsx", error: String((e && e.message) || e) }); }

// components/sales/RevenueKPI.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const fmt = (n, currency = 'USD') => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency,
  notation: Math.abs(n) >= 1000000 ? 'compact' : 'standard',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1
}).format(n);
const kpiTones = {
  default: {
    value: 'var(--text-primary)',
    chip: 'var(--text-muted)',
    bg: 'var(--surface)',
    border: 'var(--border)'
  },
  positive: {
    value: 'var(--success)',
    chip: 'var(--success)',
    bg: 'var(--surface)',
    border: 'var(--border)'
  },
  warning: {
    value: 'oklch(0.52 0.12 78)',
    chip: 'oklch(0.52 0.12 78)',
    bg: 'var(--warning-soft)',
    border: 'transparent'
  },
  risk: {
    value: 'var(--danger)',
    chip: 'var(--danger)',
    bg: 'var(--danger-soft)',
    border: 'transparent'
  }
};

/** One measured number with its label, qualifier and optional delta. */
function RevenueKPI({
  label,
  value,
  currency = 'USD',
  format = 'currency',
  detail,
  delta,
  deltaLabel,
  icon,
  tone = 'default',
  hero,
  style,
  ...rest
}) {
  const t = kpiTones[tone] || kpiTones.default;
  const shown = format === 'currency' ? fmt(Number(value), currency) : format === 'percent' ? `${Number(value).toFixed(1)}%` : format === 'multiple' ? `${Number(value).toFixed(1)}×` : String(value);
  const up = Number(delta) > 0;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: t.bg,
      border: `1px solid ${t.border}`,
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-card)',
      padding: hero ? 'var(--pad-card)' : 'var(--pad-card-compact)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      color: t.chip
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-semibold)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)'
    }
  }, label), icon), /*#__PURE__*/React.createElement("p", {
    className: "tnum",
    style: {
      margin: 'var(--space-4) 0 0',
      font: hero ? 'var(--type-kpi-hero)' : 'var(--type-kpi)',
      letterSpacing: 'var(--tracking-display)',
      color: t.value
    }
  }, shown), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      marginTop: 'var(--space-1)'
    }
  }, detail ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, detail) : null, delta !== undefined && delta !== null ? /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      font: 'var(--type-meta)',
      fontWeight: 'var(--weight-semibold)',
      color: up ? 'var(--success)' : 'var(--danger)'
    }
  }, up ? '▲' : '▼', " ", fmt(Math.abs(Number(delta)), currency), deltaLabel ? ` ${deltaLabel}` : '') : null));
}
Object.assign(__ds_scope, { RevenueKPI });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/sales/RevenueKPI.jsx", error: String((e && e.message) || e) }); }

// components/sales/RiskBadge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const riskLevels = {
  INFO: {
    color: 'var(--info)',
    bg: 'var(--info-soft)',
    label: 'Info',
    d: 'M12 16v-4M12 8h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z'
  },
  WARNING: {
    color: 'oklch(0.52 0.12 78)',
    bg: 'var(--warning-soft)',
    label: 'Warning',
    d: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z'
  },
  HIGH: {
    color: 'var(--orange-600)',
    bg: 'oklch(0.96 0.04 45)',
    label: 'High',
    d: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z'
  },
  CRITICAL: {
    color: 'var(--critical)',
    bg: 'var(--critical-soft)',
    label: 'Critical',
    d: 'M12 8v4M12 16h.01M7.9 2h8.2L22 7.9v8.2L16.1 22H7.9L2 16.1V7.9L7.9 2Z'
  }
};
const ACRONYMS = {
  po: 'PO',
  ai: 'AI',
  crm: 'CRM',
  id: 'ID',
  sla: 'SLA'
};
const humanise = code => code.replace(/_/g, ' ').toLowerCase().split(' ').map((w, i) => ACRONYMS[w] ? ACRONYMS[w] : i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w).join(' ');

/** Severity marker: colour + icon + word, always all three. */
function RiskBadge({
  severity = 'WARNING',
  label,
  code,
  style,
  ...rest
}) {
  const r = riskLevels[severity] || riskLevels.WARNING;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-1)',
      background: r.bg,
      color: r.color,
      borderRadius: 'var(--radius-pill)',
      padding: '2px var(--space-2)',
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-semibold)',
      whiteSpace: 'nowrap',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: r.d
  })), label || (code ? humanise(code) : r.label));
}
Object.assign(__ds_scope, { RiskBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/sales/RiskBadge.jsx", error: String((e && e.message) || e) }); }

// components/sales/SalesFunnel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Interactive narrowing funnel. Selecting a stage expands detail below, in place. */
function SalesFunnel({
  stages = [],
  currency = 'USD',
  selectedStage,
  onSelectStage,
  renderDetail,
  style,
  ...rest
}) {
  const [internal, setInternal] = React.useState(null);
  const selected = selectedStage !== undefined ? selectedStage : internal;
  const max = Math.max(...stages.map(s => s.amount), 1);
  const select = name => {
    const next = selected === name ? null : name;
    if (onSelectStage) onSelectStage(next);
    if (selectedStage === undefined) setInternal(next);
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: style
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-2)'
    }
  }, stages.map((s, i) => /*#__PURE__*/React.createElement(__ds_scope.FunnelStage, _extends({
    key: s.name
  }, s, {
    currency: currency,
    widthPct: Math.max(34, 100 - i * (58 / Math.max(1, stages.length - 1))),
    selected: selected === s.name,
    onSelect: () => select(s.name)
  })))), /*#__PURE__*/React.createElement("table", {
    style: {
      position: 'absolute',
      width: 1,
      height: 1,
      overflow: 'hidden',
      clip: 'rect(0 0 0 0)',
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement("caption", null, "Pipeline by stage"), /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Stage"), /*#__PURE__*/React.createElement("th", null, "Amount"), /*#__PURE__*/React.createElement("th", null, "Opportunities"))), /*#__PURE__*/React.createElement("tbody", null, stages.map(s => /*#__PURE__*/React.createElement("tr", {
    key: s.name
  }, /*#__PURE__*/React.createElement("td", null, s.name), /*#__PURE__*/React.createElement("td", null, s.amount), /*#__PURE__*/React.createElement("td", null, s.count))))), selected && renderDetail ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-4)',
      borderTop: '1px solid var(--border)',
      paddingTop: 'var(--space-4)',
      animation: 'none'
    }
  }, renderDetail(stages.find(s => s.name === selected))) : null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 'var(--space-3) 0 0',
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, selected ? 'Selected stage expanded below. Select again to collapse.' : 'Select a stage to break it down without leaving this view.'));
}
Object.assign(__ds_scope, { SalesFunnel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/sales/SalesFunnel.jsx", error: String((e && e.message) || e) }); }

// components/sales/SellerPerformance.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const fmt = (n, currency = 'USD') => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency,
  notation: Math.abs(n) >= 1000000 ? 'compact' : 'standard',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1
}).format(n);

/** Team roster with commit mix and attainment — where a manager picks who to help. */
function SellerPerformance({
  sellers = [],
  currency = 'USD',
  onSelect,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      overflowX: 'auto',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 'var(--text-sm)',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 'var(--text-xs)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)'
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      padding: 'var(--space-2) var(--space-3)',
      fontWeight: 'var(--weight-semibold)'
    }
  }, "Seller"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: 'var(--space-2) var(--space-3)',
      fontWeight: 'var(--weight-semibold)'
    }
  }, "Opps"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: 'var(--space-2) var(--space-3)',
      fontWeight: 'var(--weight-semibold)'
    }
  }, "Pipeline"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: 'var(--space-2) var(--space-3)',
      fontWeight: 'var(--weight-semibold)'
    }
  }, "Commit"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: 'var(--space-2) var(--space-3)',
      fontWeight: 'var(--weight-semibold)',
      minWidth: 160
    }
  }, "Commit mix"))), /*#__PURE__*/React.createElement("tbody", null, sellers.map(s => {
    const mix = s.pipeline ? s.commit / s.pipeline * 100 : 0;
    return /*#__PURE__*/React.createElement("tr", {
      key: s.seller,
      onClick: onSelect ? () => onSelect(s) : undefined,
      style: {
        borderTop: '1px solid var(--border)',
        cursor: onSelect ? 'pointer' : 'default'
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: 'var(--space-3)',
        fontWeight: 'var(--weight-semibold)'
      }
    }, s.seller), /*#__PURE__*/React.createElement("td", {
      className: "tnum",
      style: {
        padding: 'var(--space-3)'
      }
    }, s.opportunities), /*#__PURE__*/React.createElement("td", {
      className: "tnum",
      style: {
        padding: 'var(--space-3)'
      }
    }, fmt(s.pipeline, currency)), /*#__PURE__*/React.createElement("td", {
      className: "tnum",
      style: {
        padding: 'var(--space-3)'
      }
    }, fmt(s.commit, currency)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: 'var(--space-3)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 8,
        borderRadius: 'var(--radius-pill)',
        background: 'var(--surface-sunken)',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${Math.min(100, mix)}%`,
        height: '100%',
        background: mix < 25 ? 'var(--warning)' : 'var(--pipeline-commit)'
      }
    })), /*#__PURE__*/React.createElement("span", {
      className: "tnum",
      style: {
        font: 'var(--type-meta)',
        color: 'var(--text-muted)',
        minWidth: 44
      }
    }, mix.toFixed(1), "%"))));
  }))), !sellers.length ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 'var(--space-4)',
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, "No sellers in this team yet.") : null);
}
Object.assign(__ds_scope, { SellerPerformance });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/sales/SellerPerformance.jsx", error: String((e && e.message) || e) }); }

// components/sales/StageVelocity.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Days in current stage against the stage benchmark — the stagnation signal. */
function StageVelocity({
  stage,
  daysInStage,
  benchmarkDays,
  style,
  ...rest
}) {
  const ratio = benchmarkDays ? daysInStage / benchmarkDays : 0;
  const tone = ratio > 1.5 ? 'var(--danger)' : ratio > 1 ? 'var(--warning)' : 'var(--success)';
  const verdict = ratio > 1.5 ? 'Stalled' : ratio > 1 ? 'Slowing' : 'On pace';
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'grid',
      gap: 'var(--space-2)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, stage, " \xB7 days in stage"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-semibold)',
      color: tone
    }
  }, verdict)), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: 8,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--surface-sunken)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${Math.min(100, ratio * 66)}%`,
      height: '100%',
      borderRadius: 'var(--radius-pill)',
      background: tone
    }
  }), benchmarkDays ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: '66%',
      top: -3,
      width: 2,
      height: 14,
      background: 'var(--text-muted)'
    }
  }) : null), /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, daysInStage, "d", benchmarkDays ? ` · benchmark ${benchmarkDays}d` : ''));
}
Object.assign(__ds_scope, { StageVelocity });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/sales/StageVelocity.jsx", error: String((e && e.message) || e) }); }

// components/overlay/OpportunityDrawer.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const fmt = (n, currency = 'USD') => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency,
  notation: Math.abs(n) >= 1000000 ? 'compact' : 'standard',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1
}).format(n);

/** Right-side contextual drawer. The default way to inspect a deal — no page change. */
function OpportunityDrawer({
  open,
  opportunity,
  onClose,
  onOpenFull,
  quickActions = [],
  onQuickAction,
  footer,
  style,
  ...rest
}) {
  React.useEffect(() => {
    if (!open) return undefined;
    const onKey = e => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open || !opportunity) return null;
  const o = opportunity;
  const facts = [['Customer', o.customer], ['Seller', o.seller], ['Partner', o.partner || '—'], ['Brand', o.brand || '—'], ['Stage', o.stage], ['Forecast category', o.forecastCategory], ['Close date', o.closeDate], ['Billing date', o.billingDate || '—'], ['Margin', o.margin !== undefined && o.margin !== null ? `${o.margin}%` : '—']];
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "presentation",
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      background: 'var(--scrim)',
      zIndex: 70,
      display: 'flex',
      justifyContent: 'flex-end',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("aside", {
    role: "dialog",
    "aria-modal": "true",
    "aria-label": o.title,
    onClick: e => e.stopPropagation(),
    style: {
      width: 'min(var(--drawer-w), 96vw)',
      height: '100%',
      background: 'var(--surface)',
      borderLeft: '1px solid var(--border)',
      boxShadow: 'var(--shadow-overlay)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      padding: 'var(--pad-card)',
      borderBottom: '1px solid var(--border)',
      display: 'grid',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, o.customer), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '2px 0 0',
      fontSize: 'var(--text-xl)',
      fontWeight: 'var(--weight-semibold)',
      letterSpacing: 'var(--tracking-display)'
    }
  }, o.title)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    "aria-label": "Close",
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 32,
      height: 32,
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      cursor: 'pointer',
      color: 'var(--text-muted)'
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      fontSize: 'var(--text-2xl)',
      fontWeight: 'var(--weight-semibold)'
    }
  }, fmt(o.amount, o.currency || 'USD')), /*#__PURE__*/React.createElement(__ds_scope.OpportunityHealth, {
    score: o.health?.score ?? 0,
    status: o.health?.status,
    size: "sm"
  })), o.alerts && o.alerts.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--space-2)'
    }
  }, o.alerts.map(a => /*#__PURE__*/React.createElement(__ds_scope.RiskBadge, {
    key: a.code,
    severity: a.severity,
    code: a.code
  }))) : null, quickActions.length ? /*#__PURE__*/React.createElement("div", {
    role: "group",
    "aria-label": "Quick actions",
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--space-2)'
    }
  }, quickActions.map(a => {
    const label = typeof a === 'string' ? a : a.label;
    const primary = typeof a === 'object' && a.primary;
    return /*#__PURE__*/React.createElement("button", {
      key: label,
      type: "button",
      onClick: () => onQuickAction && onQuickAction(label),
      style: {
        minHeight: 32,
        padding: '0 var(--space-3)',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--weight-semibold)',
        border: '1px solid',
        borderColor: primary ? 'transparent' : 'var(--border)',
        background: primary ? 'var(--brand)' : 'var(--surface)',
        color: primary ? 'var(--text-on-brand)' : 'var(--text-primary)',
        transition: 'var(--transition-color)'
      }
    }, label);
  })) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      padding: 'var(--pad-card)',
      display: 'grid',
      gap: 'var(--space-5)'
    }
  }, o.nextStep ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--pad-card-compact)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--brand)',
      background: 'var(--surface-brand-soft)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-meta)',
      color: 'var(--teal-800)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      fontWeight: 'var(--weight-semibold)'
    }
  }, "Next step"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontSize: 'var(--text-base)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-primary)',
      textWrap: 'pretty'
    }
  }, o.nextStep.text), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--space-4)',
      marginTop: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      font: 'var(--type-meta)',
      color: o.nextStep.overdue ? 'var(--danger)' : 'var(--teal-800)',
      fontWeight: 'var(--weight-semibold)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "4",
    width: "18",
    height: "18",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 2v4M16 2v4M3 10h18"
  })), o.nextStep.date, o.nextStep.overdue ? ' · overdue' : ''), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      font: 'var(--type-meta)',
      color: 'var(--teal-800)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "8",
    r: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 21a8 8 0 0 1 16 0"
  })), o.nextStep.owner))) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--pad-card-compact)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--danger)',
      background: 'var(--danger-soft)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-meta)',
      color: 'var(--danger)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      fontWeight: 'var(--weight-semibold)'
    }
  }, "No next step"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      font: 'var(--type-body)'
    }
  }, "Deals without a dated next step slip far more often. Add one before the forecast call.")), o.lastActivity ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-3)',
      padding: 'var(--pad-card-compact)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 30,
      height: 30,
      borderRadius: 'var(--radius-sm)',
      background: o.lastActivity.stale ? 'var(--danger-soft)' : 'var(--success-soft)',
      color: o.lastActivity.stale ? 'var(--danger)' : 'var(--success)',
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-meta)',
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      fontWeight: 'var(--weight-semibold)'
    }
  }, "Last meaningful customer activity"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '3px 0 0',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)'
    }
  }, o.lastActivity.what), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 0',
      font: 'var(--type-meta)',
      color: o.lastActivity.stale ? 'var(--danger)' : 'var(--text-muted)'
    }
  }, o.lastActivity.when, o.lastActivity.who ? ` · ${o.lastActivity.who}` : ''))) : null, o.evidence ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 var(--space-3)',
      font: 'var(--type-card-title)'
    }
  }, "Why is this ", o.forecastCategory, "?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-2)'
    }
  }, (o.evidence.present || []).map(e => /*#__PURE__*/React.createElement("span", {
    key: e,
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      alignItems: 'flex-start',
      font: 'var(--type-meta)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--success)",
    strokeWidth: "2.6",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    style: {
      marginTop: 2,
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  })), /*#__PURE__*/React.createElement("span", null, e))), (o.evidence.missing || []).map(e => /*#__PURE__*/React.createElement("span", {
    key: e,
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      alignItems: 'flex-start',
      font: 'var(--type-meta)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--danger)",
    strokeWidth: "2.6",
    strokeLinecap: "round",
    "aria-hidden": "true",
    style: {
      marginTop: 2,
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, e, " ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--danger)'
    }
  }, "missing"))))), o.evidence.verdict ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 'var(--space-3) 0 0',
      padding: 'var(--space-3)',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--surface-sunken)',
      font: 'var(--type-meta)',
      textWrap: 'pretty'
    }
  }, o.evidence.verdict) : null) : null, /*#__PURE__*/React.createElement("dl", {
    style: {
      margin: 0,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-3) var(--space-4)'
    }
  }, facts.map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k
  }, /*#__PURE__*/React.createElement("dt", {
    style: {
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, k), /*#__PURE__*/React.createElement("dd", {
    style: {
      margin: '2px 0 0',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)'
    }
  }, v)))), o.daysInStage !== undefined ? /*#__PURE__*/React.createElement(__ds_scope.StageVelocity, {
    stage: o.stage,
    daysInStage: o.daysInStage,
    benchmarkDays: o.stageBenchmarkDays
  }) : null, o.stageHistory && o.stageHistory.length ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 var(--space-3)',
      font: 'var(--type-card-title)'
    }
  }, "Recent stage history"), /*#__PURE__*/React.createElement("ol", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'grid',
      gap: 'var(--space-3)'
    }
  }, o.stageHistory.map(h => /*#__PURE__*/React.createElement("li", {
    key: h.at,
    style: {
      position: 'relative',
      paddingLeft: 'var(--space-5)',
      borderLeft: '2px solid var(--surface-brand-soft)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: -5,
      top: 4,
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: 'var(--brand)'
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)'
    }
  }, h.from ? `${h.from} → ` : '', h.to), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 0',
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, h.by, " \xB7 ", h.at))))) : null, footer), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      padding: 'var(--pad-card)',
      borderTop: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onOpenFull,
    style: {
      height: 'var(--control-h)',
      padding: '0 var(--space-4)',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      color: 'var(--text-primary)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)',
      cursor: 'pointer'
    }
  }, "Open full record"))));
}
Object.assign(__ds_scope, { OpportunityDrawer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlay/OpportunityDrawer.jsx", error: String((e && e.message) || e) }); }

// product_screens/ManagerScreens.jsx
try { (() => {
/* Manager: Revenue Command Center, Funnel expanded, Forecast Review, Seller Performance */

function StageDrill({
  stage,
  onOpen
}) {
  if (!stage) return null;
  const rows = D.opportunities.filter(o => o.stage.name === stage.name);
  const sellers = D.sellers.filter(s => rows.some(r => r.seller === s.seller));
  const brands = [...new Set(rows.map(r => r.brand))];
  const [tab, setTab] = React.useState('opps');
  const tabs = [['opps', `Opportunities (${stage.count})`], ['sellers', 'By seller'], ['brands', 'By brand']];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      fontSize: 15,
      letterSpacing: '-0.02em'
    }
  }, stage.name.toUpperCase(), " \u2014 ", stage.count, " opportunities"), /*#__PURE__*/React.createElement(Badge, {
    tone: "brand"
  }, K(stage.amount)), stage.atRiskAmount ? /*#__PURE__*/React.createElement(RiskBadge, {
    severity: "HIGH",
    label: `${K(stage.atRiskAmount)} at risk · ${stage.atRisk} deals`
  }) : stage.atRisk ? /*#__PURE__*/React.createElement(RiskBadge, {
    severity: "HIGH",
    label: `${stage.atRisk} at risk`
  }) : null, stage.avgDaysInStage ? /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, stage.avgDaysInStage, "d avg in stage") : null, stage.likelyToSlip ? /*#__PURE__*/React.createElement(Badge, {
    tone: "warning"
  }, K(stage.likelyToSlip), " likely slippage") : null, /*#__PURE__*/React.createElement(Badge, {
    tone: "outline"
  }, stage.conversion, "% conversion")), /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    "aria-label": "Breakdown",
    style: {
      display: 'inline-flex',
      gap: 2,
      padding: 3,
      borderRadius: 8,
      background: 'var(--surface-muted)',
      width: 'fit-content'
    }
  }, tabs.map(([id, label]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    role: "tab",
    "aria-selected": tab === id,
    type: "button",
    onClick: () => setTab(id),
    style: {
      height: 28,
      padding: '0 11px',
      borderRadius: 6,
      border: 'none',
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 600,
      background: tab === id ? 'var(--surface)' : 'transparent',
      color: tab === id ? 'var(--text-primary)' : 'var(--text-muted)',
      boxShadow: tab === id ? 'var(--shadow-card)' : 'none'
    }
  }, label))), tab === 'opps' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 8
    }
  }, rows.length ? rows.map(o => /*#__PURE__*/React.createElement(OppRow, {
    key: o.id,
    opp: o,
    onOpen: onOpen,
    dense: true
  })) : /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, "No sampled opportunities in this stage \u2014 the aggregate above covers ", stage.count, " records."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, "Showing ", rows.length, " of ", stage.count, ". Click any row to open the drawer \u2014 the dashboard stays behind it.")) : null, tab === 'sellers' ? /*#__PURE__*/React.createElement(SellerPerformance, {
    sellers: sellers.length ? sellers : D.sellers,
    onSelect: () => {}
  }) : null, tab === 'brands' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 8
    }
  }, (brands.length ? brands : D.brands.map(b => b.brand)).map(b => {
    const meta = D.brands.find(x => x.brand === b) || {
      amount: 0,
      margin: 0,
      deals: 0
    };
    const share = Math.round(meta.amount / D.brands[0].amount * 100);
    return /*#__PURE__*/React.createElement("div", {
      key: b,
      style: {
        display: 'grid',
        gridTemplateColumns: '92px minmax(0,1fr) 74px 62px',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600
      }
    }, b), /*#__PURE__*/React.createElement("span", {
      style: {
        height: 9,
        borderRadius: 999,
        background: 'var(--surface-sunken)',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        width: share + '%',
        height: '100%',
        background: 'var(--chart-2)'
      }
    })), /*#__PURE__*/React.createElement("b", {
      className: "tnum",
      style: {
        fontSize: 12,
        textAlign: 'right'
      }
    }, K(meta.amount)), /*#__PURE__*/React.createElement("span", {
      className: "tnum",
      style: {
        fontSize: 12,
        textAlign: 'right',
        color: meta.margin < 10 ? 'var(--danger)' : 'var(--text-muted)'
      }
    }, meta.margin, "%"));
  })) : null);
}
function FunnelCard({
  onOpen,
  initial,
  subtitle
}) {
  const [stage, setStage] = React.useState(initial || null);
  return /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Sales funnel",
    subtitle: subtitle || 'Hover a stage for mechanics · click to expand below, without leaving the dashboard',
    action: /*#__PURE__*/React.createElement(Badge, {
      tone: "outline"
    }, D.team.atRisk, " at risk")
  }), /*#__PURE__*/React.createElement(CardContent, null, /*#__PURE__*/React.createElement(SalesFunnel, {
    stages: D.funnel,
    selectedStage: stage,
    onSelectStage: setStage,
    renderDetail: s => /*#__PURE__*/React.createElement(StageDrill, {
      stage: s,
      onOpen: onOpen
    })
  })));
}
function ManagerCommand({
  onOpen,
  onScreen
}) {
  const t = D.team;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ScreenHead, {
    eyebrow: "Revenue command center",
    title: "Will the team reach quota?",
    meta: `${D.tenant} · ${D.period} · ${D.periodRange} · ${D.week} · 5 sellers`,
    action: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      size: "sm",
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "Camera",
        size: 15
      })
    }, "Snapshot"), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "ClipboardCheck",
        size: 15
      }),
      onClick: () => onScreen('manager-review')
    }, "Forecast review"))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1.55fr) minmax(0,1fr)',
      gap: 16,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(LeadMetrics, {
    forecast: t.forecast,
    quota: t.quota,
    gap: t.gap,
    likely: t.likelyAttainment,
    delta: t.deltaSinceReview,
    deltaLabel: 'since ' + t.lastReview,
    confidence: t.confidence,
    confidenceBand: t.confidenceBand,
    secondary: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(QuotaProgress, {
      quota: t.quota,
      billed: t.billed,
      forecast: t.forecast - t.billed,
      label: "Team quota attainment"
    }), /*#__PURE__*/React.createElement(MetricStrip, {
      items: [{
        label: 'Billed',
        value: K(t.billed),
        detail: '44.6% of quota',
        tone: 'var(--success)'
      }, {
        label: 'Commit',
        value: K(t.commit),
        detail: '22 opportunities'
      }, {
        label: 'Backlog',
        value: K(t.backlog),
        detail: '9 awaiting billing'
      }, {
        label: 'Coverage',
        value: t.coverage.toFixed(1) + '×',
        detail: 'pipeline / gap'
      }, {
        label: 'Margin',
        value: t.margin.toFixed(1) + '%',
        detail: 'threshold 10%'
      }, {
        label: 'Accuracy',
        value: t.forecastAccuracy + '%',
        detail: 'last 4 quarters'
      }]
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(InsightBanner, {
    onAction: a => a === 'Open forecast review' ? onScreen('manager-review') : onOpen(D.byId('OPP-2041'))
  }), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Forecast movement",
    subtitle: `Since Monday's snapshot · ${K(t.slippage)} slipped`
  }), /*#__PURE__*/React.createElement(CardContent, null, /*#__PURE__*/React.createElement(ForecastMovement, {
    since: "Monday",
    net: -183000,
    movements: D.movements,
    onSelect: m => onOpen(D.byId(m.opportunityId))
  }))))), /*#__PURE__*/React.createElement(FunnelCard, {
    onOpen: onOpen
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)',
      gap: 16,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "High-risk opportunities",
    subtitle: "Open Commit and Backlog deals with signals",
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "ghost",
      onClick: () => onScreen('manager-review')
    }, "Review all")
  }), /*#__PURE__*/React.createElement(CardContent, {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 8
    }
  }, D.opportunities.filter(o => o.alerts.length && o.stage.code >= 50).map(o => /*#__PURE__*/React.createElement(OppRow, {
    key: o.id,
    opp: o,
    onOpen: onOpen,
    dense: true
  })))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Brands",
    subtitle: "Pipeline contribution and margin"
  }), /*#__PURE__*/React.createElement(CardContent, {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 9
    }
  }, D.brands.map(b => /*#__PURE__*/React.createElement("div", {
    key: b.brand,
    style: {
      display: 'grid',
      gridTemplateColumns: '72px minmax(0,1fr) 62px 50px',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600
    }
  }, b.brand), /*#__PURE__*/React.createElement("span", {
    style: {
      height: 9,
      borderRadius: 999,
      background: 'var(--surface-sunken)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      width: Math.round(b.amount / D.brands[0].amount * 100) + '%',
      height: '100%',
      background: 'var(--chart-2)'
    }
  })), /*#__PURE__*/React.createElement("b", {
    className: "tnum",
    style: {
      fontSize: 12,
      textAlign: 'right'
    }
  }, K(b.amount)), /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      fontSize: 11,
      textAlign: 'right',
      color: b.margin < 10 ? 'var(--danger)' : 'var(--text-muted)'
    }
  }, b.margin, "%")))))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Sellers",
    subtitle: "Attainment, coverage and risk \u2014 click a seller to expand",
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "ghost",
      onClick: () => onScreen('manager-sellers')
    }, "Full performance view")
  }), /*#__PURE__*/React.createElement(CardContent, null, /*#__PURE__*/React.createElement(SellerTable, {
    onOpen: onOpen,
    compact: true
  })))));
}
function SellerTable({
  onOpen,
  compact
}) {
  const [open, setOpen] = React.useState(null);
  const th = {
    padding: '8px 10px',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 'var(--tracking-label)',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textAlign: 'right',
    whiteSpace: 'nowrap'
  };
  const td = {
    padding: '11px 10px',
    fontSize: 13,
    textAlign: 'right',
    whiteSpace: 'nowrap'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      textAlign: 'left'
    }
  }, "Seller"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Quota"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Billed"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Forecast"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Attainment"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Coverage"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "At risk"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Margin"), compact ? null : /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Accuracy"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Trend"))), /*#__PURE__*/React.createElement("tbody", null, D.sellers.map(s => {
    const att = s.forecast / s.quota * 100;
    const on = open === s.seller;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: s.seller
    }, /*#__PURE__*/React.createElement("tr", {
      onClick: () => setOpen(on ? null : s.seller),
      style: {
        borderTop: '1px solid var(--border)',
        cursor: 'pointer',
        background: on ? 'var(--surface-brand-soft)' : 'transparent'
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        textAlign: 'left',
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: on ? 'ChevronDown' : 'ChevronRight',
      size: 14,
      style: {
        color: 'var(--text-muted)'
      }
    }), s.seller)), /*#__PURE__*/React.createElement("td", {
      style: td,
      className: "tnum"
    }, K(s.quota)), /*#__PURE__*/React.createElement("td", {
      style: td,
      className: "tnum"
    }, K(s.billed)), /*#__PURE__*/React.createElement("td", {
      style: td,
      className: "tnum"
    }, K(s.forecast)), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        fontWeight: 600,
        color: att < 70 ? 'var(--danger)' : att < 90 ? 'var(--warning)' : 'var(--success)'
      },
      className: "tnum"
    }, att.toFixed(1), "%"), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        color: s.coverage < 1.8 ? 'var(--danger)' : 'inherit'
      },
      className: "tnum"
    }, s.coverage.toFixed(1), "\xD7"), /*#__PURE__*/React.createElement("td", {
      style: td,
      className: "tnum"
    }, s.atRisk), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        color: s.margin < 10 ? 'var(--danger)' : 'inherit'
      },
      className: "tnum"
    }, s.margin, "%"), compact ? null : /*#__PURE__*/React.createElement("td", {
      style: td,
      className: "tnum"
    }, s.accuracy, "%"), /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        color: s.trend >= 0 ? 'var(--success)' : 'var(--danger)',
        fontWeight: 600
      },
      className: "tnum"
    }, s.trend >= 0 ? '▲' : '▼', " ", Math.abs(s.trend), "pt")), on ? /*#__PURE__*/React.createElement("tr", {
      style: {
        background: 'var(--surface-sunken)'
      }
    }, /*#__PURE__*/React.createElement("td", {
      colSpan: compact ? 9 : 10,
      style: {
        padding: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr)',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(QuotaProgress, {
      quota: s.quota,
      billed: s.billed,
      forecast: s.forecast - s.billed,
      label: `${s.seller.split(' ')[0]} · attainment`
    }), /*#__PURE__*/React.createElement(MetricStrip, {
      items: [{
        label: 'Commit',
        value: K(s.commit)
      }, {
        label: 'Accuracy',
        value: s.accuracy + '%',
        detail: 'last 4 quarters'
      }, {
        label: 'Opportunities',
        value: String(s.opportunities)
      }]
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr)',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: 'var(--tracking-label)',
        color: 'var(--text-muted)'
      }
    }, "Deals at risk"), D.opportunities.filter(o => o.seller === s.seller && o.alerts.length).map(o => /*#__PURE__*/React.createElement(OppRow, {
      key: o.id,
      opp: o,
      onOpen: onOpen,
      dense: true
    })), !D.opportunities.some(o => o.seller === s.seller && o.alerts.length) ? /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        font: 'var(--type-meta)',
        color: 'var(--text-muted)'
      }
    }, "No deals with open signals.") : null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        marginTop: 2
      }
    }, /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "outline",
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "MessageSquare",
        size: 14
      })
    }, "Ask seller"), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "ghost",
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "ClipboardCheck",
        size: 14
      })
    }, "Review their forecast")))))) : null);
  })))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, "Rows expand inline \u2014 no navigation. Amber attainment is under 90%, red under 70%."));
}
function ManagerSellers({
  onOpen
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ScreenHead, {
    eyebrow: "Team",
    title: "Where should I intervene?",
    meta: `5 sellers · ${D.period} · team attainment ${D.team.likelyAttainment.toFixed(1)}% · forecast accuracy ${D.team.forecastAccuracy}%`,
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "outline",
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "Download",
        size: 15
      })
    }, "Export")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(RevenueKPI, {
    label: "Below 70% attainment",
    value: 2,
    format: "raw",
    tone: "risk",
    detail: "Diego Andrade, Andr\xE9s Coba",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "TrendingDown",
      size: 15
    })
  }), /*#__PURE__*/React.createElement(RevenueKPI, {
    label: "Coverage under 1.8\xD7",
    value: 1,
    format: "raw",
    tone: "warning",
    detail: "Diego Andrade",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Layers",
      size: 15
    })
  }), /*#__PURE__*/React.createElement(RevenueKPI, {
    label: "Margin under threshold",
    value: 1,
    format: "raw",
    tone: "warning",
    detail: "Diego Andrade at 8.2%",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Percent",
      size: 15
    })
  }), /*#__PURE__*/React.createElement(RevenueKPI, {
    label: "Team forecast accuracy",
    value: D.team.forecastAccuracy,
    format: "percent",
    detail: "last 4 quarters",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Target",
      size: 15
    })
  })), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Seller performance",
    subtitle: "Quota, billed, forecast, attainment, coverage, risk, margin, accuracy and trend"
  }), /*#__PURE__*/React.createElement(CardContent, null, /*#__PURE__*/React.createElement(SellerTable, {
    onOpen: onOpen
  })))));
}
function ForecastReview({
  onOpen,
  onAskCopilot,
  onExit
}) {
  const queue = D.reviewQueue.map(D.byId);
  const [i, setI] = React.useState(0);
  const [decisions, setDecisions] = React.useState({});
  const [note, setNote] = React.useState('');
  const o = queue[i];
  const decide = label => {
    setDecisions(d => ({
      ...d,
      [o.id]: label
    }));
    setNote('');
    if (i < queue.length - 1) setI(i + 1);
  };
  const decided = Object.keys(decisions).length;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 16,
      marginBottom: 14,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-brand)'
    }
  }, "Forecast review"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '5px 0 0',
      fontSize: 26,
      fontWeight: 600,
      letterSpacing: '-0.035em'
    }
  }, D.period, " \xB7 ", D.week), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, decided, " of ", queue.length, " decided \xB7 ", K(queue.reduce((s, q) => s + q.amount, 0)), " under review")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost",
    onClick: onExit
  }, "Leave review"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "outline",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Camera",
      size: 15
    })
  }, "Snapshot decisions"))), /*#__PURE__*/React.createElement(ModeBanner, {
    mode: "Review",
    progress: `${decided} of ${queue.length} decided`
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)',
      gap: 16,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: `${o.customer} · ${o.title}`,
    subtitle: `${i + 1} of ${queue.length} · ${o.id} · ${o.seller} · ${o.brand} via ${o.partner}`,
    action: /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'right'
      }
    }, /*#__PURE__*/React.createElement("b", {
      className: "tnum",
      style: {
        display: 'block',
        fontSize: 28,
        fontWeight: 600,
        letterSpacing: '-0.035em'
      }
    }, K(o.amount)), /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--type-meta)',
        color: 'var(--text-muted)'
      }
    }, "closes ", o.closeDate))
  }), /*#__PURE__*/React.createElement(CardContent, {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 15
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 12,
      borderRadius: 11,
      border: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 10,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, "Seller forecast"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '5px 0 0',
      fontSize: 18,
      fontWeight: 600
    }
  }, catLabel[o.forecastCategory]), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '3px 0 0',
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, o.stage.code, "% \xB7 ", o.stage.name)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 12,
      borderRadius: 11,
      border: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 10,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, "System confidence"), /*#__PURE__*/React.createElement("p", {
    className: "tnum",
    style: {
      margin: '5px 0 0',
      fontSize: 18,
      fontWeight: 600,
      color: o.confidence >= 65 ? 'var(--success)' : o.confidence >= 40 ? 'var(--warning)' : 'var(--danger)'
    }
  }, o.confidence, "%"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      height: 6,
      borderRadius: 999,
      background: 'var(--surface-sunken)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: o.confidence + '%',
      height: '100%',
      background: o.confidence >= 65 ? 'var(--success)' : o.confidence >= 40 ? 'var(--warning)' : 'var(--danger)'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 12,
      borderRadius: 11,
      border: '1px solid var(--border)',
      background: o.suggestedCategory !== o.forecastCategory ? 'var(--warning-soft)' : 'var(--success-soft)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 10,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, "Suggested classification"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '5px 0 0',
      fontSize: 18,
      fontWeight: 600
    }
  }, catLabel[o.suggestedCategory]), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '3px 0 0',
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, o.suggestedCategory === o.forecastCategory ? 'Agrees with the seller' : 'Disagrees with the seller call'))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--success)'
    }
  }, "Evidence"), o.evidence.length ? o.evidence.map(e => /*#__PURE__*/React.createElement("span", {
    key: e,
    style: {
      display: 'flex',
      gap: 7,
      alignItems: 'flex-start',
      font: 'var(--type-meta)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Check",
    size: 13,
    style: {
      color: 'var(--success)',
      marginTop: 2
    }
  }), /*#__PURE__*/React.createElement("span", null, e))) : /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, "No evidence recorded.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--danger)'
    }
  }, "Risks"), o.risks.length ? o.risks.map(r => /*#__PURE__*/React.createElement("span", {
    key: r,
    style: {
      display: 'flex',
      gap: 7,
      alignItems: 'flex-start',
      font: 'var(--type-meta)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "TriangleAlert",
    size: 13,
    style: {
      color: 'var(--danger)',
      marginTop: 2
    }
  }), /*#__PURE__*/React.createElement("span", null, r))) : /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, "No open risks.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, "Missing evidence"), o.missing.length ? o.missing.map(m => /*#__PURE__*/React.createElement("span", {
    key: m,
    style: {
      display: 'flex',
      gap: 7,
      alignItems: 'center',
      font: 'var(--type-meta)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "CircleDashed",
    size: 13,
    style: {
      color: 'var(--text-muted)'
    }
  }), m)) : /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, "Complete."))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 7px',
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, "Stage history"), /*#__PURE__*/React.createElement("ol", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'grid',
      gap: 8
    }
  }, o.stageHistory.map(h => /*#__PURE__*/React.createElement("li", {
    key: h.at,
    style: {
      position: 'relative',
      paddingLeft: 17,
      borderLeft: '2px solid var(--surface-brand-soft)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: -5,
      top: 4,
      width: 8,
      height: 8,
      borderRadius: 999,
      background: 'var(--brand)'
    }
  }), /*#__PURE__*/React.createElement("b", {
    style: {
      fontSize: 12
    }
  }, h.from ? h.from + ' → ' : '', h.to), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 11,
      color: 'var(--text-muted)'
    }
  }, h.by, " \xB7 ", h.at))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 7px',
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, "Previous forecast changes"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 6
    }
  }, (D.movements.filter(m => m.opportunityId === o.id).length ? D.movements.filter(m => m.opportunityId === o.id) : [{
    label: 'No forecast changes recorded',
    delta: 0,
    reason: 'Category unchanged since the last snapshot'
  }]).map(m => /*#__PURE__*/React.createElement("div", {
    key: m.label,
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr) auto',
      gap: 9,
      alignItems: 'center',
      padding: '8px 10px',
      borderRadius: 9,
      border: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 0,
      fontSize: 11,
      color: 'var(--text-muted)'
    }
  }, m.reason), m.delta ? /*#__PURE__*/React.createElement("b", {
    className: "tnum",
    style: {
      fontSize: 12,
      color: m.delta > 0 ? 'var(--success)' : 'var(--danger)'
    }
  }, m.delta > 0 ? '+' : '−', K(Math.abs(m.delta))) : null))), /*#__PURE__*/React.createElement(Input, {
    style: {
      marginTop: 9
    },
    placeholder: "Add a note for the seller\u2026",
    value: note,
    onChange: e => setNote(e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      borderTop: '1px solid var(--border)',
      paddingTop: 14,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    onClick: () => decide('Commit kept')
  }, "Keep Commit"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "outline",
    onClick: () => decide('Moved to Upside')
  }, "Move to Upside"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "outline",
    onClick: () => decide('Question sent'),
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "MessageSquare",
      size: 14
    })
  }, "Ask seller"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost",
    disabled: !note,
    onClick: () => decide('Note added')
  }, "Add note"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, decisions[o.id] ? /*#__PURE__*/React.createElement(Badge, {
    tone: "positive"
  }, decisions[o.id]) : null, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "outline",
    onClick: () => setI((i + 1) % queue.length),
    iconAfter: /*#__PURE__*/React.createElement(Icon, {
      name: "ChevronRight",
      size: 15
    })
  }, "Next"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: true
  }, /*#__PURE__*/React.createElement(OpportunityHealth, {
    score: o.health.score,
    status: o.health.status,
    size: "lg",
    showFactors: true,
    factors: o.health.factors
  })), /*#__PURE__*/React.createElement(Card, {
    pad: true,
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(StageVelocity, {
    stage: o.stage.name,
    daysInStage: o.daysInStage,
    benchmarkDays: o.benchmarkDays
  }), /*#__PURE__*/React.createElement(MetricStrip, {
    items: [{
      label: 'Margin',
      value: o.margin + '%',
      tone: o.margin < 10 ? 'var(--danger)' : 'var(--success)'
    }, {
      label: 'Billing',
      value: o.billingDate ? o.billingDate.split(' ').slice(1).join(' ') : '—'
    }, {
      label: 'Alerts',
      value: String(o.alerts.length),
      tone: o.alerts.length ? 'var(--danger)' : 'inherit'
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "outline",
    onClick: () => onOpen(o),
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "PanelRight",
      size: 14
    })
  }, "Open drawer"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost",
    onClick: () => onAskCopilot('Is Commit justified?', o),
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Bot",
      size: 14
    })
  }, "Ask Copilot"))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Review queue",
    subtitle: `${queue.length - decided} still to decide`
  }), /*#__PURE__*/React.createElement(CardContent, {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 5,
      maxHeight: 300,
      overflowY: 'auto'
    }
  }, queue.map((q, ix) => /*#__PURE__*/React.createElement("button", {
    key: q.id,
    type: "button",
    onClick: () => setI(ix),
    style: {
      display: 'grid',
      gridTemplateColumns: 'auto minmax(0,1fr) auto auto',
      gap: 8,
      alignItems: 'center',
      textAlign: 'left',
      padding: '7px 9px',
      borderRadius: 9,
      cursor: 'pointer',
      border: '1px solid',
      borderColor: ix === i ? 'var(--brand)' : 'transparent',
      background: ix === i ? 'var(--surface-brand-soft)' : 'transparent'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      fontSize: 11,
      color: 'var(--text-muted)',
      width: 16
    }
  }, ix + 1), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 0,
      fontSize: 12,
      fontWeight: 600,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, q.customer), decisions[q.id] ? /*#__PURE__*/React.createElement(Icon, {
    name: "Check",
    size: 13,
    style: {
      color: 'var(--success)'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      width: 13
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      fontSize: 11,
      color: 'var(--text-muted)'
    }
  }, K(q.amount)))))))));
}
Object.assign(window, {
  ManagerCommand,
  ManagerSellers,
  ForecastReview,
  FunnelCard,
  StageDrill,
  SellerTable
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "product_screens/ManagerScreens.jsx", error: String((e && e.message) || e) }); }

// product_screens/Responsive.jsx
try { (() => {
/* Responsive: Seller mobile, Manager tablet, Opportunity mobile sheet */

function DeviceFrame({
  w,
  h,
  label,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 10,
      justifyItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: w,
      height: h,
      borderRadius: 22,
      border: '1px solid var(--border-strong)',
      background: 'var(--surface)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-overlay)',
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)'
    }
  }, children), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, label));
}
const MOBILE_TABS = [{
  id: 'today',
  label: 'Today',
  icon: 'Sun'
}, {
  id: 'opps',
  label: 'Deals',
  icon: 'Target'
}, {
  id: 'actions',
  label: 'Actions',
  icon: 'ListChecks'
}, {
  id: 'meetings',
  label: 'Meetings',
  icon: 'CalendarDays'
}, {
  id: 'copilot',
  label: 'Copilot',
  icon: 'Bot'
}];
function MobileSheet({
  deal,
  onClose
}) {
  if (!deal) return null;
  const rows = [['Stage', `${deal.stage.code}% ${deal.stage.name}`], ['Category', catLabel[deal.forecastCategory]], ['Seller', deal.seller], ['Brand', deal.brand], ['Partner', deal.partner], ['Close', deal.closeDate], ['Billing', deal.billingDate || '—'], ['Margin', deal.margin + '%']];
  return /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    "aria-label": deal.title,
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 20,
      background: 'var(--surface)',
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gridTemplateRows: '52px minmax(0,1fr) auto'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'auto minmax(0,1fr)',
      alignItems: 'center',
      gap: 6,
      padding: '0 12px',
      borderBottom: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    "aria-label": "Close",
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 44,
      height: 44,
      marginLeft: -10,
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ChevronLeft",
    size: 20
  })), /*#__PURE__*/React.createElement("b", {
    style: {
      fontSize: 14,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, deal.customer)), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowY: 'auto',
      padding: 14,
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 12,
      alignContent: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: '-0.03em'
    }
  }, deal.title), /*#__PURE__*/React.createElement("p", {
    className: "tnum",
    style: {
      margin: '6px 0 0',
      fontSize: 28,
      fontWeight: 600,
      letterSpacing: '-0.04em'
    }
  }, K(deal.amount))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6
    }
  }, deal.alerts.length ? deal.alerts.map(a => /*#__PURE__*/React.createElement(RiskBadge, {
    key: a.code,
    severity: a.severity,
    code: a.code
  })) : /*#__PURE__*/React.createElement(Badge, {
    tone: "positive"
  }, "No open risks")), /*#__PURE__*/React.createElement(Card, {
    pad: true
  }, /*#__PURE__*/React.createElement(OpportunityHealth, {
    score: deal.health.score,
    status: deal.health.status,
    size: "lg",
    showFactors: true,
    factors: deal.health.factors
  })), /*#__PURE__*/React.createElement(Card, {
    pad: true
  }, /*#__PURE__*/React.createElement(StageVelocity, {
    stage: deal.stage.name,
    daysInStage: deal.daysInStage,
    benchmarkDays: deal.benchmarkDays
  })), /*#__PURE__*/React.createElement(Card, {
    pad: true,
    style: {
      background: 'var(--surface-brand-soft)',
      borderColor: 'transparent'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 10,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--teal-800)'
    }
  }, "Next action"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '5px 0 0',
      font: 'var(--type-body)'
    }
  }, deal.nextAction)), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Details"
  }), /*#__PURE__*/React.createElement(CardContent, null, rows.map(([k, v], i) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr) auto',
      gap: 10,
      padding: '10px 0',
      borderTop: i ? '1px solid var(--border)' : 'none',
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, k), /*#__PURE__*/React.createElement("b", null, v))))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Stage history"
  }), /*#__PURE__*/React.createElement(CardContent, null, /*#__PURE__*/React.createElement("ol", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'grid',
      gap: 10
    }
  }, deal.stageHistory.map(h => /*#__PURE__*/React.createElement("li", {
    key: h.at,
    style: {
      paddingLeft: 16,
      borderLeft: '2px solid var(--surface-brand-soft)',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: -5,
      top: 4,
      width: 8,
      height: 8,
      borderRadius: 999,
      background: 'var(--brand)'
    }
  }), /*#__PURE__*/React.createElement("b", {
    style: {
      fontSize: 12
    }
  }, h.from ? h.from + ' → ' : '', h.to), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 11,
      color: 'var(--text-muted)'
    }
  }, h.by, " \xB7 ", h.at))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr) auto',
      gap: 8,
      padding: 12,
      borderTop: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Phone",
      size: 16
    })
  }, "Log activity"), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    variant: "outline",
    "aria-label": "Ask Copilot"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Bot",
    size: 17
  }))));
}
function SellerMobile({
  startTab,
  forceDeal
}) {
  const [tab, setTab] = React.useState(startTab || 'today');
  const [deal, setDeal] = React.useState(forceDeal ? D.byId(forceDeal) : null);
  const [msgs, setMsgs] = React.useState([]);
  const s = D.seller;
  const mine = D.opportunities.filter(o => o.seller === D.users.seller.name);
  const titles = {
    today: 'Today',
    opps: 'My deals',
    actions: 'Actions',
    meetings: 'Meetings',
    copilot: 'Copilot'
  };
  const body = {
    today: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr)',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Card, {
      pad: true,
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr)',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 10,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: 'var(--tracking-label)',
        color: 'var(--text-muted)'
      }
    }, "Forecast \xB7 ", D.period), /*#__PURE__*/React.createElement("p", {
      className: "tnum",
      style: {
        margin: '4px 0 0',
        fontSize: 32,
        fontWeight: 600,
        letterSpacing: '-0.04em'
      }
    }, K(s.forecast)), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '3px 0 0',
        font: 'var(--type-meta)',
        color: 'var(--text-muted)'
      }
    }, s.likelyAttainment.toFixed(1), "% likely \xB7 ", K(s.gap), " gap")), /*#__PURE__*/React.createElement(QuotaProgress, {
      quota: s.quota,
      billed: s.billed,
      forecast: s.forecast - s.billed,
      label: "My quota",
      compact: true
    })), /*#__PURE__*/React.createElement(MetricStrip, {
      items: [{
        label: 'Billed',
        value: K(s.billed),
        tone: 'var(--success)'
      }, {
        label: 'Commit',
        value: K(s.commit)
      }, {
        label: 'At risk',
        value: String(s.atRisk),
        tone: 'var(--danger)'
      }]
    }), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
      title: "Focus today",
      subtitle: "2 actions move your quarter"
    }), /*#__PURE__*/React.createElement(CardContent, {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr)',
        gap: 10
      }
    }, mine.filter(o => o.risks.length).slice(0, 2).map(o => /*#__PURE__*/React.createElement(NextBestAction, {
      key: o.id,
      customer: o.customer,
      amount: o.amount,
      category: catLabel[o.forecastCategory],
      severity: o.health.status === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      risk: o.risks[0],
      suggestion: o.nextAction,
      primaryLabel: "Log activity",
      onOpen: () => setDeal(o)
    }))))),
    opps: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr)',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Input, {
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "Search",
        size: 14
      }),
      placeholder: "Search customer or deal"
    }), mine.map(o => /*#__PURE__*/React.createElement("button", {
      key: o.id,
      type: "button",
      onClick: () => setDeal(o),
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr)',
        gap: 7,
        textAlign: 'left',
        padding: 13,
        borderRadius: 14,
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        boxShadow: 'var(--shadow-card)',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) auto',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        display: 'block',
        fontSize: 14
      }
    }, o.customer), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 11,
        color: 'var(--text-muted)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, o.title)), /*#__PURE__*/React.createElement("b", {
      className: "tnum",
      style: {
        fontSize: 14
      }
    }, K(o.amount))), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: "brand"
    }, o.stage.code, "% \xB7 ", o.stage.name), o.alerts[0] ? /*#__PURE__*/React.createElement(RiskBadge, {
      severity: o.alerts[0].severity,
      code: o.alerts[0].code
    }) : /*#__PURE__*/React.createElement(Badge, {
      tone: "positive"
    }, "On track"), /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 'auto'
      }
    }, /*#__PURE__*/React.createElement(OpportunityHealth, {
      score: o.health.score,
      status: o.health.status,
      size: "sm"
    })))))),
    actions: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr)',
        gap: 10
      }
    }, mine.filter(o => o.risks.length).map(o => /*#__PURE__*/React.createElement(NextBestAction, {
      key: o.id,
      customer: o.customer,
      amount: o.amount,
      category: catLabel[o.forecastCategory],
      severity: o.health.status === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      risk: o.risks[0],
      suggestion: o.nextAction,
      primaryLabel: "Mark done",
      onOpen: () => setDeal(o)
    }))),
    meetings: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr)',
        gap: 14
      }
    }, ['Today', 'Tomorrow', 'Thursday'].map(day => /*#__PURE__*/React.createElement("div", {
      key: day,
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr)',
        gap: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: 'var(--tracking-label)',
        color: 'var(--text-muted)'
      }
    }, day), D.meetings.filter(m => m.day === day).map(m => /*#__PURE__*/React.createElement(Card, {
      key: m.time + m.who,
      pad: true,
      style: {
        display: 'grid',
        gridTemplateColumns: 'auto minmax(0,1fr)',
        gap: 11
      }
    }, /*#__PURE__*/React.createElement("b", {
      className: "tnum",
      style: {
        fontSize: 12
      }
    }, m.time), /*#__PURE__*/React.createElement("span", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        display: 'block',
        fontSize: 13
      }
    }, m.who), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 11,
        color: 'var(--text-muted)'
      }
    }, m.what), m.ctx ? /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        marginTop: 5
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: "brand"
    }, m.ctx)) : null)))))),
    copilot: /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        minHeight: 0,
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr)'
      }
    }, /*#__PURE__*/React.createElement(CopilotRail, {
      ctx: "seller",
      messages: msgs,
      onAsk: q => setMsgs(m => [...m, {
        role: 'user',
        text: q
      }, {
        role: 'assistant',
        text: copilotAnswer(q, null)
      }])
    }))
  }[tab];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: '100%',
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gridTemplateRows: '52px minmax(0,1fr) auto',
      background: 'var(--bg-canvas)'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '0 14px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 28,
      height: 28,
      borderRadius: 9,
      background: 'var(--surface-inverse)',
      color: 'var(--accent-bright)',
      fontWeight: 700,
      fontSize: 10,
      flex: 'none'
    }
  }, "SI"), /*#__PURE__*/React.createElement("b", {
    style: {
      fontSize: 15,
      letterSpacing: '-0.02em'
    }
  }, titles[tab]), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "icon",
    variant: "ghost",
    "aria-label": "Search"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Search",
    size: 16
  })), /*#__PURE__*/React.createElement(Button, {
    size: "icon",
    variant: "ghost",
    "aria-label": "Alerts"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "BellRing",
    size: 16
  })))), /*#__PURE__*/React.createElement("main", {
    style: {
      overflowY: 'auto',
      padding: tab === 'copilot' ? 0 : 14,
      minHeight: 0
    }
  }, body), /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Primary",
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, minmax(0,1fr))',
      borderTop: '1px solid var(--border)',
      background: 'var(--surface)',
      paddingBottom: 4
    }
  }, MOBILE_TABS.map(t => {
    const on = tab === t.id;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      type: "button",
      onClick: () => setTab(t.id),
      "aria-current": on ? 'page' : undefined,
      style: {
        minHeight: 52,
        display: 'grid',
        justifyItems: 'center',
        gap: 2,
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        color: on ? 'var(--text-brand)' : 'var(--text-muted)',
        fontSize: 9.5,
        fontWeight: 600,
        padding: '7px 0'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: t.icon,
      size: 18
    }), t.label);
  })), /*#__PURE__*/React.createElement(MobileSheet, {
    deal: deal,
    onClose: () => setDeal(null)
  }));
}
function ManagerTablet({
  onOpen
}) {
  const t = D.team;
  const [stage, setStage] = React.useState(null);
  const [copilot, setCopilot] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: '100%',
      display: 'grid',
      gridTemplateColumns: '72px minmax(0,1fr)',
      background: 'var(--bg-canvas)'
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      background: 'var(--surface-inverse)',
      padding: '16px 10px',
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 6,
      alignContent: 'start',
      justifyItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 34,
      height: 34,
      borderRadius: 10,
      background: 'var(--accent-bright)',
      color: '#08242c',
      fontWeight: 700,
      fontSize: 12,
      marginBottom: 8
    }
  }, "SI"), NAV.manager.map((i, ix) => /*#__PURE__*/React.createElement("button", {
    key: i.id,
    type: "button",
    "aria-label": i.label,
    title: i.label,
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 44,
      height: 44,
      borderRadius: 11,
      border: 'none',
      cursor: 'pointer',
      background: ix === 0 ? 'oklch(0.865 0.127 207 / 0.12)' : 'transparent',
      color: ix === 0 ? 'var(--accent-bright)' : 'oklch(0.68 0.02 220)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: i.icon,
    size: 19
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gridTemplateRows: '52px minmax(0,1fr)'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '0 16px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)'
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      fontSize: 14,
      letterSpacing: '-0.02em'
    }
  }, "Command center"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(PeriodSelector, {
    periods: ['FY26 Q3', 'FY26 Q4'],
    value: D.period
  }), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "outline",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Bot",
      size: 15
    }),
    onClick: () => setCopilot(true)
  }, "Copilot"))), /*#__PURE__*/React.createElement("main", {
    style: {
      padding: 16,
      overflowY: 'auto',
      minHeight: 0,
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 14,
      alignContent: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: true,
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr) minmax(0,1fr)',
      gap: 14,
      alignItems: 'end'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 10,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, "Forecast"), /*#__PURE__*/React.createElement("p", {
    className: "tnum",
    style: {
      margin: '4px 0 0',
      fontSize: 34,
      fontWeight: 600,
      letterSpacing: '-0.04em',
      lineHeight: 1
    }
  }, K(t.forecast)), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontSize: 11,
      color: 'var(--text-muted)'
    }
  }, t.likelyAttainment.toFixed(1), "% likely")), /*#__PURE__*/React.createElement("div", {
    style: {
      borderLeft: '1px solid var(--border)',
      paddingLeft: 14
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 10,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, "Quota"), /*#__PURE__*/React.createElement("p", {
    className: "tnum",
    style: {
      margin: '4px 0 0',
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: '-0.03em'
    }
  }, K(t.quota))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderLeft: '1px solid var(--border)',
      paddingLeft: 14
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 10,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--danger)'
    }
  }, "Gap"), /*#__PURE__*/React.createElement("p", {
    className: "tnum",
    style: {
      margin: '4px 0 0',
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: '-0.03em',
      color: 'var(--danger)'
    }
  }, K(t.gap)))), /*#__PURE__*/React.createElement(QuotaProgress, {
    quota: t.quota,
    billed: t.billed,
    forecast: t.forecast - t.billed,
    label: "Team attainment",
    compact: true
  })), /*#__PURE__*/React.createElement(InsightBanner, {
    compact: true,
    onAction: () => onOpen(D.byId('OPP-2041'))
  }), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Sales funnel",
    subtitle: "Tap a stage to expand below"
  }), /*#__PURE__*/React.createElement(CardContent, null, /*#__PURE__*/React.createElement(SalesFunnel, {
    stages: D.funnel,
    selectedStage: stage,
    onSelectStage: setStage,
    renderDetail: s => /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr)',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        fontSize: 13
      }
    }, s.name.toUpperCase(), " \u2014 ", s.count, " opportunities"), D.opportunities.filter(o => o.stage.name === s.name).map(o => /*#__PURE__*/React.createElement(OppRow, {
      key: o.id,
      opp: o,
      onOpen: onOpen,
      dense: true
    })))
  }))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Sellers",
    subtitle: "Attainment and coverage"
  }), /*#__PURE__*/React.createElement(CardContent, null, /*#__PURE__*/React.createElement(SellerPerformance, {
    sellers: D.sellers,
    onSelect: () => {}
  }))))), copilot ? /*#__PURE__*/React.createElement("div", {
    role: "presentation",
    onClick: () => setCopilot(false),
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--scrim)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 30
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: 380,
      height: '100%',
      background: 'var(--surface)',
      borderLeft: '1px solid var(--border)',
      padding: 14,
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gridTemplateRows: 'auto minmax(0,1fr)',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "outline",
    style: {
      justifySelf: 'end'
    },
    onClick: () => setCopilot(false)
  }, "Close"), /*#__PURE__*/React.createElement(CopilotRail, {
    ctx: "manager",
    messages: [],
    onAsk: () => {}
  }))) : null);
}
function ResponsiveScreen({
  kind,
  onOpen
}) {
  if (kind === 'seller-mobile') {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ScreenHead, {
      eyebrow: "Responsive",
      title: "Seller mobile",
      meta: "390 \xD7 844 \xB7 Today, Deals, Actions, Meetings, Copilot. Dashboards, brand analytics and import are deliberately absent."
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 28,
        flexWrap: 'wrap',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(DeviceFrame, {
      w: 390,
      h: 780,
      label: "Today \u2014 quota, then the two moves that matter"
    }, /*#__PURE__*/React.createElement(SellerMobile, {
      startTab: "today"
    })), /*#__PURE__*/React.createElement(DeviceFrame, {
      w: 390,
      h: 780,
      label: "Deals \u2014 cards, never a table"
    }, /*#__PURE__*/React.createElement(SellerMobile, {
      startTab: "opps"
    })), /*#__PURE__*/React.createElement(DeviceFrame, {
      w: 390,
      h: 780,
      label: "Copilot \u2014 full screen, seller context"
    }, /*#__PURE__*/React.createElement(SellerMobile, {
      startTab: "copilot"
    }))));
  }
  if (kind === 'opportunity-mobile') {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ScreenHead, {
      eyebrow: "Responsive",
      title: "Opportunity mobile sheet",
      meta: "The drawer becomes a full-screen sheet: same content, same order, swipe or back to dismiss."
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 28,
        flexWrap: 'wrap',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(DeviceFrame, {
      w: 390,
      h: 780,
      label: "Banco Andino \xB7 $240K \xB7 Commit at risk"
    }, /*#__PURE__*/React.createElement(SellerMobile, {
      startTab: "opps",
      forceDeal: "OPP-2041"
    })), /*#__PURE__*/React.createElement(DeviceFrame, {
      w: 390,
      h: 780,
      label: "Grupo Pac\xEDfico \xB7 $310K \xB7 healthy"
    }, /*#__PURE__*/React.createElement(SellerMobile, {
      startTab: "opps",
      forceDeal: "OPP-2088"
    }))));
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ScreenHead, {
    eyebrow: "Responsive",
    title: "Manager tablet",
    meta: "1024 \xD7 768 \xB7 72px icon rail, Copilot as a launcher, funnel and sellers kept. The KPI cluster drops to Forecast / Quota / Gap."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(DeviceFrame, {
    w: 1024,
    h: 768,
    label: "Landscape tablet \u2014 full funnel drill-down retained"
  }, /*#__PURE__*/React.createElement(ManagerTablet, {
    onOpen: onOpen
  }))));
}
Object.assign(window, {
  ResponsiveScreen,
  SellerMobile,
  ManagerTablet,
  MobileSheet,
  DeviceFrame
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "product_screens/Responsive.jsx", error: String((e && e.message) || e) }); }

// product_screens/SellerScreens.jsx
try { (() => {
/* Seller: Standard workspace, Focus mode, Guided mode */

function FocusToday({
  onOpen,
  limit = 3
}) {
  const deals = D.guidedQueue.map(D.byId).filter(o => o.risks.length).slice(0, limit);
  return /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Focus today",
    subtitle: `${deals.length} actions may materially affect your quarter`,
    action: /*#__PURE__*/React.createElement(Badge, {
      tone: "risk"
    }, K(deals.reduce((s, d) => s + d.amount, 0)), " exposed")
  }), /*#__PURE__*/React.createElement(CardContent, {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 10
    }
  }, deals.map(o => /*#__PURE__*/React.createElement(NextBestAction, {
    key: o.id,
    customer: `${o.customer} · ${o.brand}`,
    amount: o.amount,
    category: catLabel[o.forecastCategory],
    severity: o.health.status === 'CRITICAL' ? 'CRITICAL' : o.health.status === 'AT_RISK' ? 'HIGH' : 'WARNING',
    risk: o.risks[0],
    suggestion: o.nextAction,
    primaryLabel: "Log activity",
    onOpen: () => onOpen(o)
  }))));
}
function AttentionList({
  onOpen
}) {
  const deals = D.opportunities.filter(o => o.seller === D.users.seller.name && o.status === 'OPEN');
  return /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Opportunities requiring attention",
    subtitle: "Your open portfolio, worst health first",
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "ghost",
      iconAfter: /*#__PURE__*/React.createElement(Icon, {
        name: "ArrowUpRight",
        size: 14
      })
    }, "All 16")
  }), /*#__PURE__*/React.createElement(CardContent, {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 8
    }
  }, [...deals].sort((a, b) => a.health.score - b.health.score).map(o => /*#__PURE__*/React.createElement(OppRow, {
    key: o.id,
    opp: o,
    onOpen: onOpen,
    dense: true
  }))));
}
function MeetingsCard({
  onOpen,
  limit = 5
}) {
  const items = D.meetings.slice(0, limit);
  return /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Customer meetings",
    subtitle: "Next five working days"
  }), /*#__PURE__*/React.createElement(CardContent, {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 8
    }
  }, items.map(m => /*#__PURE__*/React.createElement("div", {
    key: m.time + m.who,
    style: {
      display: 'grid',
      gridTemplateColumns: 'auto minmax(0,1fr) auto',
      gap: 11,
      alignItems: 'center',
      padding: '9px 11px',
      borderRadius: 11,
      border: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: 'center',
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 10,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, m.day.slice(0, 3)), /*#__PURE__*/React.createElement("b", {
    className: "tnum",
    style: {
      fontSize: 12
    }
  }, m.time)), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      display: 'block',
      fontSize: 13,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, m.who), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 11,
      color: 'var(--text-muted)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, m.what)), m.ctx ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onOpen(D.byId(m.opportunityId)),
    style: {
      border: 'none',
      background: 'none',
      padding: 0,
      cursor: 'pointer',
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "brand"
  }, m.ctx)) : /*#__PURE__*/React.createElement(Badge, {
    tone: "outline"
  }, "Internal")))));
}
function RisksCard({
  onOpen
}) {
  const rows = D.opportunities.filter(o => o.seller === D.users.seller.name && o.alerts.length);
  return /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Risks on my deals",
    subtitle: "Deterministic signals \xB7 colour, icon and label"
  }), /*#__PURE__*/React.createElement(CardContent, {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 12
    }
  }, rows.map(o => /*#__PURE__*/React.createElement("div", {
    key: o.id,
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onOpen(o),
    style: {
      border: 'none',
      background: 'none',
      padding: 0,
      cursor: 'pointer',
      minWidth: 0,
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      fontSize: 13,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block'
    }
  }, o.customer)), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 6,
      flex: 'none'
    }
  }, o.alerts.map(a => /*#__PURE__*/React.createElement(RiskBadge, {
    key: a.code,
    severity: a.severity,
    code: a.code
  })))), /*#__PURE__*/React.createElement(StageVelocity, {
    stage: o.stage.name,
    daysInStage: o.daysInStage,
    benchmarkDays: o.benchmarkDays
  }))), !rows.length ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, "No open risks on your deals.") : null));
}
function SellerFunnelCard({
  onOpen
}) {
  const [stage, setStage] = React.useState(null);
  return /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "My funnel",
    subtitle: "Select a stage to break it down here"
  }), /*#__PURE__*/React.createElement(CardContent, null, /*#__PURE__*/React.createElement(SalesFunnel, {
    stages: D.sellerFunnel,
    selectedStage: stage,
    onSelectStage: setStage,
    renderDetail: s => /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr)',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        font: 'var(--type-meta)',
        color: 'var(--text-muted)'
      }
    }, s.name.toUpperCase(), " \u2014 ", s.count, " opportunities \xB7 ", K(s.amount), " \xB7 ", s.conversion, "% historical conversion"), D.opportunities.filter(o => o.seller === D.users.seller.name && o.stage.name === s.name).map(o => /*#__PURE__*/React.createElement(OppRow, {
      key: o.id,
      opp: o,
      onOpen: onOpen,
      dense: true
    })))
  })));
}
function SellerStandard({
  onOpen
}) {
  const s = D.seller;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ScreenHead, {
    eyebrow: "My sales workspace",
    title: "What should I do today?",
    meta: `${D.users.seller.name} · ${D.users.seller.team} · ${D.period} · ${D.periodRange} · ${D.week}`,
    action: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      size: "sm",
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "Upload",
        size: 15
      })
    }, "Update forecast"), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "Plus",
        size: 15
      })
    }, "New opportunity"))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(SellerLead, {
    quota: s.quota,
    billed: s.billed,
    forecast: s.forecast,
    gap: s.gap,
    likely: s.likelyAttainment,
    confidence: s.confidence,
    delta: s.deltaSinceReview,
    secondary: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(QuotaProgress, {
      quota: s.quota,
      billed: s.billed,
      forecast: s.forecast - s.billed,
      label: "My quota attainment"
    }), /*#__PURE__*/React.createElement(MetricStrip, {
      items: [{
        label: 'Commit',
        value: K(s.commit),
        detail: '4 opportunities'
      }, {
        label: 'Backlog',
        value: K(s.backlog),
        detail: '1 awaiting billing'
      }, {
        label: 'Pipeline coverage',
        value: s.coverage.toFixed(1) + '×',
        detail: 'of remaining gap'
      }, {
        label: 'Margin',
        value: s.margin.toFixed(1) + '%',
        detail: 'threshold 10%',
        tone: 'var(--success)'
      }, {
        label: 'At risk',
        value: String(s.atRisk),
        detail: 'deals with signals',
        tone: 'var(--danger)'
      }]
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1fr)',
      gap: 16,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(FocusToday, {
    onOpen: onOpen
  }), /*#__PURE__*/React.createElement(SellerFunnelCard, {
    onOpen: onOpen
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1fr)',
      gap: 16,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(AttentionList, {
    onOpen: onOpen
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(MeetingsCard, {
    onOpen: onOpen
  }), /*#__PURE__*/React.createElement(RisksCard, {
    onOpen: onOpen
  })))));
}
function SellerFocus({
  onOpen
}) {
  const s = D.seller;
  const critical = D.opportunities.filter(o => o.seller === D.users.seller.name && o.health.status !== 'HEALTHY' && o.status === 'OPEN');
  const priorities = D.guidedQueue.map(D.byId).filter(o => o.risks.length).slice(0, 3);
  const [done, setDone] = React.useState([]);
  const toggle = id => setDone(d => d.includes(id) ? d.filter(x => x !== id) : [...d, id]);
  const secured = priorities.filter(o => done.includes(o.id)).reduce((t, o) => t + o.amount, 0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 760,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(ScreenHead, {
    eyebrow: "Focus mode",
    title: "Close the gap",
    meta: `${K(s.gap)} to quota · ${D.period} · 7 weeks left`
  }), /*#__PURE__*/React.createElement(ModeBanner, {
    mode: "Focus",
    progress: `${done.length} of ${priorities.length} committed`
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: true,
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, "Objective \xB7 likely attainment"), /*#__PURE__*/React.createElement("p", {
    className: "tnum",
    style: {
      margin: '6px 0 0',
      fontSize: 52,
      fontWeight: 600,
      letterSpacing: '-0.04em',
      lineHeight: 1,
      color: 'var(--warning)'
    }
  }, s.likelyAttainment.toFixed(1), "%"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '7px 0 0',
      font: 'var(--type-body)',
      color: 'var(--text-muted)'
    }
  }, K(s.gap), " remaining against a ", K(s.quota), " quota")), /*#__PURE__*/React.createElement(QuotaProgress, {
    quota: s.quota,
    billed: s.billed,
    forecast: s.forecast - s.billed,
    label: "Progress"
  })), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Today's commitments",
    subtitle: "Three moves, in order \u2014 tick each one as you make it",
    action: /*#__PURE__*/React.createElement(Badge, {
      tone: done.length === priorities.length ? 'positive' : 'brand'
    }, done.length, " of ", priorities.length, " done", secured ? ' · ' + K(secured) + ' worked' : '')
  }), /*#__PURE__*/React.createElement(CardContent, {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 10
    }
  }, priorities.map((o, i) => {
    const isDone = done.includes(o.id);
    return /*#__PURE__*/React.createElement("div", {
      key: o.id,
      style: {
        display: 'grid',
        gridTemplateColumns: 'auto minmax(0,1fr)',
        gap: 12,
        alignItems: 'start',
        opacity: isDone ? 0.55 : 1,
        transition: 'opacity var(--dur-base) var(--ease-standard)'
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => toggle(o.id),
      "aria-pressed": isDone,
      "aria-label": isDone ? 'Mark not done' : 'Mark done',
      style: {
        display: 'grid',
        placeItems: 'center',
        width: 26,
        height: 26,
        borderRadius: 999,
        marginTop: 4,
        flex: 'none',
        cursor: 'pointer',
        border: '1px solid',
        borderColor: isDone ? 'transparent' : 'var(--border-strong)',
        background: isDone ? 'var(--success)' : 'var(--surface)',
        color: isDone ? '#fff' : 'var(--text-muted)',
        fontSize: 12,
        fontWeight: 700
      }
    }, isDone ? /*#__PURE__*/React.createElement(Icon, {
      name: "Check",
      size: 14
    }) : /*#__PURE__*/React.createElement("span", {
      className: "tnum"
    }, i + 1)), /*#__PURE__*/React.createElement(NextBestAction, {
      customer: `${o.customer} · ${o.brand}`,
      amount: o.amount,
      category: catLabel[o.forecastCategory],
      severity: o.health.status === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      risk: o.risks[0],
      suggestion: o.nextAction,
      primaryLabel: isDone ? 'Logged' : 'Log activity',
      onPrimary: () => toggle(o.id),
      onOpen: () => onOpen(o)
    }));
  }), done.length === priorities.length ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      padding: 12,
      borderRadius: 11,
      background: 'var(--success-soft)',
      color: 'var(--success)',
      font: 'var(--type-body)',
      fontWeight: 600
    }
  }, "All three committed. ", K(secured), " of exposed pipeline worked today.") : null)), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Critical opportunities",
    subtitle: `${critical.length} deals need evidence before the forecast call`
  }), /*#__PURE__*/React.createElement(CardContent, {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 8
    }
  }, critical.map(o => /*#__PURE__*/React.createElement(OppRow, {
    key: o.id,
    opp: o,
    onOpen: onOpen,
    dense: true
  })))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-meta)',
      color: 'var(--text-muted)',
      textAlign: 'center'
    }
  }, "Funnel, brand analytics, meetings and portfolio tables are hidden in Focus mode. Switch to Standard to see them.")));
}
function SellerGuided({
  onOpen,
  onAskCopilot,
  onExit
}) {
  const queue = D.guidedQueue.map(D.byId);
  const [i, setI] = React.useState(0);
  const [log, setLog] = React.useState([]);
  const [nextStep, setNextStep] = React.useState('');
  const [custom, setCustom] = React.useState('');
  const [otherOpen, setOtherOpen] = React.useState(false);
  const o = queue[i];
  React.useEffect(() => {
    setOtherOpen(false);
    setCustom('');
  }, [i]);
  const record = what => {
    setLog(l => [...l, `${o.customer}: ${what}`]);
    setNextStep('');
    setCustom('');
    setOtherOpen(false);
    if (i < queue.length - 1) setI(i + 1);else onExit();
  };
  const choices = ['Call the economic buyer', 'Request the purchase order', 'Book a technical session', 'Send the revised proposal', 'Re-qualify the budget'];
  // The system's recommendation, derived from the deal's missing evidence.
  const recommended = o.missing.some(m => /purchase order/i.test(m)) ? 'Request the purchase order' : o.missing.some(m => /buyer/i.test(m)) ? 'Call the economic buyer' : o.missing.some(m => /budget/i.test(m)) ? 'Re-qualify the budget' : o.missing.some(m => /scope|requirement|criteria/i.test(m)) ? 'Book a technical session' : 'Send the revised proposal';
  const chosen = otherOpen ? custom.trim() : nextStep;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 900,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 16,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-brand)'
    }
  }, "Guided review"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '5px 0 0',
      fontSize: 26,
      fontWeight: 600,
      letterSpacing: '-0.035em'
    }
  }, queue.length, " opportunities require review")), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    onClick: onExit
  }, "Leave review")), /*#__PURE__*/React.createElement(ModeBanner, {
    mode: "Guided",
    progress: `${log.length} recorded`
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      fontSize: 13,
      fontWeight: 600,
      flex: 'none'
    }
  }, i + 1, " of ", queue.length), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 6,
      borderRadius: 999,
      background: 'var(--surface-sunken)',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${(i + 1) / queue.length * 100}%`,
      height: '100%',
      borderRadius: 999,
      background: 'var(--brand)',
      transition: 'width var(--dur-base) var(--ease-out)'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-meta)',
      color: 'var(--text-muted)',
      flex: 'none'
    }
  }, log.length, " decisions recorded")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1.35fr) minmax(0,1fr)',
      gap: 16,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: `${o.customer} · ${o.title}`,
    subtitle: `${o.id} · ${o.brand} via ${o.partner} · ${o.seller}`,
    action: /*#__PURE__*/React.createElement("b", {
      className: "tnum",
      style: {
        fontSize: 24,
        fontWeight: 600,
        letterSpacing: '-0.03em'
      }
    }, K(o.amount))
  }), /*#__PURE__*/React.createElement(CardContent, {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "brand"
  }, o.stage.code, "% \xB7 ", o.stage.name), /*#__PURE__*/React.createElement(Badge, {
    uppercase: true
  }, catLabel[o.forecastCategory]), o.alerts.map(a => /*#__PURE__*/React.createElement(RiskBadge, {
    key: a.code,
    severity: a.severity,
    code: a.code
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, "Last activity ", o.lastActivity)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--danger)'
    }
  }, "Missing information"), o.missing.length ? o.missing.map(m => /*#__PURE__*/React.createElement("span", {
    key: m,
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      font: 'var(--type-meta)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "CircleDashed",
    size: 13,
    style: {
      color: 'var(--danger)'
    }
  }), m)) : /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, "Nothing missing.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, "Current risk"), o.risks.length ? o.risks.map(r => /*#__PURE__*/React.createElement("span", {
    key: r,
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'flex-start',
      font: 'var(--type-meta)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "TriangleAlert",
    size: 13,
    style: {
      color: 'var(--warning)',
      marginTop: 2
    }
  }), /*#__PURE__*/React.createElement("span", null, r))) : /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, "No open risk signals."))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 13,
      borderRadius: 11,
      background: 'var(--surface-brand-soft)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--teal-800)'
    }
  }, "Suggested action"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '5px 0 0',
      font: 'var(--type-body)'
    }
  }, o.nextAction)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, "Choose the next step"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8
    }
  }, choices.map(c => {
    const on = !otherOpen && nextStep === c;
    const rec = c === recommended;
    return /*#__PURE__*/React.createElement("button", {
      key: c,
      type: "button",
      onClick: () => {
        setOtherOpen(false);
        setNextStep(c);
      },
      "aria-pressed": on,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        minHeight: 34,
        padding: '0 12px',
        borderRadius: 999,
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 600,
        border: rec && !on ? '1px solid var(--brand)' : '1px solid',
        borderColor: on ? 'transparent' : rec ? 'var(--brand)' : 'var(--border)',
        background: on ? 'var(--brand)' : rec ? 'var(--surface-brand-soft)' : 'var(--surface)',
        color: on ? 'var(--text-on-brand)' : rec ? 'var(--teal-800)' : 'var(--text-primary)'
      }
    }, rec ? /*#__PURE__*/React.createElement(Icon, {
      name: "Sparkles",
      size: 12
    }) : null, c, rec ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        opacity: 0.8,
        textTransform: 'uppercase',
        letterSpacing: 'var(--tracking-label)'
      }
    }, "rec") : null);
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      setOtherOpen(true);
      setNextStep('');
    },
    "aria-pressed": otherOpen,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      minHeight: 34,
      padding: '0 12px',
      borderRadius: 999,
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 600,
      border: '1px dashed',
      borderColor: otherOpen ? 'var(--brand)' : 'var(--border-strong)',
      background: otherOpen ? 'var(--surface-brand-soft)' : 'var(--surface)',
      color: otherOpen ? 'var(--teal-800)' : 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Pencil",
    size: 12
  }), "Other\u2026")), otherOpen ? /*#__PURE__*/React.createElement(Input, {
    autoFocus: true,
    value: custom,
    onChange: e => setCustom(e.target.value),
    placeholder: "Describe the next step in your own words",
    hint: "Custom steps are recorded the same way as the structured options."
  }) : null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, "Recommended: ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--text-brand)'
    }
  }, recommended), " \u2014 derived from what this deal is missing.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      borderTop: '1px solid var(--border)',
      paddingTop: 14
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    disabled: !chosen,
    onClick: () => record(`next step — ${chosen}`),
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Check",
      size: 15
    })
  }, "Add next step"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "outline",
    onClick: () => record('follow-up scheduled'),
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "CalendarPlus",
      size: 15
    })
  }, "Schedule follow-up"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "outline",
    onClick: () => record('stage updated'),
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "ArrowUpDown",
      size: 15
    })
  }, "Update stage"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "outline",
    onClick: () => onAskCopilot(`Why is ${o.customer} at risk?`, o),
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Bot",
      size: 15
    })
  }, "Ask Copilot"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost",
    onClick: () => i < queue.length - 1 ? setI(i + 1) : onExit()
  }, "Skip"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "outline",
    onClick: () => i < queue.length - 1 ? setI(i + 1) : onExit(),
    iconAfter: /*#__PURE__*/React.createElement(Icon, {
      name: "ChevronRight",
      size: 15
    })
  }, "Next"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: true
  }, /*#__PURE__*/React.createElement(OpportunityHealth, {
    score: o.health.score,
    status: o.health.status,
    size: "lg",
    showFactors: true,
    factors: o.health.factors
  })), /*#__PURE__*/React.createElement(Card, {
    pad: true
  }, /*#__PURE__*/React.createElement(StageVelocity, {
    stage: o.stage.name,
    daysInStage: o.daysInStage,
    benchmarkDays: o.benchmarkDays
  })), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Review queue",
    subtitle: `${queue.length - i - 1} remaining after this one`
  }), /*#__PURE__*/React.createElement(CardContent, {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 6
    }
  }, queue.map((q, ix) => /*#__PURE__*/React.createElement("button", {
    key: q.id,
    type: "button",
    onClick: () => setI(ix),
    style: {
      display: 'grid',
      gridTemplateColumns: 'auto minmax(0,1fr) auto',
      gap: 9,
      alignItems: 'center',
      textAlign: 'left',
      padding: '7px 9px',
      borderRadius: 9,
      cursor: 'pointer',
      border: '1px solid',
      borderColor: ix === i ? 'var(--brand)' : 'transparent',
      background: ix === i ? 'var(--surface-brand-soft)' : 'transparent'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      fontSize: 11,
      color: 'var(--text-muted)',
      width: 14
    }
  }, ix + 1), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 0,
      fontSize: 12,
      fontWeight: 600,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, q.customer), /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      fontSize: 11,
      color: 'var(--text-muted)'
    }
  }, K(q.amount)))))), log.length ? /*#__PURE__*/React.createElement(Card, {
    pad: true
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, "Recorded this session"), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: '8px 0 0',
      padding: 0,
      listStyle: 'none',
      display: 'grid',
      gap: 5
    }
  }, log.map((l, ix) => /*#__PURE__*/React.createElement("li", {
    key: ix,
    style: {
      font: 'var(--type-meta)',
      display: 'flex',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Check",
    size: 13,
    style: {
      color: 'var(--success)',
      marginTop: 2
    }
  }), l)))) : null)));
}
Object.assign(window, {
  SellerStandard,
  SellerFocus,
  SellerGuided,
  FocusToday,
  MeetingsCard,
  AttentionList,
  SellerFunnelCard,
  RisksCard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "product_screens/SellerScreens.jsx", error: String((e && e.message) || e) }); }

// product_screens/SharedScreens.jsx
try { (() => {
/* Shared: Contextual Copilot showcase, Data Import wizard */

function CopilotRail({
  ctx,
  deal,
  messages,
  onAsk
}) {
  const suggestions = deal ? D.copilot.deal : D.copilot[ctx] || D.copilot.manager;
  const insights = deal ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(CopilotInsight, {
    tone: "risk",
    defaultOpen: true,
    headline: `${deal.risks.length} open risk signals`,
    detail: `${deal.customer} · ${K(deal.amount)} · ${catLabel[deal.forecastCategory]}`,
    items: deal.risks.map(r => ({
      label: r
    }))
  }), deal.missing.length ? /*#__PURE__*/React.createElement(CopilotInsight, {
    headline: `${deal.missing.length} pieces of evidence missing`,
    items: deal.missing.map(m => ({
      label: m
    }))
  }) : null) : ctx === 'seller' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(CopilotInsight, {
    tone: "risk",
    defaultOpen: true,
    headline: "3 deals put your quota at risk",
    detail: `${K(612000)} of your ${K(D.seller.forecast)} forecast`,
    items: D.guidedQueue.map(D.byId).filter(o => o.seller === D.users.seller.name && o.risks.length).map(o => ({
      label: o.customer,
      value: K(o.amount),
      opportunityId: o.id
    }))
  }), /*#__PURE__*/React.createElement(CopilotInsight, {
    headline: "Banco Andino has not been touched in 9 days",
    detail: "It carries $240K of your Commit"
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(CopilotInsight, {
    tone: "risk",
    defaultOpen: true,
    headline: "4 meaningful changes since Monday",
    detail: `Net −${K(183000)} on the quarter`,
    items: D.movements.slice(0, 4).map(m => ({
      label: m.reason,
      value: (m.delta > 0 ? '+' : '−') + K(Math.abs(m.delta)),
      opportunityId: m.opportunityId
    }))
  }), /*#__PURE__*/React.createElement(CopilotInsight, {
    headline: "2 purchase orders missing above 75%",
    detail: `${K(404000)} of billing exposure this quarter`,
    items: [{
      label: 'Banco Andino · core banking renewal',
      value: K(240000),
      opportunityId: 'OPP-2041'
    }, {
      label: 'Seguros Continental · contact centre',
      value: K(164000),
      opportunityId: 'OPP-2158'
    }]
  }), /*#__PURE__*/React.createElement(CopilotInsight, {
    tone: "risk",
    headline: "Diego Andrade is at 52.0% likely attainment",
    detail: "1.4\xD7 coverage, 6 deals at risk, 8.2% margin"
  }));
  return /*#__PURE__*/React.createElement(CopilotPanel, {
    context: deal ? 'Opportunity' : ctx === 'seller' ? 'Seller workspace' : 'Manager dashboard',
    contextLabel: deal ? `Context · ${deal.customer} · ${K(deal.amount)} · ${catLabel[deal.forecastCategory]}` : `Context · ${ctx === 'seller' ? D.users.seller.name : D.tenant} · ${D.period}`,
    suggestions: suggestions,
    messages: messages,
    onAsk: onAsk,
    insights: insights,
    style: {
      height: '100%',
      minHeight: 0
    }
  });
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
function CopilotShowcase({
  onOpen
}) {
  const [ctx, setCtx] = React.useState('manager');
  const [msgs, setMsgs] = React.useState({
    manager: [],
    seller: [],
    deal: []
  });
  const deal = ctx === 'deal' ? D.byId('OPP-2041') : null;
  const ask = q => {
    const key = ctx;
    setMsgs(m => ({
      ...m,
      [key]: [...m[key], {
        role: 'user',
        text: q
      }, {
        role: 'assistant',
        text: copilotAnswer(q, deal)
      }]
    }));
  };
  const contexts = [['manager', 'Manager dashboard'], ['seller', 'Seller workspace'], ['deal', 'Opportunity — Banco Andino']];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ScreenHead, {
    eyebrow: "Contextual sales Copilot",
    title: "The same panel, three contexts",
    meta: "Suggestions, proactive insights and answers all change with what the user is looking at. This is not a generic chat window."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    role: "group",
    "aria-label": "Copilot context",
    style: {
      display: 'inline-flex',
      gap: 2,
      padding: 3,
      borderRadius: 9,
      background: 'var(--surface-muted)',
      width: 'fit-content'
    }
  }, contexts.map(([id, label]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    type: "button",
    "aria-pressed": ctx === id,
    onClick: () => setCtx(id),
    style: {
      height: 30,
      padding: '0 13px',
      borderRadius: 7,
      border: 'none',
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 600,
      background: ctx === id ? 'var(--surface)' : 'transparent',
      color: ctx === id ? 'var(--text-primary)' : 'var(--text-muted)',
      boxShadow: ctx === id ? 'var(--shadow-card)' : 'none'
    }
  }, label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr) minmax(0,380px)',
      gap: 16,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: true,
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, "What the Copilot can see right now"), ctx === 'manager' ? /*#__PURE__*/React.createElement(MetricStrip, {
    items: [{
      label: 'Forecast',
      value: K(D.team.forecast)
    }, {
      label: 'Quota',
      value: K(D.team.quota)
    }, {
      label: 'Gap',
      value: K(D.team.gap),
      tone: 'var(--danger)'
    }, {
      label: 'At risk',
      value: String(D.team.atRisk)
    }]
  }) : null, ctx === 'seller' ? /*#__PURE__*/React.createElement(MetricStrip, {
    items: [{
      label: 'Forecast',
      value: K(D.seller.forecast)
    }, {
      label: 'Quota',
      value: K(D.seller.quota)
    }, {
      label: 'Gap',
      value: K(D.seller.gap),
      tone: 'var(--danger)'
    }, {
      label: 'Meetings',
      value: '5'
    }]
  }) : null, ctx === 'deal' ? /*#__PURE__*/React.createElement(MetricStrip, {
    items: [{
      label: 'Amount',
      value: K(deal.amount)
    }, {
      label: 'Stage',
      value: deal.stage.code + '%'
    }, {
      label: 'Health',
      value: String(deal.health.score),
      tone: 'var(--warning)'
    }, {
      label: 'Confidence',
      value: deal.confidence + '%',
      tone: 'var(--warning)'
    }]
  }) : null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, ctx === 'deal' ? 'On an opportunity the Copilot answers about evidence, justification and preparation.' : ctx === 'seller' ? 'On the seller workspace it answers about today, priorities and the personal gap.' : 'On the manager dashboard it answers about quota risk, movement and intervention.')), ctx === 'deal' ? /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Opportunity in context",
    subtitle: "The Copilot reads the same record the drawer shows",
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "outline",
      onClick: () => onOpen(deal)
    }, "Open drawer")
  }), /*#__PURE__*/React.createElement(CardContent, {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(OppRow, {
    opp: deal,
    onOpen: onOpen
  }), /*#__PURE__*/React.createElement(OpportunityHealth, {
    score: deal.health.score,
    status: deal.health.status,
    showFactors: true,
    factors: deal.health.factors
  }))) : /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Proactive insights are pinned, not asked for",
    subtitle: "The panel opens with findings, never with a greeting"
  }), /*#__PURE__*/React.createElement(CardContent, {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 8
    }
  }, D.movements.slice(0, 3).map(m => /*#__PURE__*/React.createElement("button", {
    key: m.label,
    type: "button",
    onClick: () => onOpen(D.byId(m.opportunityId)),
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr) auto',
      gap: 10,
      alignItems: 'center',
      textAlign: 'left',
      padding: '10px 12px',
      borderRadius: 11,
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      display: 'block',
      fontSize: 13,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, m.label), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 11,
      color: 'var(--text-muted)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, m.reason)), /*#__PURE__*/React.createElement("b", {
    className: "tnum",
    style: {
      fontSize: 13,
      color: m.delta > 0 ? 'var(--success)' : 'var(--danger)'
    }
  }, m.delta > 0 ? '+' : '−', K(Math.abs(m.delta)))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 620,
      minHeight: 0,
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)'
    }
  }, /*#__PURE__*/React.createElement(CopilotRail, {
    ctx: ctx,
    deal: deal,
    messages: msgs[ctx],
    onAsk: ask
  })))));
}

/* ---------- Import wizard ---------- */
const IMPORT_STEPS = ['Upload', 'Template detection', 'Column mapping', 'Data validation', 'Data quality', 'Preview', 'Import', 'Results'];
function ImportWizardScreen() {
  const [step, setStep] = React.useState(5);
  const [mapping, setMapping] = React.useState(() => Object.fromEntries(D.import.mapping.map(m => [m.source, m.target])));
  const im = D.import;
  const conf = Object.fromEntries(im.mapping.map(m => [m.source, m.confidence]));
  const rows = im.mapping.map(m => ({
    source: m.source,
    target: mapping[m.source],
    confidence: conf[m.source]
  }));
  const primary = ['Detect template', 'Confirm template', 'Validate mapping', 'Review data quality', 'Preview 438 rows', 'Import 438 rows', 'View results', 'Done'][step - 1];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ScreenHead, {
    eyebrow: "Sales data import",
    title: im.file,
    meta: `${im.rows} rows · uploaded 4 minutes ago by ${D.users.manager.name} · ${D.period}`,
    action: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "ghost"
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      onClick: () => setStep(Math.min(8, step + 1))
    }, primary))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '208px minmax(0,1fr)',
      gap: 20,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: true
  }, /*#__PURE__*/React.createElement("ol", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 2
    }
  }, IMPORT_STEPS.map((s, ix) => {
    const n = ix + 1;
    const done = n < step;
    const now = n === step;
    return /*#__PURE__*/React.createElement("li", {
      key: s
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => setStep(n),
      style: {
        display: 'grid',
        gridTemplateColumns: 'auto minmax(0,1fr)',
        alignItems: 'center',
        gap: 9,
        width: '100%',
        minHeight: 36,
        padding: '0 8px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        fontSize: 12.5,
        fontWeight: now ? 600 : 500,
        background: now ? 'var(--surface-brand-soft)' : 'transparent',
        color: now ? 'var(--teal-800)' : done ? 'var(--text-primary)' : 'var(--text-muted)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'grid',
        placeItems: 'center',
        width: 19,
        height: 19,
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 700,
        background: done ? 'var(--success)' : now ? 'var(--brand)' : 'var(--surface-sunken)',
        color: done || now ? '#fff' : 'var(--text-muted)'
      }
    }, done ? '✓' : n), /*#__PURE__*/React.createElement("span", {
      style: {
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, s)));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 16
    }
  }, step === 1 ? /*#__PURE__*/React.createElement(Card, {
    pad: true,
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 14,
      justifyItems: 'center',
      padding: 48,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "FileSpreadsheet",
    size: 34,
    style: {
      color: 'var(--brand)'
    }
  }), /*#__PURE__*/React.createElement("b", {
    style: {
      fontSize: 17
    }
  }, "Drop a forecast workbook"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-body)',
      color: 'var(--text-muted)',
      maxWidth: 420
    }
  }, "Excel or CSV. Sheets named Oppty, Facturado Daily, Resumen and Canales Proceso are recognised automatically. Nothing is written until you approve the data-quality review."), /*#__PURE__*/React.createElement(Button, {
    onClick: () => setStep(2)
  }, "Choose file")) : null, step === 2 ? /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Template detection",
    subtitle: "Matched against your saved import templates"
  }), /*#__PURE__*/React.createElement(CardContent, {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'auto minmax(0,1fr) auto',
      gap: 12,
      alignItems: 'center',
      padding: 14,
      borderRadius: 12,
      border: '1px solid var(--brand)',
      background: 'var(--surface-brand-soft)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Check",
    size: 18,
    style: {
      color: 'var(--teal-800)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      display: 'block',
      fontSize: 14,
      color: 'var(--teal-800)'
    }
  }, im.template.name, " detected \u2014 ", im.template.confidence, "% mapping confidence"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-meta)',
      color: 'var(--teal-800)'
    }
  }, "Last used 12 Nov 2026 \xB7 8 of 8 columns recognised \xB7 2 need confirmation")), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    onClick: () => setStep(3)
  }, "Use template")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 6
    }
  }, [['Sheet "Oppty"', '477 rows'], ['Sheet "Facturado Daily"', 'present — used for billed reconciliation'], ['Sheet "Resumen"', 'present — ignored'], ['Sheet "Canales Proceso"', 'present — partner mapping']].map(([a, b]) => /*#__PURE__*/React.createElement("div", {
    key: a,
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr) auto',
      gap: 10,
      padding: '9px 11px',
      borderRadius: 9,
      border: '1px solid var(--border)',
      font: 'var(--type-meta)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)'
    }
  }, a), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, b)))), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    style: {
      justifySelf: 'start'
    }
  }, "Start from a blank mapping instead"))) : null, step === 3 || step === 4 ? /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Column mapping",
    subtitle: "Workbook column \u2192 platform field, with detector confidence",
    action: /*#__PURE__*/React.createElement(Badge, {
      tone: "warning"
    }, "2 below 65%")
  }), /*#__PURE__*/React.createElement(CardContent, null, /*#__PURE__*/React.createElement(ImportMapper, {
    templateName: im.template.name,
    templateConfidence: im.template.confidence,
    fields: im.fields,
    rows: rows,
    onChange: (src, target) => setMapping(m => ({
      ...m,
      [src]: target
    }))
  }), step === 4 ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, "Validation running"), ['Stage values resolved against the tenant ladder', 'Amounts normalised (thousands separators, currency symbols)', 'Spanish and English months parsed', 'Fingerprints derived for rows without an external id'].map(v => /*#__PURE__*/React.createElement("span", {
    key: v,
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      font: 'var(--type-meta)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Check",
    size: 13,
    style: {
      color: 'var(--success)'
    }
  }), v))) : null)) : null, step === 5 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Data quality",
    subtitle: `${im.rows} rows analysed · nothing is written until you approve`,
    action: /*#__PURE__*/React.createElement(Badge, {
      tone: "risk"
    }, im.review, " need review")
  }), /*#__PURE__*/React.createElement(CardContent, null, /*#__PURE__*/React.createElement(DataQualityPanel, {
    counts: {
      ready: im.ready,
      warnings: im.warnings,
      invalid: im.review,
      duplicates: im.duplicates
    },
    issues: im.issues,
    onReview: () => {}
  }))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Inconsistencies by type",
    subtitle: "Grouped so a whole class can be resolved at once"
  }), /*#__PURE__*/React.createElement(CardContent, {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: 10
    }
  }, [['Duplicate customer names', 6, 'Banco Andino / BANCO ANDINO S.A.'], ['Seller name inconsistencies', 11, '"D. Andrade", "VBM: SOFIA T."'], ['Opportunities without amount', 3, 'Rows 88, 254, 401'], ['Invalid months', 2, '"13/2026", "feb-25"'], ['Stage / value inconsistencies', 9, 'Billed at 0 amount']].map(([label, count, eg]) => /*#__PURE__*/React.createElement("div", {
    key: label,
    style: {
      padding: 12,
      borderRadius: 11,
      border: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      fontSize: 12.5
    }
  }, label), /*#__PURE__*/React.createElement("b", {
    className: "tnum",
    style: {
      fontSize: 15,
      color: 'var(--warning)'
    }
  }, count)), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontSize: 11,
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-mono)'
    }
  }, eg), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost",
    style: {
      marginTop: 6,
      paddingLeft: 0
    }
  }, "Resolve all")))))) : null, step === 6 ? /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Preview",
    subtitle: "First rows exactly as they will be written",
    action: /*#__PURE__*/React.createElement(Badge, {
      tone: "positive"
    }, im.ready, " ready")
  }), /*#__PURE__*/React.createElement(CardContent, {
    style: {
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, ['Opportunity', 'Customer', 'Seller', 'Stage', 'Amount', 'Close'].map(h => /*#__PURE__*/React.createElement("th", {
    key: h,
    style: {
      padding: '8px 10px',
      textAlign: 'left',
      fontSize: 10,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, D.opportunities.slice(0, 6).map(o => /*#__PURE__*/React.createElement("tr", {
    key: o.id,
    style: {
      borderTop: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px'
    }
  }, o.title), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px'
    }
  }, o.customer), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px'
    }
  }, o.seller), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px'
    }
  }, o.stage.code, "% ", o.stage.name), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px'
    },
    className: "tnum"
  }, K(o.amount)), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px'
    },
    className: "tnum"
  }, o.closeDate))))))) : null, step === 7 ? /*#__PURE__*/React.createElement(Card, {
    pad: true,
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 14,
      justifyItems: 'center',
      padding: 48,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Loader",
    size: 30,
    style: {
      color: 'var(--brand)'
    }
  }), /*#__PURE__*/React.createElement("b", {
    style: {
      fontSize: 17
    }
  }, "Importing 438 rows\u2026"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 320,
      height: 8,
      borderRadius: 999,
      background: 'var(--surface-sunken)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '72%',
      height: '100%',
      background: 'var(--brand)'
    }
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, "Idempotent by fingerprint \u2014 re-running this file will not duplicate records.")) : null, step === 8 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Card, {
    pad: true
  }, /*#__PURE__*/React.createElement(MetricStrip, {
    items: [{
      label: 'Created',
      value: '311',
      tone: 'var(--success)'
    }, {
      label: 'Updated',
      value: '127'
    }, {
      label: 'Skipped (duplicate)',
      value: '6'
    }, {
      label: 'Failed',
      value: '8',
      tone: 'var(--danger)'
    }, {
      label: 'Elapsed',
      value: '11s'
    }]
  })), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Results",
    subtitle: "Failures are downloadable as a correction workbook",
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "outline",
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "Download",
        size: 14
      })
    }, "Download 8 failed rows")
  }), /*#__PURE__*/React.createElement(CardContent, {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 8
    }
  }, im.issues.filter(i => i.severity === 'invalid').map(i => /*#__PURE__*/React.createElement("div", {
    key: i.row,
    style: {
      display: 'grid',
      gridTemplateColumns: 'auto auto minmax(0,1fr)',
      gap: 10,
      alignItems: 'baseline',
      padding: '9px 11px',
      borderRadius: 9,
      border: '1px solid var(--border)',
      font: 'var(--type-meta)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      fontFamily: 'var(--font-mono)',
      color: 'var(--text-muted)'
    }
  }, "Row ", i.row), /*#__PURE__*/React.createElement(RiskBadge, {
    severity: "CRITICAL",
    label: "Failed"
  }), /*#__PURE__*/React.createElement("span", null, i.message))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "outline",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Save",
      size: 14
    })
  }, "Save as import template"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost"
  }, "Open the imported pipeline"))))) : null)));
}
Object.assign(window, {
  CopilotRail,
  CopilotShowcase,
  ImportWizardScreen,
  copilotAnswer
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "product_screens/SharedScreens.jsx", error: String((e && e.message) || e) }); }

// product_screens/Shell.jsx
try { (() => {
const D = window.SIP2;
const money = (n, opts) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: Math.abs(n) >= 1000000 ? 'compact' : 'standard',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
  ...opts
}).format(n);
const K = n => Math.abs(n) >= 1000000 ? '$' + (n / 1000000).toFixed(2) + 'M' : '$' + Math.round(n / 1000) + 'K';
const catLabel = {
  PIPELINE: 'Pipeline',
  BEST_CASE: 'Best case',
  COMMIT: 'Commit',
  UPSIDE: 'Upside',
  CLOSED: 'Closed',
  OMITTED: 'Omitted'
};
const SCREENS = [{
  section: 'Seller',
  items: [{
    id: 'seller-standard',
    label: 'Seller Standard'
  }, {
    id: 'seller-focus',
    label: 'Seller Focus'
  }, {
    id: 'seller-guided',
    label: 'Seller Guided'
  }, {
    id: 'opportunity-drawer',
    label: 'Opportunity Drawer'
  }]
}, {
  section: 'Manager',
  items: [{
    id: 'manager-command',
    label: 'Revenue Command Center'
  }, {
    id: 'manager-funnel',
    label: 'Funnel Expanded'
  }, {
    id: 'manager-review',
    label: 'Forecast Review'
  }, {
    id: 'manager-sellers',
    label: 'Seller Performance'
  }]
}, {
  section: 'Shared',
  items: [{
    id: 'shared-copilot',
    label: 'Contextual Copilot'
  }, {
    id: 'shared-import',
    label: 'Data Import'
  }]
}, {
  section: 'Responsive',
  items: [{
    id: 'seller-mobile',
    label: 'Seller Mobile'
  }, {
    id: 'manager-tablet',
    label: 'Manager Tablet'
  }, {
    id: 'opportunity-mobile',
    label: 'Opportunity Mobile Sheet'
  }]
}];

/* ---------- prototype chrome: the Product Screens navigator ---------- */
function ScreenNav({
  screen,
  onScreen
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-inverse)',
      color: '#fff',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      flexWrap: 'wrap',
      borderBottom: '1px solid var(--border-inverse)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 24,
      height: 24,
      borderRadius: 7,
      background: 'var(--accent-bright)',
      color: '#08242c',
      fontWeight: 700,
      fontSize: 10
    }
  }, "SI"), /*#__PURE__*/React.createElement("b", {
    style: {
      fontSize: 12,
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase'
    }
  }, "Product screens")), SCREENS.map(g => /*#__PURE__*/React.createElement("span", {
    key: g.section,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-inverse-muted)',
      flex: 'none'
    }
  }, g.section), g.items.map(i => {
    const on = screen === i.id;
    return /*#__PURE__*/React.createElement("button", {
      key: i.id,
      type: "button",
      onClick: () => onScreen(i.id),
      "aria-pressed": on,
      style: {
        height: 26,
        padding: '0 10px',
        borderRadius: 999,
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        border: '1px solid',
        borderColor: on ? 'transparent' : 'var(--border-inverse)',
        background: on ? 'var(--accent-bright)' : 'transparent',
        color: on ? '#08242c' : 'var(--text-inverse-muted)',
        transition: 'var(--transition-color)'
      }
    }, i.label);
  }))));
}

/* ---------- product chrome ---------- */
const NAV = {
  seller: [{
    id: 'seller-standard',
    label: 'My workspace',
    icon: 'Sun'
  }, {
    id: 'opportunity-drawer',
    label: 'Opportunities',
    icon: 'Target'
  }, {
    id: 'seller-guided',
    label: 'Guided review',
    icon: 'ListChecks'
  }, {
    id: 'shared-import',
    label: 'Import',
    icon: 'FileSpreadsheet'
  }],
  manager: [{
    id: 'manager-command',
    label: 'Command center',
    icon: 'Gauge'
  }, {
    id: 'manager-funnel',
    label: 'Pipeline',
    icon: 'Filter'
  }, {
    id: 'manager-review',
    label: 'Forecast review',
    icon: 'ClipboardCheck'
  }, {
    id: 'manager-sellers',
    label: 'Team',
    icon: 'UsersRound'
  }, {
    id: 'shared-import',
    label: 'Import',
    icon: 'FileSpreadsheet'
  }]
};
function SideNav({
  persona,
  screen,
  onScreen,
  mode
}) {
  const items = NAV[persona];
  const user = D.users[persona];
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      background: 'var(--surface-inverse)',
      color: '#fff',
      padding: '20px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 22,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '0 6px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 36,
      height: 36,
      borderRadius: 11,
      background: 'var(--accent-bright)',
      color: '#08242c',
      fontWeight: 700,
      fontSize: 13,
      flex: 'none'
    }
  }, "SI"), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      display: 'block',
      fontSize: 13
    }
  }, "Sales Intelligence"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 11,
      color: 'var(--text-inverse-muted)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, D.tenant))), /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Primary",
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 3
    }
  }, items.map(i => {
    const on = screen === i.id;
    return /*#__PURE__*/React.createElement("button", {
      key: i.id,
      type: "button",
      onClick: () => onScreen(i.id),
      "aria-current": on ? 'page' : undefined,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minHeight: 40,
        padding: '0 10px',
        borderRadius: 10,
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        fontSize: 13,
        fontWeight: 500,
        background: on ? 'oklch(0.865 0.127 207 / 0.1)' : 'transparent',
        color: on ? 'var(--accent-bright)' : 'oklch(0.68 0.02 220)',
        transition: 'var(--transition-color)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: i.icon,
      size: 17
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, i.label));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 10
    }
  }, mode && mode !== 'Standard' ? /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 12,
      background: 'oklch(0.865 0.127 207 / 0.12)',
      border: '1px solid var(--border-inverse)',
      padding: 10
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 10,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--accent-bright)',
      fontWeight: 600
    }
  }, mode, " mode"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '3px 0 0',
      fontSize: 11,
      color: 'var(--text-inverse-muted)'
    }
  }, mode === 'Focus' ? 'Secondary analytics hidden.' : mode === 'Guided' ? 'Step workflow in progress.' : 'Sequential review in progress.')) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      borderRadius: 12,
      border: '1px solid var(--border-inverse)',
      background: 'oklch(1 0 0 / 0.05)',
      padding: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 30,
      height: 30,
      borderRadius: 999,
      background: 'var(--accent-bright)',
      color: '#08242c',
      fontSize: 11,
      fontWeight: 700,
      flex: 'none'
    }
  }, user.name.split(' ').map(p => p[0]).join('')), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      display: 'block',
      fontSize: 12,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, user.name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 11,
      color: 'var(--text-inverse-muted)'
    }
  }, user.role)))));
}
function TopBar({
  mode,
  onMode,
  onCommand,
  period,
  onPeriod,
  right
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '0 24px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onCommand,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      height: 34,
      flex: '0 1 260px',
      minWidth: 0,
      padding: '0 11px',
      borderRadius: 8,
      border: '1px solid var(--border)',
      background: 'var(--surface-muted)',
      color: 'var(--text-muted)',
      fontSize: 13,
      cursor: 'pointer',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Search",
    size: 15
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      textAlign: 'left',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, "Search or run a command"), /*#__PURE__*/React.createElement("kbd", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      border: '1px solid var(--border)',
      borderRadius: 4,
      padding: '1px 4px',
      flex: 'none'
    }
  }, "\u2318K")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flex: 'none'
    }
  }, right, /*#__PURE__*/React.createElement(PeriodSelector, {
    periods: D.periods,
    value: period,
    onChange: onPeriod
  }), onMode ? /*#__PURE__*/React.createElement("div", {
    role: "group",
    "aria-label": "Cognitive mode",
    style: {
      display: 'inline-flex',
      gap: 2,
      padding: 3,
      borderRadius: 8,
      background: 'var(--surface-muted)'
    }
  }, ['Standard', 'Focus', 'Guided', 'Review'].map(m => /*#__PURE__*/React.createElement("button", {
    key: m,
    type: "button",
    "aria-pressed": mode === m,
    onClick: () => onMode(m),
    style: {
      height: 26,
      padding: '0 9px',
      borderRadius: 6,
      border: 'none',
      cursor: 'pointer',
      fontSize: 11,
      fontWeight: 600,
      background: mode === m ? 'var(--surface)' : 'transparent',
      color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
      boxShadow: mode === m ? 'var(--shadow-card)' : 'none'
    }
  }, m))) : null));
}
function CollapsedRail({
  onExpand,
  count
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderLeft: '1px solid var(--border)',
      background: 'var(--surface)',
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      alignContent: 'start',
      justifyItems: 'center',
      padding: '12px 6px',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onExpand,
    "aria-label": "Expand Copilot",
    title: "Expand Copilot",
    style: {
      position: 'relative',
      display: 'grid',
      placeItems: 'center',
      width: 40,
      height: 40,
      borderRadius: 11,
      border: '1px solid var(--border)',
      background: 'var(--surface-inverse-2)',
      color: 'var(--accent-bright)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Bot",
    size: 18
  }), count ? /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      position: 'absolute',
      top: -5,
      right: -5,
      minWidth: 17,
      height: 17,
      borderRadius: 999,
      background: 'var(--danger)',
      color: '#fff',
      fontSize: 10,
      fontWeight: 700,
      display: 'grid',
      placeItems: 'center',
      padding: '0 4px'
    }
  }, count) : null), /*#__PURE__*/React.createElement("span", {
    style: {
      writingMode: 'vertical-rl',
      fontSize: 10,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, "Copilot"));
}
function Workspace({
  persona,
  screen,
  onScreen,
  mode,
  onMode,
  period,
  onPeriod,
  onCommand,
  copilot,
  copilotOpen = true,
  onToggleCopilot,
  copilotCount,
  headerRight,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '232px minmax(0,1fr)',
      gridTemplateRows: 'minmax(0,1fr)',
      minHeight: 0,
      height: '100%',
      background: 'var(--bg-canvas)'
    }
  }, /*#__PURE__*/React.createElement(SideNav, {
    persona: persona,
    screen: screen,
    onScreen: onScreen,
    mode: mode
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gridTemplateRows: '56px minmax(0,1fr)'
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    mode: onMode ? mode : null,
    onMode: onMode,
    onCommand: onCommand,
    period: period,
    onPeriod: onPeriod,
    right: headerRight
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      minHeight: 0,
      display: 'grid',
      gridTemplateColumns: copilot ? copilotOpen ? 'minmax(0,1fr) 348px' : 'minmax(0,1fr) 56px' : 'minmax(0,1fr)'
    }
  }, /*#__PURE__*/React.createElement("main", {
    style: {
      padding: 24,
      minWidth: 0,
      overflowY: 'auto'
    }
  }, children), copilot && copilotOpen ? /*#__PURE__*/React.createElement("div", {
    style: {
      borderLeft: '1px solid var(--border)',
      background: 'var(--surface)',
      padding: 16,
      minWidth: 0,
      minHeight: 0,
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gridTemplateRows: 'auto minmax(0,1fr)',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onToggleCopilot,
    style: {
      justifySelf: 'end',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      minHeight: 28,
      padding: '0 9px',
      borderRadius: 8,
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      color: 'var(--text-muted)',
      fontSize: 11,
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "PanelRightClose",
    size: 13
  }), "Collapse"), copilot) : copilot ? /*#__PURE__*/React.createElement(CollapsedRail, {
    onExpand: onToggleCopilot,
    count: copilotCount
  }) : null)));
}
function ScreenHead({
  eyebrow,
  title,
  meta,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 16,
      marginBottom: 18,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--text-brand)'
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '5px 0 0',
      fontSize: 26,
      fontWeight: 600,
      letterSpacing: '-0.035em'
    }
  }, title), meta ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, meta) : null), action ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flex: 'none'
    }
  }, action) : null);
}

/* Dominant metric block — Forecast / Quota / Gap outrank everything else. */
function LeadMetrics({
  forecast,
  quota,
  gap,
  likely,
  delta,
  deltaLabel,
  confidence,
  confidenceBand,
  secondary
}) {
  return /*#__PURE__*/React.createElement(Card, {
    pad: true,
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr)',
      gap: 20,
      alignItems: 'end'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, "Forecast"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "tnum",
    style: {
      margin: '6px 0 0',
      fontSize: 44,
      fontWeight: 600,
      letterSpacing: '-0.04em',
      lineHeight: 1
    }
  }, K(forecast)), delta !== undefined && delta !== null ? /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 8px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      background: delta < 0 ? 'var(--danger-soft)' : 'var(--success-soft)',
      color: delta < 0 ? 'var(--danger)' : 'var(--success)'
    }
  }, delta < 0 ? '▼' : '▲', " ", K(Math.abs(delta))) : null), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, likely.toFixed(1), "% likely attainment", delta !== undefined && delta !== null ? ' · ' + (deltaLabel || 'since the last forecast review') : ''), confidence !== undefined ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 5,
      maxWidth: 300
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, "Forecast confidence"), /*#__PURE__*/React.createElement("b", {
    className: "tnum",
    style: {
      fontSize: 13,
      color: confidence >= 65 ? 'var(--success)' : confidence >= 40 ? 'var(--warning)' : 'var(--danger)'
    }
  }, confidence, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 7,
      borderRadius: 999,
      background: 'var(--surface-sunken)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: confidence + '%',
      height: '100%',
      background: confidence >= 65 ? 'var(--success)' : confidence >= 40 ? 'var(--warning)' : 'var(--danger)'
    }
  })), confidenceBand ? /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      fontSize: 11,
      color: 'var(--text-muted)'
    }
  }, "Range ", K(confidenceBand.low), " \u2013 ", K(confidenceBand.high), " at 80% confidence") : null) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      borderLeft: '1px solid var(--border)',
      paddingLeft: 20
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, "Quota"), /*#__PURE__*/React.createElement("p", {
    className: "tnum",
    style: {
      margin: '6px 0 0',
      fontSize: 30,
      fontWeight: 600,
      letterSpacing: '-0.035em',
      lineHeight: 1
    }
  }, K(quota)), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, D.period, " \xB7 ", D.periodRange.split(' – ')[1])), /*#__PURE__*/React.createElement("div", {
    style: {
      borderLeft: '1px solid var(--border)',
      paddingLeft: 20
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--danger)'
    }
  }, "Gap"), /*#__PURE__*/React.createElement("p", {
    className: "tnum",
    style: {
      margin: '6px 0 0',
      fontSize: 30,
      fontWeight: 600,
      letterSpacing: '-0.035em',
      lineHeight: 1,
      color: 'var(--danger)'
    }
  }, K(gap)), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, "to close before ", D.periodRange.split(' – ')[1]))), secondary);
}

/* Seller hierarchy: likely attainment and remaining gap lead; forecast and billed support. */
function SellerLead({
  quota,
  billed,
  forecast,
  gap,
  likely,
  confidence,
  delta,
  secondary
}) {
  const short = likely < 100;
  return /*#__PURE__*/React.createElement(Card, {
    pad: true,
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1fr)',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, "Likely attainment"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "tnum",
    style: {
      margin: '6px 0 0',
      fontSize: 52,
      fontWeight: 600,
      letterSpacing: '-0.04em',
      lineHeight: 1,
      color: short ? 'var(--warning)' : 'var(--success)'
    }
  }, likely.toFixed(1), "%"), delta !== undefined && delta !== null ? /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 8px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      background: delta < 0 ? 'var(--danger-soft)' : 'var(--success-soft)',
      color: delta < 0 ? 'var(--danger)' : 'var(--success)'
    }
  }, delta < 0 ? '▼' : '▲', " ", K(Math.abs(delta))) : null), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '7px 0 0',
      font: 'var(--type-body)',
      color: 'var(--text-muted)'
    }
  }, "of your ", K(quota), " quota", confidence !== undefined ? ' · ' + confidence + '% forecast confidence' : '')), /*#__PURE__*/React.createElement("div", {
    style: {
      borderLeft: '1px solid var(--border)',
      paddingLeft: 20
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--danger)'
    }
  }, "Remaining gap"), /*#__PURE__*/React.createElement("p", {
    className: "tnum",
    style: {
      margin: '6px 0 0',
      fontSize: 40,
      fontWeight: 600,
      letterSpacing: '-0.04em',
      lineHeight: 1,
      color: 'var(--danger)'
    }
  }, K(gap)), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '7px 0 0',
      font: 'var(--type-body)',
      color: 'var(--text-muted)'
    }
  }, "to close before ", D.periodRange.split(' – ')[1]), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      display: 'flex',
      gap: 18,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 10,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, "Forecast"), /*#__PURE__*/React.createElement("b", {
    className: "tnum",
    style: {
      fontSize: 16
    }
  }, K(forecast))), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 10,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, "Billed"), /*#__PURE__*/React.createElement("b", {
    className: "tnum",
    style: {
      fontSize: 16,
      color: 'var(--success)'
    }
  }, K(billed)))))), secondary);
}

/* States the cognitive contract of the active mode — modes are workflows, not skins. */
const MODE_CONTRACT = {
  Standard: {
    icon: 'LayoutDashboard',
    what: 'Explore',
    why: 'Full working surface. Everything is available; nothing is sequenced for you.'
  },
  Focus: {
    icon: 'Crosshair',
    what: 'Commit to today',
    why: 'One goal, three moves, marked done as you go. Analytics, funnel and portfolio tables are withheld.'
  },
  Guided: {
    icon: 'ListChecks',
    what: 'Work a queue',
    why: 'One opportunity at a time, one decision per step, every decision recorded.'
  },
  Review: {
    icon: 'ClipboardCheck',
    what: 'Decide sequentially',
    why: 'Seller call against system confidence, evidence against risk, then a recorded verdict per deal. Built to run a live forecast call.'
  }
};
function ModeBanner({
  mode,
  progress
}) {
  const c = MODE_CONTRACT[mode];
  if (!c || mode === 'Standard') return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'auto minmax(0,1fr) auto',
      gap: 12,
      alignItems: 'center',
      padding: '10px 14px',
      borderRadius: 12,
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 30,
      height: 30,
      borderRadius: 9,
      background: 'var(--surface-brand-soft)',
      color: 'var(--teal-800)',
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: c.icon,
    size: 16
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      fontSize: 12.5
    }
  }, mode, " mode \xB7 ", c.what), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 11,
      color: 'var(--text-muted)'
    }
  }, c.why)), progress ? /*#__PURE__*/React.createElement(Badge, {
    tone: "brand"
  }, progress) : null);
}

/* The prototype is drawn at one reference size; production stays fluid. */
function ViewportNote() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'auto minmax(0,1fr)',
      gap: 10,
      alignItems: 'center',
      padding: '9px 20px',
      background: 'var(--surface-muted)',
      borderBottom: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Info",
    size: 14,
    style: {
      color: 'var(--text-muted)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: 'var(--text-muted)',
      textWrap: 'pretty'
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--text-primary)'
    }
  }, "1440 \xD7 1024 is a reference design viewport only \u2014 production must remain fluid."), ' ', "Every layout here is built on minmax(0,1fr) and auto-fit tracks rather than fixed pixel columns; see Responsive \u2192 Manager Tablet (1024) and Seller Mobile (390) for the same screens at other widths."));
}
function MetricStrip({
  items
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(104px, 1fr))',
      gap: 1,
      background: 'var(--border)',
      borderRadius: 10,
      overflow: 'hidden'
    }
  }, items.map(i => /*#__PURE__*/React.createElement("div", {
    key: i.label,
    style: {
      background: 'var(--surface)',
      padding: '11px 13px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 10,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, i.label), /*#__PURE__*/React.createElement("p", {
    className: "tnum",
    style: {
      margin: '4px 0 0',
      fontSize: 17,
      fontWeight: 600,
      letterSpacing: '-0.02em',
      color: i.tone || 'var(--text-primary)'
    }
  }, i.value), i.detail ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 0',
      fontSize: 11,
      color: 'var(--text-muted)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, i.detail) : null)));
}
function InsightBanner({
  onAction,
  compact
}) {
  const i = D.insight;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 10,
      padding: 16,
      borderRadius: 14,
      border: '1px solid var(--danger)',
      background: 'var(--danger-soft)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "TriangleAlert",
    size: 15,
    style: {
      color: 'var(--danger)'
    }
  }), /*#__PURE__*/React.createElement("b", {
    style: {
      fontSize: 15,
      letterSpacing: '-0.02em'
    }
  }, i.headline)), compact ? null : /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-body)',
      textWrap: 'pretty'
    }
  }, i.body), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, i.actions.map((a, ix) => /*#__PURE__*/React.createElement(Button, {
    key: a,
    size: "sm",
    variant: ix ? 'outline' : 'primary',
    onClick: () => onAction && onAction(a)
  }, a))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 11,
      color: 'var(--text-muted)'
    }
  }, "Rule-based interpretation \xB7 recalculated 08:04 today"));
}
function OppRow({
  opp,
  onOpen,
  dense
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onOpen(opp),
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr) auto auto',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      textAlign: 'left',
      padding: dense ? '9px 11px' : '12px 13px',
      borderRadius: 11,
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      cursor: 'pointer',
      transition: 'var(--transition-color)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      display: 'block',
      fontSize: 13,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, opp.customer, " \xB7 ", opp.title), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 11,
      color: 'var(--text-muted)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, opp.seller, " \xB7 ", opp.brand, " \xB7 closes ", opp.closeDate)), opp.alerts.length ? /*#__PURE__*/React.createElement(RiskBadge, {
    severity: opp.alerts[0].severity,
    code: opp.alerts[0].code
  }) : /*#__PURE__*/React.createElement(Badge, {
    tone: "positive"
  }, "On track"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement(OpportunityHealth, {
    score: opp.health.score,
    status: opp.health.status,
    size: "sm"
  }), /*#__PURE__*/React.createElement("b", {
    className: "tnum",
    style: {
      fontSize: 13,
      minWidth: 52,
      textAlign: 'right'
    }
  }, K(opp.amount))));
}
Object.assign(window, {
  D,
  money,
  K,
  catLabel,
  SCREENS,
  ScreenNav,
  SideNav,
  TopBar,
  Workspace,
  CollapsedRail,
  ScreenHead,
  LeadMetrics,
  SellerLead,
  MetricStrip,
  InsightBanner,
  OppRow,
  ModeBanner,
  ModeContract: MODE_CONTRACT,
  ViewportNote
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "product_screens/Shell.jsx", error: String((e && e.message) || e) }); }

// product_screens/data.js
try { (() => {
// Sales Intelligence Platform — synthetic but realistic demo dataset.
// Fictional customers and partners. Brands are real vendor names as used in the product seed.
window.SIP2 = (() => {
  const STAGES = [{
    code: 0,
    name: 'Initial',
    token: 'discovery'
  }, {
    code: 25,
    name: 'Qualified',
    token: 'qualified'
  }, {
    code: 50,
    name: 'Proposal',
    token: 'proposal'
  }, {
    code: 75,
    name: 'Commit',
    token: 'commit'
  }, {
    code: 90,
    name: 'Backlog',
    token: 'backlog'
  }, {
    code: 100,
    name: 'Billed',
    token: 'billed'
  }];
  const stage = code => STAGES.find(s => s.code === code);
  const o = x => ({
    status: 'OPEN',
    currency: 'USD',
    ...x,
    stage: stage(x.stageCode)
  });
  const opportunities = [o({
    id: 'OPP-2041',
    title: 'Core banking infrastructure renewal',
    customer: 'Banco Andino',
    seller: 'Sofía Torres',
    brand: 'Lenovo',
    partner: 'Andes Technology',
    amount: 240000,
    stageCode: 75,
    forecastCategory: 'COMMIT',
    suggestedCategory: 'UPSIDE',
    confidence: 62,
    closeDate: '19 Dec 2026',
    billingDate: '15 Jan 2027',
    margin: 9.2,
    daysInStage: 38,
    benchmarkDays: 21,
    health: {
      score: 48,
      status: 'AT_RISK',
      factors: [{
        code: 'CLOSE_DATE_MOVED',
        impact: -16,
        message: 'Closing date moved twice (Nov 14 → Dec 5 → Dec 19)'
      }, {
        code: 'MISSING_PO',
        impact: -14,
        message: 'No purchase order at 75%'
      }, {
        code: 'STAGE_STAGNATION',
        impact: -10,
        message: '38 days in Commit, benchmark 21'
      }, {
        code: 'BUYER_IDENTIFIED',
        impact: 8,
        message: 'Economic buyer identified and engaged'
      }]
    },
    alerts: [{
      code: 'MISSING_PO',
      severity: 'CRITICAL'
    }, {
      code: 'LOW_MARGIN',
      severity: 'WARNING'
    }],
    evidence: ['Proposal accepted by IT and Finance', 'Economic buyer identified (CFO)', 'Technical validation complete'],
    risks: ['Closing date moved twice', 'Purchase order missing', 'Margin 9.2% below the 10% threshold'],
    missing: ['Purchase order number', 'Signed billing schedule'],
    nextAction: 'Call the CFO to confirm the purchase order before Friday.',
    lastActivity: '9 days ago · discovery call',
    stageHistory: [{
      from: 'Proposal',
      to: 'Commit',
      by: 'Sofía Torres',
      at: '12 Nov 2026'
    }, {
      from: 'Qualified',
      to: 'Proposal',
      by: 'Sofía Torres',
      at: '28 Sep 2026'
    }, {
      from: 'Initial',
      to: 'Qualified',
      by: 'Sofía Torres',
      at: '3 Sep 2026'
    }]
  }), o({
    id: 'OPP-2088',
    title: 'Hyperconverged data platform',
    customer: 'Grupo Pacífico',
    seller: 'Camila Paz',
    brand: 'Nutanix',
    partner: 'CloudBridge',
    amount: 310000,
    stageCode: 75,
    forecastCategory: 'COMMIT',
    suggestedCategory: 'COMMIT',
    confidence: 84,
    closeDate: '12 Dec 2026',
    billingDate: '20 Dec 2026',
    margin: 15.4,
    daysInStage: 12,
    benchmarkDays: 21,
    health: {
      score: 86,
      status: 'HEALTHY',
      factors: [{
        code: 'PO_RECEIVED',
        impact: 12,
        message: 'Purchase order received (PO-88412)'
      }, {
        code: 'ON_PACE',
        impact: 6,
        message: 'Moving faster than the stage benchmark'
      }]
    },
    alerts: [],
    evidence: ['Purchase order received', 'Proof of concept signed off', 'Budget confirmed for FY27'],
    risks: [],
    missing: [],
    nextAction: 'Confirm the delivery window with logistics.',
    lastActivity: '2 days ago · commercial review',
    stageHistory: [{
      from: 'Proposal',
      to: 'Commit',
      by: 'Camila Paz',
      at: '8 Dec 2026'
    }, {
      from: 'Qualified',
      to: 'Proposal',
      by: 'Camila Paz',
      at: '14 Oct 2026'
    }]
  }), o({
    id: 'OPP-2103',
    title: 'Policy platform storage refresh',
    customer: 'Seguros Continental',
    seller: 'Diego Andrade',
    brand: 'Hitachi',
    partner: 'Pacific IT',
    amount: 186000,
    stageCode: 75,
    forecastCategory: 'COMMIT',
    suggestedCategory: 'BEST_CASE',
    confidence: 41,
    closeDate: '22 Dec 2026',
    billingDate: null,
    margin: 7.4,
    daysInStage: 44,
    benchmarkDays: 21,
    health: {
      score: 36,
      status: 'CRITICAL',
      factors: [{
        code: 'NO_ACTIVITY',
        impact: -18,
        message: 'No activity logged in 16 days'
      }, {
        code: 'LOW_MARGIN',
        impact: -12,
        message: 'Margin 7.4% below the 10% threshold'
      }, {
        code: 'STAGE_STAGNATION',
        impact: -14,
        message: '44 days in Commit, benchmark 21'
      }]
    },
    alerts: [{
      code: 'STAGE_STAGNATION',
      severity: 'HIGH'
    }, {
      code: 'LOW_MARGIN',
      severity: 'WARNING'
    }, {
      code: 'NO_ACTIVITY',
      severity: 'CRITICAL'
    }],
    evidence: ['Technical requirements documented'],
    risks: ['No activity in 16 days', 'No economic buyer identified', 'Competitor evaluation in progress'],
    missing: ['Economic buyer', 'Next step date', 'Purchase order number'],
    nextAction: 'Re-qualify: confirm whether the budget still exists for this quarter.',
    lastActivity: '16 days ago · email',
    stageHistory: [{
      from: 'Proposal',
      to: 'Commit',
      by: 'Diego Andrade',
      at: '6 Nov 2026'
    }]
  }), o({
    id: 'OPP-2117',
    title: 'Campus workplace modernization',
    customer: 'Universidad Metropolitana',
    seller: 'Sofía Torres',
    brand: 'HP',
    partner: 'Digital Core',
    amount: 148000,
    stageCode: 50,
    forecastCategory: 'BEST_CASE',
    suggestedCategory: 'BEST_CASE',
    confidence: 71,
    closeDate: '28 Jan 2027',
    billingDate: null,
    margin: 13.1,
    daysInStage: 16,
    benchmarkDays: 24,
    health: {
      score: 74,
      status: 'HEALTHY',
      factors: [{
        code: 'ON_PACE',
        impact: 5,
        message: 'On pace against the stage benchmark'
      }]
    },
    alerts: [],
    evidence: ['Public tender requirements confirmed', 'Reference visit completed'],
    risks: ['Public tender award date may slip past the quarter'],
    missing: ['Award date confirmation'],
    nextAction: 'Confirm the tender award date with procurement.',
    lastActivity: '3 days ago · workshop',
    stageHistory: [{
      from: 'Qualified',
      to: 'Proposal',
      by: 'Sofía Torres',
      at: '24 Nov 2026'
    }]
  }), o({
    id: 'OPP-2124',
    title: 'Store network refresh — 140 branches',
    customer: 'RetailNova',
    seller: 'Andrés Coba',
    brand: 'Dell',
    partner: 'Nova Systems',
    amount: 275000,
    stageCode: 50,
    forecastCategory: 'BEST_CASE',
    suggestedCategory: 'COMMIT',
    confidence: 78,
    closeDate: '18 Dec 2026',
    billingDate: null,
    margin: 11.9,
    daysInStage: 9,
    benchmarkDays: 24,
    health: {
      score: 79,
      status: 'HEALTHY',
      factors: [{
        code: 'MULTI_STAKEHOLDER',
        impact: 7,
        message: 'Operations and IT both sponsoring'
      }]
    },
    alerts: [],
    evidence: ['Pilot approved in 12 stores', 'Rollout plan agreed with operations'],
    risks: ['Rollout depends on store closures in January'],
    missing: ['Signed rollout calendar'],
    nextAction: 'Agree the January rollout calendar with store operations.',
    lastActivity: 'Yesterday · rollout planning',
    stageHistory: [{
      from: 'Qualified',
      to: 'Proposal',
      by: 'Andrés Coba',
      at: '1 Dec 2026'
    }]
  }), o({
    id: 'OPP-2131',
    title: 'Disaster recovery site build',
    customer: 'Cooperativa Andes',
    seller: 'Valeria Núñez',
    brand: 'Nutanix',
    partner: 'CloudBridge',
    amount: 198000,
    stageCode: 25,
    forecastCategory: 'PIPELINE',
    suggestedCategory: 'PIPELINE',
    confidence: 34,
    closeDate: '26 Feb 2027',
    billingDate: null,
    margin: 12.6,
    daysInStage: 41,
    benchmarkDays: 18,
    health: {
      score: 52,
      status: 'AT_RISK',
      factors: [{
        code: 'STAGE_STAGNATION',
        impact: -15,
        message: '41 days in Qualified, benchmark 18'
      }]
    },
    alerts: [{
      code: 'STAGE_STAGNATION',
      severity: 'WARNING'
    }],
    evidence: ['Regulatory driver confirmed'],
    risks: ['Stalled 41 days in Qualified', 'No budget owner identified'],
    missing: ['Budget owner', 'Technical scope'],
    nextAction: 'Identify the budget owner and book a scoping session.',
    lastActivity: '11 days ago · call',
    stageHistory: [{
      from: 'Initial',
      to: 'Qualified',
      by: 'Valeria Núñez',
      at: '29 Oct 2026'
    }]
  }), o({
    id: 'OPP-2140',
    title: 'Clinical imaging storage expansion',
    customer: 'Hospital San Lucas',
    seller: 'Camila Paz',
    brand: 'Hitachi',
    partner: 'Pacific IT',
    amount: 132000,
    stageCode: 90,
    forecastCategory: 'COMMIT',
    suggestedCategory: 'COMMIT',
    confidence: 92,
    closeDate: '2 Dec 2026',
    billingDate: '18 Dec 2026',
    margin: 16.2,
    daysInStage: 6,
    benchmarkDays: 12,
    health: {
      score: 91,
      status: 'HEALTHY',
      factors: [{
        code: 'PO_RECEIVED',
        impact: 14,
        message: 'Purchase order received (PO-77201)'
      }]
    },
    alerts: [],
    evidence: ['Purchase order received', 'Delivery scheduled'],
    risks: [],
    missing: [],
    nextAction: 'Confirm invoicing with finance for the December close.',
    lastActivity: '4 days ago · delivery planning',
    stageHistory: [{
      from: 'Commit',
      to: 'Backlog',
      by: 'Camila Paz',
      at: '28 Nov 2026'
    }]
  }), o({
    id: 'OPP-2146',
    title: 'Textile ERP server consolidation',
    customer: 'Textiles Ribera',
    seller: 'Diego Andrade',
    brand: 'Lenovo',
    partner: 'Andes Technology',
    amount: 94000,
    stageCode: 25,
    forecastCategory: 'PIPELINE',
    suggestedCategory: 'PIPELINE',
    confidence: 38,
    closeDate: '14 Mar 2027',
    billingDate: null,
    margin: 8.8,
    daysInStage: 27,
    benchmarkDays: 18,
    health: {
      score: 58,
      status: 'AT_RISK',
      factors: [{
        code: 'LOW_MARGIN',
        impact: -9,
        message: 'Margin 8.8% below threshold'
      }]
    },
    alerts: [{
      code: 'LOW_MARGIN',
      severity: 'WARNING'
    }],
    evidence: ['Current hardware end of support in Q2'],
    risks: ['Margin below threshold', 'No next step scheduled'],
    missing: ['Next step date', 'Decision criteria'],
    nextAction: 'Book the technical assessment and rebuild the margin case.',
    lastActivity: '8 days ago · email',
    stageHistory: [{
      from: 'Initial',
      to: 'Qualified',
      by: 'Diego Andrade',
      at: '12 Nov 2026'
    }]
  }), o({
    id: 'OPP-2151',
    title: 'Branch endpoint fleet renewal',
    customer: 'Banco Andino',
    seller: 'Valeria Núñez',
    brand: 'HP',
    partner: 'Digital Core',
    amount: 122000,
    stageCode: 100,
    status: 'WON',
    forecastCategory: 'CLOSED',
    suggestedCategory: 'CLOSED',
    confidence: 100,
    closeDate: '7 Nov 2026',
    billingDate: '21 Nov 2026',
    margin: 14.8,
    daysInStage: 0,
    benchmarkDays: 0,
    health: {
      score: 96,
      status: 'HEALTHY',
      factors: []
    },
    alerts: [],
    evidence: ['Invoiced INV-4471'],
    risks: [],
    missing: [],
    nextAction: 'None — invoiced.',
    lastActivity: '21 Nov 2026 · invoiced',
    stageHistory: [{
      from: 'Backlog',
      to: 'Billed',
      by: 'Alex Rivera',
      at: '21 Nov 2026'
    }]
  }), o({
    id: 'OPP-2158',
    title: 'Contact centre virtualization',
    customer: 'Seguros Continental',
    seller: 'Andrés Coba',
    brand: 'Dell',
    partner: 'Nova Systems',
    amount: 164000,
    stageCode: 75,
    forecastCategory: 'COMMIT',
    suggestedCategory: 'UPSIDE',
    confidence: 57,
    closeDate: '30 Dec 2026',
    billingDate: null,
    margin: 10.4,
    daysInStage: 25,
    benchmarkDays: 21,
    health: {
      score: 61,
      status: 'AT_RISK',
      factors: [{
        code: 'CLOSE_DATE_MOVED',
        impact: -12,
        message: 'Closing date moved once (Dec 12 → Dec 30)'
      }, {
        code: 'MISSING_PO',
        impact: -10,
        message: 'No purchase order at 75%'
      }]
    },
    alerts: [{
      code: 'MISSING_PO',
      severity: 'HIGH'
    }],
    evidence: ['Proposal accepted', 'Security review passed'],
    risks: ['Closing date moved once', 'Purchase order missing', 'Year-end freeze on new spend'],
    missing: ['Purchase order number'],
    nextAction: 'Ask procurement whether the PO can be issued before the freeze.',
    lastActivity: '5 days ago · procurement call',
    stageHistory: [{
      from: 'Proposal',
      to: 'Commit',
      by: 'Andrés Coba',
      at: '13 Nov 2026'
    }]
  }), o({
    id: 'OPP-2163',
    title: 'Analytics platform expansion',
    customer: 'Grupo Pacífico',
    seller: 'Sofía Torres',
    brand: 'Nutanix',
    partner: 'CloudBridge',
    amount: 208000,
    stageCode: 50,
    forecastCategory: 'BEST_CASE',
    suggestedCategory: 'BEST_CASE',
    confidence: 66,
    closeDate: '5 Feb 2027',
    billingDate: null,
    margin: 13.8,
    daysInStage: 21,
    benchmarkDays: 24,
    health: {
      score: 72,
      status: 'HEALTHY',
      factors: []
    },
    alerts: [],
    evidence: ['Business case approved by the data office'],
    risks: ['Competing internal project for the same budget'],
    missing: ['Budget confirmation for FY27'],
    nextAction: 'Confirm FY27 budget allocation with the data office.',
    lastActivity: '6 days ago · business review',
    stageHistory: [{
      from: 'Qualified',
      to: 'Proposal',
      by: 'Sofía Torres',
      at: '19 Nov 2026'
    }]
  }), o({
    id: 'OPP-2170',
    title: 'Campus network segmentation',
    customer: 'Universidad Metropolitana',
    seller: 'Diego Andrade',
    brand: 'HP',
    partner: 'Digital Core',
    amount: 88000,
    stageCode: 0,
    forecastCategory: 'PIPELINE',
    suggestedCategory: 'PIPELINE',
    confidence: 22,
    closeDate: '30 Mar 2027',
    billingDate: null,
    margin: 11.2,
    daysInStage: 14,
    benchmarkDays: 15,
    health: {
      score: 64,
      status: 'AT_RISK',
      factors: []
    },
    alerts: [],
    evidence: [],
    risks: ['Not yet qualified'],
    missing: ['Requirements', 'Budget', 'Timeline'],
    nextAction: 'Run the discovery workshop scheduled for next week.',
    lastActivity: '2 days ago · intro meeting',
    stageHistory: [{
      from: null,
      to: 'Initial',
      by: 'Diego Andrade',
      at: '25 Nov 2026'
    }]
  }), o({
    id: 'OPP-2176',
    title: 'Warehouse compute refresh',
    customer: 'RetailNova',
    seller: 'Camila Paz',
    brand: 'Lenovo',
    partner: 'Andes Technology',
    amount: 156000,
    stageCode: 90,
    forecastCategory: 'COMMIT',
    suggestedCategory: 'COMMIT',
    confidence: 88,
    closeDate: '9 Dec 2026',
    billingDate: '23 Dec 2026',
    margin: 12.9,
    daysInStage: 8,
    benchmarkDays: 12,
    health: {
      score: 88,
      status: 'HEALTHY',
      factors: [{
        code: 'PO_RECEIVED',
        impact: 13,
        message: 'Purchase order received (PO-90233)'
      }]
    },
    alerts: [],
    evidence: ['Purchase order received'],
    risks: [],
    missing: [],
    nextAction: 'Track delivery for the December billing window.',
    lastActivity: '3 days ago · logistics',
    stageHistory: [{
      from: 'Commit',
      to: 'Backlog',
      by: 'Camila Paz',
      at: '1 Dec 2026'
    }]
  }), o({
    id: 'OPP-2182',
    title: 'Treasury platform HA upgrade',
    customer: 'Cooperativa Andes',
    seller: 'Valeria Núñez',
    brand: 'Dell',
    partner: 'Pacific IT',
    amount: 142000,
    stageCode: 75,
    forecastCategory: 'COMMIT',
    suggestedCategory: 'COMMIT',
    confidence: 74,
    closeDate: '17 Dec 2026',
    billingDate: '8 Jan 2027',
    margin: 11.1,
    daysInStage: 15,
    benchmarkDays: 21,
    health: {
      score: 76,
      status: 'HEALTHY',
      factors: []
    },
    alerts: [],
    evidence: ['Proposal accepted', 'Economic buyer identified'],
    risks: ['Billing date falls into the next quarter'],
    missing: ['Purchase order number'],
    nextAction: 'Request the purchase order to protect December billing.',
    lastActivity: '4 days ago · commercial call',
    stageHistory: [{
      from: 'Proposal',
      to: 'Commit',
      by: 'Valeria Núñez',
      at: '23 Nov 2026'
    }]
  })];
  const byId = id => opportunities.find(x => x.id === id);
  return {
    tenant: 'Andes Technology Distribution',
    period: 'FY26 Q4',
    periodRange: '1 Dec 2026 – 28 Feb 2027',
    week: 'Week 8',
    periods: ['FY26 Q1', 'FY26 Q2', 'FY26 Q3', 'FY26 Q4'],
    currency: 'USD',
    STAGES,
    stage,
    byId,
    opportunities,
    users: {
      seller: {
        name: 'Sofía Torres',
        role: 'Seller',
        team: 'Enterprise · Andean region',
        email: 'sofia@andestech.demo'
      },
      manager: {
        name: 'Morgan Silva',
        role: 'Sales manager',
        team: 'Enterprise · 5 sellers',
        email: 'morgan@andestech.demo'
      }
    },
    seller: {
      quota: 1100000,
      billed: 620000,
      forecast: 940000,
      commit: 550000,
      backlog: 132000,
      gap: 160000,
      likelyAttainment: 85.5,
      coverage: 2.6,
      pipeline: 1580000,
      margin: 12.4,
      atRisk: 3,
      deltaSinceReview: -64000,
      confidence: 71
    },
    team: {
      quota: 4800000,
      billed: 2140000,
      forecast: 3740000,
      commit: 980000,
      backlog: 620000,
      pipeline: 8900000,
      coverage: 2.4,
      gap: 1060000,
      likelyAttainment: 77.9,
      margin: 11.4,
      atRisk: 18,
      forecastAccuracy: 81,
      slippage: 640000,
      deltaSinceReview: -183000,
      lastReview: 'Week 7 review · 18 Dec',
      confidence: 64,
      confidenceBand: {
        low: 3180000,
        high: 4020000
      }
    },
    insight: {
      headline: 'Forecast is $1.06M below quota with 7 weeks left.',
      body: 'Three Commit opportunities worth $590K carry open risk signals — two are missing purchase orders and one has had no activity in 16 days. Diego Andrade accounts for $186K of that and is at 41.4% likely attainment.',
      actions: ['Review the 3 risks', 'Open forecast review']
    },
    funnel: [{
      name: 'Initial',
      token: 'discovery',
      amount: 2980000,
      count: 34,
      atRiskAmount: 520000,
      probability: 0,
      avgAmount: 87600,
      avgDaysInStage: 19,
      atRisk: 6,
      conversion: 41,
      likelyToSlip: 980000
    }, {
      name: 'Qualified',
      token: 'qualified',
      amount: 2240000,
      count: 26,
      atRiskAmount: 430000,
      probability: 25,
      avgAmount: 86100,
      avgDaysInStage: 23,
      atRisk: 5,
      conversion: 54,
      likelyToSlip: 620000
    }, {
      name: 'Proposal',
      token: 'proposal',
      amount: 1680000,
      count: 19,
      atRiskAmount: 355000,
      probability: 50,
      avgAmount: 88400,
      avgDaysInStage: 26,
      atRisk: 4,
      conversion: 62,
      likelyToSlip: 410000
    }, {
      name: 'Commit',
      token: 'commit',
      amount: 980000,
      count: 22,
      atRiskAmount: 590000,
      probability: 75,
      avgAmount: 44500,
      avgDaysInStage: 24,
      atRisk: 3,
      conversion: 81,
      likelyToSlip: 590000
    }, {
      name: 'Backlog',
      token: 'backlog',
      amount: 620000,
      count: 9,
      atRiskAmount: 132000,
      probability: 90,
      avgAmount: 68900,
      avgDaysInStage: 11,
      atRisk: 1,
      conversion: 96,
      likelyToSlip: 130000
    }, {
      name: 'Billed',
      token: 'billed',
      amount: 2140000,
      count: 27,
      atRiskAmount: 0,
      probability: 100,
      avgAmount: 79300,
      avgDaysInStage: 0,
      atRisk: 0,
      conversion: 100,
      likelyToSlip: 0
    }],
    sellerFunnel: [{
      name: 'Qualified',
      token: 'qualified',
      amount: 402000,
      count: 6,
      atRiskAmount: 96000,
      probability: 25,
      avgAmount: 67000,
      avgDaysInStage: 21,
      atRisk: 1,
      conversion: 52,
      likelyToSlip: 96000
    }, {
      name: 'Proposal',
      token: 'proposal',
      amount: 486000,
      count: 5,
      atRiskAmount: 118000,
      probability: 50,
      avgAmount: 97200,
      avgDaysInStage: 19,
      atRisk: 1,
      conversion: 64,
      likelyToSlip: 118000
    }, {
      name: 'Commit',
      token: 'commit',
      amount: 418000,
      count: 4,
      atRiskAmount: 240000,
      probability: 75,
      avgAmount: 104500,
      avgDaysInStage: 27,
      atRisk: 1,
      conversion: 79,
      likelyToSlip: 240000
    }, {
      name: 'Backlog',
      token: 'backlog',
      amount: 132000,
      count: 1,
      atRiskAmount: 0,
      probability: 90,
      avgAmount: 132000,
      avgDaysInStage: 6,
      atRisk: 0,
      conversion: 97,
      likelyToSlip: 0
    }, {
      name: 'Billed',
      token: 'billed',
      amount: 620000,
      count: 7,
      atRiskAmount: 0,
      probability: 100,
      avgAmount: 88500,
      avgDaysInStage: 0,
      atRisk: 0,
      conversion: 100,
      likelyToSlip: 0
    }],
    sellers: [{
      seller: 'Sofía Torres',
      quota: 1100000,
      billed: 620000,
      forecast: 940000,
      coverage: 2.6,
      atRisk: 3,
      margin: 12.4,
      accuracy: 91,
      trend: 4,
      opportunities: 16,
      commit: 550000
    }, {
      seller: 'Camila Paz',
      quota: 950000,
      billed: 540000,
      forecast: 880000,
      coverage: 3.1,
      atRisk: 2,
      margin: 14.1,
      accuracy: 88,
      trend: 2,
      opportunities: 13,
      commit: 442000
    }, {
      seller: 'Andrés Coba',
      quota: 900000,
      billed: 410000,
      forecast: 700000,
      coverage: 2.0,
      atRisk: 4,
      margin: 10.6,
      accuracy: 74,
      trend: -3,
      opportunities: 15,
      commit: 439000
    }, {
      seller: 'Valeria Núñez',
      quota: 850000,
      billed: 260000,
      forecast: 700000,
      coverage: 2.2,
      atRisk: 3,
      margin: 11.8,
      accuracy: 82,
      trend: 6,
      opportunities: 12,
      commit: 340000
    }, {
      seller: 'Diego Andrade',
      quota: 1000000,
      billed: 310000,
      forecast: 520000,
      coverage: 1.4,
      atRisk: 6,
      margin: 8.2,
      accuracy: 68,
      trend: -9,
      opportunities: 14,
      commit: 186000
    }],
    brands: [{
      brand: 'Lenovo',
      amount: 2140000,
      margin: 11.8,
      deals: 24
    }, {
      brand: 'HP',
      amount: 1880000,
      margin: 13.2,
      deals: 21
    }, {
      brand: 'Nutanix',
      amount: 1720000,
      margin: 15.1,
      deals: 14
    }, {
      brand: 'Dell',
      amount: 1540000,
      margin: 10.4,
      deals: 19
    }, {
      brand: 'Hitachi',
      amount: 1160000,
      margin: 8.9,
      deals: 11
    }],
    movements: [{
      label: 'Banco Andino · Core banking renewal',
      delta: -240000,
      reason: 'Close date moved to 19 Dec, purchase order still missing',
      opportunityId: 'OPP-2041'
    }, {
      label: 'Seguros Continental · Policy platform storage',
      delta: -186000,
      reason: 'No activity in 16 days, competitor evaluation opened',
      opportunityId: 'OPP-2103'
    }, {
      label: 'RetailNova · Store network refresh',
      delta: 275000,
      reason: 'Pilot approved, moved Qualified → Proposal',
      opportunityId: 'OPP-2124'
    }, {
      label: 'Seguros Continental · Contact centre virtualization',
      delta: -164000,
      reason: 'Year-end spend freeze, close date moved to 30 Dec',
      opportunityId: 'OPP-2158'
    }, {
      label: 'Hospital San Lucas · Imaging storage',
      delta: 132000,
      reason: 'Purchase order received, moved Commit → Backlog',
      opportunityId: 'OPP-2140'
    }],
    meetings: [{
      day: 'Today',
      time: '09:30',
      who: 'Banco Andino',
      what: 'Purchase order review with CFO',
      ctx: 'Commit · $240K',
      opportunityId: 'OPP-2041'
    }, {
      day: 'Today',
      time: '14:00',
      who: 'Morgan Silva',
      what: 'Forecast preparation (internal)',
      ctx: null
    }, {
      day: 'Tomorrow',
      time: '11:00',
      who: 'Universidad Metropolitana',
      what: 'Tender award date confirmation',
      ctx: 'Best case · $148K',
      opportunityId: 'OPP-2117'
    }, {
      day: 'Tomorrow',
      time: '16:30',
      who: 'Grupo Pacífico',
      what: 'FY27 budget allocation review',
      ctx: 'Best case · $208K',
      opportunityId: 'OPP-2163'
    }, {
      day: 'Thursday',
      time: '10:00',
      who: 'Cooperativa Andes',
      what: 'Scoping session — DR site',
      ctx: 'Pipeline · $198K',
      opportunityId: 'OPP-2131'
    }],
    reviewQueue: ['OPP-2041', 'OPP-2103', 'OPP-2158', 'OPP-2088', 'OPP-2182', 'OPP-2140', 'OPP-2176', 'OPP-2124', 'OPP-2163', 'OPP-2117', 'OPP-2131', 'OPP-2146'],
    guidedQueue: ['OPP-2041', 'OPP-2103', 'OPP-2117', 'OPP-2163', 'OPP-2131', 'OPP-2146', 'OPP-2158'],
    copilot: {
      manager: ['Why could we miss quota?', 'What changed since Monday?', 'Which sellers need intervention?', 'Explain forecast movement.', 'Prepare my forecast meeting.'],
      seller: ['What should I do first today?', 'Which deals put my quota at risk?', 'Prepare my forecast update.', 'Draft a follow-up for Banco Andino.'],
      deal: ['Why is this deal at risk?', 'Is Commit justified?', 'What is missing?', 'Prepare next meeting.', 'Draft follow-up.', 'Summarize history.']
    },
    import: {
      file: 'PROGRAMA VENTAS Q4.xlsx',
      rows: 477,
      ready: 438,
      warnings: 31,
      review: 8,
      duplicates: 6,
      template: {
        name: 'TD Forecast Template',
        confidence: 98
      },
      mapping: [{
        source: 'OPPTY',
        target: 'Opportunity',
        confidence: 99
      }, {
        source: 'VBM',
        target: 'Seller',
        confidence: 74
      }, {
        source: 'End User',
        target: 'Customer',
        confidence: 96
      }, {
        source: 'Sales Stage',
        target: 'Stage',
        confidence: 91
      }, {
        source: 'Monto',
        target: 'Amount',
        confidence: 88
      }, {
        source: 'Mes Facturación',
        target: 'Expected billing',
        confidence: 63
      }, {
        source: 'Canal',
        target: 'Partner',
        confidence: 57
      }, {
        source: 'Línea',
        target: '',
        confidence: 34
      }],
      fields: ['Opportunity', 'Seller', 'Customer', 'Stage', 'Amount', 'Expected close', 'Expected billing', 'Partner', 'Brand', 'Purchase order'],
      issues: [{
        row: 34,
        severity: 'warning',
        message: 'Duplicate customer name: "Banco Andino" and "BANCO ANDINO S.A." resolve to the same account'
      }, {
        row: 61,
        severity: 'warning',
        message: 'Seller name inconsistency: "D. Andrade" — matched to Diego Andrade at 86% confidence'
      }, {
        row: 88,
        severity: 'invalid',
        message: 'Opportunity without amount — row cannot be imported'
      }, {
        row: 112,
        severity: 'invalid',
        message: 'Invalid month: "13/2026" is not a valid billing period'
      }, {
        row: 147,
        severity: 'warning',
        message: 'Stage / value inconsistency: stage 100% Billed but amount is 0'
      }, {
        row: 203,
        severity: 'warning',
        message: 'Seller name inconsistency: "VBM: SOFIA T." — matched to Sofía Torres at 91% confidence'
      }, {
        row: 254,
        severity: 'invalid',
        message: 'Stage "Negociación avanzada" does not map to any tenant stage'
      }, {
        row: 311,
        severity: 'warning',
        message: 'Duplicate opportunity: same customer, amount and close date as row 34'
      }, {
        row: 366,
        severity: 'invalid',
        message: 'Expected close date (14/03/2025) is before the fiscal period'
      }, {
        row: 402,
        severity: 'warning',
        message: 'Margin below the 10% tenant threshold (6.2%)'
      }]
    }
  };
})();

/* Sprint 1 refinement: dated + owned next steps, structured last activity, stage evidence. */
(() => {
  const detail = {
    'OPP-2041': {
      nextStep: {
        text: 'Call the CFO to confirm the purchase order',
        date: 'Due 12 Dec · 3 days ago',
        owner: 'Sofía Torres',
        overdue: true
      },
      lastActivity: {
        what: 'Discovery call with IT director — no decision reached',
        when: '9 days ago · 4 Dec',
        who: 'Sofía Torres',
        stale: true
      },
      evidence: {
        present: ['Proposal accepted by IT and Finance', 'Economic buyer identified (CFO)', 'Technical validation complete'],
        missing: ['Purchase order', 'Signed billing schedule'],
        verdict: 'Commit is not defensible on current evidence: the close date has moved twice and there is no purchase order at 75%. System confidence 62% — suggested Upside.'
      }
    },
    'OPP-2088': {
      nextStep: {
        text: 'Confirm the delivery window with logistics',
        date: 'Due 16 Dec',
        owner: 'Camila Paz'
      },
      lastActivity: {
        what: 'Commercial review with the CIO — terms agreed',
        when: '2 days ago · 11 Dec',
        who: 'Camila Paz'
      },
      evidence: {
        present: ['Purchase order received (PO-88412)', 'Proof of concept signed off', 'FY27 budget confirmed'],
        missing: [],
        verdict: 'Commit is supported: purchase order in hand and the deal is moving faster than the stage benchmark. System confidence 84%.'
      }
    },
    'OPP-2103': {
      nextStep: null,
      lastActivity: {
        what: 'Email to the infrastructure lead — no reply',
        when: '16 days ago · 27 Nov',
        who: 'Diego Andrade',
        stale: true
      },
      evidence: {
        present: ['Technical requirements documented'],
        missing: ['Economic buyer', 'Purchase order', 'Next step'],
        verdict: 'Commit is not justified. No economic buyer, no activity in 16 days, a competitor evaluation is open and margin is 7.4%. System confidence 41% — suggested Best case.'
      }
    },
    'OPP-2117': {
      nextStep: {
        text: 'Confirm the tender award date with procurement',
        date: 'Due 18 Dec',
        owner: 'Sofía Torres'
      },
      lastActivity: {
        what: 'Requirements workshop with the campus IT board',
        when: '3 days ago · 10 Dec',
        who: 'Sofía Torres'
      },
      evidence: {
        present: ['Public tender requirements confirmed', 'Reference visit completed'],
        missing: ['Award date confirmation'],
        verdict: 'Best case is the right call while the tender award date is unconfirmed.'
      }
    },
    'OPP-2124': {
      nextStep: {
        text: 'Agree the January rollout calendar with store operations',
        date: 'Due 15 Dec',
        owner: 'Andrés Coba'
      },
      lastActivity: {
        what: 'Rollout planning session with operations',
        when: 'Yesterday · 12 Dec',
        who: 'Andrés Coba'
      },
      evidence: {
        present: ['Pilot approved in 12 stores', 'Rollout plan agreed with operations', 'Operations and IT both sponsoring'],
        missing: ['Signed rollout calendar'],
        verdict: 'Stronger than its category: system confidence 78% suggests this can move from Best case to Commit once the calendar is signed.'
      }
    },
    'OPP-2131': {
      nextStep: {
        text: 'Identify the budget owner and book a scoping session',
        date: 'Due 19 Dec',
        owner: 'Valeria Núñez'
      },
      lastActivity: {
        what: 'Call with the risk officer on regulatory drivers',
        when: '11 days ago · 2 Dec',
        who: 'Valeria Núñez',
        stale: true
      },
      evidence: {
        present: ['Regulatory driver confirmed'],
        missing: ['Budget owner', 'Technical scope'],
        verdict: 'Correctly in Pipeline — stalled 41 days in Qualified with no budget owner.'
      }
    },
    'OPP-2140': {
      nextStep: {
        text: 'Confirm invoicing with finance for the December close',
        date: 'Due 15 Dec',
        owner: 'Camila Paz'
      },
      lastActivity: {
        what: 'Delivery planning with the hospital IT team',
        when: '4 days ago · 9 Dec',
        who: 'Camila Paz'
      },
      evidence: {
        present: ['Purchase order received (PO-77201)', 'Delivery scheduled'],
        missing: [],
        verdict: 'Backlog is correct: won and awaiting billing.'
      }
    },
    'OPP-2146': {
      nextStep: {
        text: 'Book the technical assessment and rebuild the margin case',
        date: 'Due 22 Dec',
        owner: 'Diego Andrade'
      },
      lastActivity: {
        what: 'Email with end-of-support timeline',
        when: '8 days ago · 5 Dec',
        who: 'Diego Andrade',
        stale: true
      },
      evidence: {
        present: ['Hardware end of support in Q2'],
        missing: ['Decision criteria', 'Next step date'],
        verdict: 'Pipeline is correct. Margin at 8.8% needs rebuilding before this advances.'
      }
    },
    'OPP-2151': {
      nextStep: {
        text: 'None — invoiced',
        date: 'Closed 21 Nov',
        owner: 'Alex Rivera'
      },
      lastActivity: {
        what: 'Invoice INV-4471 issued',
        when: '21 Nov 2026',
        who: 'Alex Rivera'
      },
      evidence: {
        present: ['Invoiced INV-4471'],
        missing: [],
        verdict: 'Billed and reconciled.'
      }
    },
    'OPP-2158': {
      nextStep: {
        text: 'Ask procurement whether the PO can be issued before the freeze',
        date: 'Due 14 Dec',
        owner: 'Andrés Coba'
      },
      lastActivity: {
        what: 'Procurement call on the year-end spend freeze',
        when: '5 days ago · 8 Dec',
        who: 'Andrés Coba'
      },
      evidence: {
        present: ['Proposal accepted', 'Security review passed'],
        missing: ['Purchase order'],
        verdict: 'Commit is optimistic: the close date has moved once and a year-end freeze is in force. System confidence 57% — suggested Upside.'
      }
    },
    'OPP-2163': {
      nextStep: {
        text: 'Confirm FY27 budget allocation with the data office',
        date: 'Due 20 Dec',
        owner: 'Sofía Torres'
      },
      lastActivity: {
        what: 'Business review with the data office',
        when: '6 days ago · 7 Dec',
        who: 'Sofía Torres'
      },
      evidence: {
        present: ['Business case approved by the data office'],
        missing: ['FY27 budget confirmation'],
        verdict: 'Best case is right while a competing internal project holds the same budget.'
      }
    },
    'OPP-2170': {
      nextStep: {
        text: 'Run the discovery workshop',
        date: 'Due 17 Dec',
        owner: 'Diego Andrade'
      },
      lastActivity: {
        what: 'Introductory meeting with the network team',
        when: '2 days ago · 11 Dec',
        who: 'Diego Andrade'
      },
      evidence: {
        present: [],
        missing: ['Requirements', 'Budget', 'Timeline'],
        verdict: 'Not yet qualified — Pipeline is correct.'
      }
    },
    'OPP-2176': {
      nextStep: {
        text: 'Track delivery for the December billing window',
        date: 'Due 18 Dec',
        owner: 'Camila Paz'
      },
      lastActivity: {
        what: 'Logistics confirmation for the warehouse sites',
        when: '3 days ago · 10 Dec',
        who: 'Camila Paz'
      },
      evidence: {
        present: ['Purchase order received (PO-90233)'],
        missing: [],
        verdict: 'Backlog is correct: purchase order received, delivery in progress.'
      }
    },
    'OPP-2182': {
      nextStep: {
        text: 'Request the purchase order to protect December billing',
        date: 'Due 15 Dec',
        owner: 'Valeria Núñez'
      },
      lastActivity: {
        what: 'Commercial call with the treasury lead',
        when: '4 days ago · 9 Dec',
        who: 'Valeria Núñez'
      },
      evidence: {
        present: ['Proposal accepted', 'Economic buyer identified'],
        missing: ['Purchase order'],
        verdict: 'Commit holds, but billing falls into the next quarter unless the purchase order arrives this week.'
      }
    }
  };
  window.SIP2.opportunities.forEach(o => {
    const x = detail[o.id];
    if (!x) return;
    o.nextStep = x.nextStep;
    o.lastActivityDetail = x.lastActivity;
    o.evidenceBlock = x.evidence;
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "product_screens/data.js", error: String((e && e.message) || e) }); }

// ui_kits/command-platform/AppShell.jsx
try { (() => {
const shellNav = [{
  id: 'home',
  label: 'My day',
  icon: 'Sun',
  roles: ['seller']
}, {
  id: 'command',
  label: 'Command center',
  icon: 'Gauge',
  roles: ['manager']
}, {
  id: 'opportunities',
  label: 'Opportunities',
  icon: 'Target',
  roles: ['seller', 'manager']
}, {
  id: 'review',
  label: 'Forecast review',
  icon: 'Sparkles',
  roles: ['manager']
}, {
  id: 'guided',
  label: 'Guided review',
  icon: 'ListChecks',
  roles: ['seller']
}, {
  id: 'alerts',
  label: 'Alerts',
  icon: 'BellRing',
  roles: ['seller', 'manager']
}, {
  id: 'import',
  label: 'Import',
  icon: 'FileSpreadsheet',
  roles: ['seller', 'manager']
}, {
  id: 'settings',
  label: 'Settings',
  icon: 'Settings',
  roles: ['seller', 'manager']
}];
function NavItem({
  item,
  active,
  onClick,
  compact
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    "aria-current": active ? 'page' : undefined,
    "aria-label": compact ? item.label : undefined,
    title: compact ? item.label : undefined,
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: compact ? 'center' : 'flex-start',
      gap: 12,
      width: '100%',
      minHeight: 44,
      padding: compact ? '10px 0' : '10px 12px',
      borderRadius: 12,
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      fontSize: 14,
      fontWeight: 500,
      background: active ? 'oklch(0.865 0.127 207 / 0.1)' : hover ? 'oklch(1 0 0 / 0.05)' : 'transparent',
      color: active ? 'var(--accent-bright)' : hover ? '#fff' : 'oklch(0.68 0.02 220)',
      transition: 'var(--transition-color)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: item.icon,
    size: 18
  }), compact ? null : item.label);
}
function ModeSwitch({
  mode,
  onChange
}) {
  const modes = ['Standard', 'Focus', 'Guided', 'Review'];
  return /*#__PURE__*/React.createElement("div", {
    role: "group",
    "aria-label": "Cognitive mode",
    style: {
      display: 'inline-flex',
      gap: 2,
      padding: 3,
      borderRadius: 8,
      background: 'var(--surface-muted)'
    }
  }, modes.map(m => /*#__PURE__*/React.createElement("button", {
    key: m,
    type: "button",
    "aria-pressed": mode === m,
    onClick: () => onChange(m),
    style: {
      height: 28,
      padding: '0 10px',
      borderRadius: 6,
      border: 'none',
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 600,
      background: mode === m ? 'var(--surface)' : 'transparent',
      color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
      boxShadow: mode === m ? 'var(--shadow-card)' : 'none',
      transition: 'var(--transition-color)'
    }
  }, m)));
}
const DOCK_MIN = 1280;
function AppShell({
  persona,
  onPersona,
  view,
  onView,
  mode,
  onMode,
  theme,
  onTheme,
  onCommand,
  copilot,
  children
}) {
  const user = SIP.users[persona];
  const items = shellNav.filter(i => i.roles.includes(persona));
  const [wide, setWide] = React.useState(() => typeof window === 'undefined' ? true : window.innerWidth >= DOCK_MIN);
  const iconRail = !wide;
  const [railOpen, setRailOpen] = React.useState(false);
  React.useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= DOCK_MIN);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const docked = wide && !!copilot;
  const overlay = !wide && !!copilot;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: (iconRail ? '72px' : '248px') + ' minmax(0,1fr)',
      minHeight: '100%',
      background: 'var(--bg-canvas)'
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      background: 'var(--surface-inverse)',
      padding: iconRail ? '20px 12px' : '20px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      color: '#fff',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: iconRail ? 0 : '0 8px',
      justifyContent: iconRail ? 'center' : 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 40,
      height: 40,
      borderRadius: 12,
      background: 'var(--accent-bright)',
      color: '#08242c',
      fontWeight: 700,
      fontSize: 14,
      flex: 'none'
    }
  }, "SI"), iconRail ? null : /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", {
    style: {
      display: 'block',
      fontSize: 14
    }
  }, "Sales Intelligence"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--text-inverse-muted)'
    }
  }, "Command platform"))), /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Primary",
    style: {
      display: 'grid',
      gap: 4
    }
  }, items.map(i => /*#__PURE__*/React.createElement(NavItem, {
    key: i.id,
    item: i,
    active: view === i.id,
    onClick: () => onView(i.id),
    compact: iconRail
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      display: iconRail ? 'none' : 'grid',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 16,
      border: '1px solid var(--border-inverse)',
      background: 'oklch(1 0 0 / 0.05)',
      padding: 12
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 12,
      color: 'var(--text-inverse-muted)'
    }
  }, "Active workspace"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontSize: 14,
      fontWeight: 500
    }
  }, SIP.tenant)), /*#__PURE__*/React.createElement("div", {
    role: "group",
    "aria-label": "Persona",
    style: {
      display: iconRail ? 'none' : 'grid',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-inverse-muted)',
      fontWeight: 600
    }
  }, "Preview as"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, [['seller', 'Seller'], ['manager', 'Manager']].map(([id, label]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    type: "button",
    "aria-pressed": persona === id,
    onClick: () => onPersona(id),
    style: {
      flex: 1,
      height: 30,
      borderRadius: 8,
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 600,
      border: '1px solid var(--border-inverse)',
      background: persona === id ? 'var(--accent-bright)' : 'transparent',
      color: persona === id ? '#08242c' : 'var(--text-inverse-muted)'
    }
  }, label)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gridTemplateRows: '64px 1fr'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '0 32px',
      borderBottom: '1px solid var(--border)',
      background: 'color-mix(in oklab, var(--surface) 90%, transparent)',
      backdropFilter: 'var(--blur-header)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onCommand,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      height: 36,
      minWidth: 0,
      flex: '0 1 300px',
      padding: '0 12px',
      borderRadius: 8,
      border: '1px solid var(--border)',
      background: 'var(--surface-muted)',
      color: 'var(--text-muted)',
      fontSize: 14,
      cursor: 'pointer',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Search",
    size: 15
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      textAlign: 'left',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, "Search or run a command"), /*#__PURE__*/React.createElement("kbd", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      border: '1px solid var(--border)',
      borderRadius: 4,
      padding: '1px 5px'
    }
  }, "\u2318K")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement(ModeSwitch, {
    mode: mode,
    onChange: onMode
  }), overlay ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setRailOpen(true),
    "aria-expanded": railOpen,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      height: 36,
      padding: '0 12px',
      borderRadius: 8,
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      color: 'var(--text-primary)',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Bot",
    size: 16
  }), "Copilot") : null, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onTheme,
    "aria-label": "Toggle appearance",
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 36,
      height: 36,
      borderRadius: 8,
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      color: 'var(--text-muted)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: theme === 'dark' ? 'Sun' : 'Moon',
    size: 16
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 24,
      background: 'var(--border)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "CircleUserRound",
    size: 20,
    style: {
      color: 'var(--brand)'
    }
  }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", {
    style: {
      display: 'block',
      fontSize: 12
    }
  }, user.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--text-muted)'
    }
  }, user.roleLabel))))), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      display: 'grid',
      gridTemplateColumns: docked ? 'minmax(0,1fr) 380px' : 'minmax(0,1fr)'
    }
  }, /*#__PURE__*/React.createElement("main", {
    style: {
      padding: 32,
      minWidth: 0
    }
  }, children), docked ? /*#__PURE__*/React.createElement("div", {
    style: {
      borderLeft: '1px solid var(--border)',
      padding: 20,
      background: 'var(--surface)',
      minWidth: 0
    }
  }, copilot) : null), overlay && railOpen ? /*#__PURE__*/React.createElement("div", {
    role: "presentation",
    onClick: () => setRailOpen(false),
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 60,
      background: 'var(--scrim)',
      display: 'flex',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: 'min(420px, 94vw)',
      height: '100%',
      background: 'var(--surface)',
      borderLeft: '1px solid var(--border)',
      boxShadow: 'var(--shadow-overlay)',
      padding: 20,
      display: 'grid',
      gridTemplateRows: 'auto minmax(0,1fr)',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setRailOpen(false),
    "aria-label": "Close Copilot",
    style: {
      justifySelf: 'end',
      display: 'grid',
      placeItems: 'center',
      width: 32,
      height: 32,
      borderRadius: 8,
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      color: 'var(--text-muted)',
      cursor: 'pointer'
    }
  }, "\xD7"), /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: 0
    }
  }, copilot))) : null));
}
function PageHead({
  eyebrow,
  title,
  meta,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 16,
      marginBottom: 24,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-eyebrow)',
      color: 'var(--text-brand)'
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '4px 0 0',
      fontSize: 30,
      fontWeight: 600,
      letterSpacing: '-0.035em'
    }
  }, title), meta ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 0 0',
      font: 'var(--type-body)',
      color: 'var(--text-muted)'
    }
  }, meta) : null), action);
}
Object.assign(window, {
  AppShell,
  PageHead,
  ModeSwitch
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/command-platform/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/command-platform/ManagerHome.jsx
try { (() => {
function BrandBars() {
  const max = Math.max(...SIP.brands.map(b => b[1]));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 10
    }
  }, SIP.brands.map(([name, amount]) => /*#__PURE__*/React.createElement("div", {
    key: name,
    style: {
      display: 'grid',
      gridTemplateColumns: '78px minmax(0,1fr) 68px',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    style: {
      height: 10,
      borderRadius: 999,
      background: 'var(--surface-sunken)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      width: amount / max * 100 + '%',
      height: '100%',
      background: 'var(--chart-2)'
    }
  })), /*#__PURE__*/React.createElement("b", {
    className: "tnum",
    style: {
      fontSize: 13,
      textAlign: 'right'
    }
  }, '$' + (amount / 1000).toFixed(0) + 'K'))));
}
function StageBreakdown({
  stage,
  onOpen
}) {
  if (!stage) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "brand"
  }, stage.name), /*#__PURE__*/React.createElement(Badge, null, stage.count, " opportunities"), stage.atRisk ? /*#__PURE__*/React.createElement(RiskBadge, {
    severity: "HIGH",
    label: stage.atRisk + ' at risk'
  }) : null, stage.likelyToSlip ? /*#__PURE__*/React.createElement(Badge, {
    tone: "warning"
  }, '$' + (stage.likelyToSlip / 1000).toFixed(0) + 'K likely to slip') : null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 8
    }
  }, SIP.opportunities.slice(0, 3).map(o => /*#__PURE__*/React.createElement("button", {
    key: o.id,
    type: "button",
    onClick: () => onOpen(o),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      textAlign: 'left',
      padding: 12,
      borderRadius: 12,
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      display: 'block',
      fontSize: 14
    }
  }, o.customer), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: 'var(--type-meta)',
      color: 'var(--text-muted)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, o.seller, " \xB7 ", o.brand, " \xB7 closes ", o.closeDate)), /*#__PURE__*/React.createElement(OpportunityHealth, {
    score: o.health.score,
    status: o.health.status,
    size: "sm"
  }), /*#__PURE__*/React.createElement("b", {
    className: "tnum",
    style: {
      fontSize: 14
    }
  }, '$' + (o.amount / 1000).toFixed(0) + 'K')))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 8px',
      font: 'var(--type-meta)',
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      fontWeight: 600
    }
  }, "By seller"), /*#__PURE__*/React.createElement(SellerPerformance, {
    sellers: SIP.sellers.slice(0, 3)
  })))));
}
function ManagerHome({
  mode,
  onOpen,
  onReview
}) {
  const k = SIP.teamKpis;
  const focus = mode === 'Focus';
  const [stage, setStage] = React.useState(null);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHead, {
    eyebrow: "Revenue command center",
    title: "Will the team reach quota?",
    meta: `${SIP.tenant} · ${SIP.period} · 1 Jun – 31 Aug 2026`,
    action: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement(PeriodSelector, {
      periods: SIP.periods,
      value: SIP.period,
      comparison: "last snapshot"
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "Camera"
      })
    }, "Snapshot"))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,1fr)',
      gap: 20,
      alignItems: 'stretch'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: true,
    style: {
      display: 'grid',
      gap: 20,
      alignContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(QuotaProgress, {
    quota: k.quota,
    billed: k.billed,
    forecast: k.forecast,
    label: "Team quota attainment"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(RevenueKPI, {
    label: "Pipeline",
    value: k.pipeline,
    detail: k.coverage.toFixed(1) + '× coverage',
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Layers"
    })
  }), /*#__PURE__*/React.createElement(RevenueKPI, {
    label: "Commit",
    value: k.commit,
    detail: "7 opportunities",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Handshake"
    })
  }), /*#__PURE__*/React.createElement(RevenueKPI, {
    label: "Margin",
    value: k.margin,
    format: "percent",
    detail: "threshold 10%",
    tone: "positive",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Percent"
    })
  }))), /*#__PURE__*/React.createElement(QuotaGap, {
    gap: k.gap,
    onAction: onReview,
    action: "Review risks",
    interpretation: "Your current forecast is $390K below quota. Three opportunities representing $510K account for most of the quarter risk.",
    drivers: [{
      label: 'Banco ABC · no activity 9 days',
      amount: 180000
    }, {
      label: 'Retail Norte · purchase order missing',
      amount: 210000
    }, {
      label: 'Telco Andina · stalled in Discovery',
      amount: 120000
    }]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: focus ? 'minmax(0,1fr)' : 'minmax(0,1.35fr) minmax(0,1fr)',
      gap: 20,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Pipeline funnel",
    subtitle: "Hover for stage mechanics \xB7 select to expand in place",
    action: /*#__PURE__*/React.createElement(Badge, {
      tone: "outline"
    }, k.atRisk, " at risk")
  }), /*#__PURE__*/React.createElement(CardContent, null, /*#__PURE__*/React.createElement(SalesFunnel, {
    stages: SIP.funnel,
    selectedStage: stage,
    onSelectStage: setStage,
    renderDetail: s => /*#__PURE__*/React.createElement(StageBreakdown, {
      stage: s,
      onOpen: onOpen
    })
  }))), focus ? null : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Forecast movement",
    subtitle: "Since Monday's snapshot"
  }), /*#__PURE__*/React.createElement(CardContent, null, /*#__PURE__*/React.createElement(ForecastMovement, {
    since: "Monday",
    net: -242000,
    movements: SIP.movements,
    onSelect: m => onOpen(SIP.opportunities.find(o => o.id === m.opportunityId))
  }))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Pipeline by brand",
    subtitle: "Line item contribution"
  }), /*#__PURE__*/React.createElement(CardContent, null, /*#__PURE__*/React.createElement(BrandBars, null))))), focus ? null : /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Team",
    subtitle: "Commit mix under 25% is the intervention cue",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      size: "sm",
      onClick: onReview,
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "ClipboardCheck"
      })
    }, "Open forecast review")
  }), /*#__PURE__*/React.createElement(CardContent, null, /*#__PURE__*/React.createElement(SellerPerformance, {
    sellers: SIP.sellers,
    onSelect: () => onReview()
  })))));
}
Object.assign(window, {
  ManagerHome,
  StageBreakdown,
  BrandBars
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/command-platform/ManagerHome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/command-platform/Opportunities.jsx
try { (() => {
function Opportunities({
  onOpen
}) {
  const [query, setQuery] = React.useState('');
  const [applied, setApplied] = React.useState([]);
  const rows = SIP.opportunities.filter(o => {
    const q = (o.title + o.customer + o.seller).toLowerCase().includes(query.toLowerCase());
    const risky = !applied.includes('at-risk') || o.health.status !== 'HEALTHY';
    const commit = !applied.includes('commit') || o.forecastCategory === 'Commit';
    const margin = !applied.includes('low-margin') || o.margin !== null && o.margin < 10;
    return q && risky && commit && margin;
  });
  const th = {
    padding: '12px 16px',
    font: 'var(--type-meta)',
    textTransform: 'uppercase',
    letterSpacing: 'var(--tracking-label)',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textAlign: 'left'
  };
  const td = {
    padding: '16px',
    fontSize: 14,
    verticalAlign: 'middle'
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHead, {
    eyebrow: "Portfolio",
    title: "Opportunities",
    meta: `${rows.length} of ${SIP.opportunities.length} commercial motions in ${SIP.period}`,
    action: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "Download"
      })
    }, "Export"), /*#__PURE__*/React.createElement(Button, {
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "Plus"
      })
    }, "New opportunity"))
  }), /*#__PURE__*/React.createElement(Card, {
    style: {
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      borderBottom: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement(FilterBar, {
    search: query,
    onSearch: setQuery,
    applied: applied,
    onClear: () => setApplied([]),
    onToggle: id => setApplied(a => a.includes(id) ? a.filter(x => x !== id) : [...a, id]),
    searchPlaceholder: "Search title, customer or seller",
    filters: [{
      id: 'at-risk',
      label: 'At risk',
      count: 4
    }, {
      id: 'commit',
      label: 'Commit',
      count: 2
    }, {
      id: 'low-margin',
      label: 'Margin under 10%',
      count: 2
    }]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      minWidth: 940,
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", {
    style: {
      background: 'var(--surface-sunken)'
    }
  }, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Opportunity"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Stage"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Category"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Seller"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Brand"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Amount"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Close"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Health"))), /*#__PURE__*/React.createElement("tbody", null, rows.map(o => /*#__PURE__*/React.createElement("tr", {
    key: o.id,
    onClick: () => onOpen(o),
    style: {
      borderTop: '1px solid var(--border)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement("b", null, o.title), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-meta)',
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, o.customer)), /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "brand"
  }, o.stageCode, "% \xB7 ", o.stage)), /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement(Badge, {
    uppercase: true
  }, o.forecastCategory)), /*#__PURE__*/React.createElement("td", {
    style: td
  }, o.seller), /*#__PURE__*/React.createElement("td", {
    style: td
  }, o.brand), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      fontWeight: 600
    },
    className: "tnum"
  }, '$' + (o.amount / 1000).toFixed(0) + 'K'), /*#__PURE__*/React.createElement("td", {
    style: td,
    className: "tnum"
  }, o.closeDate), /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement(OpportunityHealth, {
    score: o.health.score,
    status: o.health.status,
    size: "sm"
  }))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderTop: '1px solid var(--border)',
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("span", null, rows.length, " opportunities \xB7 click a row to inspect without leaving this list"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, "Page 1 of 1", /*#__PURE__*/React.createElement(Button, {
    size: "icon",
    variant: "outline",
    "aria-label": "Previous page",
    disabled: true
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ChevronLeft"
  })), /*#__PURE__*/React.createElement(Button, {
    size: "icon",
    variant: "outline",
    "aria-label": "Next page",
    disabled: true
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ChevronRight"
  }))))));
}
function AlertsScreen({
  onOpen
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHead, {
    eyebrow: "Commercial control",
    title: "Risk alerts",
    meta: `${SIP.alerts.length} deterministic signals across the active portfolio.`
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 12
    }
  }, SIP.alerts.map(a => /*#__PURE__*/React.createElement(Card, {
    key: a.code + a.title,
    pad: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 44,
      height: 44,
      borderRadius: 12,
      background: a.severity === 'CRITICAL' ? 'var(--critical-soft)' : 'var(--warning-soft)',
      color: a.severity === 'CRITICAL' ? 'var(--critical)' : 'oklch(0.52 0.12 78)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "OctagonAlert",
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 16,
      fontWeight: 600
    }
  }, a.title), /*#__PURE__*/React.createElement(RiskBadge, {
    severity: a.severity,
    code: a.code
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 0 0',
      font: 'var(--type-body)',
      color: 'var(--text-muted)'
    }
  }, a.message), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 0 0',
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, "Detected ", a.at)), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "sm",
    onClick: () => onOpen(SIP.opportunities[0])
  }, "Inspect"))))));
}
function SettingsScreen() {
  const rows = [['Currency', 'USD'], ['Timezone', 'America/Guayaquil'], ['Fiscal year', 'December → November'], ['Minimum margin', '10%'], ['Appearance', 'System']];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHead, {
    eyebrow: "Workspace",
    title: "Settings",
    meta: "Tenant-owned commercial and fiscal defaults."
  }), /*#__PURE__*/React.createElement(Card, {
    style: {
      maxWidth: 640
    }
  }, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Commercial defaults",
    action: /*#__PURE__*/React.createElement(Badge, null, "Tenant scoped")
  }), /*#__PURE__*/React.createElement(CardContent, null, rows.map(([k, v], i) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '16px 0',
      borderTop: i ? '1px solid var(--border)' : 'none',
      fontSize: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, k), /*#__PURE__*/React.createElement("b", null, v))))));
}
Object.assign(window, {
  Opportunities,
  AlertsScreen,
  SettingsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/command-platform/Opportunities.jsx", error: String((e && e.message) || e) }); }

// ui_kits/command-platform/SellerHome.jsx
try { (() => {
function FocusList({
  mode,
  onOpen
}) {
  const deals = SIP.opportunities.filter(o => o.risk).slice(0, mode === 'Focus' ? 2 : 3);
  return /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Focus today",
    subtitle: `${deals.length} actions may materially affect your quarter`,
    action: /*#__PURE__*/React.createElement(Badge, {
      tone: "brand"
    }, SIP.period)
  }), /*#__PURE__*/React.createElement(CardContent, {
    style: {
      display: 'grid',
      gap: 12
    }
  }, deals.map(d => /*#__PURE__*/React.createElement(NextBestAction, {
    key: d.id,
    customer: `${d.customer} · ${d.brand}`,
    amount: d.amount,
    category: d.forecastCategory,
    severity: d.health.status === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
    risk: d.risk,
    suggestion: d.suggestion,
    primaryLabel: "Log activity",
    onOpen: () => onOpen(d)
  }))));
}
function MyFunnel({
  onOpen
}) {
  return /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "My funnel",
    subtitle: "Select a stage to break it down here"
  }), /*#__PURE__*/React.createElement(CardContent, null, /*#__PURE__*/React.createElement(SalesFunnel, {
    stages: SIP.funnel.slice(0, 4),
    renderDetail: stage => /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr)',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        font: 'var(--type-meta)',
        color: 'var(--text-muted)'
      }
    }, stage.name, " \xB7 ", stage.count, " opportunities \xB7 ", stage.atRisk || 0, " at risk"), SIP.opportunities.slice(0, 3).map(o => /*#__PURE__*/React.createElement("button", {
      key: o.id,
      type: "button",
      onClick: () => onOpen(o),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        textAlign: 'left',
        padding: 12,
        borderRadius: 12,
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        display: 'block',
        fontSize: 14
      }
    }, o.customer), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        font: 'var(--type-meta)',
        color: 'var(--text-muted)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, o.title, " \xB7 closes ", o.closeDate)), /*#__PURE__*/React.createElement(OpportunityHealth, {
      score: o.health.score,
      status: o.health.status,
      size: "sm"
    }), /*#__PURE__*/React.createElement("b", {
      className: "tnum",
      style: {
        fontSize: 14
      }
    }, '$' + (o.amount / 1000).toFixed(0) + 'K'))))
  })));
}
function SellerHome({
  mode,
  onOpen
}) {
  const k = SIP.sellerKpis;
  const focus = mode === 'Focus';
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHead, {
    eyebrow: "My day",
    title: "What should I do today?",
    meta: `${SIP.period} · 1 Jun – 31 Aug 2026 · ${SIP.users.seller.name}`,
    action: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement(PeriodSelector, {
      periods: SIP.periods,
      value: SIP.period
    }), /*#__PURE__*/React.createElement(Button, {
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "Plus"
      })
    }, "New opportunity"))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: focus ? 'minmax(0,1fr)' : 'minmax(0,1.1fr) minmax(0,1fr)',
      gap: 24,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(QuotaProgress, {
    quota: k.quota,
    billed: k.billed,
    forecast: k.forecast,
    label: "My quota attainment"
  }), focus ? null : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(RevenueKPI, {
    label: "Billed",
    value: k.billed,
    detail: "44.6% attainment",
    tone: "positive",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "ReceiptText"
    })
  }), /*#__PURE__*/React.createElement(RevenueKPI, {
    label: "Forecast",
    value: k.forecast,
    detail: "35.0% attainment",
    delta: -24000,
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "CircleGauge"
    })
  }), /*#__PURE__*/React.createElement(RevenueKPI, {
    label: "Remaining gap",
    value: k.gap,
    tone: "risk",
    detail: "to quota",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "BadgeDollarSign"
    })
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: focus ? 'minmax(0,1fr)' : 'minmax(0,1.15fr) minmax(0,1fr)',
      gap: 20,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(FocusList, {
    mode: mode,
    onOpen: onOpen
  }), focus ? null : /*#__PURE__*/React.createElement(MyFunnel, {
    onOpen: onOpen
  })), focus ? null : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Stuck opportunities",
    subtitle: "Longer in stage than the benchmark"
  }), /*#__PURE__*/React.createElement(CardContent, {
    style: {
      display: 'grid',
      gap: 16
    }
  }, SIP.opportunities.filter(o => o.daysInStage > o.stageBenchmarkDays).map(o => /*#__PURE__*/React.createElement("div", {
    key: o.id,
    style: {
      display: 'grid',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      fontSize: 14
    }
  }, o.customer), /*#__PURE__*/React.createElement(RiskBadge, {
    severity: o.alerts[0] ? o.alerts[0].severity : 'WARNING',
    code: o.alerts[0] ? o.alerts[0].code : 'STAGE_STAGNATION'
  })), /*#__PURE__*/React.createElement(StageVelocity, {
    stage: o.stage,
    daysInStage: o.daysInStage,
    benchmarkDays: o.stageBenchmarkDays
  }))))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Customer meetings",
    subtitle: "Next five working days"
  }), /*#__PURE__*/React.createElement(CardContent, {
    style: {
      display: 'grid',
      gap: 8
    }
  }, [['Wed 09:30', 'Banco ABC', 'PO review with CFO'], ['Thu 15:00', 'Retail Norte', 'Technical validation'], ['Fri 11:00', 'Telco Andina', 'Budget qualification']].map(([when, who, what]) => /*#__PURE__*/React.createElement("div", {
    key: when,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      borderRadius: 12,
      border: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "CalendarDays",
    size: 16,
    style: {
      color: 'var(--text-muted)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      display: 'block',
      fontSize: 14
    }
  }, who), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, what)), /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, when))))))));
}
Object.assign(window, {
  SellerHome
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/command-platform/SellerHome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/command-platform/Workflows.jsx
try { (() => {
function ImportWizard() {
  const steps = ['Upload', 'Detect template', 'Map columns', 'Validate', 'Data quality', 'Preview', 'Import', 'Results'];
  const [step, setStep] = React.useState(3);
  const [mapping, setMapping] = React.useState({
    OPPTY: 'Opportunity',
    VBM: 'Seller',
    'End User': 'Customer',
    'Sales Stage': 'Stage',
    Monto: 'Amount',
    'Fecha Cierre': ''
  });
  const fields = ['Opportunity', 'Seller', 'Customer', 'Stage', 'Amount', 'Expected close', 'Partner', 'Brand'];
  const conf = {
    OPPTY: 99,
    VBM: 74,
    'End User': 96,
    'Sales Stage': 91,
    Monto: 88,
    'Fecha Cierre': 41
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHead, {
    eyebrow: "Sales data",
    title: "Import forecast workbook",
    meta: "PROGRAMA VENTAS.xlsx \xB7 194 rows \xB7 uploaded 2 minutes ago",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "X"
      })
    }, "Cancel import")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '220px minmax(0,1fr)',
      gap: 24,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: true
  }, /*#__PURE__*/React.createElement("ol", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'grid',
      gap: 4
    }
  }, steps.map((s, i) => {
    const n = i + 1;
    const done = n < step;
    const now = n === step;
    return /*#__PURE__*/React.createElement("li", {
      key: s
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => setStep(n),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '8px 10px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        fontSize: 13,
        fontWeight: now ? 600 : 500,
        background: now ? 'var(--surface-brand-soft)' : 'transparent',
        color: now ? 'var(--teal-800)' : done ? 'var(--text-primary)' : 'var(--text-muted)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'grid',
        placeItems: 'center',
        width: 20,
        height: 20,
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        background: done ? 'var(--success)' : now ? 'var(--brand)' : 'var(--surface-sunken)',
        color: done || now ? '#fff' : 'var(--text-muted)'
      }
    }, done ? '✓' : n), s));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 20
    }
  }, step <= 3 ? /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Map columns",
    subtitle: "Confirm every mapping before validation runs"
  }), /*#__PURE__*/React.createElement(CardContent, null, /*#__PURE__*/React.createElement(ImportMapper, {
    templateName: "TD Forecast Template",
    templateConfidence: 98,
    fields: fields,
    rows: Object.keys(mapping).map(k => ({
      source: k,
      target: mapping[k],
      confidence: conf[k]
    })),
    onChange: (src, target) => setMapping(m => ({
      ...m,
      [src]: target
    }))
  }))) : /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Data quality",
    subtitle: "Nothing is written until you approve this"
  }), /*#__PURE__*/React.createElement(CardContent, null, /*#__PURE__*/React.createElement(DataQualityPanel, {
    counts: {
      ready: 182,
      warnings: 9,
      invalid: 3,
      duplicates: 6
    },
    issues: [{
      row: 41,
      severity: 'invalid',
      message: 'Amount is not a number ("N/D")'
    }, {
      row: 58,
      severity: 'warning',
      message: 'Stage "Negociación" mapped to Proposal (50%)'
    }, {
      row: 77,
      severity: 'warning',
      message: 'Seller not found in this workspace'
    }, {
      row: 91,
      severity: 'invalid',
      message: 'Expected close date is before the fiscal period'
    }],
    onReview: () => {}
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: () => setStep(s => Math.min(8, s + 1))
  }, step <= 3 ? 'Validate mapping' : 'Import 182 ready rows'), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    onClick: () => setStep(s => Math.max(1, s - 1))
  }, "Back"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      alignSelf: 'center',
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, "Saved templates make this a two-click import next quarter.")))));
}
function GuidedMode({
  onDone
}) {
  const [step, setStep] = React.useState(1);
  const total = 4;
  const bodies = [/*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 12
    },
    key: "1"
  }, /*#__PURE__*/React.createElement(ForecastConfidence, {
    sellerCategory: "COMMIT",
    confidence: 38,
    rationale: "No activity in 9 days and no purchase order at 75%."
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Keep this in Commit?",
    options: [{
      value: 'keep',
      label: 'Keep Commit'
    }, {
      value: 'best',
      label: 'Move to Best case'
    }, {
      value: 'pipe',
      label: 'Move to Pipeline'
    }]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
      gap: 12
    },
    key: "2"
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Expected close",
    type: "date",
    defaultValue: "2026-09-30"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Expected billing",
    type: "date",
    defaultValue: "2026-10-14"
  })), /*#__PURE__*/React.createElement(Input, {
    key: "3",
    label: "Next action",
    defaultValue: "Call the CFO to confirm the purchase order",
    hint: "Every Commit deal needs a dated next step."
  }), /*#__PURE__*/React.createElement("div", {
    key: "4",
    style: {
      display: 'grid',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Purchase order number",
    placeholder: "PO-\u2026",
    hint: "Required from 90%."
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Gross profit",
    defaultValue: "15120",
    hint: "Margin is currently 8.4%, below the 10% threshold."
  }))];
  const titles = ['Is Commit still justified?', 'Confirm the dates', 'Define the next step', 'Complete the missing evidence'];
  const whys = ['This deal carries $180K of your quarter and the system disagrees with the seller call.', 'Two Commit deals close after the quarter ends. Fixing dates now prevents a week-11 miss.', 'Deals without a dated next step slip 2.3× more often in this workspace.', 'Missing purchase orders are the most common reason billing slides into the next quarter.'];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHead, {
    eyebrow: "Guided mode",
    title: "Prepare Banco ABC for forecast review",
    meta: "4 steps \xB7 about 3 minutes \xB7 progress is saved as you go"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,620px) 1fr',
      gap: 24,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(GuidedTask, {
    step: step,
    total: total,
    title: titles[step - 1],
    why: whys[step - 1],
    primaryLabel: step === total ? 'Finish review' : 'Save and continue',
    onPrimary: () => step === total ? onDone() : setStep(step + 1),
    onBack: step > 1 ? () => setStep(step - 1) : undefined,
    onSkip: step < total ? () => setStep(step + 1) : undefined
  }, bodies[step - 1]), /*#__PURE__*/React.createElement(Card, {
    pad: true,
    style: {
      display: 'grid',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-meta)',
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      fontWeight: 600
    }
  }, "Deal context"), /*#__PURE__*/React.createElement("b", {
    style: {
      fontSize: 18,
      letterSpacing: '-0.02em'
    }
  }, "Banco ABC \xB7 $180K"), /*#__PURE__*/React.createElement(OpportunityHealth, {
    score: 42,
    status: "CRITICAL",
    showFactors: true,
    factors: SIP.opportunities[0].health.factors
  }), /*#__PURE__*/React.createElement(StageVelocity, {
    stage: "Commit",
    daysInStage: 41,
    benchmarkDays: 21
  }))));
}
function ReviewMode({
  onOpen
}) {
  const deals = SIP.opportunities;
  const [i, setI] = React.useState(0);
  const o = deals[i];
  const [decision, setDecision] = React.useState(null);
  const decide = d => {
    setDecision(d);
    setTimeout(() => {
      setDecision(null);
      setI(x => (x + 1) % deals.length);
    }, 350);
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHead, {
    eyebrow: "Review mode",
    title: "Weekly forecast review",
    meta: `Opportunity ${i + 1} of ${deals.length} · ${SIP.period} · reviewed sequentially, no page changes`,
    action: /*#__PURE__*/React.createElement(Badge, {
      tone: decision ? 'positive' : 'outline'
    }, decision ? decision + ' recorded' : 'Awaiting decision')
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr) 320px',
      gap: 20,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: o.customer + ' · ' + o.title,
    subtitle: o.seller + ' · ' + o.brand + ' · closes ' + o.closeDate,
    action: /*#__PURE__*/React.createElement("b", {
      className: "tnum",
      style: {
        fontSize: 24,
        fontWeight: 600
      }
    }, '$' + (o.amount / 1000).toFixed(0) + 'K')
  }), /*#__PURE__*/React.createElement(CardContent, {
    style: {
      display: 'grid',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(ForecastConfidence, {
    sellerCategory: o.forecastCategory === 'Commit' ? 'COMMIT' : 'BEST_CASE',
    confidence: o.confidence,
    rationale: o.risk || 'No open risk signals on this opportunity.'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(OpportunityHealth, {
    score: o.health.score,
    status: o.health.status,
    showFactors: true,
    factors: o.health.factors
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(StageVelocity, {
    stage: o.stage,
    daysInStage: o.daysInStage,
    benchmarkDays: o.stageBenchmarkDays || 20
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8
    }
  }, o.alerts.length ? o.alerts.map(a => /*#__PURE__*/React.createElement(RiskBadge, {
    key: a.code,
    severity: a.severity,
    code: a.code
  })) : /*#__PURE__*/React.createElement(Badge, {
    tone: "positive"
  }, "No open risks")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 8px',
      font: 'var(--type-card-title)'
    }
  }, "Stage history"), /*#__PURE__*/React.createElement("ol", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'grid',
      gap: 10
    }
  }, o.stageHistory.map(h => /*#__PURE__*/React.createElement("li", {
    key: h.at,
    style: {
      position: 'relative',
      paddingLeft: 20,
      borderLeft: '2px solid var(--surface-brand-soft)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: -5,
      top: 4,
      width: 8,
      height: 8,
      borderRadius: 999,
      background: 'var(--brand)'
    }
  }), /*#__PURE__*/React.createElement("b", {
    style: {
      fontSize: 14
    }
  }, h.from ? h.from + ' → ' : '', h.to), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, h.by, " \xB7 ", h.at))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      borderTop: '1px solid var(--border)',
      paddingTop: 16
    }
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: () => decide('Commit kept')
  }, "Keep Commit"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    onClick: () => decide('Category moved')
  }, "Move category"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    onClick: () => decide('Question sent')
  }, "Ask seller"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: () => decide('Note added')
  }, "Add note"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    style: {
      marginLeft: 'auto'
    },
    iconAfter: /*#__PURE__*/React.createElement(Icon, {
      name: "ChevronRight"
    }),
    onClick: () => setI(x => (x + 1) % deals.length)
  }, "Next")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 12
    }
  }, deals.map((d, ix) => /*#__PURE__*/React.createElement("button", {
    key: d.id,
    type: "button",
    onClick: () => setI(ix),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      textAlign: 'left',
      padding: 12,
      borderRadius: 12,
      cursor: 'pointer',
      border: '1px solid',
      borderColor: ix === i ? 'var(--brand)' : 'var(--border)',
      background: 'var(--surface)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "tnum",
    style: {
      font: 'var(--type-meta)',
      color: 'var(--text-muted)',
      width: 16
    }
  }, ix + 1), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      display: 'block',
      fontSize: 13
    }
  }, d.customer), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, d.forecastCategory)), /*#__PURE__*/React.createElement(OpportunityHealth, {
    score: d.health.score,
    status: d.health.status,
    size: "sm"
  }))), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    onClick: () => onOpen(o),
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "PanelRight"
    })
  }, "Open drawer"))));
}
Object.assign(window, {
  ImportWizard,
  GuidedMode,
  ReviewMode
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/command-platform/Workflows.jsx", error: String((e && e.message) || e) }); }

// ui_kits/command-platform/data.js
try { (() => {
window.SIP = {
  tenant: 'Tech Distribution Demo',
  period: 'FY26 Q3',
  periods: ['FY26 Q1', 'FY26 Q2', 'FY26 Q3', 'FY26 Q4'],
  users: {
    seller: {
      name: 'Sofía Torres',
      role: 'SELLER',
      roleLabel: 'Seller'
    },
    manager: {
      name: 'Morgan Silva',
      role: 'MANAGER',
      roleLabel: 'Sales manager'
    },
    admin: {
      name: 'Alex Rivera',
      role: 'TENANT_ADMIN',
      roleLabel: 'Tenant admin'
    }
  },
  sellerKpis: {
    quota: 480000,
    billed: 214000,
    forecast: 168000,
    gap: 98000,
    coverage: 2.1
  },
  teamKpis: {
    quota: 2200000,
    billed: 1180000,
    forecast: 630000,
    pipeline: 3560000,
    commit: 610000,
    backlog: 340000,
    gap: 390000,
    coverage: 1.9,
    atRisk: 7,
    margin: 11.4
  },
  funnel: [{
    name: 'Discovery',
    token: 'discovery',
    amount: 1240000,
    count: 18,
    probability: 25,
    avgAmount: 68900,
    avgDaysInStage: 22,
    atRisk: 4,
    likelyToSlip: 240000
  }, {
    name: 'Proposal',
    token: 'proposal',
    amount: 860000,
    count: 11,
    probability: 50,
    avgAmount: 78200,
    avgDaysInStage: 17,
    atRisk: 2,
    likelyToSlip: 120000
  }, {
    name: 'Commit',
    token: 'commit',
    amount: 610000,
    count: 7,
    probability: 75,
    avgAmount: 87100,
    avgDaysInStage: 31,
    atRisk: 3,
    likelyToSlip: 180000
  }, {
    name: 'Closed won',
    token: 'backlog',
    amount: 340000,
    count: 5,
    probability: 90,
    avgAmount: 68000,
    avgDaysInStage: 12,
    atRisk: 1
  }, {
    name: 'Billed',
    token: 'billed',
    amount: 1180000,
    count: 14,
    probability: 100,
    avgAmount: 84300,
    avgDaysInStage: 0
  }],
  brands: [['HP', 940000], ['Lenovo', 810000], ['Nutanix', 690000], ['Dell', 620000], ['Hitachi', 500000]],
  sellers: [{
    seller: 'Sofía Torres',
    opportunities: 14,
    pipeline: 820000,
    commit: 310000,
    quota: 480000
  }, {
    seller: 'Diego Andrade',
    opportunities: 11,
    pipeline: 640000,
    commit: 98000,
    quota: 480000
  }, {
    seller: 'Camila Paz',
    opportunities: 9,
    pipeline: 520000,
    commit: 245000,
    quota: 480000
  }, {
    seller: 'Andrés Coba',
    opportunities: 12,
    pipeline: 730000,
    commit: 180000,
    quota: 400000
  }],
  opportunities: [{
    id: 'o1',
    title: 'Lenovo core modernization',
    customer: 'Banco ABC',
    amount: 180000,
    stage: 'Commit',
    stageCode: '75',
    forecastCategory: 'Commit',
    status: 'OPEN',
    seller: 'Sofía Torres',
    partner: 'Andes Technology',
    brand: 'Lenovo',
    closeDate: '30 Sep 2026',
    billingDate: '14 Oct 2026',
    margin: 8.4,
    daysInStage: 41,
    stageBenchmarkDays: 21,
    nextAction: 'Call the CFO to confirm the purchase order before Friday.',
    health: {
      score: 42,
      status: 'CRITICAL',
      factors: [{
        code: 'STAGE_STAGNATION',
        impact: -18,
        message: '41 days in Commit, benchmark 21'
      }, {
        code: 'LOW_MARGIN',
        impact: -12,
        message: 'Margin 8.4% is below the 10% threshold'
      }, {
        code: 'NO_ACTIVITY',
        impact: -14,
        message: 'No activity logged in 9 days'
      }]
    },
    alerts: [{
      code: 'MISSING_PO',
      severity: 'CRITICAL'
    }, {
      code: 'LOW_MARGIN',
      severity: 'WARNING'
    }],
    confidence: 38,
    stageHistory: [{
      from: 'Proposal',
      to: 'Commit',
      by: 'Sofía Torres',
      at: '12 Jul 2026'
    }, {
      from: 'Discovery',
      to: 'Proposal',
      by: 'Sofía Torres',
      at: '2 Jun 2026'
    }],
    risk: 'No activity in 9 days and no purchase order at 75%.',
    suggestion: 'Contact customer.'
  }, {
    id: 'o2',
    title: 'Nutanix data platform',
    customer: 'Retail Norte',
    amount: 210000,
    stage: 'Closed won · pending billing',
    stageCode: '90',
    forecastCategory: 'Commit',
    status: 'WON',
    seller: 'Sofía Torres',
    partner: 'CloudBridge',
    brand: 'Nutanix',
    closeDate: '18 Sep 2026',
    billingDate: null,
    margin: 14.2,
    daysInStage: 9,
    stageBenchmarkDays: 14,
    nextAction: 'Request the purchase order from procurement.',
    health: {
      score: 66,
      status: 'AT_RISK',
      factors: [{
        code: 'MISSING_PO',
        impact: -22,
        message: 'No purchase order at 90%'
      }]
    },
    alerts: [{
      code: 'MISSING_PO',
      severity: 'CRITICAL'
    }],
    confidence: 61,
    stageHistory: [{
      from: 'Commit',
      to: 'Closed won · pending billing',
      by: 'Sofía Torres',
      at: '18 Aug 2026'
    }],
    risk: 'No purchase order recorded at 90%.',
    suggestion: 'Request PO from procurement.'
  }, {
    id: 'o3',
    title: 'HP workplace refresh',
    customer: 'Ministerio de Salud',
    amount: 96000,
    stage: 'Proposal',
    stageCode: '50',
    forecastCategory: 'Best case',
    status: 'OPEN',
    seller: 'Diego Andrade',
    partner: 'Digital Core',
    brand: 'HP',
    closeDate: '12 Oct 2026',
    billingDate: null,
    margin: 12.8,
    daysInStage: 14,
    stageBenchmarkDays: 18,
    nextAction: 'Schedule the technical validation workshop.',
    health: {
      score: 78,
      status: 'HEALTHY',
      factors: [{
        code: 'ON_PACE',
        impact: 6,
        message: 'Moving faster than the stage benchmark'
      }]
    },
    alerts: [],
    confidence: 72,
    stageHistory: [{
      from: 'Discovery',
      to: 'Proposal',
      by: 'Diego Andrade',
      at: '11 Aug 2026'
    }],
    risk: 'Public tender timeline may extend past the quarter.',
    suggestion: 'Confirm the award date.'
  }, {
    id: 'o4',
    title: 'Hitachi storage renewal',
    customer: 'Telco Andina',
    amount: 142000,
    stage: 'Discovery',
    stageCode: '25',
    forecastCategory: 'Pipeline',
    status: 'OPEN',
    seller: 'Camila Paz',
    partner: 'Pacific IT',
    brand: 'Hitachi',
    closeDate: '28 Nov 2026',
    billingDate: null,
    margin: 9.1,
    daysInStage: 33,
    stageBenchmarkDays: 22,
    nextAction: 'Qualify the budget owner.',
    health: {
      score: 54,
      status: 'AT_RISK',
      factors: [{
        code: 'STAGE_STAGNATION',
        impact: -15,
        message: '33 days in Discovery'
      }]
    },
    alerts: [{
      code: 'STAGE_STAGNATION',
      severity: 'WARNING'
    }, {
      code: 'LOW_MARGIN',
      severity: 'WARNING'
    }],
    confidence: 44,
    stageHistory: [{
      from: null,
      to: 'Discovery',
      by: 'Camila Paz',
      at: '24 Jul 2026'
    }],
    risk: 'Stuck in Discovery for 33 days.',
    suggestion: 'Qualify the budget owner.'
  }, {
    id: 'o5',
    title: 'Dell branch rollout',
    customer: 'Cooperativa Sur',
    amount: 88000,
    stage: 'Billed',
    stageCode: '100',
    forecastCategory: 'Closed',
    status: 'WON',
    seller: 'Andrés Coba',
    partner: 'Nova Systems',
    brand: 'Dell',
    closeDate: '4 Aug 2026',
    billingDate: '19 Aug 2026',
    margin: 15.6,
    daysInStage: 0,
    stageBenchmarkDays: 0,
    nextAction: 'None — invoiced.',
    health: {
      score: 92,
      status: 'HEALTHY',
      factors: []
    },
    alerts: [],
    confidence: 98,
    stageHistory: [{
      from: 'Closed won · pending billing',
      to: 'Billed',
      by: 'Alex Rivera',
      at: '19 Aug 2026'
    }],
    risk: null,
    suggestion: null
  }],
  movements: [{
    label: 'Banco ABC · Lenovo core modernization',
    delta: -180000,
    reason: 'Close date moved out of the quarter',
    opportunityId: 'o1'
  }, {
    label: 'Retail Norte · Nutanix data platform',
    delta: -95000,
    reason: 'Commit → Best case, purchase order missing',
    opportunityId: 'o2'
  }, {
    label: 'Ministerio de Salud · HP workplace refresh',
    delta: 65000,
    reason: 'Stage 25 → 50',
    opportunityId: 'o3'
  }, {
    label: 'Telco Andina · Hitachi storage renewal',
    delta: -32000,
    reason: 'Amount revised after scoping',
    opportunityId: 'o4'
  }],
  alerts: [{
    code: 'MISSING_PO',
    severity: 'CRITICAL',
    title: 'Banco ABC · Lenovo core modernization',
    message: 'Purchase order is required at this stage',
    at: '25 Aug 2026, 08:12'
  }, {
    code: 'LOW_MARGIN',
    severity: 'WARNING',
    title: 'Telco Andina · Hitachi storage renewal',
    message: 'Margin is below the 10% tenant threshold',
    at: '24 Aug 2026, 17:40'
  }, {
    code: 'STAGE_STAGNATION',
    severity: 'WARNING',
    title: 'Telco Andina · Hitachi storage renewal',
    message: 'Opportunity has remained more than 30 days in stage',
    at: '24 Aug 2026, 06:02'
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/command-platform/data.js", error: String((e && e.message) || e) }); }

__ds_ns.CommandPalette = __ds_scope.CommandPalette;

__ds_ns.FilterBar = __ds_scope.FilterBar;

__ds_ns.PeriodSelector = __ds_scope.PeriodSelector;

__ds_ns.CopilotInsight = __ds_scope.CopilotInsight;

__ds_ns.CopilotPanel = __ds_scope.CopilotPanel;

__ds_ns.GuidedTask = __ds_scope.GuidedTask;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.CardHeader = __ds_scope.CardHeader;

__ds_ns.CardContent = __ds_scope.CardContent;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.DataQualityPanel = __ds_scope.DataQualityPanel;

__ds_ns.ImportMapper = __ds_scope.ImportMapper;

__ds_ns.OpportunityDrawer = __ds_scope.OpportunityDrawer;

__ds_ns.ForecastConfidence = __ds_scope.ForecastConfidence;

__ds_ns.ForecastMovement = __ds_scope.ForecastMovement;

__ds_ns.FunnelStage = __ds_scope.FunnelStage;

__ds_ns.NextBestAction = __ds_scope.NextBestAction;

__ds_ns.OpportunityHealth = __ds_scope.OpportunityHealth;

__ds_ns.QuotaGap = __ds_scope.QuotaGap;

__ds_ns.QuotaProgress = __ds_scope.QuotaProgress;

__ds_ns.RevenueKPI = __ds_scope.RevenueKPI;

__ds_ns.RiskBadge = __ds_scope.RiskBadge;

__ds_ns.SalesFunnel = __ds_scope.SalesFunnel;

__ds_ns.SellerPerformance = __ds_scope.SellerPerformance;

__ds_ns.StageVelocity = __ds_scope.StageVelocity;

})();
