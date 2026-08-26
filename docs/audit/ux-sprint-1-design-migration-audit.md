# UX Sprint 1 Design Migration Audit

## Result

**FAIL — NOT READY TO MERGE**

The migrated Sprint 1 surfaces pass the legacy-remnant, responsive, interaction, token, and
artifact-isolation checks. The strict audit does not declare the branch ready because several
Claude component contracts remain partial. Closing those fidelity gaps would add or complete UX
behavior and is outside this audit-only pass.

No merge was performed.

## Git and CI Baseline

| Reference        | SHA                                        | Meaning                                            |
| ---------------- | ------------------------------------------ | -------------------------------------------------- |
| BASE             | `912ee9497e7134098d5e65485cb9f1095656db0c` | `origin/staging` before UX Sprint 1                |
| AUDIT INPUT HEAD | `8493083bb12317d74631ab51f9170d4f5f54f514` | `feat/ux-sprint-1` before this audit/removal delta |

The real GitHub runner result for the audit input HEAD was green: [run 32987160795](https://github.com/georgenton/sales-intelligent-platform/actions/runs/32987160795).
The prior runner-startup outage was treated as external infrastructure, not a code failure. The
audit/removal commit is required to be green on the branch before handoff; the current branch result
is available in [GitHub Actions](https://github.com/georgenton/sales-intelligent-platform/actions?query=branch%3Afeat%2Fux-sprint-1).

## Design Source of Truth

The imported Claude Design reference source is exactly `design/sprint-1/`:

- `design/sprint-1/product_screens/`
- `design/sprint-1/ui_kits/command-platform/`
- `design/sprint-1/guidelines/`
- `design/sprint-1/components/`
- `design/sprint-1/tokens/`
- `design/sprint-1/readme.md`

The directory is already normalized and contains no spaces. No production file in `apps/web` or a
shared production package imports from the design directory, its `_ds_bundle.js`, its prototype
screens, or its UI-kit implementation.

## Route Migration Matrix

| Route                     | Persona                       | Layout                                                | Design system                               | Legacy imports                                                 | Hardcoded legacy styling | Status                   |
| ------------------------- | ----------------------------- | ----------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------- | ------------------------ | ------------------------ |
| `/`                       | Public                        | Redirect only                                         | N/A                                         | None                                                           | None                     | `NON_VISUAL`             |
| `/login`                  | Public                        | Standalone responsive login                           | Canonical semantic tokens and production UI | None                                                           | None                     | `MIGRATED_SPRINT_1`      |
| `/app/dashboard`          | Seller, Manager, Tenant Admin | `AppShell` plus role/mode workspace                   | Sprint 1 production sales components        | Reuses the conforming `CreateSnapshotButton` production action | None                     | `MIGRATED_SPRINT_1`      |
| `/app/opportunities`      | Seller, Manager, Tenant Admin | `AppShell`, responsive table/cards, contextual drawer | Sprint 1 production UI                      | None                                                           | None                     | `MIGRATED_SPRINT_1`      |
| `/app/opportunities/new`  | Authenticated commercial user | `AppShell`, full-page creation form                   | Existing production primitives              | `OpportunityForm` retained                                     | None detected            | `INTENTIONALLY_DEFERRED` |
| `/app/opportunities/[id]` | Authenticated commercial user | `AppShell`, full-record detail/edit                   | Existing production primitives              | `UpdateOpportunityPanel` and full-record page retained         | None detected            | `INTENTIONALLY_DEFERRED` |
| `/app/forecast`           | Manager, Tenant Admin         | `AppShell`, snapshot history                          | Existing production primitives              | Reuses `CreateSnapshotButton`                                  | None detected            | `INTENTIONALLY_DEFERRED` |
| `/app/alerts`             | Seller, Manager, Tenant Admin | `AppShell`, responsive alert cards, contextual drawer | Sprint 1 production UI                      | None                                                           | None                     | `MIGRATED_SPRINT_1`      |
| `/app/analytics`          | Manager, Tenant Admin         | `AppShell`, seller analytics table                    | Existing production primitives              | Existing analytics page retained                               | None detected            | `INTENTIONALLY_DEFERRED` |
| `/app/settings`           | Tenant Admin                  | `AppShell`, settings summary                          | Existing production primitives              | Existing settings page retained                                | None detected            | `INTENTIONALLY_DEFERRED` |
| `/app/admin/users`        | Tenant Admin                  | `AppShell`, memberships list                          | Existing production primitives              | Existing admin page retained                                   | None detected            | `INTENTIONALLY_DEFERRED` |
| `/app/import`             | Tenant Admin                  | `AppShell`, staged import workspace                   | Sprint 1 production UI                      | None                                                           | None                     | `MIGRATED_SPRINT_1`      |
| `/backend/[...path]`      | System                        | Same-origin API proxy                                 | N/A                                         | None                                                           | None                     | `NON_VISUAL`             |

No route is classified as `DEPRECATED`.

## Sprint 1 Surface Audit

Percentages were intentionally not invented. Each result is based on component-region inspection at
all three required viewports.

| Surface                | Result | Legacy found | Action                                                              |
| ---------------------- | ------ | ------------ | ------------------------------------------------------------------- |
| Seller Standard        | PASS   | None         | No removal needed                                                   |
| Seller Focus           | PASS   | None         | No removal needed                                                   |
| Seller Guided          | PASS   | None         | No removal needed                                                   |
| Manager Command Center | PASS   | None         | Removed replaced charts/brief; retained new workspace               |
| Funnel Expanded        | PASS   | None         | Removed hover scale; corrected mobile list and inline disclosure    |
| Forecast Review        | PASS   | None         | No removal needed                                                   |
| Opportunity Drawer     | PASS   | None         | Verified full-screen mobile drawer, Escape, and focus restoration   |
| Dark Mode              | PASS   | None         | Uses the same semantic token names as light/system                  |
| Opportunities          | PASS   | None         | Corrected tablet column density; mobile uses cards                  |
| Alerts                 | PASS   | None         | Replaced direct detail navigation with contextual drawer inspection |

## Intentionally Deferred Surfaces

The following were outside Claude Sprint 1 and were not redesigned or deleted:

- Full-page opportunity creation: `/app/opportunities/new`
- Full opportunity record and edit escalation: `/app/opportunities/[id]`
- Forecast snapshot history: `/app/forecast`
- Seller analytics: `/app/analytics`
- Tenant settings: `/app/settings`
- Executive/Tenant Admin membership management: `/app/admin/users`

## Legacy Component Inventory

### Removed: DEAD + REPLACED

- `apps/web/src/components/dashboard/dashboard-charts.tsx`
- `apps/web/src/components/dashboard/manager-brief.tsx`
- Direct `recharts` dependency from `apps/web/package.json` and its now-unreachable lockfile graph

### Active

No accidental legacy UI component remains active on a migrated Sprint 1 surface. The pre-Sprint
`CreateSnapshotButton` remains an active, semantically styled shared action on the new dashboard and
deferred forecast page; it is reused rather than replaced. The API endpoint named
`/ai/manager-brief` is an active service contract and is not the deleted UI component.

### Deferred

- `apps/web/src/components/opportunities/opportunity-form.tsx`
- `apps/web/src/components/opportunities/update-opportunity-panel.tsx`
- The route-local UI in analytics, settings, and admin/users

### Replaced in Place

- The BASE equal-weight dashboard metric/card arrangement
- The BASE Recharts pipeline/brand visualizations
- The BASE dashboard manager brief card
- The BASE shell/sidebar breakpoint behavior
- Direct opportunity-detail navigation where Sprint 1 requires contextual disclosure
- Color-only opportunity health indicators on the migrated opportunities surface

Static import search, TypeScript, ESLint, and the production build found no remaining reference to the
deleted UI files or to Recharts.

## Token Audit

- Duplicate theme systems: **No**.
- Canonical implementation: `apps/web/src/app/globals.css`, with the same semantic token names for
  default/light and `[data-theme='dark']`.
- `LIGHT`, `DARK`, and `SYSTEM` all select that same semantic system; no second palette or provider was
  found.
- Hex and `rgb()` values are confined to canonical token definitions, shadows, pipeline tokens, and
  login glow tokens in `globals.css`: **TOKENIZED**.
- Hardcoded color literals, arbitrary Tailwind colors, and `rgba()` in production TS/TSX: **None**.
- CSS modules, SCSS, and orphaned route style sheets: **None**.
- Dynamic inline width/position values for progress, confidence, velocity, and funnel geometry are
  **JUSTIFIED_EXCEPTION** because they encode data geometry rather than a visual palette.

## Claude Component Fidelity

| Claude contract      | Production mapping                                      | Status                | Notes                                                                                                                                                           |
| -------------------- | ------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RevenueKPI`         | `components/sales/sales-components.tsx`                 | PARTIAL               | Core hierarchy, tones, values, and responsive composition match; complete loading/error/empty variants are not exposed.                                         |
| `QuotaProgress`      | `components/sales/sales-components.tsx`                 | PARTIAL               | Billed/forecast segmentation matches; full unavailable/over-quota contract states are incomplete.                                                               |
| `QuotaGap`           | `components/sales/sales-components.tsx`                 | PARTIAL               | Gap, interpretation, and drivers match; full action/state contract is incomplete.                                                                               |
| `SalesFunnel`        | `components/sales/sales-components.tsx`                 | PARTIAL               | Accessible stages, responsive mobile list, selection, and inline drilldown match; full loading/error state contract is incomplete.                              |
| `FunnelStage`        | Co-located inside `SalesFunnel`                         | INTENTIONAL_DEVIATION | It is a one-use internal band to keep stage selection, geometry, and disclosure state atomic; behavior is retained without a separately exported component.     |
| `OpportunityHealth`  | `components/sales/sales-components.tsx`                 | PARTIAL               | Score, status, icon, and factor labels exist; the reference arc treatment is not implemented.                                                                   |
| `OpportunityDrawer`  | `components/opportunities/opportunity-drawer.tsx`       | PARTIAL               | Desktop width, mobile full-screen mode, focus trap/restore, Escape, evidence, and full-record escalation match; swipe-to-close and skeleton loading are absent. |
| `ForecastConfidence` | `components/sales/sales-components.tsx`                 | PARTIAL               | Confidence, thresholds, and rationale exist; the full alignment/disagreement verdict contract is incomplete.                                                    |
| `RiskBadge`          | `components/sales/sales-components.tsx`                 | MATCH                 | Severity has semantic color, distinct icon, and text; codes are humanized.                                                                                      |
| `StageVelocity`      | `components/sales/sales-components.tsx`                 | MATCH                 | Uses On pace/Slowing/Stalled and does not fabricate a benchmark when none exists.                                                                               |
| `ForecastMovement`   | `components/sales/sales-components.tsx`                 | PARTIAL               | Direction and selection behavior exist; full empty/loading/error variants are incomplete.                                                                       |
| `SellerPerformance`  | `components/sales/sales-components.tsx`                 | PARTIAL               | Manager table and inline expansion exist; the API does not expose every quota/risk/trend/accuracy field in the reference contract.                              |
| `NextBestAction`     | Composed in seller Focus/Guided workspace               | PARTIAL               | Why/context/open/complete behavior exists; the full standalone action contract is not exported.                                                                 |
| `CopilotPanel`       | `components/copilot/copilot-panel.tsx`                  | PARTIAL               | Context, suggestions, composer, answers, and responsive overlay/dock exist; multi-message history and full proactive disclosures are incomplete.                |
| `CopilotInsight`     | Manager command insight plus contextual Copilot answer  | PARTIAL               | Insight and explanation entry point exist; the reference expandable evidence disclosure is incomplete.                                                          |
| `GuidedTask`         | Seller Guided mode in `sales-workspace.tsx`             | PARTIAL               | Progress, recommendation, decision, and queue advance exist; full standalone focus/back persistence contract is incomplete.                                     |
| `ImportMapper`       | Mapping stage in `import-workspace.tsx`                 | PARTIAL               | Field mapping works; confidence scoring/template confidence ordering is incomplete.                                                                             |
| `DataQualityPanel`   | Data-quality stage in `import-workspace.tsx`            | PARTIAL               | Counts and issues exist; duplicate review/filtering contract is incomplete.                                                                                     |
| `PeriodSelector`     | Dashboard `FilterBar` period control                    | PARTIAL               | Visible active fiscal period exists; the API currently supplies one active period, so multi-period state is absent.                                             |
| `FilterBar`          | Dashboard filter and opportunity search/status controls | PARTIAL               | Search/filter state exists; full chip count/toggle/clear contract is incomplete.                                                                                |
| `CommandPalette`     | `components/layout/command-palette.tsx`                 | MATCH                 | Shortcut, focus management, keyboard navigation, grouped results, and command selection pass E2E.                                                               |

## Interaction Fidelity

| Required chain                                                                                      | Result | Evidence                                                                              |
| --------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------- |
| Manager → Commit funnel → inline drilldown → opportunity → drawer → Copilot → Escape → focus return | PASS   | Automated E2E verifies disclosure, contextual drawer, Escape, and focus restoration.  |
| Seller Standard → Focus → complete priority → Guided → recommended action → next item               | PASS   | Automated E2E advances both mode and queue.                                           |
| Manager → Review → evidence → decision → next item                                                  | PASS   | Automated E2E verifies no advance before the explicit decision and advance afterward. |
| Command Palette → keyboard navigation → command selection                                           | PASS   | Automated E2E uses `Control+K`, `ArrowDown`, and `Enter`.                             |
| Appearance → Light → Dark → System                                                                  | PASS   | Automated E2E verifies semantic theme selection and persistence.                      |
| Logout → protected route                                                                            | PASS   | Automated E2E verifies logout and redirect back to `/login`.                          |

## Visual Audit

Current HEAD was captured locally against isolated synthetic data at:

- 1440 × 1024
- 1024 × 768
- 390 × 844

Ten required surfaces at three viewports produced 30 HEAD screenshots. Five technically equivalent
BASE routes at the same three viewports produced 15 comparison screenshots from a detached local
worktree. BASE was never deployed remotely.

No current capture reported a console error, page error, or 5xx response. Visual inspection found no
old equal KPI grid, Recharts chart, old manager brief, old sidebar behavior, direct detail navigation,
old color-dot health, or mixed old/new card, typography, spacing, badge, color, button, table, or empty
state on the migrated surfaces.

## Design Artifact Isolation

- No production import points at `design/sprint-1`.
- No `design/sprint-1`, `product_screens`, `ui_kits`, or `_ds_bundle` marker exists in the production
  `.next/server` or `.next/static` output.
- No production source or non-source-map production bundle contains an Unpkg, jsDelivr, or cdnjs
  runtime URL.
- Prototype CDN usage remains reference-only.
- Production icons continue to use the installed `lucide-react` package.
- No prototype page was emitted as an application route.

## Security Regression

| Area                   | Result                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| Authentication/session | PASS — integration login, opaque HttpOnly session, logout, and protected redirect verified          |
| CSRF                   | PASS — integration mutations require the session CSRF token                                         |
| RBAC                   | PASS — existing authorization tests/gates remain green; no authorization code changed               |
| Tenant isolation       | PASS — 4 tenant/RLS isolation tests passed                                                          |
| RLS                    | PASS — cross-tenant database visibility/mutation suite passed                                       |
| Secrets                | PASS — Gitleaks scanned Git history and found no leaks                                              |
| Dependencies           | PASS at configured high threshold — 1 low and 1 moderate advisory remain; no high/critical advisory |

## Quality Gates

| Command                                                         | Result                                                      |
| --------------------------------------------------------------- | ----------------------------------------------------------- |
| `pnpm format:check`                                             | PASS                                                        |
| `pnpm lint`                                                     | PASS                                                        |
| `pnpm typecheck`                                                | PASS                                                        |
| `pnpm test`                                                     | PASS — 16 tests across API, web, and shared packages        |
| `pnpm test:integration` with isolated local DB environment      | PASS — 5 tests                                              |
| `pnpm test:tenant-isolation` with isolated local DB environment | PASS — 4 tests                                              |
| `pnpm build`                                                    | PASS — Next.js production route build and API/shared builds |
| Playwright E2E with isolated local DB environment               | PASS — 5 tests                                              |
| `gitleaks git --no-banner --redact --verbose`                   | PASS — no leaks                                             |
| `pnpm security:audit`                                           | PASS at `--audit-level high` — 1 low, 1 moderate            |

The integration command requires an explicitly seeded database URL and an ephemeral demo password.
An initial invocation without that environment failed before login; the correctly configured isolated
run is the authoritative result above. No credential was written to this report or repository.

## Remaining Legacy and Fidelity Debt

- The intentionally deferred opportunity form/detail, snapshot history, analytics, settings, and
  Tenant Admin routes still use their pre-Sprint layouts.
- `CopilotInsight`, import confidence/duplicate review, the health arc, swipe-to-close, and several
  complete loading/empty/error component states remain partial relative to the Claude contracts.
- Seller quota is shown as unavailable where the API does not expose personal quota; no value is
  fabricated.
- The import workflow currently parses CSV; Excel parsing is explicitly unavailable.
- The existing mobile `Meetings` navigation target still resolves to `/app/forecast`; a Meetings
  feature was not added in this no-new-features pass.
- The dependency audit reports one low and one moderate advisory below the configured blocking
  threshold.

## Recommendation

**NOT READY TO MERGE**

The migration is clean of accidental legacy UI on the declared Sprint 1 surfaces, but this strict
audit cannot call the Claude contracts fully faithful while the documented partial contracts remain.
Resolve or explicitly approve those deviations in a separately authorized UX scope, rerun this gate,
and only then reconsider PR #3. Do not merge as part of this audit.
