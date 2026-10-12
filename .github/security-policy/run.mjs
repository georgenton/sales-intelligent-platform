import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { EXPECTED_REPOSITORY_EVIDENCE, evaluateSecurityPolicy } from './evaluate.mjs';

const policyDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(policyDirectory, '../..');
const exceptionPath = resolve(policyDirectory, 'braces-exception.json');
const commandTimeoutMs = 120_000;

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 50 * 1024 * 1024,
    timeout: commandTimeoutMs,
  });
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    exitCode: result.status,
    timedOut: result.error?.code === 'ETIMEDOUT',
    error: result.error ? String(result.error.message) : null,
  };
}

function printExecution(title, execution) {
  process.stdout.write(`\n=== ${title} STDOUT ===\n${execution.stdout || '(empty)\n'}`);
  process.stdout.write(`\n=== ${title} STDERR ===\n${execution.stderr || '(empty)\n'}`);
  process.stdout.write(`\n${title}_EXIT_CODE: ${String(execution.exitCode)}\n`);
}

function rawAuditStatus(execution) {
  if (execution.timedOut || execution.error || ![0, 1].includes(execution.exitCode)) return 'ERROR';
  const output = `${execution.stdout}${execution.stderr}`;
  if (!output.trim()) return 'ERROR';
  if (
    execution.exitCode === 1 &&
    (!output.includes('vulnerabilities found') || !output.includes('Severity:'))
  ) {
    return 'ERROR';
  }
  return execution.exitCode === 0 ? 'PASS' : 'FAIL';
}

function normalizeWhyGraph(nodes) {
  const paths = [];
  const visit = (node, downstream) => {
    const current = `${node.name}@${node.version}`;
    if (!node.dependents?.length) {
      paths.push([current, ...downstream].join('>'));
      return;
    }
    for (const dependent of node.dependents) visit(dependent, [current, ...downstream]);
  };
  for (const node of nodes) visit(node, []);
  return paths.sort((left, right) => left.localeCompare(right));
}

function sourceReferences() {
  const tracked = run('git', ['ls-files', 'apps', 'packages']);
  if (tracked.exitCode !== 0)
    return { references: [], error: 'could not enumerate tracked source' };
  const tokens = /(?:braces|micromatch|fast-glob|eslint-config-next(?:\/[a-z-]+)?)/g;
  const references = [];
  for (const relativePath of tracked.stdout.split('\n').filter(Boolean)) {
    const contents = readFileSync(resolve(repositoryRoot, relativePath), 'utf8');
    for (const match of contents.matchAll(tokens)) references.push(`${relativePath}:${match[0]}`);
  }
  return {
    references: [...new Set(references)].sort((left, right) => left.localeCompare(right)),
    error: null,
  };
}

function workflowControls() {
  const workflow = readFileSync(resolve(repositoryRoot, '.github/workflows/ci.yml'), 'utf8');
  const packageJson = JSON.parse(readFileSync(resolve(repositoryRoot, 'package.json'), 'utf8'));
  const required = new Map([
    ['build', /^\s*- run: pnpm build\s*$/m],
    ['frozen-install', /^\s*- run: pnpm install --frozen-lockfile\s*$/m],
    ['gitleaks', /gitleaks\/gitleaks-action@v2/],
    ['integration-tests', /^\s*- run: pnpm test:integration\s*$/m],
    ['lint', /^\s*- run: pnpm lint\s*$/m],
    ['policy-tests', /node --test \.github\/security-policy\/evaluate\.test\.mjs/],
    ['quality-timeout', /timeout-minutes: 25/],
    ['read-only-secrets-job', /pull-requests: read/],
    ['tenant-isolation-tests', /^\s*- run: pnpm test:tenant-isolation\s*$/m],
    ['unit-tests', /^\s*- run: pnpm test\s*$/m],
  ]);
  const controls = [];
  const errors = [];
  for (const [control, pattern] of required) {
    if (pattern.test(workflow)) controls.push(control);
    else errors.push(`missing workflow control: ${control}`);
  }
  if (packageJson.scripts?.['security:audit'] === 'pnpm audit --audit-level high') {
    controls.push('raw-high-audit');
  } else {
    errors.push('raw high audit command changed');
  }
  if (workflow.includes('node .github/security-policy/run.mjs')) controls.push('full-json-audit');
  else errors.push('policy runner is not in CI');
  if (!workflow.includes('pull_request_target')) controls.push('no-pull-request-target');
  else errors.push('pull_request_target is forbidden');
  if (!workflow.includes('continue-on-error')) controls.push('no-continue-on-error');
  else errors.push('continue-on-error is forbidden');

  const forbidden = [
    '--ignore-unfixable',
    '--ignore-registry-errors',
    'audit --prod',
    'audit-level critical',
    '|| true',
    'contents: write',
    'pull-requests: write',
    'write-all',
  ];
  for (const text of forbidden) {
    if (workflow.includes(text)) errors.push(`forbidden workflow setting: ${text}`);
  }
  return {
    controls: controls.sort((left, right) => left.localeCompare(right)),
    errors,
  };
}

