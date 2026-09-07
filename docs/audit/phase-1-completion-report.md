# Phase 1 commercial domain completion report

## Scope and baseline

- Branch: `feat/phase-1-commercial-completion`
- Required base: `staging` at `0d60cc2e57086a1a9c62890452903a0d7e79b549`
- Customer production and `main`: untouched
- Full Phase 2/3 functionality: intentionally not implemented
- Private workbook: `data/private/PROGRAMA VENTAS.xlsx` was not present in the workspace and no private data was committed

## Implemented commercial contract

The platform now uses stage code as the canonical contract: 20 Prospecting, 40 Qualification, 60 Proposal, 80 Negotiation, 90 Closing, and terminal 100 Billed. Lost and Cancelled remain statuses. Forecast category remains independent, with explicit compatible combinations and controlled defaults. A forward-only Prisma migration transforms legacy stage data without deleting opportunity history.

Current-quarter calculations are tenant-fiscal-calendar aware. Forecast is open eligible Best Case plus Commit. Gap is `max(quota - billed, 0)`. Coverage is eligible current-quarter open pipeline divided by remaining quota; weighted coverage applies opportunity probability first. A missing quota and fulfilled quota are explicit non-numeric states.

The dashboard response is the consolidated source for tenant/seller quota, actual billing, pipeline, forecast, Commit, backlog, gap, attainment, coverage, and GM. Brand performance returns the same commercial facts per brand. Seller quota is never derived from team quota.

Seller-facing financial input is GM %. Gross profit is calculated and persisted. Conflicting amount/GM/gross-profit input is rejected. Tenant margin threshold drives deterministic low-margin alerts.

Gate 60 and gate 80 are tenant-owned bilingual criteria with auditable evidence responses. Seller advancement is blocked until evidence is complete. Manager/Tenant Admin override requires a reason and produces both review and audit evidence. Forecast Review, Ask Seller, Seller Response, notes, category decisions, and Guided actions persist in the backend.

CSV and XLSX uploads use a bounded in-memory multipart service with dry-run validation, explicit quality status, source-sheet recognition, and idempotent execution. `Oppty` feeds opportunities; `Facturado Daily` feeds first-class billing facts; `Resumen` and `Canales Proceso` are recognized but not imported.

Local password recovery uses generic responses, rate limits, secure one-time hashed tokens, expiry, Argon2id, session revocation, one-time use, and audit. SMTP is configurable without a paid dependency. Future feature entitlements are disabled by default and managed only through the guarded migration-credential CLI.

## Verification evidence

| Check                  | Result  | Evidence                                                                      |
| ---------------------- | ------- | ----------------------------------------------------------------------------- |
| Formatting             | PASS    | `pnpm format:check`                                                           |
| Lint                   | PASS    | `pnpm lint`                                                                   |
| Types                  | PASS    | `pnpm typecheck`                                                              |
| Unit/component tests   | PASS    | 68 tests across API, web, and shared packages                                 |
| API integration        | PASS    | 16 tests: CRUD/auth plus Phase 1 and password recovery                        |
| Tenant isolation / RLS | PASS    | 5 tests across all new tenant-owned tables                                    |
| Production build       | PASS    | `pnpm build`                                                                  |
| Dependency audit       | PASS    | no high or critical vulnerability                                             |
| Secret scan            | PASS    | Gitleaks over tracked worktree and history                                    |
| Docker/API readiness   | PASS    | image build; live and ready probes with database up                           |
| Browser/E2E            | PASS    | 8 commercial, role, responsive, theme, import, and EN/ES flows on local stack |
| GitHub CI              | PENDING | Awaiting pull-request checks                                                  |
| Vercel Preview         | PENDING | Awaiting the branch deployment                                                |

## Commercial acceptance matrix

