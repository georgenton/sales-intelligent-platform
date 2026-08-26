repo: georgenton/sales-intelligent-platform
branch: main
path: apps/web

## Last sync

date: 2026-08-26T01:53:00Z

### Updated in this project

- Token system extracted from `apps/web/src/app/globals.css` (oklch teal palette, radii, chart series) and extended with dark theme, pipeline-stage and sales semantics.
- 24 reusable components authored: the four source primitives plus the sales, Copilot, import, control and drawer vocabulary from the redesign brief.
- Interactive UI kit recreating the command platform: login, seller home, revenue command center, funnel drill-down, opportunity drawer, Copilot, import wizard, guided and review modes.
- 21 foundation specimen cards covering colour, pipeline, type, spacing and brand.

## Screen map

| Project screen | Built from |
|---|---|
| `ui_kits/command-platform/AppShell.jsx` | `apps/web/src/app/app/layout.tsx`, `src/components/layout/sidebar-nav.tsx` |
| `ui_kits/command-platform/index.html` (login) | `src/app/login/page.tsx`, `src/components/auth/login-form.tsx` |
| `ui_kits/command-platform/ManagerHome.jsx` | `src/app/app/dashboard/page.tsx`, `src/components/dashboard/dashboard-charts.tsx`, `manager-brief.tsx` |
| `ui_kits/command-platform/SellerHome.jsx` | `src/app/app/dashboard/page.tsx`, `src/lib/types.ts` (DashboardData), `apps/api/prisma/seed.ts` |
| `ui_kits/command-platform/Opportunities.jsx` | `src/app/app/opportunities/page.tsx`, `src/components/opportunities/opportunity-table.tsx`, `src/app/app/alerts/page.tsx`, `src/app/app/settings/page.tsx` |
| `ui_kits/command-platform/Workflows.jsx` | `src/app/app/opportunities/[id]/page.tsx`, `update-opportunity-panel.tsx`, `src/app/app/forecast/page.tsx`, root `README.md` (Excel importer) |
| `components/core/*` | `src/components/ui/{button,badge,card,input}.tsx` |
| `tokens/*` | `src/app/globals.css`, `apps/api/prisma/seed.ts` (stage ladder) |
