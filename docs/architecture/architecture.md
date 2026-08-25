# Architecture

Sales Intelligence Platform starts as a modular monolith: one deployable API with explicit domain
modules, one web application and one PostgreSQL database. This keeps transactions and operations
simple while preserving boundaries that can be extracted only when evidence justifies it.

```mermaid
flowchart LR
  B["Browser"] -->|"same-origin /backend/*"| W["Next.js · Vercel"]
  W -->|"server-only API_ORIGIN"| A["NestJS modular monolith · Railway"]
  A -->|"transaction + SET LOCAL ROLE + tenant context"| P[("PostgreSQL + RLS")]
  A --> I["IdentityProvider"]
  A --> AI["AiProvider"]
  I --> L["Local Argon2id"]
  AI --> M["Mock deterministic"]
```

## Request and tenant boundary

```mermaid
sequenceDiagram
  participant Browser
  participant API
  participant SessionStore as PostgreSQL sessions
  participant BusinessDB as PostgreSQL business tables
  Browser->>API: HttpOnly opaque session cookie
  API->>SessionStore: SHA-256(token) lookup
  API->>SessionStore: validate user, tenant and membership status
  API->>BusinessDB: BEGIN
  API->>BusinessDB: SET LOCAL ROLE app_runtime
  API->>BusinessDB: set_config(app.current_tenant_id, tenant, true)
  API->>BusinessDB: application-filtered query
  BusinessDB-->>API: RLS-filtered rows
  API-->>Browser: tenant-scoped response
```

The identity plane (`users`, credentials, sessions and memberships) is resolved before the business
tenant context. All commercial tables carry `tenant_id` and enforce the policy. Provider adapters
sit at infrastructure edges; business services import no cloud or model SDK.

## Module boundaries

- `auth`, `authorization`, `users`, `audit`: identity and policy plane.
- `opportunities`, `forecast`, `analytics`, `alerts`: current vertical slice.
- `ai`: advisory manager brief through a provider interface.
- `imports`: trusted offline ingestion command with dry-run and fingerprints.
- `health`: process and database readiness.

Later modules can follow the same boundary without adding a message bus or microservice prematurely.
