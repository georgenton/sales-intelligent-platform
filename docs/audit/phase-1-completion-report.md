# Phase 1 commercial domain completion report

## Scope and baseline

- Branch: `feat/phase-1-commercial-completion`
- Required base: `staging` at `0d60cc2e57086a1a9c62890452903a0d7e79b549`
- Customer production and `main`: untouched
- Full Phase 2/3 functionality: intentionally not implemented
- Reviewed final role-scope baseline: `e2167578be05810a5ffae3cca64f5a46a29a8828`
- Private workbook: `PROGRAMA VENTAS.xlsx` was not found in the authorized project, download, document, desktop, iCloud Drive, or CloudStorage locations; no private data was copied, parsed, uploaded, logged, or committed

## Implemented commercial contract

The platform now uses stage code as the canonical contract: 20 Prospecting, 40 Qualification, 60 Proposal, 80 Negotiation, 90 Closing, and terminal 100 Billed. Lost and Cancelled remain statuses. Stage 40 permits only Pipeline or Omitted; Best Case begins at stage 60. Stage 80 retains deliberate Pipeline/Best Case/Commit/Omitted downgrade support. A forward-only corrective Prisma migration converts any stage-40 Best Case rows to Pipeline and reconciles unsupported stage-100 rows without rewriting applied migration history or deleting opportunity history.

Current-quarter calculations are tenant-fiscal-calendar aware. Open forecast is eligible open Best Case plus Commit. Remaining quota is `max(quota - billed, 0)` and is the coverage denominator. Projected revenue is `billed + open forecast`; projected gap is `max(quota - projected revenue, 0)`. Billing and projected attainment use those same explicit numerators. Coverage is eligible current-quarter open pipeline divided by remaining quota; weighted coverage applies opportunity probability first. A missing quota produces `null` quota-derived values, while a fulfilled quota produces `coverageStatus=FULFILLED` and null coverage ratios.

The dashboard response is the consolidated source for tenant/seller quota, actual billing, remaining quota, open forecast, projected revenue, projected gap, Commit, backlog, billing/projected attainment, coverage, and GM. Brand performance returns the same unambiguous commercial facts per brand. Seller quota is never derived from team quota. `QuotaProgress` receives billed and open forecast directly and computes the projection without subtracting billed from open forecast.

`BillingRecord` is the authoritative actual-revenue fact. Ordinary opportunity create/update and import paths reject stage 100 without a billing fact. A linked billing record atomically advances an appropriate stage-90 Won opportunity to stage 100 with stage history and audit evidence. A brand-only billing fact increases the billed KPI but cannot advance an opportunity. Existing unsupported synthetic stage-100 rows are moved to stage 90 rather than creating fake billing records.

Seller-facing financial input is GM %. Gross profit is calculated and persisted. Conflicting amount/GM/gross-profit input is rejected. Tenant margin threshold drives deterministic low-margin alerts.

Gate 60 and gate 80 are tenant-owned bilingual criteria with auditable evidence responses. Seller advancement is blocked until evidence is complete. Manager/Tenant Admin override requires a reason and produces both review and audit evidence. Forecast Review, Ask Seller, Seller Response, notes, category decisions, and Guided actions persist in the backend.

CSV and XLSX uploads use a bounded in-memory multipart service with server-side analysis, visible source-to-destination mapping, explicit confirmation, dry-run validation, quality status, source-sheet recognition, and idempotent execution. Required/unconfirmed/duplicate mappings block execution. `Oppty` feeds opportunities; `Facturado Daily` feeds first-class billing facts; `Resumen` and `Canales Proceso` are recognized but not imported. `Orders` is intentionally not assumed to be an invoice identifier. Aggregate billing requires an operator-supplied `asOfDate` when no per-row date is mapped; today's date is never invented.

Manager updates now use `OPPORTUNITIES_UPDATE_TEAM`, scoped by `managerId == currentUser` or `sellerId == currentUser`. Tenant/Platform Admin retain tenant-wide mutation, Seller remains owner-scoped, and Executive/Viewer remain read-only. The same scope applies to opportunity, qualification, and review mutations, above PostgreSQL RLS.

Analytics, alerts, billing attribution, and forecast snapshots now use that same role scope instead of stopping at tenant RLS. A Manager sees only team-derived pipeline, forecast, Commit, backlog, funnel, GM, seller/brand performance, alerts, and billing linked to those opportunities. A manager-specific quota is used when present; otherwise quota-derived values remain not configured. Brand-only unattributed billing and tenant quota are never used as Manager fallbacks. Snapshot rows carry `scopeType` plus `scopeUserId`, and latest-diff compares only compatible snapshots.

## Final role contract matrix

