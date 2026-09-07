# Phase 1 commercial domain

## Canonical opportunity lifecycle

Stage `code` is the stable commercial contract. Names are tenant data, while known canonical codes are localized by the web application.

| Code | English       | Español      | Default status | Default forecast | Meaning                                               |
| ---: | ------------- | ------------ | -------------- | ---------------- | ----------------------------------------------------- |
|   20 | Prospecting   | Prospección  | `OPEN`         | `PIPELINE`       | Initial identified motion.                            |
|   40 | Qualification | Calificación | `OPEN`         | `PIPELINE`       | Discovery and buying context.                         |
|   60 | Proposal      | Propuesta    | `OPEN`         | `BEST_CASE`      | Qualified proposal with gate-60 evidence.             |
|   80 | Negotiation   | Negociación  | `OPEN`         | `COMMIT`         | Commercial negotiation with gates 60 and 80 complete. |
|   90 | Closing       | Cierre       | `WON`          | `CLOSED`         | Won, awaiting billing.                                |
|  100 | Billed        | Facturado    | `WON`          | `CLOSED`         | Operational terminal revenue outcome.                 |

Stage 100 is excluded from the active open funnel. Lost and cancelled are statuses; an opportunity retains its last historical stage instead of moving to a synthetic 0% stage.

The supported status values are `OPEN`, `WON`, `LOST`, and `CANCELLED`. Forecast category is separate from both status and stage: `PIPELINE`, `BEST_CASE`, `COMMIT`, `CLOSED`, or `OMITTED`. A small domain compatibility function rejects impossible combinations while permitting deliberate manager downgrades such as an 80% opportunity in Best Case.

The data migration preserves stage identifiers where possible. Legacy 0/25/50/75 codes are transformed or remapped to 20/40/60/80 and every dependent opportunity, history, and snapshot reference is retained.

## Fiscal calendar and forecast

The fiscal-year start month is tenant configuration. The demo tenant uses December through November, yielding quarters Dec–Feb, Mar–May, Jun–Aug, and Sep–Nov. Quarter boundaries are inclusive and calendar-safe, including leap-year February.

Pipeline, forecast, Commit, snapshots, and coverage use only opportunities whose expected close date is inside the current fiscal quarter. Forecast equals eligible open `BEST_CASE + COMMIT`; Commit is eligible open `COMMIT`. A snapshot stores only the active quarter. The latest diff reports added/removed opportunities and changes to amount, stage, category, close date, and billing date, plus the total forecast delta.

## Quota, billing, gap, and coverage

Quota can be configured for the tenant total, by brand, and optionally by seller. Missing seller quota remains `null` and the UI says "Quota not configured"; the team quota is never apportioned implicitly.

Billing records are actual-revenue facts. An opportunity link is optional, but every import row must have enough attribution to identify a tenant brand, amount, currency, billing date, source, and deterministic external reference. This supports Facturado Daily without creating artificial opportunities.

Definitions:

```text
remaining quota = max(total quota - billed, 0)
pipeline coverage = current-quarter eligible open pipeline / remaining quota
weighted coverage = current-quarter weighted eligible open pipeline / remaining quota
```

Coverage is `null` when quota is not configured. It is also `null` with status `FULFILLED` when remaining quota is zero; this avoids division by zero and truthfully indicates that more coverage is not required. Gap and attainment are computed on the server. Brand performance returns quota, billed, pipeline, forecast, Commit, backlog, gap, billing/forecast attainment, and GM from one consolidated domain response.

## Gross margin

The operational seller input is GM percentage:

```text
gross profit = estimated amount × gross margin percent / 100
GM percent = gross profit / estimated amount × 100
```

Gross profit remains the persisted financial value. If an API client sends both values, a difference greater than one cent is rejected. When line-item cost exists, brand allocation uses line amount minus cost; otherwise opportunity gross profit is apportioned by line amount. Low-margin alerts use the tenant's configurable `defaultMarginThreshold`.

## Qualification gates

