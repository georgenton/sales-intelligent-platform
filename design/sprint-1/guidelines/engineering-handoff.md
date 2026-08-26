# 10 · Engineering handoff

One contract per component: purpose, variants, states, data, interactions, responsive behaviour, accessibility, and the three states teams forget — empty, loading, error.

Conventions that apply to **every** component here:

- Styling references CSS custom properties only. No component hard-codes a hex value, and none imports a CSS-in-JS library or npm package beyond React.
- Interaction state (selected opportunity, expanded funnel stage, filters, experience mode, fiscal period, Copilot context, import step, guided step) belongs in global interaction state. Server data and mutations belong in the query layer. **Auth tokens never enter either** — sessions stay in HttpOnly cookies.
- Loading is a skeleton that preserves layout, never a centred spinner that collapses the card.
- Errors are stated in one plain sentence with a retry, scoped to the failing panel — never a global toast, never a modal.
- Empty states are instructions or genuine good news, never apologies.

### Icon

**Purpose** — Render a Lucide 0.577 glyph — the product's own icon library — so no SVG is ever hand-authored.
**Variants** — Any Lucide name; sizes 14 (dense tables) / 16 (default) / 18 (nav) / 20 (tile headers).
**States** — None. Colour inherits `currentColor`.
**Data** — `name`, `size`, `strokeWidth`, `label`.
**Interactions** — None; it is never the interactive element itself.
**Responsive** — Unchanged across breakpoints; icon-only buttons grow to a 44px touch target on touch breakpoints.
**Accessibility** — `aria-hidden` by default; passing `label` promotes it to `role="img"` with a `<title>`.
**Empty** — Unknown name renders an empty 24×24 box rather than throwing — layout never shifts.
**Loading** — Lucide UMD not yet loaded renders the empty box; it fills on the next render.
**Error** — Never throws.

### Button

**Purpose** — The action control. One `primary` per view; everything else recedes.
**Variants** — primary · secondary · outline · ghost · danger · onDark; sizes sm 32 / md 40 / lg 48 / icon 40².
**States** — default · hover (brightness 0.94) · active · focus-visible (2px ring) · disabled (0.5 opacity, pointer-events none).
**Data** — `variant`, `size`, `icon`, `iconAfter`, `full`, plus native button props.
**Interactions** — Click / Enter / Space. No scale or shadow change on press.
**Responsive** — `full` for stacked mobile forms; icon-only buttons reach 44px on touch.
**Accessibility** — Native `<button>`; `size="icon"` requires `aria-label`; disabled is a real attribute, not a class.
**Empty** — n/a
**Loading** — Caller sets `disabled` and swaps the label ("Saving…"), optionally a spinning `RefreshCw`.
**Error** — Failure is reported by the surrounding form (`role="alert"`), never by the button.

### Badge

**Purpose** — Read-only status token for enum values — status, forecast category, stage, count.
**Variants** — neutral · brand · positive · warning · risk · critical · outline; optional `uppercase` for raw enums.
**States** — Static. Not interactive — a clickable pill is a `FilterBar` chip.
**Data** — `tone`, `icon`, `uppercase`, children.
**Interactions** — None.
**Responsive** — Wraps; never truncates. Long enum values shorten upstream.
**Accessibility** — Plain text in flow. Risk tones must include an icon or an explicit word — use `RiskBadge` for severity.
**Empty** — Render nothing rather than an empty pill.
**Loading** — A 56×20 skeleton pill.
**Error** — n/a

### Card / CardHeader / CardContent

**Purpose** — The container for every panel. Definition comes from the 1px border, not the shadow.
**Variants** — default · inverse (ink Copilot/brief surface) · risk (danger border) · sunken; `pad` for header-less cards.
**States** — Static container. Interactive cards get their affordance from an inner button, not a hover lift.
**Data** — `tone`, `pad`; header takes `title`, `subtitle`, `icon`, `action`.
**Interactions** — None itself. Nested rows use 12px radius + 1px border — never a second shadow.
**Responsive** — Full-width below 768px; 20px padding holds at every breakpoint (16px on compact tiles).
**Accessibility** — `CardHeader title` renders an `<h3>`. Keep heading order sane per screen.
**Empty** — A card with no content should not render — remove the card, not just its body.
**Loading** — Border and header render immediately; body shows skeleton rows so layout never jumps.
**Error** — Body shows one sentence plus a retry `Button variant="outline"`; the card frame stays.

