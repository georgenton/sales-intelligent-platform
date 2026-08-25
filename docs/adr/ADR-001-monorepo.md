# ADR-001: pnpm and Turborepo monorepo

- Status: Accepted
- Date: 2026-08-25

## Decision

Keep web, API and shared configuration in a pnpm workspace orchestrated by Turborepo. Pin Node 24
LTS and pnpm 10.

## Consequences

One lockfile and shared quality gates reduce drift. Deployments still target `apps/web` and
`apps/api` independently. Remote build caching is optional and not required locally.
