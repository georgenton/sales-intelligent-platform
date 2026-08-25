# ADR-005: session-derived tenant context

- Status: Accepted
- Date: 2026-08-25

## Decision

Resolve `userId`, `activeTenantId`, membership, role and permissions from a validated server session.
Ignore and reject arbitrary tenant identifiers in business DTOs. Every commercial record carries a
tenant foreign key.

## Consequences

Tenant switching will require a dedicated authenticated endpoint that validates a second membership
and rotates the session. URL or form manipulation cannot choose the authority context.