### Input

**Purpose** — Text entry, 40px, 8px radius.
**Variants** — labelled · bare · with leading icon (search) · borderless (filled header search).
**States** — default · hover · focus (ring) · filled · error (danger border + message) · disabled.
**Data** — `label`, `hint`, `error`, `icon`, `borderless`, native input props.
**Interactions** — Type, clear, submit on Enter within a form.
**Responsive** — Full-width by default; stacks in single column below 768px.
**Accessibility** — Label bound by `htmlFor`; `aria-invalid` on error; the error message sits next to the field, not in a toast.
**Empty** — Placeholder shows a real example ("Search title, customer or seller"), never "Enter value".
**Loading** — Disabled with a skeleton fill during async prefill.
**Error** — `error` string renders in danger below the field and sets `aria-invalid`.

### Select

**Purpose** — Enum editing — status, stage, forecast category, column mapping.
**Variants** — labelled · bare; options as strings or {value,label}.
**States** — default · hover · focus · disabled · unset (leading "— … —" option).
**Data** — `options`, `label`, `hint`, native select props.
**Interactions** — Native picker. Changes are optimistic; the caller confirms.
**Responsive** — Full-width; native picker on touch.
**Accessibility** — Native `<select>` with a bound label. Always give an explicit `aria-label` when unlabelled (mapper rows).
**Empty** — Render "— Ignore column —" style unset option rather than an empty list.
**Loading** — Disabled with a single "Loading…" option.
**Error** — Border switches to danger; message sits below, as `Input`.

### RevenueKPI

**Purpose** — One measured number with the qualifier that makes it decidable.
**Variants** — tone default · positive · warning · risk; `hero` (36px) for the one lead metric; formats currency · percent · multiple · raw.
**States** — static · with delta (▲/▼ + signed value) · hero · risk-toned.
**Data** — `label`, `value`, `currency`, `format`, `detail`, `delta`, `deltaLabel`, `icon`, `tone`.
**Interactions** — Not interactive by default. If it opens a breakdown, wrap it in a button and say so in the label.
**Responsive** — 3–6 per row desktop, 2 tablet, quota progress + 2 on mobile with the rest behind "All metrics".
**Accessibility** — Tabular numerals; the qualifier is real text, not a tooltip. Delta direction is a glyph plus a signed number, not colour alone.
**Empty** — Em dash plus "no quota set for this period" in `detail`.
**Loading** — Label and icon render; a 24px skeleton bar replaces the value.
**Error** — Em dash value with `detail` = "unavailable" — never a zero, which reads as real data.

### QuotaProgress

**Purpose** — Answers "am I going to make quota?" on one axis: solid billed, translucent forecast, tick at quota.
**Variants** — full (with legend) · `compact` (single line, for drawer and list rows).
**States** — under quota (attainment amber) · at or above (green) · no quota set.
**Data** — `quota`, `billed`, `forecast`, `currency`, `label`, `compact`.
**Interactions** — None. Segment widths animate on data change (280ms), collapsed under reduced motion.
**Responsive** — Full width everywhere; legend wraps to two lines on tablet, `compact` on mobile rows.
**Accessibility** — The bar carries an `aria-label` reading all three values; the attainment percentage is real text.
**Empty** — "No quota set for this period" replaces the bar — do not render a 0% track.
**Loading** — Grey track with no segments and a skeleton percentage.
**Error** — Track with a single sentence beneath: "Quota could not be loaded."

### QuotaGap

