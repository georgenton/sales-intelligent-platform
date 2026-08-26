# 1 · UX architecture

## Product frame

**A sales operating system, not a CRM database.** Insight first, navigation second: the user should almost never traverse pages to understand something. Every screen answers a question the persona actually asks, and every answer ends in an action.

## Roles and permissions surface

Roles come from the product's RBAC (`MembershipRole`): `SELLER`, `MANAGER`, `TENANT_ADMIN`, `PLATFORM_ADMIN`. Identity is global; access is granted per tenant membership. The UI never asks which tenant you are in — session-derived tenant context is displayed, not selected.

| Role | Home | Sees | Never sees |
|---|---|---|---|
| Seller | My day | Own quota, own funnel, own deals, Copilot | Team roster, other sellers' forecast, admin |
| Manager | Revenue Command Center | Team quota, gap interpretation, funnel, sellers, brands, movement, review mode | Security config, user provisioning |
| Executive | Command center (trend-weighted) | Attainment, trends, brands, teams, margin, narrative | Row-level editing, import |
| Tenant admin | Command center + Administration | Users, roles, stages, fiscal periods, quotas, brands, integrations | — |

Administration is a **destination, never a fixture**: it lives at the bottom of navigation and never appears in a sales workspace.

## Information architecture

```
Workspace (tenant, session-derived)
├── My day                    [seller]      quota → focus today → my funnel → stuck → meetings
├── Revenue Command Center    [manager]     quota+gap → funnel → movement → brands → team
├── Opportunities                           filter bar → table → DRAWER (default) → full record (escalation)
├── Forecast
│   ├── Review mode           [manager]     sequential opportunity review
│   └── Snapshots                           immutable positions, comparison baseline
├── Guided review             [seller]      step workflows: qualify, complete data, define next step, prep forecast
├── Alerts                                  deterministic signals → DRAWER
├── Import                                  8-step wizard
├── Settings                                commercial + fiscal defaults
└── Administration            [admin]       users & roles, stages, periods, quotas, brands
```

**Overlays available from anywhere** (not IA nodes): opportunity drawer, Copilot rail, ⌘K command palette. These are how depth is reached — not new routes.

## Navigation rules

1. A dashboard click **never** changes route. It expands in place, selects, or opens a drawer.
2. The full opportunity record is an *escalation* offered inside the drawer, never the default landing.
3. Maximum two levels of chrome: sidebar + header. No breadcrumb trails, no nested tabs inside tabs.
4. The fiscal period is global state. One `PeriodSelector` per screen; widgets never carry their own period.
5. ⌘K is the fastest path to any object. Every navigation item is also a command.

## Decision test applied to every element

Each component in this system was required to answer: what question does this answer · what decision does it enable · what action follows · can it be progressively disclosed · is it different for a seller vs a manager. Anything that failed the first three was cut; anything that failed the fourth became a hover, an expand or a drawer.
