# Build report

- Date: 2026-08-25
- Branch: `feat/bootstrap-sales-intelligence-platform`
- Host: macOS arm64
- Runtime: Node 24.19.0 LTS, pnpm 10.33.2, Docker 29.7.2

## Phases completed

1. Repository and pinned monorepo configuration.
2. PostgreSQL schema, migration, synthetic seed, transaction-scoped RLS and automated isolation.
3. Local Argon2id authentication, opaque sessions, RBAC, CSRF, audit and structured logs.
4. Opportunity vertical slice, dashboard, alerts, health score, forecast snapshots and mock AI brief.
5. Next.js command center and idempotent Excel/CSV importer.
6. Vercel/Railway configuration, CI, Dependabot and security documentation.

## Verification results

| Command                      | Result                                                               |
| ---------------------------- | -------------------------------------------------------------------- |
| `pnpm install`               | Passed; lockfile created                                             |
| `pnpm db:generate`           | Passed after allowing Prisma cache access                            |
| `pnpm db:up`                 | Passed on port 5449; 5434 was already used by an unrelated container |
| `prisma migrate dev`         | Passed; initial migration applied                                    |
| `pnpm db:seed`               | Passed; 40 synthetic opportunities                                   |
| `prisma migrate status`      | Passed; one migration, schema up to date                             |
| `pnpm test:tenant-isolation` | Passed; 4/4 tests                                                    |
| `pnpm test:integration`      | Passed; 5/5 tests                                                    |
| `pnpm test`                  | Passed; 8 API + 1 shared unit tests                                  |
| `pnpm typecheck`             | Passed for API, web and shared packages                              |
| `pnpm lint`                  | Passed with zero warnings                                            |
| `pnpm format:check`          | Passed                                                               |
| `pnpm build`                 | Passed; Nest production build + 12 Next.js routes                    |
| `pnpm security:audit`        | Passed at high threshold; 0 high/critical, 1 moderate, 1 low         |
| Docker production build      | Passed for `linux/arm64`                                             |
| Docker readiness smoke       | Passed; `/health/ready` reported database up                         |
| Browser end-to-end smoke     | Passed; login, dashboard, list, create, update, audit and logout     |
| synthetic import dry-run     | Passed; 3 valid rows, 0 errors                                       |
| synthetic import + repeat    | Passed; 3 imported, then 3 duplicates skipped                        |

## Decisions and incidents

- Node 20 was installed as the default but is out of LTS; the existing Node 24.19 NVM runtime is now
  pinned in `.nvmrc`.
- Port 5434 belonged to `ai-demo-postgres`; this project moved to free port 5449 without changing the
  unrelated service.
- Prisma 8 was an RC, so Prisma 6.19.3 was selected.
- TanStack Table 9 changed its hook API; mature v8.21.3 is pinned.
- Request logs initially exposed the CSRF header during integration; the header is now explicitly
  redacted.
- Development startup exposed type-only imports that removed Nest decorator metadata; ESLint now
  reads the Nest TypeScript project so runtime imports remain intact without weakening the rule.
- Browser verification exposed a UTC/local date shift; commercial date-only values now format in
  UTC while timestamped audit events keep local-time formatting.
- Container startup exposed a missing generated Prisma client after workspace deployment; the
  Docker build now generates the client inside the final `/app` artifact.
- The RLS fixture originally pushed tenant IDs from parallel promises in nondeterministic order; it
  now records IDs from the resolved named fixtures and passes repeatedly.
- External rewrites from Vercel could not reach the Railway hostname reliably; a validated,
  server-only Next.js Route Handler now proxies `/backend/*` and preserves session cookies.
- Railway proxy addresses initially prevented the per-IP login throttle from converging; the tracker
  now uses Railway's overwritten real-IP header only when platform request markers are present, with
  adapter-IP fallback elsewhere.

## Risks and accepted debt

- GitHub branch rules for this private repository require a paid plan; CI is green but enforcement is
  not active on the current Free account.
- OIDC/SAML, OpenAI adapter, automatic weekly snapshots, channel-cutoff evaluation and advanced
  forecast accuracy are intentionally deferred.
- The importer maps the `Oppty` vertical slice; other workbook sheets are detected but not yet
  persisted as billing/cutoff records.
- The remaining low/moderate dependency findings are transitively inherited; CI blocks high and
  critical findings and Dependabot is enabled for follow-up.