**Purpose** — The management interpretation — not a KPI. Says how far short, what drives it, and what to do.
**Variants** — short of quota (danger) · above quota (positive).
**States** — with drivers · without drivers · with action · read-only.
**Data** — `gap` (positive = short), `interpretation`, `drivers[{label,amount}]`, `action`, `onAction`.
**Interactions** — One action button, which opens a filtered risk view or review mode — not a new route where avoidable.
**Responsive** — Sits beside quota progress on desktop, stacks above the funnel on tablet, is the second block on mobile.
**Accessibility** — Interpretation is body text, so screen readers get the conclusion without parsing numbers.
**Empty** — Gap of zero renders the positive variant with "Forecast covers quota" — never an empty card.
**Loading** — Skeleton hero number and two skeleton driver rows.
**Error** — Show the gap number with drivers omitted and one line: "Risk concentration unavailable."

### SalesFunnel

**Purpose** — The pipeline as a true funnel: bands narrow toward cash, hover exposes mechanics, click expands in place.
**Variants** — controlled (`selectedStage`) · self-managed; with or without `renderDetail`.
**States** — idle · stage hovered (tooltip) · stage selected (outline + expanded detail) · collapsed.
**Data** — `stages[]` (name, token, amount, count, probability, avgAmount, atRisk, avgDaysInStage, likelyToSlip), `renderDetail`.
**Interactions** — Hover reveals stage mechanics; click **selects** and expands the detail region below; clicking again collapses. Never navigates.
**Responsive** — Full funnel desktop and tablet (detail stacks); on mobile a stage list where tap expands.
**Accessibility** — Stages are buttons with `aria-pressed` and a full `aria-label`; a visually-hidden `<table>` gives the tabular equivalent.
**Empty** — "No open pipeline in this period." — no zero-width bands.
**Loading** — Four grey bands at descending widths plus a skeleton caption.
**Error** — Bands hidden; one sentence and a retry button, dashboard context preserved.

### FunnelStage

**Purpose** — One narrowing band. Rarely used alone.
**Variants** — Six pipeline tokens: discovery · qualified · proposal · commit · backlog · billed.
**States** — default · hover (brightness 1.08 + tooltip) · selected (2px outline) · focus-visible.
**Data** — `name`, `token`, `amount`, `count`, `widthPct`, plus the hover metrics.
**Interactions** — Hover/focus shows the tooltip; click selects.
**Responsive** — `widthPct` is computed by the funnel; minimum 34% so the last band stays legible and tappable.
**Accessibility** — Button with `aria-pressed`; tooltip content is supplementary — the amount and count are always visible in the band.
**Empty** — A zero-amount stage still renders with "0 opportunities" so the ladder stays readable.
**Loading** — Grey band at the same width.
**Error** — n/a — handled by the funnel.

### OpportunityHealth

**Purpose** — The explainable 0–100 forecast health score with the factors that moved it.
**Variants** — sizes sm (tables) · md · lg (drawer, with factors); `showFactors` on/off.
**States** — HEALTHY · AT_RISK · CRITICAL — each with its own arc colour, glyph and word.
**Data** — `score`, `status`, `factors[{code,impact,message}]`, `showFactors`, `size`.
**Interactions** — Static. Factors may be wrapped in a disclosure by the caller when space is tight.
**Responsive** — sm in mobile cards, lg in the full-screen sheet.
**Accessibility** — Arc has `aria-label` "Forecast health 42 of 100, Critical"; status word and glyph both render — never colour alone.
**Empty** — No score yet renders "—" with status omitted, not a 0 (which reads as critical).
**Loading** — Grey ring plus skeleton number.
**Error** — "—" with a "score unavailable" caption; never fabricate.

### ForecastConfidence

**Purpose** — Puts the seller's forecast call beside the system's confidence so disagreement is visible. Core of Review mode.
**Variants** — aligned · disagreement (the verdict word changes).
**States** — confidence <40 danger · 40–64 warning · ≥65 positive.
**Data** — `sellerCategory`, `confidence` (0–100), `rationale`.
**Interactions** — Static. The action lives in Review mode's button row.
**Responsive** — Two columns desktop/tablet, stacks on mobile.
**Accessibility** — "Aligned" / "Disagreement" is a word, not a colour; the percentage is text next to the bar.
**Empty** — No confidence yet: show the seller call and "System confidence not yet computed".
**Loading** — Skeleton bar and percentage.
**Error** — Seller call renders; confidence area shows "unavailable" — a wrong confidence is worse than none.

