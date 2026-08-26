# Deployment checklist

## Shared

- CI is green on the exact commit; lockfile is frozen.
- Production secrets exist only in platform secret stores.
- `APP_URL` and `API_ORIGIN` use HTTPS origins without trailing paths.
- Database backup and rollback plan are confirmed before migrations.

## Railway API

- Apply `.railway/railway.ts` and confirm a subsequent plan reports no changes.
- Provision PostgreSQL and separate owner/runtime login roles.
- Grant the runtime login `app_runtime`; do not grant `BYPASSRLS`.
- Confirm hosted startup rejects a runtime URL whose username does not match `RUNTIME_DATABASE_USER`.
- Run `prisma migrate deploy` as pre-deploy, not at process startup.
- Set health check to `/health/ready`; confirm failed health prevents activation.
- Enable GitHub integration and **Wait for CI**.
- Confirm structured logs redact cookies, auth, CSRF and passwords.
- Run the guarded synthetic bootstrap once; then remove `ALLOW_STAGING_BOOTSTRAP` and
  `STAGING_ADMIN_PASSWORD` from the service.
- Run the hosted RLS verifier and a public cross-tenant read/write probe; remove its temporary
  fixtures after the result is captured.

## Vercel web

- Root directory is `apps/web`; framework preset is Next.js.
- `API_ORIGIN` is server-only and set independently for Preview and Production.
- Validate `/backend/auth/login` Set-Cookie behavior on the custom HTTPS domain.
- Validate Preview against a non-production API/data environment.
- Keep deployment protection enabled for non-public staging and revoke any temporary automation
  bypass immediately after browser automation.
- Promote the exact green `staging` deployment to the stable staging alias; do not deploy production.

## Smoke test

1. `/health/live` and `/health/ready` return success.
2. Login, dashboard and opportunity list load.
3. Create and update a synthetic opportunity; observe stage history and audit event.
4. Generate a manager brief and capture a forecast snapshot.
5. Log out; confirm the previous session is rejected.
6. Run `pnpm test:e2e:staging` with credentials supplied only through the operator environment.

## 2026-08-25 staging evidence

- [x] GitHub CI green on the deployed application commit, including Gitleaks and dependency audit.
- [x] Railway IaC converged; PostgreSQL and `api-staging` are healthy in `us-west2`.
- [x] Migration `20260825171652_init` applied through the owner credential.
- [x] Runtime database role is `NOINHERIT`, `NOSUPERUSER` and `NOBYPASSRLS`.
- [x] Hosted RLS SELECT/INSERT/UPDATE checks and public cross-tenant API probes passed.
- [x] HTTPS browser E2E passed through the Vercel Route Handler; temporary bypass was revoked.
- [x] Bootstrap variables were removed after creating the synthetic staging dataset.
- [ ] GitHub branch rules remain unavailable for this private repository on the current Free plan.
