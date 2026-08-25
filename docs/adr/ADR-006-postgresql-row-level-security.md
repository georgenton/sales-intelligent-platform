# ADR-006: PostgreSQL row-level security

- Status: Accepted
- Date: 2026-08-25

## Decision

Use Prisma 6 interactive transactions. At the beginning of every tenant business transaction execute
`SET LOCAL ROLE app_runtime`, then transaction-local `set_config('app.current_tenant_id', tenant,
true)`. Apply matching `USING` and `WITH CHECK` policies plus `FORCE ROW LEVEL SECURITY` to every
commercial tenant table.

## Rationale

`SET LOCAL` semantics are connection-pool safe because the setting disappears at transaction end.
The fixed runtime role is non-superuser and has no `BYPASSRLS`. Prisma remains suitable because the
entire operation can be kept on one transaction connection.

## Consequences

All service queries must use `withTenant`; direct Prisma access is limited to identity bootstrap and
trusted offline tooling. Integration tests attempt cross-tenant direct-ID reads in both directions and
a cross-tenant write. Production must use separate migration and runtime logins.