| Role                  | Data scope                       | Read                                                       | Mutation                                                                                  | Snapshots                             | Dashboard                                                                                   |
| --------------------- | -------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------- |
| Tenant/Platform Admin | Tenant-wide                      | All commercial tenant data                                 | Create with explicit Seller/optional Manager; update all                                  | Tenant read/create                    | Tenant total quota and all billing, including unattributed brand-only facts                 |
| Manager               | Managed or self-sold opportunity | Team opportunities, alerts, reviews, qualification         | Active Seller preserved; backend forces current Manager; team update/review/qualification | Exact `TEAM/current-user` read/create | Team facts only; linked billing only; manager quota or `NOT_CONFIGURED`                     |
| Seller                | Own opportunity                  | Own opportunities, alerts, reviews, qualification          | Create/update self; own qualification and review response                                 | Exact `OWN/current-user` read-only    | Own facts only; linked billing only; seller quota or `NOT_CONFIGURED`                       |
| Executive             | Tenant-wide                      | Opportunity, alert, forecast and analytics reads           | None                                                                                      | Tenant read-only                      | Tenant-wide read-only command center                                                        |
| Viewer                | Tenant-wide                      | Opportunity, forecast and analytics reads; no alert detail | None                                                                                      | Tenant read-only                      | Tenant-wide read-only command center; mutation entry points and alert navigation are hidden |

Executive and Viewer mutation entry points are absent from the shell command palette, dashboard review mode, opportunity list/drawer/detail/qualification, forecast capture, and direct create route. Backend permission guards remain authoritative and return 403 for crafted create/update/snapshot mutation requests.

Local password recovery uses generic responses, rate limits, secure one-time hashed tokens, expiry, Argon2id, session revocation, one-time use, and audit. SMTP is configurable without a paid dependency. Future feature entitlements are disabled by default and managed only through the guarded migration-credential CLI.

## Verification evidence

| Check                  | Result | Evidence                                                                 |
| ---------------------- | ------ | ------------------------------------------------------------------------ |
| Formatting             | PASS   | `pnpm format:check`                                                      |
| Lint                   | PASS   | `pnpm lint`                                                              |
| Types                  | PASS   | `pnpm typecheck`                                                         |
| Unit/component tests   | PASS   | 80 tests across API, web, and shared packages                            |
| API integration        | PASS   | 21 tests, including exact Manager A/B scope and read-only mutations      |
| Tenant isolation / RLS | PASS   | 5 tests across all new tenant-owned tables                               |
| Production build       | PASS   | `pnpm build`                                                             |
| Migration baseline     | PASS   | Four ordered migrations; schema current after final role-scope migration |
| Prisma schema          | PASS   | `prisma validate`                                                        |
| Dependency audit       | PASS   | no high/critical findings; one low and three moderate remain             |
| Secret scan            | PASS   | Gitleaks: 68-commit history plus final role-scope diff                   |
| Docker/API readiness   | PASS   | corrected image build; live 200; ready 200 with database up              |
| Browser/E2E            | PASS   | 9 contracts across clean split runs: 7 core flows plus 2 role flows      |
| GitHub CI              | PASS   | Run `34155380450` green on application HEAD `c44ccdf`                    |
| Vercel Preview         | PASS   | Deployment `dpl_8Q2emHm6WPgrMKLrMj5tp6wsJedT` for `c44ccdf`, READY       |

## Commercial acceptance matrix

