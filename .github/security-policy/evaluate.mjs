import { isDeepStrictEqual } from 'node:util';

const EXPECTED_CONTRACT = {
  schemaVersion: 1,
  id: 'SIP-SEC-EXC-2026-001',
  status: 'APPROVED',
  revoked: false,
  approvedBy: 'Jorge Quizamanchuro',
  authorizationText:
    'Apruebo por un máximo de 14 días la excepción temporal de braces@3.0.3, exclusivamente para el advisory y la cadena de herramientas documentados en G16, con revisión semanal, sin renovación automática y sin autorizar todavía merges ni despliegues',
  startsAt: '2026-10-12T16:59:59Z',
  reviewDueAt: '2026-10-19T16:59:59Z',
  expiresAt: '2026-10-26T16:59:59Z',
  displayTimezone: 'America/Guayaquil',
  startsAtLocal: '2026-10-12T11:59:59-05:00',
  reviewDueAtLocal: '2026-10-19T11:59:59-05:00',
  expiresAtLocal: '2026-10-26T11:59:59-05:00',
  renewal: 'NONE',
  approvalSource: 'https://app.notion.com/p/3f7cbb1031a081e8a00ac1030c70a12f',
  branches: ['fix/staging-runtime-security', 'feat/manager-dashboard-edgar'],
  scope: {
    ghsa: 'GHSA-vfj7-8cjw-p6xm',
    cve: 'CVE-2026-93687',
    package: 'braces',
    version: '3.0.3',
    severity: 'high',
    auditPaths: [
      'packages__eslint-config>eslint-config-next>@next/eslint-plugin-next>fast-glob>micromatch>braces',
    ],
    graphPaths: [
      '@sip/eslint-config@0.1.0>eslint-config-next@16.3.8>@next/eslint-plugin-next@16.3.8>fast-glob@3.3.1>micromatch@4.0.8>braces@3.0.3',
    ],
    usage: 'lint-build-tooling-only',
    sourceReferences: [
      'packages/eslint-config/next.mjs:eslint-config-next/core-web-vitals',
      'packages/eslint-config/next.mjs:eslint-config-next/typescript',
      'packages/eslint-config/package.json:eslint-config-next',
    ],
    vercelLimitation:
      'The complete filesystem of every hosted Vercel function was not independently inspected; local standalone and NFT evidence must not be represented as zero risk.',
  },
  controls: [
    'build',
    'frozen-install',
    'full-json-audit',
    'gitleaks',
    'integration-tests',
    'lint',
    'no-continue-on-error',
    'no-pull-request-target',
    'policy-tests',
    'quality-timeout',
    'raw-high-audit',
    'read-only-secrets-job',
    'tenant-isolation-tests',
    'unit-tests',
  ],
};

export const EXPECTED_REPOSITORY_EVIDENCE = Object.freeze({
  graphPaths: EXPECTED_CONTRACT.scope.graphPaths,
  sourceReferences: EXPECTED_CONTRACT.scope.sourceReferences,
  usage: EXPECTED_CONTRACT.scope.usage,
  controls: EXPECTED_CONTRACT.controls,
  errors: [],
});

const SEVERITIES = ['info', 'low', 'moderate', 'high', 'critical'];

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function auditCounts(report) {
  return Object.fromEntries(
    SEVERITIES.map((severity) => [severity, report.metadata.vulnerabilities[severity]]),
  );
}

function validateCompleteReport(report) {
  if (!report || typeof report !== 'object' || Array.isArray(report)) {
    return 'audit JSON root must be an object';
  }
  if (!report.advisories || typeof report.advisories !== 'object') {
    return 'audit JSON is missing advisories';
  }
  const counts = report.metadata?.vulnerabilities;
  if (!counts || SEVERITIES.some((severity) => !Number.isInteger(counts[severity]))) {
    return 'audit JSON is missing complete vulnerability counts';
  }

  const observed = Object.fromEntries(SEVERITIES.map((severity) => [severity, 0]));
  for (const advisory of Object.values(report.advisories)) {
    if (
      !advisory ||
      typeof advisory !== 'object' ||
      typeof advisory.github_advisory_id !== 'string' ||
      typeof advisory.module_name !== 'string' ||
      !SEVERITIES.includes(advisory.severity) ||
      !Array.isArray(advisory.findings) ||
      advisory.findings.length === 0
    ) {
      return 'audit JSON contains an incomplete advisory';
    }
    for (const finding of advisory.findings) {
      if (
        typeof finding.version !== 'string' ||
        !Array.isArray(finding.paths) ||
        finding.paths.length === 0 ||
        finding.paths.some((path) => typeof path !== 'string')
      ) {
        return 'audit JSON contains an incomplete finding';
      }
    }
    observed[advisory.severity] += 1;
  }

  if (SEVERITIES.some((severity) => observed[severity] !== counts[severity])) {
    return 'audit JSON is filtered or its counts do not reconcile';
  }
  return null;
}

