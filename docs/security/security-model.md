# Security model

## Authentication and sessions

Local credentials use Argon2id. Authentication performs a dummy hash verification for unknown users,
tracks failed attempts and locks an account for 15 minutes after five failures. A successful login
rotates into a random 256-bit opaque token; only its SHA-256 hash is stored. Sessions expire, can be
revoked and are delivered in `HttpOnly`, `SameSite=Lax` cookies (`Secure` in production).

Mutations require a random double-submit CSRF value whose hash is bound to the server-side session.
The readable CSRF cookie is not an authentication credential. The session token is never exposed to
JavaScript or browser storage.

## Authorization

Identity and RBAC are independent. Session resolution validates the current user, tenant and
membership on every request and attaches a centralized permission set. Controllers use guards and
services additionally scope owner/team access. DTO whitelist validation rejects mass assignment,
including submitted `tenantId` fields.

## Tenancy and RLS

The active tenant comes only from the stored session. Commercial services apply `tenantId` filters
and run inside a single Prisma interactive transaction. That transaction adopts `app_runtime` and
sets `app.current_tenant_id` with transaction-local scope. RLS policies use that setting for `USING`
and `WITH CHECK`, and tables use `FORCE ROW LEVEL SECURITY`. The role has no `BYPASSRLS`.

Identity bootstrap tables are deliberately outside business RLS; access to them is confined to auth
services. Production should use separate migration and runtime login roles. The migration creates a
NOLOGIN capability role; the platform operator grants it to the runtime login.

## Application controls

- Helmet, strict DTO validation, bounded payload parsers and origin-specific CORS.
- Global rate limiting plus stricter login throttling and account backoff.
- Prisma parameterization and fixed raw SQL statements for transaction context.
- Request IDs, structured Pino HTTP logs and redaction for auth, cookie, CSRF, password and secret
  response headers.
- Append-only application audit events and immutable snapshot tables through database privileges.
- Consistent error envelopes with no production stack traces.
- Frozen lockfile, Dependabot, dependency audit and Gitleaks CI.

## Known boundary

The local compose connection uses the owner account for migrations and then adopts `app_runtime`
inside business transactions. Hosted environments must provision a genuinely separate runtime login;
that infrastructure action cannot be completed without platform credentials.
