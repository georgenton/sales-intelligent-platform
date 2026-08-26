# ADR-010: Scoped frontend interaction state

## Status

Accepted for UX Sprint 1.

## Context

The approved product experience adds cognitive modes, appearance preferences, contextual overlays, sequential reviews, dashboard drilldowns, and a multi-step import flow. These interactions cross sibling Client Components, while authentication, tenant resolution, and primary page data already have secure Server Component and same-origin API boundaries.

## Decision

Use Redux Toolkit only inside the authenticated application shell for mutable product-interaction state:

- cognitive and appearance modes;
- selected opportunity and funnel stage;
- dashboard filters and active period;
- Copilot panel and its minimal context contract;
- guided/review session progress;
- import wizard progress.

Use RTK Query only for reusable browser interactions that need request state, invalidation, or cross-component caching. Current endpoints cover opportunity detail/list/create/update, alerts, reference data, and the existing deterministic manager brief.

Keep these boundaries:

- authentication profile and dashboard composition remain Server Component fetches;
- opaque session cookies and CSRF values never enter Redux;
- browser requests use the existing `/backend` same-origin proxy;
- mutations retain server-side RBAC, tenant scoping, validation, audit, and CSRF enforcement;
- localStorage stores only the non-sensitive appearance preference.

## Consequences

The interactive layer has predictable shared state without converting the application into a client-only SPA. Initial page data is not duplicated in RTK Query unless an interaction later needs client caching or invalidation. Redux remains replaceable because domain data and authorization continue to live on the server.