export function parseFullAuditExecution(execution) {
  if (execution.timedOut || execution.error) {
    return { ok: false, error: execution.error ?? 'audit command timed out' };
  }
  if (![0, 1].includes(execution.exitCode)) {
    return { ok: false, error: `unexpected audit exit code: ${String(execution.exitCode)}` };
  }
  if (!execution.stdout?.trim()) {
    return { ok: false, error: 'audit report is empty' };
  }
  if (execution.stderr?.trim()) {
    return { ok: false, error: 'audit JSON command wrote to stderr' };
  }

  let report;
  try {
    report = JSON.parse(execution.stdout);
  } catch {
    return { ok: false, error: 'audit report is not valid JSON' };
  }
  const reportError = validateCompleteReport(report);
  if (reportError) return { ok: false, error: reportError };

  const total = Object.values(report.metadata.vulnerabilities).reduce(
    (sum, count) => sum + count,
    0,
  );
  if ((total === 0 && execution.exitCode !== 0) || (total > 0 && execution.exitCode !== 1)) {
    return { ok: false, error: 'audit exit code contradicts the complete report' };
  }
  return { ok: true, report };
}

function validateExceptionRecord(record, now) {
  if (!record) return ['approved exception record is absent'];
  const mismatches = [];
  const allowedFields = sorted([...Object.keys(EXPECTED_CONTRACT), 'reviewHistory']);
  if (!isDeepStrictEqual(sorted(Object.keys(record)), allowedFields)) {
    mismatches.push('unexpected or missing fields');
  }
  for (const [field, expected] of Object.entries(EXPECTED_CONTRACT)) {
    if (!isDeepStrictEqual(record[field], expected)) mismatches.push(field);
  }
  if (mismatches.length > 0) {
    return [`approved exception record differs in: ${mismatches.join(', ')}`];
  }

  const reviews = record.reviewHistory;
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return ['approved exception review history is absent'];
  }
  const initialReview = {
    reviewedAt: EXPECTED_CONTRACT.startsAt,
    reviewer: EXPECTED_CONTRACT.approvedBy,
    nextReviewDueAt: EXPECTED_CONTRACT.reviewDueAt,
    evidence: EXPECTED_CONTRACT.approvalSource,
  };
  if (!isDeepStrictEqual(reviews[0], initialReview)) {
    return ['initial approved exception review differs from the fixed contract'];
  }

  let previousDueMs = Date.parse(initialReview.nextReviewDueAt);
  let previousReviewMs = Date.parse(initialReview.reviewedAt);
  const expiresMs = Date.parse(EXPECTED_CONTRACT.expiresAt);
  const nowMs = Date.parse(now);
  if (Number.isNaN(nowMs)) return ['exception date is invalid'];
  for (const review of reviews.slice(1)) {
    const reviewedMs = Date.parse(review.reviewedAt);
    const nextDueMs = Date.parse(review.nextReviewDueAt);
    const weeklyMaximumMs = reviewedMs + 7 * 24 * 60 * 60 * 1000;
    if ([reviewedMs, nextDueMs].some(Number.isNaN)) {
      return ['weekly exception review history is invalid'];
    }
    if (reviewedMs > nowMs) {
      return ['weekly exception review is dated in the future'];
    }
    if (
      review.reviewer !== EXPECTED_CONTRACT.approvedBy ||
      typeof review.evidence !== 'string' ||
      !review.evidence.startsWith('https://app.notion.com/p/') ||
      reviewedMs < previousReviewMs ||
      reviewedMs > previousDueMs ||
      nextDueMs <= reviewedMs ||
      nextDueMs > weeklyMaximumMs ||
      nextDueMs > expiresMs
    ) {
      return ['weekly exception review history is invalid'];
    }
    previousReviewMs = reviewedMs;
    previousDueMs = nextDueMs;
  }
  return [];
}

