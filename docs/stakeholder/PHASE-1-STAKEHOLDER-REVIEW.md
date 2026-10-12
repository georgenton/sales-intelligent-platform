# Sales Intelligence Platform

## Phase 1 Stakeholder Review

### 1. What Phase 1 solves

Phase 1 reduces the commercial team's operational dependence on disconnected Excel files. It centralizes pipeline, forecast and quarterly visibility so sellers and managers can work from the same commercial facts.

The platform makes qualification explicit, preserves the reasoning behind forecast decisions, compares quota against billed revenue and open forecast, and adds brand and gross-margin visibility. Deterministic alerts highlight incomplete, stale or commercially inconsistent opportunities.

Phase 1 is a sales intelligence and revenue-management foundation. It is not yet a full CRM.

### 2. Agreed commercial methodology

| Stage              | Commercial meaning                                      | Forecast posture      |
| ------------------ | ------------------------------------------------------- | --------------------- |
| 20% — Prospección  | Early opportunity with a concrete commercial hypothesis | Pipeline              |
| 40% — Calificación | Opportunity being qualified                             | Pipeline              |
| 60% — Propuesta    | Proposal backed by required evidence                    | Upside / Best Case    |
| 80% — Negociación  | Active negotiation with stronger commitment evidence    | Commit                |
| 90% — Cierre       | Won or commercially closed, pending actual billing      | Won / pending billing |
| 100% — Facturado   | Actual billed-revenue outcome                           | Terminal              |

Lost and Cancelled remain statuses. They do not erase the historical stage reached by an opportunity.

### 3. Fiscal calendar

The agreed commercial year runs from December through November:

- Q1: December–February
- Q2: March–May
- Q3: June–August
- Q4: September–November

Quarterly calculations use this fiscal calendar rather than calendar-year assumptions.

### 4. Executive metrics

| Metric            | Business definition                                               |
| ----------------- | ----------------------------------------------------------------- |
| Quota             | Commercial target for the current fiscal period                   |
| Billed            | Actual revenue supported by billing facts                         |
| Remaining quota   | Quota minus billed revenue, never below zero                      |
| Open forecast     | Current-quarter open Best Case plus Commit opportunities          |
| Projected revenue | Billed revenue plus open forecast                                 |
| Projected gap     | Quota minus billed revenue minus open forecast, never below zero  |
| Commit            | Open opportunities currently classified as Commit                 |
| Backlog           | Won opportunities still pending billing                           |
| Coverage          | Eligible open current-quarter pipeline divided by remaining quota |
| GM                | Gross margin derived from opportunity revenue and gross profit    |

When quota or another required source fact is not configured, the platform reports it as unavailable rather than silently displaying a false zero.

### 5. Seller workflow

The daily seller flow is:

Create or update opportunity → complete qualification → confirm GM → record the next action → answer manager questions → progress the opportunity.

Standard, Focus and Guided views organize the same seller-owned information for different working styles. The seller remains responsible for the commercial facts and evidence.

### 6. Manager workflow

The manager flow is:

Dashboard → identify risk → inspect funnel → run Forecast Review → inspect qualification evidence → ask seller → preserve traceability → compare snapshots.

The command center answers whether the team is likely to reach quota, where the gap is, which opportunities need intervention, and what changed since the previous review.

### 7. Qualification at 60% and 80%

Stage 60 and stage 80 require explicit, tenant-owned qualification evidence. An opportunity cannot advance when required answers or evidence are missing. Authorized manager overrides require a reason and remain auditable.

This improves forecast confidence by making the basis of a stage visible and reviewable. It is deterministic commercial governance, not an AI prediction.

### 8. Security and profiles

- **Tenant Admin:** manages tenant-wide commercial configuration and access.
- **Manager:** sees and manages the assigned team scope.
- **Seller:** sees and manages the seller's own opportunity scope.
- **Executive:** receives permitted tenant-level visibility without mutation rights.
- **Viewer:** receives permitted read-only visibility without administrative access.

Tenant isolation is enforced at the application and database layers. Manager and seller scopes remain narrower than tenant-wide access.

### 9. Excel coexistence

CSV and XLSX imports coexist with the platform through an Analyze → Map → Confirm → Validate → Execute workflow. Mappings are visible, dry-run validation occurs before mutation, and duplicate or incomplete mappings are blocked.

The platform does not assume that every spreadsheet uses the same schema. Customer-specific `Facturado Daily` validation remains pending because the real `PROGRAMA VENTAS.xlsx` workbook has not been provided for final mapping.

### 10. AI roadmap boundary

Phase 1 delivers deterministic intelligence: explicit formulas, qualification gates, persisted evidence, traceability and rule-based alerts.

Future phases may add contextual AI, manager briefs, predictive forecasting and agent workflows. Those capabilities are not claimed as delivered in Phase 1.

### 11. What is included now

- [x] Tenant-scoped opportunity and forecast workflows
- [x] Canonical 20/40/60/80/90/100 methodology
- [x] Fiscal quarter and executive commercial metrics
- [x] Seller Standard, Focus and Guided workspaces
- [x] Manager Command Center and Forecast Review
- [x] Qualification gates and persisted evidence
- [x] Manager questions, seller responses and audit traceability
- [x] Quota, billed revenue, projected gap, coverage and GM
- [x] Brand-level commercial performance
- [x] Deterministic risk and data-quality alerts
- [x] Team, seller and tenant-scoped snapshots
- [x] Validated CSV and generic XLSX import workflow
- [x] Tenant Admin, Manager, Seller, Executive and Viewer profiles
- [x] Spanish/English and responsive desktop/mobile experience

### 12. What is intentionally not included yet

- Full CRM depth
- Outlook or Teams synchronization
- Full Channel Cutoff workflow
- Predictive machine learning
- A real production AI provider
- Autonomous agents
- Enterprise SSO unless separately contracted
- Customer production deployment

### 13. External configuration remaining

- The real customer workbook for `Facturado Daily` mapping and validation
- Hosted SMTP configuration and external delivery validation
- Future corporate identity integration if separately contracted

### 14. Acceptance questions for Edgar

1. Does the dashboard represent the way you want to read the quarter?
2. Is the 20/40/60/80/90/100 methodology operationally correct?
3. Are the 60% and 80% qualification questions sufficient?
4. Is the GM flow aligned with seller practice?
5. Does Forecast Review adequately replace the current weekly Excel review?
6. Is the brand quota/billed/forecast view sufficient for management?
7. What is the real source that should feed `Facturado Daily`?
8. Are there any Phase 1 blockers before operational use?

Capture Phase 1 acceptance observations separately from Phase 2 feature ideas.

## Accepted review baseline

- Staging SHA: `de23454048f22bf2deac295630235c181b661c04`
- Release-candidate tag: `phase-1-uat-accepted`
- Staging application: `https://sales-intelligence-staging-georgent.vercel.app`
- Status: contractual UAT passed on staging; not customer production
