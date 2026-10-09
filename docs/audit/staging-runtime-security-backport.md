# G16 — Residual exposure and stable runtime-security backport

Date: 2026-10-08  
Target: `fix/staging-runtime-security` → `staging`  
Base: `de23454048f22bf2deac295630235c181b661c04` (`origin/staging`)  
Source dependency change: `a31eaa8e37c5de887fdd6f58e1d07bcc5d7dad88`  
Deployment state: **not deployed**

## Result

The compatible runtime dependency patches from G15 apply cleanly to the stable branch without functional code, migrations, October entities, the Edgar dashboard, or visit functionality. The stable schema remains at four migrations.

The backport is prepared as a draft and has two explicit blockers:

1. raw `pnpm audit --audit-level high` remains **FAIL** because of `braces@3.0.3`; no exception has been applied; and
2. the stable integration suite has a pre-existing order-dependent assertion in `phase1-commercial.integration-spec.ts` (20/21 tests passed). Commit `23842f7` in the functional branch fixes that assertion by selecting a configured brand instead of `brandPerformance[0]`, but it is intentionally excluded here because G16 forbids copying dashboard-specific tests into the security backport.

## Official upstream status, checked once

- Advisory: [GHSA-vfj7-8cjw-p6xm / CVE-2026-93687](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
- Observed version and npm `latest`: `braces@3.0.3`.
- Affected range: `<=3.0.3`.
- Patched versions reported by the advisory: none (`<0.0.0`).
- The official repository has [no GitHub releases](https://github.com/micromatch/braces/releases); the latest official tag and npm publication are `3.0.3`.
- Upstream tracking [micromatch/braces#70](https://github.com/micromatch/braces/issues/70) is open and does not provide a released compatible patch.

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

The remaining risk is bounded to CI/developer-tool availability if untrusted versioned configuration is changed to feed a malicious pattern to the lint rule. A malicious pull request can already execute repository-controlled install/test scripts in the same read-only, secretless job, so review and the job timeout are the relevant containment controls. This analysis does not claim “not affected.”

## Temporary acceptance proposal — not approved

Status: **PENDIENTE DE APROBACIÓN**  
Proposed owner: Jorge  
Proposed review: weekly  
Proposed expiry: 14 days after an actual approval; no active expiry exists and renewal is not automatic.

Proposed scope is only GHSA-vfj7-8cjw-p6xm / CVE-2026-93687 for `braces@3.0.3` through the exact importer chain documented above. Residual risk is a CI/developer-tool denial of service from a malicious versioned glob configuration.

Proposed conditions:

- no high or critical runtime finding;
- no new `braces` chain or use outside the evaluated ESLint path;
- lint, tests, and raw audit remain active and the warning remains visible;
- any change in version, chain, call site, input control, or any new high/critical advisory triggers immediate review; and
- remove the acceptance as soon as a compatible official patch exists.

**Exception applied: NO.** `pnpm security:audit` and `pnpm audit --audit-level high` are unchanged and still fail. An approved policy outcome, if any, must remain distinct from the raw audit result.

## Backported dependency changes

- Next.js `16.3.3 → 16.3.8` and matching `eslint-config-next`.
- Nest common/core/platform-express/testing `11.2.3 → 11.2.7`.
- Nodemailer `10.0.0 → 10.0.16`.
- Compatible lockfile refreshes include proxy-addr 2.0.8, Multer 2.4.0, Sharp 0.35.5, js-yaml 4.3.2, fast-uri 3.1.8, corrected brace-expansion lines, source-map-js 1.2.2, and qs 6.16.0.

No new override was introduced; the pre-existing `deepmerge-ts` override is unchanged. The diff contains only three package manifests, the lockfile, and this technical report.

## Verification on the stable base

The first typecheck attempt after a clean install was invalid because Prisma generation had not yet run. Repeating the exact CI order (`db:generate` before typecheck) passed.

| Check                                    | Result                                                                                                                                                                                               |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fresh `pnpm install --frozen-lockfile`   | PASS; 827 packages, lockfile unchanged                                                                                                                                                               |
| Prisma generate/deploy/status            | PASS; stable schema has 4 migrations                                                                                                                                                                 |
| `pnpm format:check`                      | PASS                                                                                                                                                                                                 |
| `pnpm lint`                              | PASS                                                                                                                                                                                                 |
| `pnpm typecheck` after Prisma generation | PASS                                                                                                                                                                                                 |
| `pnpm test`                              | PASS; 81 tests (49 API, 31 web, 1 shared)                                                                                                                                                            |
| `pnpm test:integration`                  | **FAIL; 20/21 passed** — pre-existing stable assertion selects `brandPerformance[0]`, which is an unconfigured higher-pipeline brand created earlier in the same suite                               |
| `pnpm test:tenant-isolation`             | PASS; 5/5                                                                                                                                                                                            |
| `pnpm build`                             | PASS                                                                                                                                                                                                 |
| API Docker build and smoke               | PASS; `/health/live` 200 and `/health/ready` 200/database up                                                                                                                                         |
| Web standalone smoke                     | PASS; login HTML, static asset, and backend health proxy 200                                                                                                                                         |
| Local synthetic E2E                      | PASS for all 10 scenarios when scheduled within the real 5-logins/minute limit: 9 passed in the suite run, then the rate-limited final scenario passed alone after the window, with retries disabled |
| Gitleaks                                 | PASS; 85 commits scanned, no leaks                                                                                                                                                                   |
| Raw full security gate                   | **FAIL; one high (`braces`)**                                                                                                                                                                        |

The first monolithic E2E attempt at the canonical local origin hit the expected HTTP 429 on the sixth login in a minute; the throttle was not disabled or bypassed. There were no HTTP 5xx responses in the completed flows. All data and credentials used by these tests were local and disposable.

## Automation review and non-deployment guarantee

- GitHub CI runs for pull requests. It does not deploy.
- Vercel may create an automatic branch preview after push; that is a build-only preview and is not the stable alias.
- Railway is configured from the `staging` branch and its watch paths. Pushing `fix/staging-runtime-security` does not update the stable service.
- The current stable Railway API remains deployment `010ea649-a4eb-4ab4-a48e-561eed2b8d78`, application SHA `125ad6f6e05121b363d7982d4195bb32c88b25d6`, live/ready 200.
- No aliases, environments, databases, credentials, or remote services were changed.

## Review, later deployment, and rollback runbook — not executed

1. Resolve the stable integration assertion in an independently approved scope or after its source commit is present in the target base.
2. Obtain security review and an explicit decision on the temporary proposal, or replace `braces` with an official compatible patch.
3. Require review of the manifest/lockfile-only changes, raw audit output, artifact evidence, and stable-suite result.
4. Merge only after the applicable repository policy is satisfied; then allow the existing staging CI/deployment automation to build the exact merge SHA.
5. Recheck Railway and Vercel artifact SHAs, API live/ready, web smoke, Auth/CSRF/RLS/RBAC/tenant isolation, and absence of 5xx. Do not promote to `main` or customer production.
6. If regression occurs, revert the backport merge and redeploy the last known stable staging artifacts identified above; verify database state before rollback. This backport has no migration, so schema rollback is not expected.
