# UI kit — Sales Intelligence command platform

An interactive recreation of the product's web app (`apps/web`), composed entirely from this design system's components.

Open `index.html`. The flow:

1. **Login** — split ink/surface layout, exactly the source's copy and hierarchy. Any credentials sign in.
2. **Revenue Command Center** (manager default) — quota progress, KPI row, the quota-gap interpretation, the interactive funnel, forecast movement since Monday, brand split, team roster.
3. **Interactive funnel** — hover a band for probability, average amount, days in stage, count at risk and amount likely to slip; click to expand a breakdown *below the funnel*, never a page change.
4. **Opportunity drawer** — click any deal anywhere (funnel breakdown, table row, alert, Copilot insight, forecast movement). Escape closes.
5. **Copilot rail** — context label changes with the selected deal; suggestions are context-specific; two proactive insights sit pinned above the log.
6. **⌘K command palette** — arrow keys, Enter, Escape. Some commands change screen or mode.
7. **Modes** — Standard / Focus / Guided / Review in the header. Focus strips secondary analytics; Guided runs a four-step deal review; Review walks opportunities sequentially with Keep Commit / Move category / Ask seller / Add note / Next.
8. **Personas** — Seller / Manager switch at the bottom of the sidebar changes navigation and home surface.
9. **Appearance** — the moon/sun button toggles the dark theme, resolved purely from tokens.
10. **Import wizard** — eight-step rail, column mapper with per-row confidence and a detected saved template, then the pre-import data-quality verdict.

Files: `data.js` (synthetic data, shaped like `src/lib/types.ts`), `AppShell.jsx`, `SellerHome.jsx`, `ManagerHome.jsx`, `Opportunities.jsx` (portfolio + alerts + settings), `Workflows.jsx` (import, guided, review).

All figures are synthetic. Customer names are invented; brands, stage names, roles, alert codes and the fiscal calendar match the product seed.
