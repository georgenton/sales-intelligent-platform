# Phase 1 contractual UAT result

## Release record

| Item                     | Result                                                   |
| ------------------------ | -------------------------------------------------------- |
| Decision                 | **PASS**                                                 |
| UAT completed            | 2026-09-07/08, America/Guayaquil                         |
| PR                       | `#17` — `feat/phase-1-commercial-completion` → `staging` |
| Approved HEAD            | `d158a29ced40eaf70128a0c15527e083a0fae80a`               |
| Merge method             | Squash                                                   |
| Phase 1 merge SHA        | `125ad6f6e05121b363d7982d4195bb32c88b25d6`               |
| Verified application SHA | `1d9002555f70df31a9b46e958879d9561f798574`               |
| GitHub CI                | Run `34173074173`, PASS                                  |
| Railway API deployment   | `010ea649-a4eb-4ab4-a48e-561eed2b8d78`, SUCCESS/RUNNING  |
| Vercel deployment        | `dpl_ASPexZ1tX9QbvsmqwJ7kRWtYkoT7`, READY                |
| Stable staging URL       | `https://sales-intelligence-staging-georgent.vercel.app` |
| Customer production      | Untouched                                                |
| `main`                   | Untouched at `77c58dd7f2fa7fe791f4a478ff1d3e7e7915d22a`  |

The verified application SHA includes the Phase 1 merge and the isolated authentication hardening PRs #19–#23 discovered during staging UAT. This report is committed afterward as documentation-only work; its eventual `staging` SHA therefore differs from the application SHA without changing the tested runtime behavior.

## Environment and deployment verification

- GitHub CI passed formatting, lint, type checking, 80 unit/component tests, 21 API integration tests, 5 tenant-isolation/RLS tests, production build, dependency audit, and Gitleaks.
- The dependency audit found no high or critical vulnerabilities. One low and three moderate findings remain.
- Railway successfully deployed the Phase 1 API. Later web-only authentication commits were correctly skipped by the API service watch paths.
- All four Prisma migrations are applied exactly once. No migration is failed or rolled back.
- The runtime PostgreSQL role is not a superuser, has no `BYPASSRLS`, cannot create roles, and cannot create databases.
- RLS is enabled and forced on `billing_records`, `opportunity_review_events`, `qualification_criteria`, `qualification_responses`, and `tenant_feature_entitlements`.
- `/health/live` returned HTTP 200.
- `/health/ready` returned HTTP 200 with `database: up`.
- `/backend/health/ready` returned HTTP 200 with `database: up` through the Vercel same-origin proxy.
- The Vercel deployment for `1d90025` reached READY and the stable staging alias referenced that artifact during final UAT.
- Vercel build logs contain no `API_ORIGIN` warning. Runtime inspection found no unexpected HTTP 5xx or fatal errors.

## Roles tested

The existing secure UAT credential set was used without printing, committing, or including credentials in this report.

| Role         | Evidence                                                                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tenant Admin | Authenticated configuration access; fiscal, currency, margin, quota, brand, seller-quota, and qualification controls inspected; tenant-wide scope confirmed                          |
| Manager      | Authenticated team command center; commercial questions, funnel, drawer, forecast review, qualification evidence, alerts, snapshot/service scope, and cross-team isolation exercised |
| Seller       | Authenticated Seller Standard, Focus, and Guided modes; own-scope opportunity progression, GM, gates, and manager-response behavior exercised                                        |
| Executive    | Authenticated tenant-wide read-only experience; mutation controls absent and crafted mutation requests rejected                                                                      |
| Viewer       | Authenticated permitted read-only experience; administrative and mutation controls absent and crafted mutation requests rejected                                                     |

## Test cases and commercial observations

### Authentication and session behavior

- First visit without `sip_locale` rendered Spanish.
- Spanish and English login flows worked. Locale persisted across authentication and route changes.
- Session continuity, secure cookies, CSRF behavior, logout, and protected redirect passed.
- The login form exposes only a POST fallback before hydration; credentials and submit are disabled until the protected handler is attached and React Hook Form is ready.
- The final post-merge browser run passed 10/10 without credential query serialization, console errors, or HTTP 5xx.
- Password recovery automated coverage passed for generic unknown/known-email responses, expiry, one-time use, session revocation, old-password rejection, and new-password acceptance.

