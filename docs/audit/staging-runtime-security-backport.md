# G16 — Residual exposure and stable runtime-security backport

Date: 2026-10-08  
Test-only closure: 2026-10-12
G17 policy implementation: 2026-10-12

Target: `fix/staging-runtime-security` → `staging`  
Base: `de23454048f22bf2deac295630235c181b661c04` (`origin/staging`)  
Source dependency change: `a31eaa8e37c5de887fdd6f58e1d07bcc5d7dad88`  
Deployment state: **not deployed**

## Result

The compatible runtime dependency patches from G15 apply cleanly to the stable branch without functional code, migrations, October entities, the Edgar dashboard, or visit functionality. The stable schema remains at four migrations.

The test-only closure on 2026-10-12 removed the stable integration blocker without changing runtime code, schema, dependencies, lockfile, or the backend response order.

The raw `pnpm audit --audit-level high` result remains **FAIL** because of `braces@3.0.3`. G17 does not hide or alter that result: it adds a separate fail-closed policy decision that may return `PASS_WITH_TIME_LIMITED_EXCEPTION` only for the exact approved tooling finding and only while the fixed approval and weekly review window remain current. This is neither a vulnerability fix nor permission to merge or deploy.

The original G16 run exposed a pre-existing order-dependent assertion in `phase1-commercial.integration-spec.ts` (20/21 tests passed). The approved test-only correction is documented below; no functional dashboard work from commit `23842f7` was cherry-picked.

## Test-only integration closure — 2026-10-12

### Confirmed cause and correction

The failing assertion selected `brandPerformance[0]`. The dashboard intentionally sorts brand rows by pipeline plus billed value, so the first row was the higher-pipeline Role Scope Brand B created earlier by the fixture. That brand has commercial activity but no configured quota; the contract correctly returned `null` for quota-dependent metrics. This was a test defect, not a product defect.

The test now resolves the seeded `HP` fixture to its exact `brandId`, confirms that the current tenant-wide configuration contains an explicit brand quota for that same ID, and selects the dashboard row by that ID. The original numeric assertions for quota, billed, pipeline, forecast, commit, remaining quota, projected revenue, projected gap, and projected attainment remain in place.

The test also selects Role Scope Brand B by its fixture `brandId`, confirms that no tenant-wide brand quota exists for it, and asserts the contract explicitly: `quota`, `remainingQuota`, `projectedGap`, `billingAttainment`, and `projectedAttainment` remain `null`, while its independent commercial values remain numeric. No `null` value is converted to zero and no arbitrary row with a non-null quota is accepted.

### Fresh evidence

- Before the edit, a disposable PostgreSQL 16 database with all four stable migrations reproduced the failure: **20 passed, 1 failed, 0 skipped** across 21 integration tests.
- After the edit, the complete integration suite passed: **21 passed, 0 failed, 0 skipped**.
- A second PostgreSQL 16 container was created from scratch, all four stable migrations were applied, the synthetic seed and restricted runtime role were recreated, and the complete suite passed again: **21 passed, 0 failed, 0 skipped**.
- `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` passed.
- `pnpm test` passed **81/81** (49 API, 31 web, 1 shared).
- `pnpm test:tenant-isolation` passed **5/5**.
- No E2E scenario or container image was rerun in this closure; the E2E, build, artifact, health, and Gitleaks entries below remain G16 evidence.

Both `pnpm audit --audit-level high` and the unchanged `pnpm security:audit` command still fail with **1 high, 2 moderate, and 1 low** vulnerability. The high finding is `braces@3.0.3` through the documented shared ESLint chain. No ignore, exception, `continue-on-error`, production-only substitution, severity reduction, or risk acceptance was added.

## Official upstream status, checked once

