# Sales Intelligence Platform — Design System

A design system for **Sales Intelligence Platform**, an enterprise multitenant sales-execution product: quota, pipeline, forecast, margin and commercial risk for a technology-distribution business. The product describes itself as *"a professional MVP for multitenant sales execution, forecast control, margin visibility and commercial risk"* — the design language here treats it as a **sales operating system, not a CRM database**.

The design principle behind every decision in this system: **insight first, navigation second.** A user should almost never need to traverse pages to understand something — inline drill-down, contextual drawers, expandable sections and progressive disclosure carry the weight instead.

## Sources

Everything here was derived by reading the product source, not from screenshots:

- **GitHub — https://github.com/georgenton/sales-intelligent-platform** (branch `main`, private). Read closely: `apps/web/src/app/globals.css` (the token seed), `apps/web/src/app/app/layout.tsx` (app shell), `apps/web/src/components/ui/*` (Button, Badge, Card, Input), the dashboard / opportunities / forecast / alerts / analytics / settings routes, and `apps/api/prisma/seed.ts` (stage ladder, brands, roles, alert codes, fiscal calendar).
- Product stack for context: Next.js 16 App Router + React 19, Tailwind CSS 4 with source-owned shadcn/ui "new-york" primitives, `lucide-react` 0.577 icons, recharts, TanStack Table; NestJS 11 + Prisma + PostgreSQL RLS behind it.

**Explore that repository further** before building anything substantial with this system — the API contracts (`apps/web/src/lib/types.ts`), the alert codes and the health-score model are the vocabulary the UI speaks, and reading them will make any design you produce materially more accurate.

### Substitutions and gaps (please confirm)

- **No logo or brand mark exists in the source.** The product renders a type lockup: a rounded square reading `SI` in cyan on `#081e25`, next to "Sales Intelligence / Command platform". This system reproduces exactly that and **does not invent a mark**. If a real logo exists, drop the SVG into `assets/` and tell me.
- **No webfont ships with the product.** `layout.tsx` applies Tailwind's `font-sans`, i.e. the platform UI stack — so that stack *is* the type identity here. No Google Font was substituted. If a brand typeface exists, send the files and I will re-cut the type tokens.
- **Icons come from Lucide 0.577** (the library the product already uses), loaded from CDN — `https://unpkg.com/lucide@0.577.0/dist/umd/lucide.js`. Nothing is hand-drawn.
- The product's `formatCurrency` (`apps/web/src/lib/utils.ts`) omits `minimumFractionDigits: 0`, so standard-notation amounts render as `$390,000.0`. This system deliberately does **not** reproduce that: money is always whole in standard notation and one decimal in compact notation (`$3.6M`). Worth fixing upstream.
- Charts in the product use recharts. Components here render lightweight CSS/SVG equivalents so they work without a bundler; the colour tokens are identical.

## Personas the system serves

| Persona | Core question | Home surface |
|---|---|---|
| Seller | What should I do today to maximise my chance of hitting quota? | **My day** — quota, then Focus today |
| Sales manager | Will my team reach quota, and where do I intervene? | **Revenue Command Center** |
| Executive | How is the commercial organisation performing? | Command center, trend-weighted |
| Tenant admin | Users, roles, stages, fiscal periods, quotas | Settings and Users — never dominant |