### Commercial configuration and metrics

- Tenant Admin can access fiscal-year start, currency, margin threshold, total quota, brand quota, optional seller quota, and qualification criteria controls.
- The demo fiscal contract is December–November: Q1 Dec–Feb, Q2 Mar–May, Q3 Jun–Aug, and Q4 Sep–Nov.
- Manager dashboard data answers quota, billed, open forecast, projected gap, Commit, backlog, coverage, GM, brand performance, risk, and review-change questions within team scope.
- The deterministic metric contract is covered by unit/integration evidence: quota 3,000,000; billed 1,980,000; open forecast 720,000; remaining quota 1,020,000; projected revenue 2,700,000; projected gap 300,000; billing attainment 66%; projected attainment 90%.
- Missing quota remains not configured instead of being silently represented as zero.

### Opportunity, funnel, qualification, and GM

- A normal opportunity starts at stage 20. Title, customer, partner, seller, brand, amount, currency, stage, forecast, close/billing dates, PO, and GM input are supported.
- A test opportunity demonstrated amount/gross-profit consistency and GM derivation. The automated contract independently covers the requested 100,000 × 15% = 15,000 example and rejects conflicting financial inputs.
- Stage 60 and stage 80 progression are blocked until their required persisted qualification evidence is complete.
- Stage 60 defaults to Best Case; stage 80 defaults to Commit. Stage 100 is terminal Billed and is excluded from the active open funnel.
- Lost and Cancelled retain their historical stage.
- Manager questions, seller responses, review decisions, notes, actors, timestamps, and history persist.

### Billing, snapshots, imports, and alerts

- Manual opportunity mutation cannot create stage 100; it requires an authoritative billing fact.
- Linked billing advances an eligible stage-90 Won opportunity to stage 100 atomically. Brand-only billing affects billed KPIs without falsely advancing an opportunity.
- Team/own/tenant snapshots retain their scope, and latest-diff compares compatible snapshots only.
- CSV and synthetic XLSX flows cover Analyze → Map → Confirm → Validate → Execute, including required fields, duplicate/unconfirmed mapping gates, dry-run, and idempotency.
- The actual `PROGRAMA VENTAS.xlsx` was unavailable, so the customer-specific `Facturado Daily` mapping is not claimed as passed.
- Deterministic alert tests cover missing amount/PO/billing date, low stage near close, tenant-threshold low margin, stagnation, incomplete qualification, Commit without evidence, past close, billing-before-close, and forecast outside the current quarter.

### Responsive, locale, and theme

- Desktop 1440, tablet 1024, and mobile 390/375/360 contracts were exercised.
- Seller Focus, Manager Command Center, funnel, opportunity drawer, and import validation remain usable without horizontal viewport overflow.
- Spanish and English preserve the current route and theme while authenticated.
- Light, Dark, and System themes do not break layout; Spanish Dark and mobile 390 were explicitly covered.
- No untranslated message keys or Spanish clipping were observed.

## Contractual acceptance matrix