### RiskBadge

**Purpose** — The only correct way to mark risk: colour **and** icon **and** label.
**Variants** — INFO · WARNING · HIGH · CRITICAL, each with a distinct glyph.
**States** — Static.
**Data** — `severity`, `label` or `code` (API alert codes are humanised automatically).
**Interactions** — None. Clickable risk lives on the row, not the badge.
**Responsive** — Wraps; never truncates.
**Accessibility** — Icon is decorative because the word carries the meaning; contrast checked on each soft fill.
**Empty** — No alerts renders a positive `Badge` "No open risks" — never an empty row.
**Loading** — 20px skeleton pill.
**Error** — n/a

### StageVelocity

**Purpose** — Answers "is this deal moving?" — days in stage against the stage benchmark, with a one-word verdict.
**Variants** — On pace · Slowing · Stalled (derived from the ratio).
**States** — ratio ≤1 positive · 1–1.5 warning · >1.5 danger.
**Data** — `stage`, `daysInStage`, `benchmarkDays`.
**Interactions** — Static.
**Responsive** — Full width in cards and drawers; unchanged on mobile.
**Accessibility** — Verdict word plus both numbers as text; the track is decorative.
**Empty** — No benchmark: show days only, omit the tick and the verdict.
**Loading** — Grey track plus skeleton caption.
**Error** — Days only with "benchmark unavailable".

### ForecastMovement

**Purpose** — Answers "what changed since Monday?" against the last immutable snapshot.
**Variants** — with `onSelect` (rows open the drawer) · read-only.
**States** — net positive · net negative · no movement.
**Data** — `since`, `net`, `movements[{label,delta,reason,opportunityId}]`.
**Interactions** — Row click opens the opportunity drawer — never a route change.
**Responsive** — Full width; on mobile it lives under Today as "Since Monday".
**Accessibility** — Direction is a glyph plus a signed number plus colour; rows are buttons when interactive.
**Empty** — "No forecast changes since Monday." — a real and reassuring answer.
**Loading** — Skeleton net figure and three skeleton rows.
**Error** — One sentence: "Movement could not be computed — the last snapshot may be missing."

### SellerPerformance

**Purpose** — Team roster: pipeline, commit and commit mix per seller — where a manager picks who to help.
**Variants** — with `onSelect` · read-only; full or top-N.
**States** — commit mix <25% turns the bar amber (the intervention cue).
**Data** — `sellers[{seller,opportunities,pipeline,commit,quota}]`.
**Interactions** — Row click opens the seller's forecast in a contextual panel or review queue.
**Responsive** — Full table desktop; seller · commit · mix on tablet; card list on mobile (manager mobile is out of primary scope).
**Accessibility** — Real `<table>` with header cells; the mix percentage is text beside the bar; rows are keyboard-reachable when interactive.
**Empty** — "No sellers in this team yet."
**Loading** — Three skeleton rows keeping column widths.
**Error** — Header renders with one sentence in the body.

### NextBestAction

**Purpose** — The unit of "Focus today": one commercially relevant action that explains why it matters.
**Variants** — severity WARNING · HIGH · CRITICAL; primary label is caller-defined ("Log a call", "Request PO").
**States** — default · hover on the deal name · completed (caller removes the card).
**Data** — `customer`, `amount`, `category`, `risk`, `suggestion`, `severity`, `primaryLabel`, `onPrimary`, `onOpen`.
**Interactions** — Primary button performs the action; "Open deal" opens the drawer. Two actions maximum.
**Responsive** — Full width; on mobile it is the Actions tab's row unit.
**Accessibility** — Severity dot is supplementary — the word "Risk ·" and the sentence carry the meaning. Both buttons are real buttons.
**Empty** — Zero actions is a success state: "Nothing needs you today. Your forecast is current."
**Loading** — Two skeleton cards, never a spinner.
**Error** — "Priorities could not be loaded" with a retry, inside the Focus today card.

### CopilotPanel

