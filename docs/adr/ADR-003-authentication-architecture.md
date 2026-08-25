# ADR-003: adaptable identity providers

- Status: Accepted
- Date: 2026-08-25

## Decision

Domain authentication depends on `IdentityProvider`. The MVP implements `LocalIdentityProvider`;
future enterprise federation uses one generic OIDC adapter and, only when required, a SAML adapter.
Tenant provider records store secret references rather than client secrets.

## Consequences

The product has no Azure dependency and RBAC remains provider-neutral. OIDC discovery, account
linking and tenant selection remain future work.
