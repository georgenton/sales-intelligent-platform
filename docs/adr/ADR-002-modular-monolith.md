# ADR-002: modular monolith

- Status: Accepted
- Date: 2026-08-25

## Decision

Implement one NestJS deployable with modules for identity, authorization, opportunities, forecast,
analytics, alerts, AI, imports, audit and health.

## Consequences

Cross-domain transactions remain reliable and local operations stay simple. Modules own controllers
and services and avoid cloud SDKs. Extraction to services is deferred until scaling or ownership data
provides a concrete reason.
