# 9 · Accessibility notes — WCAG 2.2 AA

## Colour and meaning

- **No colour-only meaning, anywhere.** Every risk, health and status state carries **colour + icon + label**: `RiskBadge` renders a severity glyph and a word; `OpportunityHealth` renders an arc, a number, an icon and a status word; `StageVelocity` renders a one-word verdict.
- Body text on `--surface` and `--bg-canvas` clears 4.5:1; `--text-muted` is reserved for ≥12px secondary text and clears 4.5:1 against both surfaces. `--text-inverse-muted` on the ink surfaces clears 4.5:1.
- Status text is never the raw saturated hue on a soft fill without a check: warning text uses `oklch(0.52 0.12 78)` rather than `--warning` (which is a fill, not a text colour). Never set `--warning` as body text on white.
- Both themes derive from the same token names, so contrast is a token property, not a per-component decision.

## Keyboard

- Every interactive element is a real `<button>`, `<a>`, `<input>` or `<select>` — no click handlers on `<div>`s in this system.
- **⌘K / Ctrl+K** opens the command palette; ↑↓ move, Enter runs, Escape closes.
- **Escape** closes the opportunity drawer and the palette. Focus returns to the trigger.
- Drawers and the palette are `role="dialog" aria-modal="true"` with an accessible name; the host should trap focus and restore it on close.
- Funnel stages are buttons with `aria-pressed` — the funnel is fully keyboard-drillable.
- Focus is a visible 2px `--focus-ring` outline at 2px offset. It is never removed, and never replaced by a colour change alone.

## Screen-reader semantics

- Toggles (`PeriodSelector`, `FilterBar`, `ModeSwitch`, funnel stages) use `aria-pressed`; groups use `role="group"` with a label.
- Navigation is `<nav aria-label="Primary">` with `aria-current="page"`.
- Decorative icons are `aria-hidden`; meaningful ones take `label` (rendered as `role="img"` + `<title>`).
- Form errors set `aria-invalid` and are associated with the field; status messages use `role="status"`, blocking errors `role="alert"`.

## Accessible data visualisation

- **`SalesFunnel` ships a visually-hidden `<table>`** with a caption and one row per stage — the alternative tabular representation.
- `QuotaProgress` carries a full `aria-label` reading billed, forecast and quota values.
- `OpportunityHealth` labels the arc with "Forecast health 42 of 100, Critical".
- Any chart added to this system must ship the same: an equivalent table or a complete `aria-label`. A canvas or bar row with no text equivalent is not shippable.
- All figures are tabular numerals, which also improves comparison for low-vision users.

## Motion

`prefers-reduced-motion: reduce` collapses `--dur-instant/fast/base/slow` to `0ms`, which removes every transition in the system at once — width animations, drawer slides, expand/collapse. Nothing loops or autoplays, so there is no pause requirement.

## Target size and pointer

Controls are 32 / 40 / 48px tall; on touch breakpoints the minimum is 44px. Hover-only information always has a tap or focus equivalent (funnel mechanics, table row affordances).
