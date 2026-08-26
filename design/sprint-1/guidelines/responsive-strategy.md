# 8 · Responsive strategy

Three intents, not one layout at three widths. Mobile is **not** a compressed dashboard.

| | Desktop ≥1280 | Tablet 768–1279 | Mobile <768 |
|---|---|---|---|
| Purpose | Full Revenue Command Center | Seller workflow + opportunity management | Today, act, ask |
| Shell | 248px sidebar + 64px header + 380px docked Copilot rail | 72px icon rail (labels become tooltips, workspace + persona blocks hidden); Copilot becomes a header launcher opening a 420px overlay | Bottom tab bar (5 items), 56px top bar |
| Grid | 12 columns, 1600px max, 20px gutters | 8 columns, 16px gutters | 1 column, 16px page padding |
| KPIs | 3–6 tiles per row | 2 per row | Quota progress + 2 tiles; the rest behind "All metrics" |
| Funnel | Full funnel + in-place drill-down | Full funnel, drill-down stacks below | Stage list with amount + count; tap expands |
| Opportunity | 480px right drawer | 60%-width right drawer | Full-screen sheet, swipe or ✕ to dismiss |
| Copilot | Docked rail, always visible | Launcher → 420px overlay panel | Tab; full-screen |
| Tables | Full columns | Opportunity · stage · amount · health | Cards, not tables — never a horizontally scrolling grid |
| Import wizard | Rail + content | Rail collapses to a step chip row | Not offered; deep-link says "continue on desktop" |
| Review mode | Detail + queue rail | Detail, queue as a top chip row | Detail only, swipe for next |

## Mobile scope (deliberately narrow)

Five tabs: **Today · Opportunities · Actions · Meetings · Copilot**.

Dashboards, brand analytics, seller roster, snapshots, admin and import are **not** on mobile. A seller on a phone is between meetings: they need their number, their next action, the deal in front of them, and a way to ask.

Touch targets are 44px minimum. Hover-only disclosure has a tap equivalent everywhere — funnel stage mechanics that appear on hover on desktop appear on tap-expand on mobile.

## Rules

1. Never compress a desktop widget — replace it with the mobile-appropriate answer to the same question.
2. Card lists replace tables below 768px.
3. Drawers become full-screen sheets, never modals stacked on modals.
4. The period selector stays reachable on every breakpoint; it is global state.
5. Text never drops below 12px; KPI values never below 20px.