| Requirement                      | Manual UAT evidence                                                                                  | Automated evidence                                                                                   | Status                          | Notes                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------- |
| Opportunity CRUD                 | Created and progressed a normal staging opportunity; drawer/detail history refreshed successfully    | Domain unit, API integration, and browser progression tests                                          | PASS                            | Canonical validation, ownership, audit, and history apply                   |
| Seller Workspace                 | Seller Standard, Focus, and Guided opened with seller-owned data                                     | Seller browser flow and scoped analytics integration                                                 | PASS                            | Guided actions persist through backend services                             |
| Manager Command Center           | Manager dashboard, funnel drill-down, drawer, risks, brands, seller view, and review entry exercised | Manager browser flow and analytics integration                                                       | PASS                            | Team facts only                                                             |
| Fiscal quarters                  | Tenant Admin fiscal configuration visible; Dec–Nov contract reviewed                                 | Fiscal calendar and snapshot integration tests                                                       | PASS                            | Q1 Dec–Feb; Q2 Mar–May; Q3 Jun–Aug; Q4 Sep–Nov                              |
| Canonical funnel                 | Five active stages rendered; stage 100 excluded                                                      | Reference-data integration and responsive funnel tests                                               | PASS                            | 20/40/60/80/90 active; 100 terminal                                         |
| Quota                            | Total and optional seller quota controls visible                                                     | Exact metric and commercial-config tests                                                             | PASS                            | Null means not configured; no silent zero                                   |
| Quota by brand                   | Brand quota configuration and manager brand table visible                                            | Phase 1 integration and manager browser flow                                                         | PASS                            | Per-brand results preserve null semantics                                   |
| Billed                           | Billed KPI and terminal behavior inspected                                                           | Billing migration, service, and import integration                                                   | PASS                            | `BillingRecord` is authoritative                                            |
| Billed by brand                  | Brand metrics inspected                                                                              | Deterministic billing attribution integration                                                        | PASS                            | Direct brand or opportunity-line attribution                                |
| Open forecast                    | Manager dashboard displayed open forecast                                                            | Fiscal analytics unit/integration tests                                                              | PASS                            | Current-quarter open Best Case + Commit only                                |
| Projected gap                    | Manager metric visible                                                                               | Exact 3.0M/1.98M/0.72M numeric contract                                                              | PASS                            | `max(quota - billed - openForecast, 0)`                                     |
| Coverage                         | Manager coverage visible                                                                             | Coverage unit/integration tests, including future-quarter exclusion                                  | PASS                            | Denominator is remaining quota                                              |
| GM                               | Seller GM input and derived GP exercised                                                             | Unit/integration rejection of inconsistent GM/GP                                                     | PASS                            | Tenant threshold drives low-margin alert                                    |
| Qualification 60                 | Advancement blocked before evidence; persisted after completion                                      | Gate 60 API integration and browser progression                                                      | PASS                            | Bilingual, tenant-owned criteria                                            |
| Qualification 80                 | Advancement blocked before evidence; persisted after completion                                      | Gate 80 API integration and browser progression                                                      | PASS                            | Combined 60+80 evidence required                                            |
| Manager override                 | Manager qualification/review scope inspected                                                         | Override reason, review, and audit integration tests                                                 | PASS                            | Admin/Manager only; reason required                                         |
| Forecast Review                  | Decision and note flow persisted after refresh                                                       | Review integration and browser review flow                                                           | PASS                            | Keep Commit, Move Best Case, Ask Seller, Add Note                           |
| Manager question                 | Question was visible through review workflow                                                         | Review-event integration tests                                                                       | PASS                            | Durable event, not UI-only state                                            |
| Seller response                  | Seller response behavior and persistence exercised                                                   | Seller reply integration tests                                                                       | PASS                            | Actor and timestamp retained                                                |
| Traceability                     | Opportunity history and review evidence inspected                                                    | Stage, review, reply, override, and audit tests                                                      | PASS                            | Persisted evidence; no fabricated explanation                               |
| Snapshots                        | Team snapshot behavior reviewed                                                                      | Tenant/team/own scope snapshot integration                                                           | PASS                            | Scope type and user retained                                                |
| Snapshot diff                    | Compatible latest-diff behavior reviewed                                                             | Fiscal snapshot movement and compatibility tests                                                     | PASS                            | Cross-scope comparisons excluded                                            |
| Alerts                           | Alerts drawer and explainable signals inspected                                                      | Deterministic unit/integration alert suite                                                           | PASS                            | All 11 requested alert codes covered                                        |
| CSV                              | Validation gate exercised                                                                            | Parser, dry-run, mapping, execute, and idempotency tests                                             | PASS                            | Execution occurs only after approval                                        |
| XLSX generic                     | Synthetic XLSX validation workflow exercised                                                         | Two-pass synthetic XLSX integration                                                                  | PASS                            | Generic server-side engine verified                                         |
| Facturado Daily real workbook    | Real workbook unavailable                                                                            | Source recognition and generic mapping tests only                                                    | EXTERNAL_CONFIGURATION_REQUIRED | Customer workbook headers/dates/`Orders` semantics cannot be fabricated     |
| Tenant Admin                     | Authenticated configuration and tenant-wide access inspected                                         | Admin RBAC and tenant-wide API integration                                                           | PASS                            | Total-quota field is accessible; no configured value was fabricated for UAT |
| Manager team scope               | Actual Manager account saw team command center; restricted scope inspected                           | Manager A/B negative cases across analytics, billing, alerts, sellers, brands, quotas, and mutations | PASS                            | Other-manager team data excluded                                            |
| Seller own scope                 | Actual Seller account used own workflow                                                              | Own-opportunity and cross-seller denial tests                                                        | PASS                            | Other seller mutation/question response denied                              |
| Executive read-only              | Actual Executive account saw indicators without mutation affordances                                 | Crafted create/update/snapshot requests return 403                                                   | PASS                            | Tenant-wide intended reads, no writes                                       |
| Viewer read-only                 | Actual Viewer account saw permitted data without admin/mutation controls                             | Crafted mutation requests return 403                                                                 | PASS                            | Alert-detail/admin entry points hidden                                      |
| Password recovery implementation | Forgot/reset UI present; hosted token values were not exposed                                        | Generic response, expired/used/valid token, session revocation, password acceptance tests            | PASS                            | Argon2id and hashed one-time tokens                                         |
| SMTP delivery                    | Hosted delivery not attempted because SMTP is absent                                                 | Local transport/application integration passes                                                       | EXTERNAL_CONFIGURATION_REQUIRED | Host/account credentials must be owner-supplied                             |
| Security                         | Secure session/CSRF behavior, protected redirect, no URL credential serialization, no 5xx            | Auth integration, audit, Gitleaks, dependency audit                                                  | PASS                            | UAT-exposed credentials and DB owner credential were rotated outside source |
| RLS                              | Persistent staging role and policies inspected                                                       | Five-table bidirectional tenant-isolation suite                                                      | PASS                            | Runtime role remains non-`BYPASSRLS`; RLS enabled and forced                |
| RBAC                             | All five roles authenticated and UI affordances checked                                              | Admin/team/own/read-only integration matrix                                                          | PASS                            | Backend remains authoritative for crafted requests                          |
| EN/ES                            | Default Spanish, English switch, authenticated switching, persistence, and HTML language exercised   | Message coverage and browser locale tests                                                            | PASS                            | Route and theme preserved                                                   |
| Responsive                       | 1440/1024/390/375/360 and key surfaces exercised                                                     | Browser viewport matrix and overflow assertions                                                      | PASS                            | No horizontal viewport overflow or Spanish clipping                         |