function validateTime(record, now) {
  if (!Array.isArray(record.reviewHistory) || record.reviewHistory.length === 0) {
    return ['exception review date is invalid'];
  }
  const nowMs = Date.parse(now);
  const startsMs = Date.parse(record.startsAt);
  const reviewMs = Date.parse(record.reviewHistory.at(-1).nextReviewDueAt);
  const expiresMs = Date.parse(record.expiresAt);
  if ([nowMs, startsMs, reviewMs, expiresMs].some(Number.isNaN)) {
    return ['exception date is invalid'];
  }
  if (nowMs < startsMs) return ['exception is not active yet'];
  if (nowMs >= expiresMs) return ['exception has expired'];
  if (nowMs >= reviewMs) return ['weekly review is overdue'];
  return [];
}

function exactAdvisoryMatch(advisory, scope) {
  const paths = advisory.findings.flatMap((finding) => finding.paths);
  const versions = advisory.findings.map((finding) => finding.version);
  return (
    advisory.github_advisory_id === scope.ghsa &&
    advisory.module_name === scope.package &&
    advisory.severity === scope.severity &&
    isDeepStrictEqual(sorted(advisory.cves ?? []), [scope.cve]) &&
    isDeepStrictEqual(sorted([...new Set(versions)]), [scope.version]) &&
    isDeepStrictEqual(sorted(paths), sorted(scope.auditPaths))
  );
}

function policyResult(policy, reasons, report, exceptionApplied = false) {
  return {
    policy,
    reasons,
    exceptionApplied,
    exceptionId: exceptionApplied ? EXPECTED_CONTRACT.id : null,
    counts: report ? auditCounts(report) : null,
  };
}

export function evaluateSecurityPolicy({ fullAudit, rawAuditStatus, record, evidence, now }) {
  const parsed = parseFullAuditExecution(fullAudit);
  if (!parsed.ok) return policyResult('FAIL', [parsed.error], null);
  const { report } = parsed;
  if (!['PASS', 'FAIL'].includes(rawAuditStatus)) {
    return policyResult('FAIL', ['raw audit did not complete safely'], report);
  }

  const advisories = Object.values(report.advisories);
  const highOrCritical = advisories.filter((advisory) =>
    ['high', 'critical'].includes(advisory.severity),
  );
  const expectedRaw = highOrCritical.length > 0 ? 'FAIL' : 'PASS';
  if (rawAuditStatus !== expectedRaw) {
    return policyResult('FAIL', ['raw audit result contradicts the full report'], report);
  }

  if (highOrCritical.length === 0) {
    return policyResult(
      'PASS',
      ['no High/Critical finding remains; close the exception instead of renewing it'],
      report,
    );
  }

  const reasons = [
    ...validateExceptionRecord(record, now),
    ...(record ? validateTime(record, now) : []),
  ];
  if (!isDeepStrictEqual(evidence, EXPECTED_REPOSITORY_EVIDENCE)) {
    reasons.push('repository graph, usage, or controls differ from the approved scope');
  }

  const samePackageDifferentAdvisory = advisories.some(
    (advisory) =>
      advisory.module_name === EXPECTED_CONTRACT.scope.package &&
      advisory.github_advisory_id !== EXPECTED_CONTRACT.scope.ghsa,
  );
  if (samePackageDifferentAdvisory) reasons.push('another advisory affects the accepted package');
  if (highOrCritical.length !== 1) reasons.push('an additional High/Critical finding exists');
  if (
    highOrCritical.length !== 1 ||
    !exactAdvisoryMatch(highOrCritical[0], EXPECTED_CONTRACT.scope)
  ) {
    reasons.push('High/Critical finding does not exactly match the approved advisory scope');
  }

  if (reasons.length > 0) return policyResult('FAIL', [...new Set(reasons)], report);
  return policyResult(
    'PASS_WITH_TIME_LIMITED_EXCEPTION',
    ['exact approved tooling finding is present and the fixed exception window is active'],
    report,
    true,
  );
}