- Advisory: [GHSA-vfj7-8cjw-p6xm / CVE-2026-93687](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
- Observed version and npm `latest`: `braces@3.0.3`.
- Affected range: `<=3.0.3`.
- Patched versions reported by the advisory: none (`<0.0.0`).
- The official repository has [no GitHub releases](https://github.com/micromatch/braces/releases); the latest official tag and npm publication are `3.0.3`.
- Upstream tracking [micromatch/braces#70](https://github.com/micromatch/braces/issues/70) is open and does not provide a released compatible patch.
- G17 recheck on 2026-10-12 through GitHub's official advisory API: severity remains `high`, affected range remains `<=3.0.3`, `first_patched_version` remains `null`, `withdrawn_at` remains `null`, and the advisory's last recorded update is `2026-10-02T22:36:34Z`.

No fork, unpublished commit, fake version, override, or chained experimental upgrade was used.

## Audit and complete importer graph

| Diagnostic                 | Exit | Critical | High | Moderate | Low |
| -------------------------- | ---: | -------: | ---: | -------: | --: |
| `pnpm audit --json`        |    1 |        0 |    1 |        2 |   1 |
| `pnpm audit --prod --json` |    1 |        0 |    1 |        2 |   0 |

The remaining unique advisories are:

- high: `braces@3.0.3`;
- moderate: `uuid@8.3.2` through `apps__api > exceljs`;
- moderate: `js-yaml@5.3.0` through `apps__api > @nestjs/swagger`; and
- low, full audit only: `esbuild@0.27.7` through `apps__api > @nestjs/cli`.

Every `braces` importer resolves to the same single chain:

```text
packages__eslint-config
  > eslint-config-next@16.3.8
  > @next/eslint-plugin-next@16.3.8
  > fast-glob@3.3.1
  > micromatch@4.0.8
  > braces@3.0.3
```

`@sip/eslint-config` is a development dependency of the web and API workspaces, but its own tooling packages are regular `dependencies`. That packaging choice explains why the monorepo-wide `--prod` diagnostic still reports `braces`; it is not evidence that the application runtime loads it. The raw full audit remains the unchanged policy gate.

## Effective exposure analysis

Final classification: **TOOLING ACOTADO DEMOSTRADO**.

| Area                           | Evidence                                                                                                                                                                                                                                                                                   | Result                                                                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source and manifests           | No application import or `require` of `braces`, `micromatch`, or `fast-glob`; the only source entry is the shared Next ESLint configuration.                                                                                                                                               | Lint/build-time dependency only.                                                                                                                  |
| Physical install               | `braces`, `micromatch`, `fast-glob`, and `eslint-config-next` exist in the pnpm virtual store used by the builder.                                                                                                                                                                         | Present in dependency storage; this is not a runtime trace.                                                                                       |
| ESLint call site               | `@next/eslint-plugin-next/dist/utils/get-root-dirs.js` calls `fast-glob.globSync` only for `settings.next.rootDir`; the repository does not set that option and therefore uses `context.cwd`.                                                                                              | Current versioned configuration does not send HTTP, upload, or commercial data to the parser.                                                     |
| Repository and PR control      | A pull request can modify the ESLint config and introduce a crafted `rootDir` pattern. Repository file names alone are not passed as brace patterns by this call site.                                                                                                                     | Residual CI availability risk from untrusted repository changes.                                                                                  |
| API final image                | The reproducible final Docker stage contains no directories named `braces`, `micromatch`, `fast-glob`, or `eslint-config-next`; none is resolvable from `/app`. Nest 11.2.7 and Nodemailer 10.0.16 are resolvable; physical production packages include Multer 2.4.0 and proxy-addr 2.0.8. | Vulnerable chain excluded from the API runner.                                                                                                    |
| Web standalone                 | No vulnerable-chain file occurs in `.next/standalone`; none of 37 NFT manifests names it; the modules are not resolvable from the standalone application.                                                                                                                                  | Vulnerable chain excluded from the locally generated runtime trace.                                                                               |
| Vercel preview                 | `dpl_CiKBjDLunFqWLVu8dfyYv7aPXUJH` is a Ready preview for functional SHA `da9fbf8`; logs show all-workspace install followed by the web build and `/vercel/output` generation. The CLI exposes functions and logs, not a downloadable complete function filesystem/SBOM.                   | Builder presence is confirmed; remote file-level absence cannot be asserted independently, so local standalone/NFT evidence is the runtime proof. |
| HTTP, uploads, commercial data | Route/controller/import searches found no path from request parameters, uploaded workbooks, or commercial fields into ESLint, fast-glob, micromatch, or braces.                                                                                                                            | No application-controlled parser input found.                                                                                                     |

The vulnerability is a stack-exhaustion denial of service when a deeply nested brace pattern reaches the recursive parser. A string merely containing braces is not sufficient evidence of exploitability.

## CI trust boundary and controls

- CI uses `pull_request`, not `pull_request_target`, plus pushes to `main` and `staging`.
- The quality job checks out pull-request code, installs it, and executes repository scripts. A contributor can therefore change versioned ESLint configuration and package scripts.
- Repository default workflow permissions are read-only. The quality job receives no repository secret through its environment. The secrets job explicitly has `contents: read` and `pull-requests: read`; its `GITHUB_TOKEN` is read-only and repository secrets are not exposed to an external fork pull request.
- The quality job has a 25-minute timeout and concurrency cancellation by ref. Network egress is not explicitly restricted.
- Lint and the raw high-severity audit remain active. There is no ignore, `continue-on-error`, `--ignore-unfixable`, production-only replacement, or severity downgrade.
- GitHub reports default workflow permissions as read-only and disallows workflow approval of pull requests. It reports no repository rulesets, and the branch-protection API returns `404 Branch not protected` for both `staging` and `main`. Therefore the green policy check is evidence, not a platform-enforced merge authorization; operational authorization remains separate.

The remaining risk is bounded to CI/developer-tool availability if untrusted versioned configuration is changed to feed a malicious pattern to the lint rule. A malicious pull request can already execute repository-controlled install/test scripts in the same read-only, secretless job, so review and the job timeout are the relevant containment controls. This analysis does not claim “not affected.”

## Temporary exception — approved with fixed expiry

- Status: **APPROVED, ACTIVE, TIME-LIMITED**
- Identifier: `SIP-SEC-EXC-2026-001`
- Approver and owner: Jorge Quizamanchuro
- Start: `2026-10-12T16:59:59Z` / `2026-10-12 11:59:59` America/Guayaquil
- First weekly review due: `2026-10-19T16:59:59Z` / `2026-10-19 11:59:59` America/Guayaquil
- Maximum expiry: `2026-10-26T16:59:59Z` / `2026-10-26 11:59:59` America/Guayaquil
- Renewal: none; copying, retrying CI, or pushing another branch does not change these timestamps.

Recorded authorization:

> Apruebo por un máximo de 14 días la excepción temporal de braces@3.0.3, exclusivamente para el advisory y la cadena de herramientas documentados en G16, con revisión semanal, sin renovación automática y sin autorizar todavía merges ni despliegues.

The approval covers only GHSA-vfj7-8cjw-p6xm / CVE-2026-93687, `braces@3.0.3`, severity `HIGH`, and the one exact `@sip/eslint-config → eslint-config-next@16.3.8 → @next/eslint-plugin-next@16.3.8 → fast-glob@3.3.1 → micromatch@4.0.8 → braces@3.0.3` tooling chain. It does not cover a different advisory, version, importer, path, severity, runtime use, input source, or any other High/Critical finding.

Approved conditions and controls:

- no high or critical runtime finding;
- no new `braces` chain or use outside the evaluated ESLint path;
- frozen installation, exact installed graph, source-reference scope, lint, unit/integration/tenant tests, build, Gitleaks, timeouts, read-only workflow permissions, full JSON audit, and raw audit remain active;
- `AUDIT_RAW` and `SECURITY_POLICY` are reported separately and the complete Low/Moderate/High findings remain visible;
- any change in version, chain, call site, input control, or any new high/critical advisory triggers immediate review; and
- remove the acceptance as soon as a compatible official patch exists.

The evaluator fails closed for missing/revoked/invalid records, overdue weekly review, `now >= 2026-10-26T16:59:59Z`, incomplete or malformed JSON, registry/network/timeout errors, contradictory evidence, another path or advisory, severity escalation, runtime use, lost controls, or any additional High/Critical finding. There is no date-bypass flag; simulated time exists only in unit tests.

A previously green GitHub check does not turn red automatically when the review deadline or expiry is reached. Any future merge or deployment therefore requires a fresh policy evaluation on that exact HEAD while the exception is still valid, plus separate operational authorization.

If the accepted High disappears and no other High/Critical remains, the policy returns `PASS` without using the exception and instructs maintainers to close the record rather than renew it. Moderate and Low findings remain visible under the pre-existing high-severity gate.

**Exception applied: YES, only in `SECURITY_POLICY`.** `pnpm security:audit` and `pnpm audit --audit-level high` remain unchanged and continue to report **FAIL**. Current real evaluation is `AUDIT_RAW: FAIL` and `SECURITY_POLICY: PASS_WITH_TIME_LIMITED_EXCEPTION`.

Residual risk remains a CI/developer-tool denial of service from a malicious versioned glob configuration. The complete filesystem of every hosted Vercel function was not independently inspected; local standalone and NFT evidence must not be presented as zero risk.

## Backported dependency changes

- Next.js `16.3.3 → 16.3.8` and matching `eslint-config-next`.
- Nest common/core/platform-express/testing `11.2.3 → 11.2.7`.
- Nodemailer `10.0.0 → 10.0.16`.
- Compatible lockfile refreshes include proxy-addr 2.0.8, Multer 2.4.0, Sharp 0.35.5, js-yaml 4.3.2, fast-uri 3.1.8, corrected brace-expansion lines, source-map-js 1.2.2, and qs 6.16.0.

No new override was introduced; the pre-existing `deepmerge-ts` override is unchanged. The original G16 dependency diff contains only three package manifests, the lockfile, and this technical report. The approved closure adds only the integration assertion and this report update.

## Verification on the stable base

The first typecheck attempt after a clean install was invalid because Prisma generation had not yet run. Repeating the exact CI order (`db:generate` before typecheck) passed.

| Check                                    | Result                                                                                                                                                                                                                                                                                                                                             |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fresh `pnpm install --frozen-lockfile`   | PASS; 827 packages, lockfile unchanged                                                                                                                                                                                                                                                                                                             |
| Prisma generate/deploy/status            | PASS; stable schema has 4 migrations                                                                                                                                                                                                                                                                                                               |
| `pnpm format:check`                      | PASS                                                                                                                                                                                                                                                                                                                                               |
| `pnpm lint`                              | PASS                                                                                                                                                                                                                                                                                                                                               |
| `pnpm typecheck` after Prisma generation | PASS                                                                                                                                                                                                                                                                                                                                               |
| `pnpm test`                              | PASS; 81 tests (49 API, 31 web, 1 shared)                                                                                                                                                                                                                                                                                                          |
| `pnpm test:integration` — G16 run        | **FAIL; 20/21 passed** — pre-existing stable assertion selected `brandPerformance[0]`, which was an unconfigured higher-pipeline brand created earlier in the same suite                                                                                                                                                                           |
| `pnpm test:integration` — test closure   | PASS twice; 21/21 on the first corrected run and 21/21 after rebuilding a disposable database from four migrations; 0 failed and 0 skipped in each run                                                                                                                                                                                             |
| `pnpm test:tenant-isolation`             | PASS; 5/5                                                                                                                                                                                                                                                                                                                                          |
| `pnpm build`                             | PASS                                                                                                                                                                                                                                                                                                                                               |
| API Docker build and smoke               | PASS; `/health/live` 200 and `/health/ready` 200/database up                                                                                                                                                                                                                                                                                       |
| Web standalone smoke                     | PASS; login HTML, static asset, and backend health proxy 200                                                                                                                                                                                                                                                                                       |
| Local synthetic E2E                      | PASS for all 10 scenarios when scheduled within the real 5-logins/minute limit: 9 passed in the suite run, then the rate-limited final scenario passed alone after the window, with retries disabled                                                                                                                                               |
| Gitleaks                                 | PASS; 85 commits scanned, no leaks                                                                                                                                                                                                                                                                                                                 |
| Raw full security gate                   | **FAIL; one high (`braces`)**                                                                                                                                                                                                                                                                                                                      |
| G17 evaluator fixtures                   | PASS; 31 tests covering exact scope, altered GHSA/version/path/use/severity, extra path, extra High/Critical, missing/revoked/invalid record, weekly review and expiry boundaries, future/equal/current review timestamps, audit errors, filtered reports, raw-report contradictions, finding removal, lost controls, and cross-branch fixed dates |
| G17 real complete audit                  | `AUDIT_RAW: FAIL`; `SECURITY_POLICY: PASS_WITH_TIME_LIMITED_EXCEPTION`; 0 critical, 1 high, 2 moderate, 1 low                                                                                                                                                                                                                                      |

The first monolithic E2E attempt at the canonical local origin hit the expected HTTP 429 on the sixth login in a minute; the throttle was not disabled or bypassed. There were no HTTP 5xx responses in the completed flows. All data and credentials used by these tests were local and disposable.

### G17 future-review timestamp correction — 2026-10-12

Independent review reproduced a temporal defect in the approved evaluator: at `now = 2026-10-12T17:40:00Z`, a cloned record containing a weekly review dated `2026-10-19T16:59:59Z` incorrectly returned `PASS_WITH_TIME_LIMITED_EXCEPTION`. The evaluator now compares every additional `reviewedAt` with the same explicit `now` received by `evaluateSecurityPolicy` and fails with `weekly exception review is dated in the future` when `reviewedAt > now`. Equality remains valid when every other ordering, weekly-deadline, and absolute-expiry condition is satisfied.

Four deterministic cases were added without modifying `braces-exception.json`: future review fails, a completed valid review passes, `reviewedAt === now` passes, and an invalid review date fails. The prior 27 cases remain; the complete evaluator suite is 31/31. Existing cases continue to prove overdue review failure, exact absolute-expiry failure, and the current approved record's valid result. The real report remains `AUDIT_RAW: FAIL` and `SECURITY_POLICY: PASS_WITH_TIME_LIMITED_EXCEPTION` with 0 critical, 1 high, 2 moderate, and 1 low.

The authorization, start, weekly-review deadline, absolute expiry, advisory scope, and current review history are unchanged. This correction is not a future weekly review and does not renew the exception. It changes no product code, dependency, schema, packaging, account, data, or deployment. G15/G16 E2E, container, runtime, and image evidence is reused and was not rerun for this correction.

## Automation review and non-deployment guarantee

- GitHub CI runs for pull requests. It does not deploy.
- Vercel may create an automatic branch preview after push; that is a build-only preview and is not the stable alias.
- Railway is configured from the `staging` branch and its watch paths. Pushing `fix/staging-runtime-security` does not update the stable service.
- The current stable Railway API remains deployment `010ea649-a4eb-4ab4-a48e-561eed2b8d78`, application SHA `125ad6f6e05121b363d7982d4195bb32c88b25d6`, live/ready 200.
- No aliases, environments, databases, credentials, or remote services were changed.

## Review, later deployment, and rollback runbook — not executed

1. Preserve the explicit-brand integration assertion and its no-quota contract check during review.
2. Re-evaluate the exact HEAD before any future merge or deployment, complete the weekly review by its fixed deadline, and remove the exception when an official compatible patch exists.
3. Require review of the dependency changes, test-only correction, fixed exception record, evaluator/workflow, raw audit output, artifact evidence, and stable-suite result.
4. Merge only after the applicable repository policy is satisfied; then allow the existing staging CI/deployment automation to build the exact merge SHA.
5. Recheck Railway and Vercel artifact SHAs, API live/ready, web smoke, Auth/CSRF/RLS/RBAC/tenant isolation, and absence of 5xx. Do not promote to `main` or customer production.
6. If regression occurs, revert the backport merge and redeploy the last known stable staging artifacts identified above; verify database state before rollback. This backport has no migration, so schema rollback is not expected.

## Sanitized memory handoff

The integration blocker in PR #30 is closed by a test-only assertion that targets the exact configured fixture brand and preserves the explicit no-quota contract. Jorge approved only `SIP-SEC-EXC-2026-001` with the fixed timestamps and scope recorded above. The raw audit still fails; only the separate policy may pass with the exception. No merge, deployment, H3 validation, D01–D04 resolution, real reconciliation, or Coolify migration is authorized or implied. This handoff is pending synchronization because no authorized Notion connector was available in this execution context. Existing G16 history must be retained when it is synchronized.