function repositoryEvidence(whyExecution) {
  const errors = [];
  let graphPaths = [];
  if (whyExecution.exitCode !== 0 || whyExecution.stderr.trim()) {
    errors.push('installed dependency graph could not be verified');
  } else {
    try {
      graphPaths = normalizeWhyGraph(JSON.parse(whyExecution.stdout));
    } catch {
      errors.push('installed dependency graph is malformed');
    }
  }
  const sources = sourceReferences();
  if (sources.error) errors.push(sources.error);
  const workflow = workflowControls();
  errors.push(...workflow.errors);
  return {
    graphPaths,
    sourceReferences: sources.references,
    usage: 'lint-build-tooling-only',
    controls: workflow.controls,
    errors,
  };
}

let exceptionRecord = null;
try {
  exceptionRecord = JSON.parse(readFileSync(exceptionPath, 'utf8'));
} catch (error) {
  process.stderr.write(`Could not read approved exception record: ${String(error)}\n`);
}

const rawAudit = run('pnpm', ['security:audit']);
printExecution('AUDIT_RAW', rawAudit);
const rawStatus = rawAuditStatus(rawAudit);
process.stdout.write(`AUDIT_RAW: ${rawStatus}\n`);

const fullAudit = run('pnpm', ['audit', '--json']);
printExecution('AUDIT_FULL_JSON', fullAudit);
const whyExecution = run('pnpm', ['why', 'braces', '-r', '--json']);
printExecution('DEPENDENCY_GRAPH', whyExecution);
const evidence = repositoryEvidence(whyExecution);
const decision = evaluateSecurityPolicy({
  fullAudit,
  rawAuditStatus: rawStatus,
  record: exceptionRecord,
  evidence,
  now: new Date().toISOString(),
});

process.stdout.write(`\nSECURITY_POLICY: ${decision.policy}\n`);
process.stdout.write(`EXCEPTION_ID: ${exceptionRecord?.id ?? 'NONE'}\n`);
process.stdout.write('FINDING: GHSA-vfj7-8cjw-p6xm / CVE-2026-93687 / braces@3.0.3 / HIGH\n');
process.stdout.write(
  'SCOPE: @sip/eslint-config -> eslint-config-next@16.3.8 -> @next/eslint-plugin-next@16.3.8 -> fast-glob@3.3.1 -> micromatch@4.0.8 -> braces@3.0.3\n',
);
process.stdout.write(
  `REVIEW_DUE_AT: ${exceptionRecord?.reviewHistory?.at(-1)?.nextReviewDueAt ?? 'UNKNOWN'}\n`,
);
process.stdout.write(`EXPIRES_AT: ${exceptionRecord?.expiresAt ?? 'UNKNOWN'}\n`);
process.stdout.write(
  `VISIBLE_COUNTS: ${decision.counts ? JSON.stringify(decision.counts) : 'UNKNOWN'}\n`,
);
for (const reason of decision.reasons) process.stdout.write(`POLICY_REASON: ${reason}\n`);
if (decision.policy === 'PASS') {
  process.stdout.write('EXCEPTION_ACTION: close the record; do not renew it\n');
}

if (!Object.isFrozen(EXPECTED_REPOSITORY_EVIDENCE)) process.exitCode = 1;
else process.exitCode = decision.policy === 'FAIL' ? 1 : 0;
