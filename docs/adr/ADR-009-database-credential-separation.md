# ADR-009: Separate database credentials for migrations and runtime

- Status: Accepted
- Date: 2026-08-25

## Decision

Hosted environments use two PostgreSQL identities. `MIGRATION_DATABASE_URL` belongs to the
database owner and is available only to the pre-deploy migration/bootstrap workflow. `DATABASE_URL`
belongs to an unprivileged login used by the running API. The runtime login is `NOINHERIT`, is
forbidden from `SUPERUSER` and `BYPASSRLS`, and may assume the non-login `app_runtime` role only
inside the tenant transaction helper.

The pre-deploy workflow runs `prisma migrate deploy` with the owner credential and idempotently
provisions the runtime login. The application container starts only after that workflow succeeds.

## Rationale

Prisma migrations require DDL privileges that the API must not retain. Keeping the identities
separate makes forced RLS effective even if application code accidentally executes a tenant query
outside the transaction helper, while preserving direct minimum grants needed for authentication
and session management.

## Consequences

- Both URLs are secret platform variables and must never be committed or printed.
- CI provisions the restricted login and executes the API integration suite through it.
- Runtime-role password rotation reruns the idempotent provisioner; it does not require a schema
  migration.
- Staging data bootstrap requires an explicit one-shot guard and the migration credential.
