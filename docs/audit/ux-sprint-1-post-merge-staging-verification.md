# UX Sprint 1 Post-Merge Staging Verification

## Result

**STAGING VERIFIED — READY FOR USER ACCEPTANCE TESTING**

Verification completed on 2026-08-26/27 (America/Guayaquil) against the dedicated staging
Railway and Vercel projects. No merge to `main`, customer-production deployment, paid service, or
customer data operation was performed.

## Merge

- PR: [#3](https://github.com/georgenton/sales-intelligent-platform/pull/3),
  `feat/ux-sprint-1` into `staging`.
- Approved PR HEAD confirmed before merge:
  `f6bc447147bc456fa7c1d6b6254e2ef4e36bd2e2`.
- Required PR checks were green and GitHub reported the PR clean and mergeable.
- Merge method: squash, consistent with the approved preference and with no repository policy or
  intentionally useful commit series requiring preservation.
- Merge SHA: `b0eb849e03b601d5a11f48a5bcfc094f3f2aa68d`.
- Local `staging` was updated to the merge SHA and the working tree was clean before verification.

## GitHub CI

- Run: [CI #33024211821](https://github.com/georgenton/sales-intelligent-platform/actions/runs/33024211821).
- SHA: `b0eb849e03b601d5a11f48a5bcfc094f3f2aa68d`.
- Result: **SUCCESS**.
- `quality`: passed format, lint, typecheck, unit, integration, tenant-isolation, build, and
  high-severity dependency audit gates.
- `secrets`: Gitleaks passed.

## Railway

- Project/environment: `sales-intelligence-staging` / `staging`.
- Service: `api-staging`.
- Wait-for-CI deployment: `0fe03a03-0d03-4722-8bad-67ee2f5a8160`.
- Source SHA: `b0eb849e03b601d5a11f48a5bcfc094f3f2aa68d`.
- Result: **SUCCESS** after the GitHub CI gate completed.
- `GET /health/live`: HTTP 200, `{"status":"ok"}`.
- `GET /health/ready`: HTTP 200, `{"status":"ready","database":"up"}`.
- Final HTTP log review contained no 5xx responses. The two Copilot 401 responses were deliberate
  session-expiry error/retry probes; the CSRF 403 and final session 401 were also expected negative
  security probes.

## Vercel

- Dedicated staging project: `sales-intelligence-staging-georgenton`.
- Stable deployment: `dpl_4EQeR5EM56LkzWa1Rn1eSztgtdge`.
- Stable URL: <https://sales-intelligence-staging-georgent.vercel.app>.
- Source SHA: `b0eb849e03b601d5a11f48a5bcfc094f3f2aa68d`.
- Result: **READY**; the stable staging alias resolves to the verified deployment.
- Build completed successfully with the expected dynamic `/backend/[...path]` proxy route.
- The former `API_ORIGIN missing from turbo.json` warning is absent from the full promoted build
  log. `API_ORIGIN` remains declared by name only in Turborepo configuration and its value remains
  in the Vercel environment.
- Post-smoke runtime review found no runtime error clusters and no 5xx logs.

## Functional Smoke

| Flow                      | Result | Evidence                                                                                                                |
| ------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| Login                     | PASS   | Staging administrator authenticated and reached `/app/dashboard`.                                                       |
| Seller Standard           | PASS   | Personal scope, unavailable personal quota semantics, pipeline and seller funnel rendered.                              |
| Seller Focus              | PASS   | `3 priorities today` rendered and a session-only priority completion advanced the view.                                 |
| Seller Guided             | PASS   | Guided queue opened, recommendation was selected, and session decisions advanced.                                       |
| Manager Command Center    | PASS   | Standard command center and explicit-decision Review mode rendered with live tenant data.                               |
| Funnel drill-down         | PASS   | Commit band expanded to the inline opportunity drill-down.                                                              |
| Opportunity Drawer        | PASS   | Known context loaded, evidence sections rendered, and close restored the dashboard.                                     |
| Copilot mock success      | PASS   | Hosted deterministic manager brief returned successfully.                                                               |
| Copilot error/retry       | PASS   | Session expiry produced the safe error, preserved the prompt, and retry repeated the request.                           |
| Import validation gate    | PASS   | Unsupported workbook was rejected; invalid CSV mapping/quality blocked Continue and exposed no import mutation control. |
| Opportunities             | PASS   | Protected opportunities surface and tenant-scoped table rendered.                                                       |
| Dark mode                 | PASS   | Dark theme applied, persisted through reload, and returned to System.                                                   |
| Logout/protected redirect | PASS   | Admin and seller sessions ended; protected navigation returned to `/login`.                                             |

No unexpected browser console errors were captured during the manager or seller flows.

## Security Regression

- **Auth:** login and `/auth/me` returned HTTP 200 for the active tenant administrator; logout
  returned HTTP 204 and the revoked session was rejected with HTTP 401.
- **Session cookies:** session cookie remained `HttpOnly`, `Secure`, `SameSite=Lax`; CSRF cookie
  remained `Secure`, `SameSite=Lax`.
- **CSRF:** authenticated logout without the CSRF header returned HTTP 403; the same operation with
  the matching token returned HTTP 204.
- **RLS:** the hosted staging verifier passed restricted-runtime-role, cross-tenant SELECT, INSERT,
  and UPDATE isolation checks and cleaned its synthetic fixtures.
- **RBAC:** tenant administrator access exposed the Users administration surface; the seller session
  did not expose it and received seller-only cognitive modes.
- **Tenant isolation:** GitHub `test:tenant-isolation` passed on the merge SHA and the independent
  hosted RLS verifier passed against staging.
- Credential rotation became necessary because the prior secure clipboard value was unavailable.
  The administrator credential was rotated through the guarded staging-only Argon2id domain command,
  all sessions were revoked, and the final secret was copied to the owner's macOS clipboard. The
  temporary seller smoke credential was rotated again to an unrecoverable random secret after logout.
  No credential is present in source, logs, CI variables, or this report.

## Remaining P1

- `RevenueKPI`
- `QuotaGap`
- `SalesFunnel`
- `OpportunityHealth`
- `OpportunityDrawer`
- `NextBestAction`
- `GuidedTask`
- `FilterBar`

## Remaining P2

- `ForecastMovement`
- `SellerPerformance`
- `CopilotInsight`
- `PeriodSelector`

## Remaining Warnings

- GitHub reports that third-party actions still declare the deprecated Node 20 action runtime; the
  jobs are currently forced to Node 24 and pass.
- Vercel/pnpm reports ignored install scripts for `@scarf/scarf` and `unrs-resolver`; the build,
  application runtime, and security gates pass. No `API_ORIGIN` warning remains.

## Recommendation

**READY FOR USER ACCEPTANCE TESTING**