| Requirement                      | Implementation                                                                              | Test evidence                                          | Status                          |
| -------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------- |
| Opportunity CRUD                 | Canonical state validation, ownership, financial derivation, audit/history                  | Domain unit + API integration + E2E progression        | PASS                            |
| Seller Workspace                 | Seller-scoped metrics, risks, qualification gaps, manager questions, durable Guided actions | Analytics integration + seller browser flow            | PASS                            |
| Manager Command Center           | Decision KPIs, risk, brand table, seller view, review entry                                 | Analytics integration + manager browser flow           | PASS                            |
| Quota                            | Tenant total and optional seller period quotas; null semantics                              | Commercial config integration + metric unit tests      | PASS                            |
| Quota by brand                   | Admin configuration and server brand response                                               | Phase 1 integration + manager browser flow             | PASS                            |
| Billed                           | Opportunity-optional billing fact model                                                     | Migration + XLSX integration                           | PASS                            |
| Billed by brand                  | Direct or deterministic opportunity-line attribution                                        | Multi-brand service logic + integration                | PASS                            |
| Forecast                         | Current-quarter open Best Case + Commit only                                                | Fiscal and analytics tests                             | PASS                            |
| Remaining Quota                  | `max(quota - billed, 0)`; coverage denominator; null without quota                          | Exact metric unit + integration                        | PASS                            |
| Projected Gap                    | `max(quota - billed - openForecast, 0)`; distinct from remaining quota                      | Exact $3.0M/$1.98M/$0.72M unit contract + integration  | PASS                            |
| Projected Attainment             | `(billed + openForecast) / quota`; no premature rounding                                    | Exact 90% numeric contract + UI component              | PASS                            |
| Coverage                         | Eligible pipeline / remaining quota and weighted variant                                    | Coverage unit + integration                            | PASS                            |
| GM                               | GM % input, gross-profit derivation, conflict rejection, brand/seller rollups               | Domain unit + integration + UI type/build              | PASS                            |
| Qualification 60                 | Data-driven bilingual required evidence gate                                                | Gate integration + browser progression                 | PASS                            |
| Qualification 80                 | Combined 60+80 evidence gate for Commit                                                     | Gate integration + browser progression                 | PASS                            |
| Funnel                           | Canonical open stages; terminal Billed excluded                                             | Reference-data integration + accessible funnel E2E     | PASS                            |
| Forecast Review                  | Durable Keep Commit, Move Best Case, Ask Seller, Add Note                                   | Review integration + browser review flow               | PASS                            |
| Traceability                     | Review events, seller reply resolution, override/audit events                               | Phase 1 integration                                    | PASS                            |
| Snapshots                        | Fiscal eligibility and deterministic latest diff                                            | Snapshot unit + integration + UI                       | PASS                            |
| Alerts                           | Explainable deterministic commercial and qualification signals                              | Alert unit + integration                               | PASS                            |
| CSV import                       | Server validation/dry run and idempotent opportunity execution                              | Parser + Phase 1 integration + browser validation gate | PASS                            |
| XLSX import engine               | Server-side XLSX parsing; derived/future sheets excluded                                    | Parser + two-pass synthetic integration                | PASS                            |
| Facturado Daily customer mapping | Real workbook-specific headers, dates, and `Orders` meaning not available                   | Authorized local search; no workbook found             | EXTERNAL_CONFIGURATION_REQUIRED |
| Billing source-of-truth          | Manual stage 100 rejected; linked fact advances; brand-only fact changes KPI only           | Migration + API/import integration                     | PASS                            |
| Import mapping confirmation      | Analyze, visible suggestions, explicit confirmation, quality gate, exact execution map      | Parser + API integration + browser E2E                 | PASS                            |
| Manager team RBAC                | Manager A/Seller A allowed; Seller B team denied; admin both; read-only roles denied        | API integration + tenant isolation                     | PASS                            |
| Roles                            | Centralized permissions plus all/team/own/read-only service scope                           | API integration + tenant isolation                     | PASS                            |
| Local auth                       | Argon2id, opaque sessions, lockout, CSRF                                                    | Existing auth integration/regression                   | PASS                            |
| Password recovery                | Hashed expiring one-time token, revoke sessions, audit, rate limit                          | Dedicated recovery integration                         | PASS                            |
| Security                         | Auth, CSRF, RBAC, RLS, audit, redaction, upload limits, secret scan                         | Integration, RLS, local Gitleaks, dependency audit     | PASS                            |
| EN/ES                            | Canonical stage labels and new Phase 1 surfaces localized                                   | Message tests + browser locale flow                    | PASS                            |
| Responsive                       | Commercial screens preserve contained overflow and mobile layout                            | 360/375/390/1024/1440 browser matrix                   | PASS                            |

## RLS coverage

The Phase 1 migration applies `ENABLE ROW LEVEL SECURITY`, `FORCE ROW LEVEL SECURITY`, and tenant-matching `USING` / `WITH CHECK` policies to:

- `qualification_criteria`
- `qualification_responses`
- `opportunity_review_events`
- `tenant_feature_entitlements`

`billing_records` retains its tenant RLS policy after becoming opportunity-optional. The tenant-isolation suite verifies own-tenant access and foreign-tenant rejection for the new tables and billing changes. Password reset tokens are global identity records rather than tenant-owned commercial rows and remain restricted to the authentication service/runtime grants.

## Genuine external configuration

| Dependency                    | Why external                                                                                                                 | Status                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Staging SMTP credentials      | Code and local integration are complete; an SMTP host/account must be supplied by the owner to deliver real email            | EXTERNAL_CONFIGURATION_REQUIRED |
| Real private workbook mapping | The workbook was absent, so `Facturado Daily`, quota/target headers, dates, and `Orders` meaning cannot be declared reliable | EXTERNAL_CONFIGURATION_REQUIRED |

Neither dependency blocks the implemented Phase 1 application contract. SMTP delivery itself and a workbook-derived quota source must not be reported as complete until configured/verified.

## Pull request disposition

PR [#17](https://github.com/georgenton/sales-intelligent-platform/pull/17) remains the sole Phase 1 proposal to `staging`; it must not be merged automatically. Final role-scope application commit `c44ccdf9b269dbd052a00942f5992ed4aefa149e` passed GitHub CI [run 34155380450](https://github.com/georgenton/sales-intelligent-platform/actions/runs/34155380450), including quality, migration, 80 unit/component tests, 21 integration tests, 5 RLS/tenant isolation tests, build, dependency audit, and Gitleaks jobs. The dependency audit reports zero high/critical findings, with one low and three moderate remaining. GitHub reports the PR clean and mergeable.

Vercel Preview deployment `dpl_8Q2emHm6WPgrMKLrMj5tp6wsJedT` cloned commit `c44ccdf`, compiled successfully with Node 24, and reached READY at `https://sales-intelligence-staging-georgenton-55t8yt8a3.vercel.app`. Vercel Authentication may protect anonymous Preview access. Preview status is therefore build/deployment evidence rather than an unauthenticated application smoke test. Full integrated browser evidence is produced against an isolated local web/API/database stack because the unmerged branch intentionally does not migrate or deploy the persistent staging Railway API. No protection bypass is used, no paid Railway preview environment is created, and no customer production deployment is performed.