**Purpose** — The contextual Copilot surface — dark, docked, and always aware of the current object.
**Variants** — context Dashboard · Opportunity · Forecast review · Import; docked rail · tablet overlay · mobile full-screen.
**States** — idle (insights + suggestions, no log) · conversing · thinking · error.
**Data** — `context`, `contextLabel`, `suggestions[]`, `insights` (CopilotInsight nodes), `messages[]`, `onAsk`.
**Interactions** — Suggestion chips submit immediately; the composer submits on Enter. Insight items can select an opportunity, changing the panel's own context.
**Responsive** — 380px rail desktop; 420px overlay from a launcher on tablet; a tab and full screen on mobile. Suppressed in Guided mode.
**Accessibility** — `<section aria-label="Sales Copilot">`; composer has a label; suggestions are buttons; the message log should be a polite live region in production.
**Empty** — Never blank: proactive insights plus context suggestions. No "How can I help?" greeting.
**Loading** — An assistant bubble with three static dots and "Working…" — no looping animation.
**Error** — An assistant bubble stating the failure plainly and keeping the question in the composer for retry.

### CopilotInsight

**Purpose** — A proactive finding stated as a fact, expanding to its evidence.
**Variants** — tone neutral · risk · positive; `defaultOpen`.
**States** — collapsed · expanded · with or without evidence items.
**Data** — `headline`, `detail`, `items[{label,value,opportunityId}]`, `tone`, `onItemSelect`.
**Interactions** — Header toggles disclosure (chevron rotates 140ms); items select an opportunity.
**Responsive** — Same at all sizes; only renders on an inverse surface.
**Accessibility** — `aria-expanded` on the header button; items are buttons when selectable.
**Empty** — No items renders headline-only and no chevron.
**Loading** — Skeleton headline bar.
**Error** — Omit the insight entirely rather than showing a broken finding.

### GuidedTask

**Purpose** — One step of Guided mode — coaching, not a form. Progress always visible.
**Variants** — first · middle · last (primary label becomes "Finish review"); with or without skip.
**States** — in progress · saving · complete.
**Data** — `step`, `total`, `title`, `why`, children (fields), `onPrimary`, `onSkip`, `onBack`.
**Interactions** — Primary advances and saves; Skip advances without saving; Back returns with values intact. One decision per step, max seven steps.
**Responsive** — 620px column with a context rail on desktop/tablet; full width on mobile with the context collapsed into a disclosure.
**Accessibility** — Progress is text ("Step 2 of 5") as well as a bar; heading order is preserved; focus moves to the new step title on advance.
**Empty** — A workflow with nothing to fix should not start: "Nothing to review — this deal is complete."
**Loading** — Skeleton title and field rows; buttons disabled.
**Error** — Inline message above the buttons; the step is never lost and values are retained.

### ImportMapper

**Purpose** — Step 3 of the guided import: workbook column → platform field, with per-row mapping confidence.
**Variants** — with detected template banner · without; editable · read-only preview.
**States** — confidence ≥90 positive · 60–89 warning · <60 danger; unmapped (ignored) rows.
**Data** — `rows[{source,target,confidence}]`, `fields[]`, `templateName`, `templateConfidence`, `onChange`.
**Interactions** — Each row has a select; changing it updates confidence upstream. Low-confidence rows should be sorted to the top in production.
**Responsive** — Four columns desktop; source over target stacked on tablet; not offered on mobile.
**Accessibility** — Every select has an `aria-label` naming its source column; confidence is a number, not just a bar.
**Empty** — "No columns detected — the first row may not be a header." with a re-parse action.
**Loading** — Header row plus five skeleton rows.
**Error** — Banner stating the file could not be parsed, with the upload step reachable.

### DataQualityPanel

**Purpose** — Step 5: the verdict before anything is written — ready, warnings, invalid, duplicates, then row-level reasons.
**Variants** — counts only · counts + issue list · with review action.
**States** — all ready · warnings present · invalid present (import is partial) · nothing importable.
**Data** — `counts{ready,warnings,invalid,duplicates}`, `issues[{row,severity,message}]`, `onReview`.
**Interactions** — Review opens the row list filtered by severity. Import proceeds on ready rows only, and says so in the button label.
**Responsive** — Four tiles wrap to two on tablet; not offered on mobile.
**Accessibility** — Counts are headings with text labels; severity is a word in each row, not a colour.
**Empty** — Zero issues: "182 rows are ready to import. No warnings." — a real result.
**Loading** — Four skeleton tiles.
**Error** — "Validation did not complete" with retry; the import button stays disabled.

