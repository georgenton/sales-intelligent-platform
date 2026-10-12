import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { EXPECTED_REPOSITORY_EVIDENCE, evaluateSecurityPolicy } from './evaluate.mjs';

const directory = dirname(fileURLToPath(import.meta.url));
const approvedRecord = JSON.parse(
  readFileSync(resolve(directory, 'braces-exception.json'), 'utf8'),
);
const approvedPath =
  'packages__eslint-config>eslint-config-next>@next/eslint-plugin-next>fast-glob>micromatch>braces';

function advisory({
  ghsa = 'GHSA-vfj7-8cjw-p6xm',
  cve = 'CVE-2026-93687',
  packageName = 'braces',
  version = '3.0.3',
  severity = 'high',
  paths = [approvedPath],
} = {}) {
  return {
    github_advisory_id: ghsa,
    cves: cve ? [cve] : [],
    module_name: packageName,
    severity,
    findings: [{ version, paths }],
  };
}

function report(advisories) {
  const counts = { info: 0, low: 0, moderate: 0, high: 0, critical: 0 };
  for (const item of advisories) counts[item.severity] += 1;
  return {
    advisories: Object.fromEntries(advisories.map((item, index) => [String(index + 1), item])),
    metadata: { vulnerabilities: counts },
  };
}

function execution(advisories, overrides = {}) {
  return {
    stdout: JSON.stringify(report(advisories)),
    stderr: '',
    exitCode: advisories.length > 0 ? 1 : 0,
    timedOut: false,
    error: null,
    ...overrides,
  };
}

function decide({
  advisories = [advisory(), advisory({ packageName: 'uuid', severity: 'moderate' })],
  record = approvedRecord,
  evidence = EXPECTED_REPOSITORY_EVIDENCE,
  now = '2026-10-13T16:59:59Z',
  rawAuditStatus = advisories.some((item) => ['high', 'critical'].includes(item.severity))
    ? 'FAIL'
    : 'PASS',
  fullAudit = execution(advisories),
} = {}) {
  return evaluateSecurityPolicy({ fullAudit, rawAuditStatus, record, evidence, now });
}

test('exact current finding receives the fixed time-limited exception', () => {
  const result = decide();
  assert.equal(result.policy, 'PASS_WITH_TIME_LIMITED_EXCEPTION');
  assert.equal(result.exceptionApplied, true);
  assert.equal(result.counts.moderate, 1);
});

test('same package with another GHSA, version, chain, or use fails', async (t) => {
  await t.test('GHSA', () => {
    assert.equal(decide({ advisories: [advisory({ ghsa: 'GHSA-other' })] }).policy, 'FAIL');
  });
  await t.test('version', () => {
    assert.equal(decide({ advisories: [advisory({ version: '3.0.4' })] }).policy, 'FAIL');
  });
  await t.test('chain', () => {
    assert.equal(
      decide({ advisories: [advisory({ paths: ['apps__web>braces'] })] }).policy,
      'FAIL',
    );
  });
  await t.test('usage', () => {
    const evidence = structuredClone(EXPECTED_REPOSITORY_EVIDENCE);
    evidence.usage = 'runtime';
    assert.equal(decide({ evidence }).policy, 'FAIL');
  });
});

test('allowed path together with another path fails', () => {
  const result = decide({
    advisories: [advisory({ paths: [approvedPath, 'apps__web>micromatch>braces'] })],
  });
  assert.equal(result.policy, 'FAIL');
});

test('an additional High or Critical finding fails', () => {
  for (const severity of ['high', 'critical']) {
    const result = decide({
      advisories: [
        advisory(),
        advisory({
          ghsa: `GHSA-additional-${severity}`,
          cve: '',
          packageName: `additional-${severity}`,
          version: '1.0.0',
          severity,
          paths: [`apps__api>additional-${severity}`],
        }),
      ],
    });
    assert.equal(result.policy, 'FAIL');
  }
});

test('severity escalation of the accepted advisory fails', () => {
  assert.equal(decide({ advisories: [advisory({ severity: 'critical' })] }).policy, 'FAIL');
});

