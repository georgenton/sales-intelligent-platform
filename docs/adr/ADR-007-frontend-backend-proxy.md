# ADR-007: same-origin frontend/backend proxy

- Status: Accepted
- Date: 2026-08-25

## Decision

Browser requests target `/backend/*` on the Next.js origin. Next.js rewrites them to the server-only
`API_ORIGIN`. Server Components call the same origin directly from the server and forward cookies.

## Consequences

Vercel/Railway hosting does not depend on third-party cookies and the API hostname is not exposed as
browser configuration. The rewrite is not a security boundary; NestJS still performs all auth,
authorization, CSRF and validation.