### PeriodSelector

**Purpose** — Global fiscal-period switcher, top-right of any workspace header.
**Variants** — with or without a comparison baseline; 2–6 periods.
**States** — selected · unselected · hover · focus.
**Data** — `periods[]`, `value`, `onChange`, `comparison`.
**Interactions** — Click switches the period for the whole screen — it is global interaction state, never per-widget.
**Responsive** — Segmented on desktop/tablet; a `Select` on mobile.
**Accessibility** — `role="group"` with a label; each option is a button with `aria-pressed`.
**Empty** — A single period renders as a static label, not a one-item switcher.
**Loading** — Skeleton pill of the same width.
**Error** — Fall back to the current period label as static text.

### FilterBar

**Purpose** — Chip filters plus optional search, with applied state always visible.
**Variants** — with or without search; with or without counts; with clear-all.
**States** — chip on/off · hover · focus · some applied (clear-all appears).
**Data** — `filters[{id,label,count}]`, `applied[]`, `onToggle`, `onClear`, `search`, `onSearch`.
**Interactions** — Chips toggle immediately; applied chips show a × ; clear-all resets. Filter state belongs in global interaction state so it survives a drawer.
**Responsive** — Wraps to multiple lines; on mobile search sits full-width above a horizontally scrolling chip row.
**Accessibility** — Chips are buttons with `aria-pressed`; the search field has a real label; counts are inside the button text.
**Empty** — No filters available renders search only.
**Loading** — Search plus three skeleton chips.
**Error** — Chips render without counts rather than disappearing.

### CommandPalette

**Purpose** — ⌘K keyboard-first entry to any object or action.
**Variants** — grouped commands (Navigate · Create · Review · Data · Copilot); with hints.
**States** — closed · open empty query · filtering · no matches · item highlighted.
**Data** — `open`, `commands[{id,label,group,hint}]`, `onSelect`, `onClose`.
**Interactions** — ⌘K/Ctrl+K toggles (host-owned listener), ↑↓ move, Enter runs, Escape closes, click on the scrim closes, hover sets the highlight.
**Responsive** — 620px max width, 12vh from the top; near-full-width on mobile.
**Accessibility** — `role="dialog" aria-modal="true"` with a label; autofocused labelled input; the host must trap and restore focus.
**Empty** — "No matches. Try a customer, seller or opportunity name."
**Loading** — Static command list renders instantly; async object results append under a "Results" group with a skeleton row.
**Error** — Static commands remain usable; a single line notes that search is unavailable.

### OpportunityDrawer

**Purpose** — The default way to inspect an opportunity from any dashboard — 480px right panel that keeps context behind it.
**Variants** — with `footer` (Copilot suggestions, forms) · without; with or without stage history.
**States** — closed · open · open with alerts · escalating to the full record.
**Data** — `opportunity` (customer, amount, stage, forecast category, health, risk alerts, seller, partner, brand, close date, billing date, margin, next action, stage history, days in stage), `onClose`, `onOpenFull`, `footer`.
**Interactions** — Opens from funnel breakdowns, tables, alerts, Copilot insights and forecast movement. Escape or scrim closes. "Open full record" is an escalation, never the default.
**Responsive** — 480px desktop; ~60% width tablet; full-screen sheet on mobile with swipe-to-dismiss.
**Accessibility** — `role="dialog" aria-modal="true"` labelled by the opportunity title; Escape wired internally; focus should be trapped and restored by the host.
**Empty** — Renders nothing when no opportunity is selected — never an empty shell.
**Loading** — Header with the known title and amount from the row, skeleton body — the drawer opens instantly.
**Error** — Header plus "This opportunity could not be loaded" and a retry; the drawer never blocks the dashboard.