Four cognitive modes sit orthogonal to light/dark appearance: **Standard**, **Focus** (goal, quota, today's priorities, Copilot — analytics suppressed), **Guided** (step-by-step workflow), **Review** (sequential weekly forecast review, "Opportunity 3 of 12").

## Content fundamentals

The product's copy is unusually disciplined; match it.

- **Interrogative headings.** Screen titles are the user's own question, not a noun: *"How is the quarter looking?"*, *"Will the team reach quota?"*, *"What should I do today?"*. A small brand-teal eyebrow above names the surface: *"Sales command center"*, *"Commercial control"*, *"Portfolio"*, *"Workspace"*, *"Performance"*.
- **Sentence case everywhere.** Headings, buttons, card titles: *"New opportunity"*, *"Priority risks"*, *"Snapshot history"*, *"Users and roles"*. UPPERCASE is reserved for API enum values shown as data (`OPEN`, `COMMIT`, `CRITICAL`) and for 12px KPI labels. Alert codes are humanised to sentence case with acronyms preserved (`MISSING_PO` → "Missing PO", `STAGE_STAGNATION` → "Stage stagnation").
- **Second person for the user, no first person for the system.** *"Sign in to review your team's commercial position."* The system states facts rather than speaking about itself: *"Stage changes are recorded automatically."*
- **Declarative, quantified, no hedging.** *"Margin is below the 10% tenant threshold."* *"Opportunity has remained more than 30 days in stage."* *"Purchase order is required at this stage."* Never *"It looks like this deal might be at risk."*
- **Every number carries its qualifier.** `$1.81M` is always accompanied by *"82.3% attainment"* or *"1.9× coverage"* or *"to billed quota"*. A bare number is an unfinished component.
- **Interpretation over description** in manager surfaces: *"Your current forecast is $390K below quota. Three opportunities representing $510K account for most of the quarter risk."* Then one action: *"Review risks."*
- **Risk copy names the evidence and the move.** *"No activity in 9 days."* → *"Suggested: contact customer."*
- **Empty states are instructions, not apologies.** *"No snapshots yet. Capture the current quarter to establish a baseline."* *"No active risks."*
- **No emoji, ever.** No exclamation marks. No marketing adjectives. Words like "powerful", "seamless", "AI-powered" do not appear. AI output is labelled soberly: *"Advisory · deterministic mock provider"*.
- **Spanish appears only as data**, never as UI copy — customer names, workbook headers (`OPPTY`, `VBM`, `Monto`, `Fecha Cierre`), stage names in imported files. The interface is English; the data is bilingual.

## Visual foundations

**Character.** A premium analytical instrument. Calm, dense, trustworthy, high-information. The furthest thing from a marketing site: no hero gradients, no decorative illustration, no glow.

- **Colour.** A single teal/cyan family in `oklch`, taken verbatim from the product: brand `oklch(0.53 0.13 190)`, accent `oklch(0.74 0.13 205)`, bright cyan accent `oklch(0.865 0.127 207)`, canvas `oklch(0.985 0.008 202)` — a barely-tinted cool white. Two ink surfaces are exact hex values from the source: `#081e25` (sidebar) and `#0b2a32` (Copilot / manager brief). Status: green `oklch(0.61 0.16 154)`, amber `oklch(0.75 0.16 78)`, red `oklch(0.59 0.2 25)`, plus a deeper `critical`. At most two background colours per screen: canvas and surface.
- **Pipeline ramp.** Six semantic stage tokens read left-to-right as *further from cash → cash*: discovery (desaturated slate-teal) → qualified → proposal → commit (brand) → backlog → billed (green). Never colour a stage by picking a hue.
- **Type.** Platform UI sans only; no display face. Page titles 30px/600 at `-0.035em`, hero numbers 36–44px at `-0.04em`, KPI values 24px/600, body 14px/1.6, meta 12px/1.5, dense chip counts 11px (the floor). Uppercase 12px at `0.06em` for KPI labels and eyebrows. **Every figure is tabular** (`font-variant-numeric: tabular-nums`); mono (`ui-monospace`) is used only for literal file content, ids, invoice numbers and workbook headers.
- **Spacing.** Strict 4px grid: 16px between KPI tiles, 20px between cards, 20px card padding (16px on compact tiles), 20/32px page padding. Frame: 248px sidebar, 64px header, 480px drawer, 380px Copilot rail, 1600px max content width.
- **Corners.** 8px controls (buttons, inputs, selects), 12px inner rows and tiles, 16px cards, full pills for badges. Nothing is fully square, nothing is a squircle blob.
- **Cards.** 1px `--border`, 16px radius, `0 1px 2px rgb(0 0 0 / 0.05)`. Cards are defined by their **border**, not their shadow. Nested rows inside a card get a 1px border and 12px radius — never a second shadow. Only overlays (drawer, command palette, tooltips) get real depth (`--shadow-overlay`).
- **Backgrounds.** Flat colour only. No imagery, no photography, no illustration, no pattern, no texture, no gradient — the source contains none, and none is invented here. Full-bleed ink panels (sidebar, Copilot, login left half) provide the only large colour fields.
- **Transparency and blur.** Used in exactly three places: the sticky header (`backdrop-filter: blur(8px)` over 90% surface), overlay scrims (`--scrim`), and `oklch(1 0 0 / 0.05)` hairline surfaces on ink backgrounds. Never on cards.
- **Motion.** 140ms colour transitions, 200ms state changes, 280ms panel entrances on `cubic-bezier(0.16,1,0.3,1)`. Funnel bands and progress bars animate their width; drawers slide from the right. Nothing loops, nothing bounces, nothing decorates. `prefers-reduced-motion` collapses every duration to 0ms.
- **Hover / press / focus.** Hover darkens (`brightness(0.94)`) or lifts to a soft brand tint — never scales, never shadows. Nav hover on ink is `oklch(1 0 0 / 0.05)`; the active nav item is cyan text on a 10% cyan wash. Press deepens to `--brand-active`. Focus is a 2px `--focus-ring` outline at 2px offset — visible, never removed.
- **Risk never relies on colour.** Every risk state carries colour **and** an icon **and** a word.
- **Charts.** Four series tokens, thin 1px grid in `--border`, no 3D, no gradient fills, no legends where a label will do. Every chart ships an accessible tabular equivalent.

## Iconography

- **Lucide 0.577**, the product's own library (`"iconLibrary": "lucide"` in `components.json`) — 2px stroke, round caps and joins, 24px viewBox. Sizes: 14px in dense tables, 16px default, 18px in nav, 20px in tile headers. Rendered through the `Icon` component so no SVG is ever hand-authored.
- Glyphs actually used by the product, worth reusing: `Gauge`, `Target`, `Sparkles`, `BellRing`, `ChartNoAxesCombined`, `Settings`, `UsersRound`, `Search`, `Building2`, `CircleUserRound`, `Goal`, `CircleGauge`, `ReceiptText`, `BadgeDollarSign`, `AlertTriangle`, `AlertOctagon`, `ArrowUpRight`, `Plus`, `Download`, `Camera`, `History`, `Bot`, `RefreshCw`, `Save`, `PackageOpen`, `Landmark`, `CalendarDays`, `CircleDollarSign`, `UserRound`, `LockKeyhole`, `ArrowRight`, `ChevronLeft`, `ChevronRight`, `ArrowUpDown`, `UserPlus`.
- **No emoji, no unicode pictographs as icons.** Two typographic exceptions are deliberate: `▲` / `▼` for signed deltas and `→` in the import mapper. Both always sit next to a real label.
- No icon font, no sprite sheet, no PNG icons exist in the source.

## Assets

`assets/` holds no logo, because the source has none — see *Substitutions* above. Where a mark belongs, render the `SI` type lockup (see the **Wordmark lockup** card in the Brand group).

## Index

| File | What it is |
|---|---|
| `styles.css` | The single stylesheet consumers link — `@import` list only |
| `tokens/colors.css` | Palette, semantic surfaces/text/status, dark theme |
| `tokens/pipeline.css` | Pipeline stage semantics + soft fills |
| `tokens/typography.css` | Font stacks, scale, weights, tracking, composed type roles |
| `tokens/spacing.css` | 4px scale, radii, control heights, layout frame |
| `tokens/elevation.css` | Card / raised / overlay shadows, scrim, header blur |
| `tokens/motion.css` | Durations, easings, reduced-motion collapse |
| `tokens/base.css` | Minimal resets mirroring the product's `globals.css` tail |
| `guidelines/*.html` | 21 foundation specimen cards (Colors, Pipeline, Type, Spacing, Brand) |
| `guidelines/ux-architecture.md` | **Deliverable 1** — roles, permissions surface, information architecture, navigation rules |
| `guidelines/experience-model.md` | **Deliverable 2** — seller vs manager behaviour, home hierarchies, the four cognitive modes |
| `guidelines/responsive-strategy.md` | **Deliverable 8** — desktop / tablet / mobile intents and per-surface rules |
| `guidelines/accessibility.md` | **Deliverable 9** — WCAG 2.2 AA notes: contrast, keyboard, semantics, accessible charts, motion |
| `guidelines/engineering-handoff.md` | **Deliverable 10** — per-component contract: purpose, variants, states, data, interactions, responsive, a11y, empty / loading / error |
| `components/**` | Reusable primitives — see below |
| `product_screens/index.html` | **Phase 2 product prototype** — Seller Standard / Focus / Guided, Revenue Command Center, funnel drill-down, opportunity drawer, forecast review, seller performance, contextual Copilot, import wizard, responsive frames |
| `ui_kits/command-platform/index.html` | Desktop prototype: login, seller home, command center, funnel drill-down, drawer, Copilot, ⌘K, import wizard, guided + review modes |
| `ui_kits/command-platform/mobile.html` | Mobile prototype: Today · Opportunities · Actions · Meetings · Copilot, with a full-screen deal sheet |
| `SKILL.md` | Agent-skill entry point |
| `github.md` | Source-repository association and screen map |

### Components

`components/core/` — **Icon**, **Button**, **Badge**, **Card** (with **CardHeader**, **CardContent**), **Input**, **Select**.

`components/sales/` — **RevenueKPI**, **QuotaProgress**, **QuotaGap**, **SalesFunnel**, **FunnelStage**, **OpportunityHealth**, **ForecastConfidence**, **RiskBadge**, **StageVelocity**, **ForecastMovement**, **SellerPerformance**, **NextBestAction**.

`components/copilot/` — **CopilotPanel**, **CopilotInsight**, **GuidedTask**.

`components/data/` — **ImportMapper**, **DataQualityPanel**.

`components/controls/` — **PeriodSelector**, **FilterBar**, **CommandPalette**.

`components/overlay/` — **OpportunityDrawer**.

Every component has a sibling `.d.ts` props contract and a `.prompt.md` with a usage example, variants and its empty/loading/error expectations.

**Intentional additions.** The source ships only four UI primitives (Button, Badge, Card, Input). Everything in `sales/`, `copilot/`, `data/`, `controls/` and `overlay/` is new product vocabulary specified by the redesign brief, plus two small additions of my own: **Icon** (a wrapper so Lucide glyphs are never hand-drawn) and **Select** (the product styles raw `<select>` inline in three places; this consolidates that exact styling).

## Engineering notes for consumers

- Interaction state that belongs in global state: selected opportunity, expanded funnel stage, applied filters, experience mode, current fiscal period, Copilot context, import wizard step, guided workflow step. Server data and mutations belong in a query layer. **Never** put auth tokens in global state or `localStorage` — the product uses opaque server-side sessions in HttpOnly cookies, and that is not a design decision to revisit.
- Do not redesign backend architecture, authentication, tenancy, RLS or API security. This system is information architecture, interaction and visual language only.
- Accessibility target is **WCAG 2.2 AA**: visible 2px focus ring, full keyboard paths (⌘K palette, Escape closes drawer and palette, arrow keys in the palette), `aria-pressed` on toggles, `aria-modal` + labelled dialogs, accessible chart equivalents as hidden tables, no colour-only meaning, and reduced-motion support.
- Full responsive rules live in `guidelines/responsive-strategy.md`. In short: **desktop** carries the full command center; **tablet** keeps the seller workflow and opportunity management (Copilot rail collapses to a launcher, drawer goes full-height); **mobile** carries Today, Opportunities, Actions, Meetings and Copilot only — dashboards are not compressed onto it.
