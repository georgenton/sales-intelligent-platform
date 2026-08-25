# ADR-004: opaque server-side sessions

- Status: Accepted
- Date: 2026-08-25

## Decision

Use random opaque session tokens in HttpOnly cookies. Store only a SHA-256 token hash with expiry,
revocation, active tenant and membership. Bind a double-submit CSRF value to the session by hash.

## Consequences

Logout and administrative revocation take effect immediately. A database lookup is required per
request; Redis is not justified for the MVP. No persistent JWT or browser token storage exists.
