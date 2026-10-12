# Phase 1 acceptance freeze

## Accepted baseline

| Item                            | Value                                                 |
| ------------------------------- | ----------------------------------------------------- |
| Accepted staging SHA            | `de23454048f22bf2deac295630235c181b661c04`            |
| Verified application SHA        | `1d9002555f70df31a9b46e958879d9561f798574`            |
| Annotated release-candidate tag | `phase-1-uat-accepted`                                |
| Tag target                      | `de23454048f22bf2deac295630235c181b661c04`            |
| Customer production             | Not deployed                                          |
| `main` at freeze                | `77c58dd7f2fa7fe791f4a478ff1d3e7e7915d22a`, untouched |

The tag annotation states that Phase 1 contractual UAT was accepted on staging, that the tag is not customer production, and that it does not imply Phase 2 or Phase 3 completion. No GitHub Release was created because the repository has no established release practice.

## Repository governance audit

The repository is private. GitHub returned HTTP 403 for both the repository rulesets endpoint and the branch-protection endpoints for `main` and `staging`:

> Upgrade to GitHub Pro or make this repository public to enable this feature.

Therefore branch protection could not be inspected or safely configured through the available plan/API. No settings were guessed and no owner-lockout risk was introduced. Effective governance remains process-based until the plan supports enforcement.

### Minimum recommended settings after plan and Actions billing are available

Apply these through GitHub Settings → Branches or repository rulesets. Preserve an owner/admin bypass so recovery remains possible.

#### `main`

- Require a pull request before merging.
- Require successful `quality` and `secrets` CI checks before merging.
- Require Vercel status when customer web deployment policy is established.
- Block force pushes.
- Block branch deletion.
- Do not require a second approver if doing so would lock out the sole repository owner.

#### `staging`

- Require a pull request before merging.
- Require successful `quality` and `secrets` CI checks before merging.
- Block force pushes.
- Block branch deletion.
- Keep owner/admin bypass available for recovery, not routine delivery.
- Avoid additional approval layers that would obstruct urgent UAT fixes.

GitHub Actions reported an account payment/spending-limit restriction on the documentation-only acceptance commit. Resolve that account condition before making CI checks mandatory; otherwise the rules would prevent all merges even when no job can start.

## Secret and temporary artifact audit

- Required temporary script paths are absent and untracked:
  - `apps/api/prisma/.uat-rotate-postgres.ts`
  - `apps/api/prisma/.uat-rotate-accounts.ts`
  - `apps/api/prisma/uat-rotate-accounts.tmp.ts`
- No private workbook copy is tracked.
- No `/private/tmp` artifact is tracked.
- No generated password/reset-token or temporary PostgreSQL credential file is tracked.
- The authorized UAT credential file remains outside Git with mode `0600`; its values were not read into this report.
- Gitleaks scanned 77 commits and reported no leaks.

Tracked references to staging password rotation, local test database URLs and the external UAT credential-file location are expected implementation/documentation references. They contain no embedded staging credential.

## Staging verification

- Vercel deployment `dpl_9RAhXnQcjqvCBWD8SqBzTfAQVfJ5`: READY.
- Stable staging URL: `https://sales-intelligence-staging-georgent.vercel.app`.
- `/health/live`: HTTP 200.
- `/backend/health/ready`: HTTP 200, database up.
- Recent Vercel error-log query: no logs found.
- Recent Railway runtime filters for error/fatal/unhandled and HTTP 5xx: no matching events.
- Railway API deployment `010ea649-a4eb-4ab4-a48e-561eed2b8d78`: SUCCESS/RUNNING. Documentation and web-only commits were correctly skipped by API watch paths.

## Lightweight stakeholder smoke

Read-only checks passed for:

- Tenant Admin login and commercial settings
- Manager dashboard
- Opportunity drawer open/close
- Forecast Review open without a decision
- Seller dashboard at 390 px without viewport overflow
- Import page without selecting or executing a file
- Executive read-only navigation
- Viewer read-only navigation
- No console/page errors or HTTP 5xx observed

The `agent-browser` CLI was not installed. The repository's existing Playwright runtime was used as the semantic browser fallback with a temporary, untracked, read-only script.

## Demo-data inventory and cleanup

The read-only smoke found 18 records created by the automated staging E2E test title pattern. The exact records and cleanup reason below were documented before any persistent change. A subsequent read-only dependency audit verified all 18 exact IDs, the expected title pattern, `MANUAL` synthetic source, and zero billing or forecast-snapshot links.

