# Deployment checklist

## Shared

- CI is green on the exact commit; lockfile is frozen.
- Production secrets exist only in platform secret stores.
- `APP_URL` and `API_ORIGIN` use HTTPS origins without trailing paths.
- Database backup and rollback plan are confirmed before migrations.

## Railway API

- Provision PostgreSQL and separate owner/runtime login roles.
- Grant the runtime login `app_runtime`; do not grant `BYPASSRLS`.
- Run `prisma migrate deploy` as pre-deploy, not at process startup.
- Set health check to `/health/ready`; confirm failed health prevents activation.
- Enable GitHub integration and **Wait for CI**.
- Confirm structured logs redact cookies, auth, CSRF and passwords.

## Vercel web

- Root directory is `apps/web`; framework preset is Next.js.
- `API_ORIGIN` is server-only and set independently for Preview and Production.
- Validate `/backend/auth/login` Set-Cookie behavior on the custom HTTPS domain.
- Validate Preview against a non-production API/data environment.

## Smoke test

1. `/health/live` and `/health/ready` return success.
2. Login, dashboard and opportunity list load.
3. Create and update a synthetic opportunity; observe stage history and audit event.
4. Generate a manager brief and capture a forecast snapshot.
5. Log out; confirm the previous session is rejected.
