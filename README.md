# Sales Intelligence Platform

A professional MVP for multitenant sales execution, forecast control, margin visibility and
commercial risk. It is a TypeScript modular monolith with a Next.js command center, a NestJS REST
API and PostgreSQL row-level security.

## What is implemented

- Opaque, revocable server-side sessions with Argon2id credentials, HttpOnly cookies, CSRF and
  login backoff.
- Tenant context derived from a valid session and membership; the browser never supplies the
  authoritative tenant ID.
- PostgreSQL RLS with `FORCE ROW LEVEL SECURITY`, `SET LOCAL ROLE` and transaction-local tenant
  context.
- Opportunity list, filters, sorting, pagination, create, update, detail, line items, stage history,
  risk factors and audit trail.
- Fiscal-quarter dashboard with quota, pipeline, weighted pipeline, forecast, commit, backlog,
  billed, gap, attainment, coverage, margin, funnel, brands and sellers.
- Deterministic alerts, explainable 0–100 health score, immutable forecast snapshots and mock AI
  manager brief.
- Synthetic demo seed and an idempotent Excel/CSV importer with dry-run validation.

## Stack and pinned runtime

- Node.js 24.19 LTS, pnpm 10.33, Turborepo 2.10
- Next.js 16.3, React 19.2, Tailwind CSS 4.3, source-owned shadcn/ui primitives
- NestJS 11.2, Prisma 6.19, PostgreSQL 17
- Vitest, ESLint, Prettier, Docker Compose

Prisma 6 is intentionally pinned: Prisma 8 was still an RC when this repository was bootstrapped.
TanStack Table 8 is intentionally used because it is the mature hook API required by this MVP.
See [the ADR index](docs/adr/README.md).

## Repository

```text
apps/
  api/                 NestJS REST API, Prisma schema, migrations and seed
  web/                 Next.js App Router application
packages/
  eslint-config/       Shared flat ESLint configuration
  shared/              Provider-neutral domain contracts
  typescript-config/   Strict shared TypeScript settings
data/
  samples/             Synthetic import fixtures
  private/             Ignored location for private client workbooks
docs/                  Architecture, security, ADRs and build audit
```

## Local setup

Prerequisites: Node 24 LTS, pnpm 10, Docker Desktop and ports 3000, 4000 and 5449 available.

```bash
nvm use
pnpm install --frozen-lockfile
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
pnpm db:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Swagger is available at
[http://localhost:4000/docs](http://localhost:4000/docs).

The checked-in environment examples contain development-only defaults. Replace every credential in
shared or hosted environments. Real `.env` files are ignored.

### Local demo login

- Email: `admin@techdistribution.demo`
- Password: the local `DEMO_ADMIN_PASSWORD` value (`ChangeMe-Local-2026!` in the example file)

The seed is disabled when `NODE_ENV=production`; this credential is strictly for the synthetic local
workspace.

## Commands

```bash
pnpm dev                    # web + API
pnpm build                  # production builds
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test                   # unit tests
pnpm test:integration       # API vertical slice (requires migrated + seeded DB)
pnpm test:tenant-isolation  # critical PostgreSQL RLS test
pnpm test:e2e:staging       # HTTPS staging flow; requires staging env variables
pnpm security:audit
pnpm db:up
pnpm db:migrate
pnpm db:migrate:deploy
pnpm db:provision:runtime
pnpm db:seed
pnpm db:bootstrap:staging
```

Schema changes must be expressed as Prisma migrations. Production uses `prisma migrate deploy` in a
pre-deploy step; migrations do not run during every application boot. Apply expand → migrate →
contract for destructive evolutions.

## Excel import

Keep private workbooks under `data/private/`.

```bash
pnpm import:excel -- --file './data/private/PROGRAMA VENTAS.xlsx' --tenant tech-distribution-demo --dry-run
pnpm import:excel -- --file './data/private/PROGRAMA VENTAS.xlsx' --tenant tech-distribution-demo
```

The importer recognizes `Oppty`, checks for `Facturado Daily`, `Resumen` and `Canales Proceso`,
normalizes whitespace, money, stages, dates and Spanish/English months, derives a stable fingerprint
when no external ID exists, and reports counts without logging row content. The sample CSV contains
synthetic data only.

## Deployment

### Vercel

The dedicated staging project is `sales-intelligence-staging-georgenton`; its protected stable URL is
<https://sales-intelligence-staging-georgenton.vercel.app>. The project root is `apps/web`, the
framework preset is Next.js and the sensitive, server-only `API_ORIGIN` is configured separately for
Preview and Production. Staging pushes create immutable previews. Promote only a green `staging`
deployment to the stable staging alias; production remains out of scope. Browser traffic uses a
validated `/backend/*` Route Handler, so session cookies remain same-origin and the upstream API
origin is not exposed to client bundles.

### Railway

Railway staging is declared in [`.railway/railway.ts`](.railway/railway.ts) and applied with
`pnpm railway-iac-ts apply -p <project-id> -e staging`. The project contains a PostgreSQL service and
`api-staging`, sourced from the `staging` branch with **Wait for CI**. Configure
`MIGRATION_DATABASE_URL` for the owner-only pre-deploy workflow and `DATABASE_URL` for the restricted
runtime login, plus `RUNTIME_DATABASE_USER`, `RUNTIME_DATABASE_PASSWORD`, `APP_ENV`, `APP_URL`,
`PORT`, `SESSION_TTL_HOURS`, `AI_PROVIDER=mock` and `LOG_LEVEL`. The pre-deploy command applies
migrations and idempotently provisions a runtime login without `SUPERUSER` or `BYPASSRLS`. Health
check: `/health/ready`; public staging API: <https://api-staging-staging-96fd.up.railway.app>.

The staging bootstrap is an explicit one-shot operation. It requires `APP_ENV=staging`,
`ALLOW_STAGING_BOOTSTRAP=true`, a strong `STAGING_ADMIN_PASSWORD`, and the migration credential.
Remove both bootstrap variables immediately after it succeeds. Never use the local demonstration
password in a hosted environment. Hosted operators run the compiled `/app/dist/scripts/seed.js`
inside the API container so the owner connection remains on Railway's private network.

No production deployment is performed by this repository bootstrap.

## Security notes

Do not commit secrets, real spreadsheets, tokens or credentials. `data/private/` and all real env
files are ignored. The API redacts authorization, cookies, CSRF headers, passwords and Set-Cookie
values from structured request logs. See [security-model.md](docs/security/security-model.md).