| Requirement            | Implementation                                                                              | Test evidence                                          | Status |
| ---------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------ |
| Opportunity CRUD       | Canonical state validation, ownership, financial derivation, audit/history                  | Domain unit + API integration + E2E progression        | PASS   |
| Seller Workspace       | Seller-scoped metrics, risks, qualification gaps, manager questions, durable Guided actions | Analytics integration + seller browser flow            | PASS   |
| Manager Command Center | Decision KPIs, risk, brand table, seller view, review entry                                 | Analytics integration + manager browser flow           | PASS   |
| Quota                  | Tenant total and optional seller period quotas; null semantics                              | Commercial config integration + metric unit tests      | PASS   |
| Quota by brand         | Admin configuration and server brand response                                               | Phase 1 integration + manager browser flow             | PASS   |
| Billed                 | Opportunity-optional billing fact model                                                     | Migration + XLSX integration                           | PASS   |
| Billed by brand        | Direct or deterministic opportunity-line attribution                                        | Multi-brand service logic + integration                | PASS   |
| Forecast               | Current-quarter Best Case + Commit only                                                     | Fiscal and analytics tests                             | PASS   |
| Gap                    | `max(quota - billed, 0)` with missing-quota state                                           | Metric unit + integration                              | PASS   |
| Coverage               | Eligible pipeline / remaining quota and weighted variant                                    | Coverage unit + integration                            | PASS   |
| GM                     | GM % input, gross-profit derivation, conflict rejection, brand/seller rollups               | Domain unit + integration + UI type/build              | PASS   |
| Qualification 60       | Data-driven bilingual required evidence gate                                                | Gate integration + browser progression                 | PASS   |
| Qualification 80       | Combined 60+80 evidence gate for Commit                                                     | Gate integration + browser progression                 | PASS   |
| Funnel                 | Canonical open stages; terminal Billed excluded                                             | Reference-data integration + accessible funnel E2E     | PASS   |
| Forecast Review        | Durable Keep Commit, Move Best Case, Ask Seller, Add Note                                   | Review integration + browser review flow               | PASS   |
| Traceability           | Review events, seller reply resolution, override/audit events                               | Phase 1 integration                                    | PASS   |
| Snapshots              | Fiscal eligibility and deterministic latest diff                                            | Snapshot unit + integration + UI                       | PASS   |
| Alerts                 | Explainable deterministic commercial and qualification signals                              | Alert unit + integration                               | PASS   |
| CSV import             | Server validation/dry run and idempotent opportunity execution                              | Parser + Phase 1 integration + browser validation gate | PASS   |
| XLSX import            | `Oppty` and `Facturado Daily`; derived/future sheets excluded                               | Parser + two-pass idempotency integration              | PASS   |
| Roles                  | Centralized RBAC plus service ownership scope                                               | API integration + tenant isolation                     | PASS   |
| Local auth             | Argon2id, opaque sessions, lockout, CSRF                                                    | Existing auth integration/regression                   | PASS   |
| Password recovery      | Hashed expiring one-time token, revoke sessions, audit, rate limit                          | Dedicated recovery integration                         | PASS   |
| Security               | Auth, CSRF, RBAC, RLS, audit, redaction, upload limits, secret scan                         | Integration, RLS, local Gitleaks, dependency audit     | PASS   |
| EN/ES                  | Canonical stage labels and new Phase 1 surfaces localized                                   | Message tests + browser locale flow                    | PASS   |
| Responsive             | Commercial screens preserve contained overflow and mobile layout                            | 360/375/390/1024/1440 browser matrix                   | PASS   |

## RLS coverage

The Phase 1 migration applies `ENABLE ROW LEVEL SECURITY`, `FORCE ROW LEVEL SECURITY`, and tenant-matching `USING` / `WITH CHECK` policies to:

- `qualification_criteria`
- `qualification_responses`
- `opportunity_review_events`
- `tenant_feature_entitlements`

`billing_records` retains its tenant RLS policy after becoming opportunity-optional. The tenant-isolation suite verifies own-tenant access and foreign-tenant rejection for the new tables and billing changes. Password reset tokens are global identity records rather than tenant-owned commercial rows and remain restricted to the authentication service/runtime grants.

## Genuine external configuration

| Dependency                          | Why external                                                                                                       | Status                          |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| Staging SMTP credentials            | Code and local integration are complete; an SMTP host/account must be supplied by the owner to deliver real email  | EXTERNAL_CONFIGURATION_REQUIRED |
| Real private workbook quota mapping | The workbook was absent, so a quota/target sheet cannot be declared reliable without inspecting its actual columns | EXTERNAL_CONFIGURATION_REQUIRED |

Neither dependency blocks the implemented Phase 1 application contract. SMTP delivery itself and a workbook-derived quota source must not be reported as complete until configured/verified.

## Pull request disposition

The Phase 1 branch is proposed to `staging` for contractual UAT. It must not be merged automatically. No Railway paid preview environment was created, and no customer production deployment was performed.