test('missing, revoked, or invalid exception record fails when needed', async (t) => {
  await t.test('missing', () => assert.equal(decide({ record: null }).policy, 'FAIL'));
  await t.test('revoked', () => {
    const record = structuredClone(approvedRecord);
    record.revoked = true;
    assert.equal(decide({ record }).policy, 'FAIL');
  });
  await t.test('invalid date', () => {
    const record = structuredClone(approvedRecord);
    record.expiresAt = 'not-a-date';
    assert.equal(decide({ record }).policy, 'FAIL');
  });
});

test('one instant before expiry can pass and exact expiry fails', () => {
  const record = structuredClone(approvedRecord);
  record.reviewHistory.push({
    reviewedAt: '2026-10-19T16:59:59Z',
    reviewer: 'Jorge Quizamanchuro',
    nextReviewDueAt: '2026-10-26T16:59:59Z',
    evidence: 'https://app.notion.com/p/3f7cbb1031a081e8a00ac1030c70a12f',
  });
  assert.equal(
    decide({ now: '2026-10-26T16:59:58.999Z', record }).policy,
    'PASS_WITH_TIME_LIMITED_EXCEPTION',
  );
  assert.equal(decide({ now: '2026-10-26T16:59:59Z', record }).policy, 'FAIL');
});

test('the exception cannot apply before its fixed start', () => {
  assert.equal(decide({ now: '2026-10-12T16:59:58.999Z' }).policy, 'FAIL');
});

test('the expiry boundary is enforced independently of review in a contract fixture', () => {
  const beforeExpiry = decide({ now: '2026-10-19T16:59:58.999Z' });
  assert.equal(beforeExpiry.policy, 'PASS_WITH_TIME_LIMITED_EXCEPTION');
  const atReviewDeadline = decide({ now: '2026-10-19T16:59:59Z' });
  assert.equal(atReviewDeadline.policy, 'FAIL');
});

test('network errors, timeouts, empty reports, and malformed reports fail closed', async (t) => {
  const filteredReport = report([advisory()]);
  filteredReport.metadata.vulnerabilities.moderate = 1;
  const cases = [
    ['network', { stdout: '', stderr: 'registry unavailable', exitCode: 1, error: 'network' }],
    ['timeout', { stdout: '', stderr: '', exitCode: null, timedOut: true }],
    ['empty', { stdout: '', stderr: '', exitCode: 1 }],
    ['malformed', { stdout: '{', stderr: '', exitCode: 1 }],
    ['incomplete', { stdout: '{}', stderr: '', exitCode: 1 }],
    ['filtered', { stdout: JSON.stringify(filteredReport), stderr: '', exitCode: 1 }],
  ];
  for (const [name, overrides] of cases) {
    await t.test(name, () => {
      assert.equal(decide({ fullAudit: execution([], overrides) }).policy, 'FAIL');
    });
  }
});

test('raw audit and complete report contradictions fail', () => {
  assert.equal(decide({ rawAuditStatus: 'PASS' }).policy, 'FAIL');
});

test('removed High with only Moderate and Low passes without exception', () => {
  const advisories = [
    advisory({ packageName: 'uuid', severity: 'moderate', ghsa: 'GHSA-moderate' }),
    advisory({ packageName: 'esbuild', severity: 'low', ghsa: 'GHSA-low' }),
  ];
  const result = decide({ advisories, record: null });
  assert.equal(result.policy, 'PASS');
  assert.equal(result.exceptionApplied, false);
  assert.deepEqual(result.counts, { info: 0, low: 1, moderate: 1, high: 0, critical: 0 });
});

test('copying or retrying on either branch does not change the fixed expiry', () => {
  const expiry = approvedRecord.expiresAt;
  for (const branch of approvedRecord.branches) {
    const record = structuredClone(approvedRecord);
    assert.equal(decide({ record }).policy, 'PASS_WITH_TIME_LIMITED_EXCEPTION', branch);
    assert.equal(record.expiresAt, expiry);
  }
  assert.equal(approvedRecord.expiresAt, expiry);
});

test('loss of an applicable control fails', () => {
  const evidence = structuredClone(EXPECTED_REPOSITORY_EVIDENCE);
  evidence.controls = evidence.controls.filter((control) => control !== 'gitleaks');
  assert.equal(decide({ evidence }).policy, 'FAIL');
});