| Opportunity ID                         | Title                                   | Reason                                                          |
| -------------------------------------- | --------------------------------------- | --------------------------------------------------------------- |
| `7860a40c-72a7-4422-aa57-277780a83a36` | `E2E staging opportunity 1787693829741` | Automated E2E residue; duplicates stakeholder-visible demo data |
| `ef2dbd6e-069b-4e8c-bc1c-3838172af5d1` | `E2E staging opportunity 1787693751354` | Automated E2E residue; duplicates stakeholder-visible demo data |
| `7b338634-0ce9-4017-9d67-796ecbd0e3f3` | `E2E staging opportunity 1787693720962` | Automated E2E residue; duplicates stakeholder-visible demo data |
| `5f7e90b4-5650-4d19-8507-9eb775ce574e` | `E2E staging opportunity 1787854410442` | Automated E2E residue; duplicates stakeholder-visible demo data |
| `28cd0bb6-e7ee-4486-9784-89ac99b672fa` | `E2E staging opportunity 1787854208883` | Automated E2E residue; duplicates stakeholder-visible demo data |
| `e3830bf9-451a-48e1-98c8-b7419950b019` | `E2E staging opportunity 1787851891900` | Automated E2E residue; duplicates stakeholder-visible demo data |
| `b7d83feb-2ac5-4061-b6a7-edcd0765a4b3` | `E2E staging opportunity 1787851688737` | Automated E2E residue; duplicates stakeholder-visible demo data |
| `f8167afa-d972-4a9e-80c2-69b1093be5bd` | `E2E staging opportunity 1787849266922` | Automated E2E residue; duplicates stakeholder-visible demo data |
| `fb7c6a5b-02c5-4578-8398-2237de40e276` | `E2E staging opportunity 1787848062990` | Automated E2E residue; duplicates stakeholder-visible demo data |
| `7f51ec4c-7701-490f-a641-bcda855b2834` | `E2E staging opportunity 1787845701144` | Automated E2E residue; duplicates stakeholder-visible demo data |
| `b6c154fb-5992-4e34-865b-d07be21acadb` | `E2E staging opportunity 1787845560066` | Automated E2E residue; duplicates stakeholder-visible demo data |
| `0d1db1fe-c29a-46c8-9496-fb1472fd507b` | `E2E staging opportunity 1787845062673` | Automated E2E residue; duplicates stakeholder-visible demo data |
| `575a2b63-e3f4-4688-9489-276a12fead74` | `E2E staging opportunity 1787844926527` | Automated E2E residue; duplicates stakeholder-visible demo data |
| `2c672fb8-9340-4059-b4a6-1c41ea379a79` | `E2E staging opportunity 1788827128732` | Automated E2E residue; duplicates stakeholder-visible demo data |
| `973cad04-4d0e-4a3c-8022-0c0f3619a1ac` | `E2E staging opportunity 1788826597380` | Automated E2E residue; duplicates stakeholder-visible demo data |
| `697cb2b0-a0db-4555-9f66-5def06fa8f87` | `E2E staging opportunity 1788826490362` | Automated E2E residue; duplicates stakeholder-visible demo data |
| `473a2020-35fa-4d92-ba63-6388612a3c5f` | `E2E staging opportunity 1788826325762` | Automated E2E residue; duplicates stakeholder-visible demo data |
| `df8c949a-4732-4f17-aca3-cee8a246fbe1` | `E2E staging opportunity 1788826026901` | Automated E2E residue; duplicates stakeholder-visible demo data |

Six records titled `UAT Seller 1/2 opportunity 1/2/3` are intentionally retained. They are stable synthetic fixtures for seller and cross-seller RBAC review rather than timestamped automation leftovers.

After the preconditions passed, all 18 timestamped E2E opportunities were soft-deleted in one staging-only transaction. One `UAT_DEMO_CLEANUP` audit event was created per record. Post-transaction verification found zero active timestamped E2E opportunities and all six intentional UAT Seller fixtures still active. The cleanup is recoverable by an authorized administrator clearing `deleted_at`; no hard deletion occurred.

The post-cleanup smoke passed again for all five roles, the Manager drawer and Forecast Review, Tenant Admin settings/import, and Seller mobile 390 px. The demo-data status is **CLEAN** for stakeholder review.

## External dependencies

- Customer-specific `Facturado Daily` mapping requires the real authorized `PROGRAMA VENTAS.xlsx` workbook.
- Hosted reset-email delivery requires owner-controlled SMTP configuration.

Neither dependency is represented as completed, and neither authorizes customer production deployment.