## Defects

### P0

- **Resolved:** pre-hydration login submission could serialize credentials into a URL. PRs #19–#23 established a POST-only fallback and gated interactive login on the actual reconciled form handler. Final external regression passed 10/10.
- **Resolved containment:** the affected six UAT credentials and the staging PostgreSQL owner credential were rotated through their established secure mechanisms. Consumers were updated, old credentials were rejected, and no values were committed or included in this report.

### P1

- **Resolved:** browser login readiness was initially timing-sensitive after the P0 fix. The callback-ref listener and semantic hydration waits removed the race; the final suite passed without flakes.

### P2

NONE.

No open P0 or P1 defect remains.

## External configuration required

| Dependency                                                       | Status                          | Required follow-up                                                                                                                                      |
| ---------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Customer `PROGRAMA VENTAS.xlsx` / real `Facturado Daily` mapping | EXTERNAL_CONFIGURATION_REQUIRED | Provide the authorized workbook and confirm customer headers, dates, quota sources, and `Orders` semantics before claiming workbook-specific acceptance |
| Hosted SMTP delivery                                             | EXTERNAL_CONFIGURATION_REQUIRED | Supply owner-controlled SMTP host/account variables in staging and verify external delivery without exposing reset tokens                               |

These external inputs do not invalidate the tested application capability and do not block staging acceptance.

## Remaining warnings

- Dependency audit: one low and three moderate findings; zero high/critical.
- GitHub Actions reports the existing Node runtime deprecation notice for JavaScript actions.
- Vercel/pnpm reports ignored optional dependency build scripts for `@parcel/watcher`, `@scarf/scarf`, `@swc/core`, and `unrs-resolver`; the build completes successfully.

## Recommendation

PHASE 1 ACCEPTED ON STAGING.

READY FOR CUSTOMER/STAKEHOLDER ACCEPTANCE REVIEW.

DO NOT MERGE TO MAIN YET.

Do not begin Phase 2 or Phase 3 as part of this acceptance record.

**PHASE 1 CONTRACTUAL UAT: PASS**