Qualification is tenant data rather than JSX rules. Criteria have bilingual labels, gate code, required/evidence-required flags, ordering, and enabled state. Responses are unique per opportunity and criterion, record `YES`, `NO`, or `UNKNOWN`, store evidence, and identify the updating user.

- Gate 60 requires all enabled required 60% criteria to be `YES`, including evidence where configured.
- Gate 80 requires both gate 60 and gate 80.
- Stages 90 and 100 use the same combined evidence requirement as stage 80.
- A seller cannot bypass a gate.
- A Manager, Tenant Admin, or Platform Admin can override only with a mandatory reason. The override creates a durable review event and an audit event.

The Opportunity view, drawer, and Forecast Review consume persisted qualification responses. They do not manufacture evidence from stage, PO, health score, or UI state.

## Review traceability

Forecast decisions use a durable opportunity review log: `KEEP_COMMIT`, `MOVE_BEST_CASE`, `ASK_SELLER`, `SELLER_RESPONSE`, `MANAGER_NOTE`, `GUIDED_ACTION`, and `OVERRIDE_QUALIFICATION`. Move-to-Best-Case changes the category in the same tenant transaction as the review record. Ask Seller targets the opportunity owner; a seller response resolves the parent request. Redux is limited to temporary presentation state.

## Imports

Both CSV and XLSX are parsed server-side from bounded multipart uploads (10 MB maximum) with no permanent file storage. Validation is a dry run and reports `READY`, `WARNING`, or `BLOCKED`. Execution uses deterministic external references and is idempotent.

- CSV and workbook sheet `Oppty` import opportunity source rows.
- `Facturado Daily` imports billing source rows.
- `Resumen` is recognized as a derived/report sheet and is not imported.
- `Canales Proceso` is recognized as future Phase 2 scope and is not imported.
- Unsupported sheets are reported without being used as primary facts.

The private workbook is never committed or logged. The exact quota/target source remains external configuration until a real private workbook is available and its mapping can be verified deterministically.

## Password recovery and mail

Local authentication supports one-time password reset tokens. Only SHA-256 token hashes are stored. Tokens expire, become invalid after use, and successful reset uses Argon2id, clears lockout state, revokes all active sessions, consumes all outstanding tokens, and writes audit events. Forgot-password responses are intentionally generic and endpoints are rate limited.

Mail is provided through SMTP without a paid-platform dependency. Required hosted configuration:

```text
APP_URL=https://the-web-origin.example
PASSWORD_RESET_TTL_MINUTES=30
SMTP_HOST=smtp.example
SMTP_PORT=587
SMTP_SECURE=false
SMTP_FROM=no-reply@example
SMTP_USER=optional-when-server-allows-anonymous-auth
SMTP_PASSWORD=required-whenever-SMTP_USER-is-set
```

Tests and local development use an in-memory provider. A hosted environment without SMTP remains healthy and preserves a generic response, but external delivery is not available.

## Future feature entitlements

Only optional future capabilities use tenant entitlements: `CRM_PROCESS_INTELLIGENCE`, `CHANNEL_CUTOFF_INTELLIGENCE`, `AI_CONTEXTUAL_REAL`, `AI_MANAGER_BRIEF`, and `AI_PREDICTIVE`. All are disabled by default. Enabled keys are exposed in authenticated profile capabilities.

The operator interface is a migration-credential CLI, not a cross-tenant UI:

```bash
pnpm platform:feature -- --environment staging --tenant <tenant-slug> --list
pnpm platform:feature -- --environment staging --tenant <tenant-slug> --feature AI_CONTEXTUAL_REAL --enable
```

The explicit `--environment` value must exactly match `APP_ENV`. The command requires `MIGRATION_DATABASE_URL`; staging operations additionally require `ALLOW_PLATFORM_FEATURE_CHANGES=true`. Production requires `ALLOW_PRODUCTION_FEATURE_CHANGES=true` and an exact `--confirm-production <tenant-slug>` argument. The CLI audits feature metadata and never logs credentials. Full Phase 2/3 capabilities and a paid real AI provider are intentionally not implemented.
