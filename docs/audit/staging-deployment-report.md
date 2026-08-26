# Staging deployment report

- Date: 2026-08-25
- Environment: staging only
- Source branch: `staging`
- Validated application commit: `8cab5ba`
- Migration: `20260825171652_init`

## GitHub and CI

- Repository: <https://github.com/georgenton/sales-intelligent-platform> (private)
- Workflow: `.github/workflows/ci.yml`
- Application gate: <https://github.com/georgenton/sales-intelligent-platform/actions/runs/32905761369>
- Gates: frozen install, migration, seed, runtime-role provisioning, format, lint, typecheck, unit,
  integration, tenant isolation, production build, dependency audit and Gitleaks.
- Status: green on the validated application commit; the documentation commit is gated by the same
  workflow before handoff.
- Governance limitation: GitHub branch rules are unavailable for a private repository on the current
  Free plan; GitHub Pro was not activated.

## Railway

- Project: `sales-intelligence-staging`
- Environment: `staging`
- Region: `us-west2`
- Services: PostgreSQL 18 with 5 GB volume; `api-staging`
- API: <https://api-staging-staging-96fd.up.railway.app>
- Validated deployment: `9174fecd-a120-46d8-9a25-0cc1294ce092` (`SUCCESS`).
- Health: `/health/live` and `/health/ready` return HTTP 200.
- Deployment: GitHub `staging` source, Wait for CI enabled, Dockerfile build, migration/runtime-role
  provisioning pre-deploy and readiness gate.
- IaC: `.railway/railway.ts`; post-apply plan converged with no changes.

## Vercel

- Project: `sales-intelligence-staging-georgenton`
- Stable URL: <https://sales-intelligence-staging-georgenton.vercel.app>
- Validated production deployment: `dpl_Cta2bGmVa6o3E7GbmDQAjfz4jJSk` (`READY`), promoted from the
  `staging` preview for commit `8cab5ba`.
- Root: `apps/web`; runtime: Node.js 24; `API_ORIGIN` is sensitive and server-only.
- Status: Ready; the exact green staging preview is promoted to the stable alias after verification.
- Access: Vercel deployment protection remains enabled. The temporary automation bypass used by E2E
  was revoked immediately after the test.

## Database and tenancy

- Owner and runtime connection strings are separate.
- Runtime login: `NOINHERIT`, `NOSUPERUSER`, `NOCREATEDB`, `NOCREATEROLE`, `NOBYPASSRLS`; member of
  the `app_runtime` capability role.
- Hosted RLS verifier: passed runtime-role, cross-tenant SELECT, INSERT and UPDATE checks.
- Public API probe: authenticated tenant A received 404 for both read and CSRF-valid update attempts
  against tenant B's UUID; the synthetic tenant-B fixture was then deleted.

## Application and security tests

- Browser E2E: login, dashboard, opportunity create, stage update, logout and protected-route
  rejection passed over HTTPS.
- Session cookie: `HttpOnly`, `Secure`, `SameSite=Lax`; CSRF cookie: readable, `Secure`,
  `SameSite=Lax`; state change without CSRF: HTTP 403.
- Login throttling: revalidated through the public Railway proxy after enabling one-hop proxy trust.
- Dependency audit: zero high/critical findings; one moderate and one low transitive finding remain.
- Secrets: Gitleaks passed; bootstrap password variables and temporary Vercel bypass were removed.

## Credential and build-environment hardening

- The staging administrator password was rotated through a dedicated administrative command that
  accepts the secret only through stdin or an ephemeral environment variable, hashes with Argon2id,
  revokes active sessions and records a secret-free audit event.
- The command requires an explicit staging flag, the exact Railway staging project/environment and
  service identity, the expected staging application URL or a local Railway SSH database tunnel, and
  a separate rotation confirmation. It cannot run against a production environment or service.
- The previous password was rejected with HTTP 401 after rotation; the new password authenticated
  successfully with HTTP 200. The new password is not stored in source, reports, platform variables
  or logs and is delivered only through the owner's macOS clipboard.
- `API_ORIGIN` is consumed by server-side web code and the `/backend` route handler, so it is declared
  by name in the Turborepo `build` task environment. Its value remains only in Vercel's sensitive
  Preview and Production environment configuration.
- Administrative Prisma sources are excluded from the Nest runtime compilation and execute through
  their dedicated TypeScript entry points; this preserves the container's stable `dist/main.js` and
  `dist/scripts/provision-runtime-role.js` layout.
- The database remained private during rotation; the owner connection was reached through a
  temporary Railway SSH tunnel that was closed immediately afterward.

## Known issues

- An empty repository that briefly occupied the requested name was preserved without data loss as
  `sales-intelligent-platform-empty-placeholder-20260825`; the application repository now uses the
  requested `sales-intelligent-platform` name.
- Vercel's project production-branch setting remains `main`; this dedicated staging project therefore
  uses green `staging` previews plus an explicit promotion to its stable staging alias.
- GitHub Actions reports a deprecation warning for third-party actions still declaring Node 20; GitHub
  currently forces those actions onto Node 24 and all jobs pass.
- No production deployment, real customer data or paid GitHub plan was created.
