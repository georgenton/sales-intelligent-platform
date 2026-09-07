import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module';
import { ApiExceptionFilter } from '../src/common/http/api-exception.filter';

const ownerDatabaseUrl = process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL;
if (!ownerDatabaseUrl) throw new Error('An owner database URL is required for integration setup');
const prisma = new PrismaClient({ datasources: { db: { url: ownerDatabaseUrl } } });

describe('Phase 1 commercial operating flows', () => {
  let app: Awaited<ReturnType<typeof createTestApp>>;
  let admin: ReturnType<typeof request.agent>;
  let seller: ReturnType<typeof request.agent>;
  let managerA: ReturnType<typeof request.agent>;
  let adminCsrf = '';
  let sellerCsrf = '';
  let managerACsrf = '';
  let tenantId = '';
  let opportunityId = '';
  let rbacOpportunityId = '';
  const rbacUserIds: string[] = [];
  const snapshotIds: string[] = [];

  beforeAll(async () => {
    app = await createTestApp();
    admin = request.agent(app.getHttpServer());
    seller = request.agent(app.getHttpServer());
    managerA = request.agent(app.getHttpServer());
    const password = process.env.DEMO_ADMIN_PASSWORD;
    if (!password) throw new Error('DEMO_ADMIN_PASSWORD is required for integration tests');
    const adminLogin = await admin
      .post('/auth/login')
      .send({ email: 'admin@techdistribution.demo', password })
      .expect(200);
    adminCsrf = csrfFrom(adminLogin);
    const sellerLogin = await seller
      .post('/auth/login')
      .send({ email: 'sofia@techdistribution.demo', password })
      .expect(200);
    sellerCsrf = csrfFrom(sellerLogin);
    const managerLogin = await managerA
      .post('/auth/login')
      .send({ email: 'manager@techdistribution.demo', password })
      .expect(200);
    managerACsrf = csrfFrom(managerLogin);
    tenantId = (
      await prisma.tenant.findUniqueOrThrow({ where: { slug: 'tech-distribution-demo' } })
    ).id;
  });

  afterAll(async () => {
    if (snapshotIds.length) {
      await prisma.forecastSnapshot.deleteMany({ where: { id: { in: snapshotIds } } });
    }
    if (opportunityId) {
      await prisma.opportunity.deleteMany({ where: { id: opportunityId } });
    }
    if (rbacOpportunityId) {
      await prisma.opportunity.deleteMany({ where: { id: rbacOpportunityId } });
    }
    if (tenantId) {
      await prisma.billingRecord.deleteMany({
        where: {
          tenantId,
          externalReference: { in: ['BILLING-INV-PHASE1', 'BILLING-INV-BRAND-PHASE1'] },
        },
      });
      await prisma.opportunity.deleteMany({
        where: { tenantId, externalReference: 'OPPTY-XLSX-PHASE1' },
      });
      await prisma.tenantFeatureEntitlement.updateMany({
        where: { tenantId, featureKey: 'AI_CONTEXTUAL_REAL' },
        data: { enabled: false },
      });
    }
    if (rbacUserIds.length) {
      await prisma.tenantMembership.deleteMany({ where: { userId: { in: rbacUserIds } } });
      await prisma.authIdentity.deleteMany({ where: { userId: { in: rbacUserIds } } });
      await prisma.localCredential.deleteMany({ where: { userId: { in: rbacUserIds } } });
      await prisma.user.deleteMany({ where: { id: { in: rbacUserIds } } });
    }
    if (app) await app.close();
    await prisma.$disconnect();
  });

  it('exposes only the canonical active funnel and terminal billed stage', async () => {
    const reference = await admin.get('/opportunities/reference-data').expect(200);
    expect(reference.body.stages.map((stage: { code: string }) => stage.code)).toEqual([
      '20',
      '40',
      '60',
      '80',
      '90',
      '100',
    ]);
  });

  it('blocks stage 60 until evidence is complete, then enforces stage 80 with both gates', async () => {
    const reference = (await admin.get('/opportunities/reference-data').expect(200)).body;
    const stage20 = reference.stages.find((stage: { code: string }) => stage.code === '20');
    const stage60 = reference.stages.find((stage: { code: string }) => stage.code === '60');
    const stage80 = reference.stages.find((stage: { code: string }) => stage.code === '80');
    const stage100 = reference.stages.find((stage: { code: string }) => stage.code === '100');
    const sofia = reference.users.find((user: { name: string }) => user.name === 'Sofía Torres');
    const manager = reference.users.find((user: { name: string }) => user.name === 'Morgan Silva');
    const created = await admin
      .post('/opportunities')
      .set('x-csrf-token', adminCsrf)
      .send({
        title: 'Phase 1 qualification flow',
        customerId: reference.customers[0].id,
        sellerId: sofia.id,
        managerId: manager.id,
        stageId: stage20.id,
        currency: 'USD',
        estimatedAmount: '50000',
        grossMarginPercent: '15',
        expectedCloseDate: '2026-10-15',
        lineItems: [
          {
            brandId: reference.brands[0].id,
            description: 'Phase 1 commercial line',
            amount: '50000',
          },
        ],
      })
      .expect(201);
    opportunityId = created.body.id;
    expect(created.body.grossProfit).toBe(7500);
    expect(created.body.grossMarginPercent).toBe(15);

    await admin
      .patch(`/opportunities/${opportunityId}`)
      .set('x-csrf-token', adminCsrf)
      .send({ stageId: stage60.id, forecastCategory: 'BEST_CASE' })
      .expect(400);

    await admin
      .patch(`/opportunities/${opportunityId}`)
      .set('x-csrf-token', adminCsrf)
      .send({
        stageId: stage60.id,
        forecastCategory: 'BEST_CASE',
        qualificationOverrideReason:
          'Manager-controlled integration override with explicit commercial rationale.',
      })
      .expect(200);
    const overrideEvents = await admin.get(`/reviews?opportunityId=${opportunityId}`).expect(200);
    expect(
      overrideEvents.body.some(
        (event: { type: string; body: string }) =>
          event.type === 'OVERRIDE_QUALIFICATION' && event.body.includes('explicit commercial'),
      ),
    ).toBe(true);
    await admin
      .patch(`/opportunities/${opportunityId}`)
      .set('x-csrf-token', adminCsrf)
      .send({ stageId: stage20.id })
      .expect(200);

    const qualification = (await admin.get(`/qualification/opportunities/${opportunityId}`)).body;
    for (const criterion of qualification.gates.find(
      (gate: { gateCode: string }) => gate.gateCode === '60',
    ).criteria) {
      await admin
        .put(`/qualification/opportunities/${opportunityId}/responses`)
        .set('x-csrf-token', adminCsrf)
        .send({
          criterionId: criterion.id,
          answer: 'YES',
          evidence: `Evidence for ${criterion.code}`,
        })
        .expect(200);
    }
    await admin
      .patch(`/opportunities/${opportunityId}`)
      .set('x-csrf-token', adminCsrf)
      .send({ stageId: stage60.id, forecastCategory: 'BEST_CASE' })
      .expect(200);
    await admin
      .patch(`/opportunities/${opportunityId}`)
      .set('x-csrf-token', adminCsrf)
      .send({ stageId: stage80.id, forecastCategory: 'COMMIT' })
      .expect(400);

    const refreshed = (await admin.get(`/qualification/opportunities/${opportunityId}`)).body;
    for (const criterion of refreshed.gates.find(
      (gate: { gateCode: string }) => gate.gateCode === '80',
    ).criteria) {
      await admin
        .put(`/qualification/opportunities/${opportunityId}/responses`)
        .set('x-csrf-token', adminCsrf)
        .send({
          criterionId: criterion.id,
          answer: 'YES',
          evidence: `Commit evidence for ${criterion.code}`,
        })
        .expect(200);
    }
    const committed = await admin
      .patch(`/opportunities/${opportunityId}`)
      .set('x-csrf-token', adminCsrf)
      .send({ stageId: stage80.id, forecastCategory: 'COMMIT' })
      .expect(200);
    expect(committed.body.stage.code).toBe('80');
    expect(committed.body.forecastCategory).toBe('COMMIT');
    await admin
      .patch(`/opportunities/${opportunityId}`)
      .set('x-csrf-token', adminCsrf)
      .send({
        stageId: stage100.id,
        qualificationOverrideReason: 'Billing must remain the source of truth.',
      })
      .expect(400)
      .expect(({ body }) => expect(body.error.code).toBe('BILLING_FACT_REQUIRED'));
  });

  it('persists manager questions, seller responses, and review decisions', async () => {
    const question = await admin
      .post('/reviews')
      .set('x-csrf-token', adminCsrf)
      .send({
        opportunityId,
        type: 'ASK_SELLER',
        body: 'Confirm the procurement date and attach evidence.',
      })
      .expect(201);
    const pending = await seller.get('/reviews?pendingOnly=true').expect(200);
    expect(pending.body.some((event: { id: string }) => event.id === question.body.id)).toBe(true);
    await seller
      .post('/reviews')
      .set('x-csrf-token', sellerCsrf)
      .send({
        opportunityId,
        type: 'SELLER_RESPONSE',
        parentEventId: question.body.id,
        body: 'Procurement confirmed for October 20; evidence recorded.',
      })
      .expect(201);
    const events = await admin.get(`/reviews?opportunityId=${opportunityId}`).expect(200);
    const persistedQuestion = events.body.find(
      (event: { id: string }) => event.id === question.body.id,
    );
    expect(persistedQuestion.resolvedAt).toBeTruthy();
    expect(persistedQuestion.replies).toHaveLength(1);
    await admin
      .post('/reviews')
      .set('x-csrf-token', adminCsrf)
      .send({ opportunityId, type: 'KEEP_COMMIT' })
      .expect(201);
  });

  it('scopes commercial mutation by admin, manager team, seller owner, and read-only roles', async () => {
    await managerA
      .patch(`/opportunities/${opportunityId}`)
      .set('x-csrf-token', managerACsrf)
      .send({ notes: 'Manager A team-scoped update' })
      .expect(200);

    const adminUser = await prisma.user.findUniqueOrThrow({
      where: { email: 'admin@techdistribution.demo' },
      include: { localCredential: true },
    });
    const testPassword = process.env.DEMO_ADMIN_PASSWORD!;
    const suffix = Date.now();
    const managerBEmail = `manager-b-${suffix}@example.test`;
    const sellerBEmail = `seller-b-${suffix}@example.test`;
    const executiveEmail = `executive-${suffix}@example.test`;
    const viewerEmail = `viewer-${suffix}@example.test`;
    const managerB = await prisma.user.create({
      data: {
        name: 'Manager B',
        email: managerBEmail,
        identities: { create: { provider: 'LOCAL', providerSubject: managerBEmail } },
        localCredential: { create: { passwordHash: adminUser.localCredential!.passwordHash } },
        memberships: { create: { tenantId, role: 'MANAGER', status: 'ACTIVE' } },
      },
    });
    const sellerB = await prisma.user.create({
      data: {
        name: 'Seller B',
        email: sellerBEmail,
        identities: { create: { provider: 'LOCAL', providerSubject: sellerBEmail } },
        localCredential: { create: { passwordHash: adminUser.localCredential!.passwordHash } },
        memberships: { create: { tenantId, role: 'SELLER', status: 'ACTIVE' } },
      },
    });
    const executive = await prisma.user.create({
      data: {
        name: 'Executive read only',
        email: executiveEmail,
        identities: { create: { provider: 'LOCAL', providerSubject: executiveEmail } },
        localCredential: { create: { passwordHash: adminUser.localCredential!.passwordHash } },
        memberships: { create: { tenantId, role: 'EXECUTIVE', status: 'ACTIVE' } },
      },
    });
    const viewer = await prisma.user.create({
      data: {
        name: 'Viewer read only',
        email: viewerEmail,
        identities: { create: { provider: 'LOCAL', providerSubject: viewerEmail } },
        localCredential: { create: { passwordHash: adminUser.localCredential!.passwordHash } },
        memberships: { create: { tenantId, role: 'VIEWER', status: 'ACTIVE' } },
      },
    });
    rbacUserIds.push(managerB.id, sellerB.id, executive.id, viewer.id);

    const reference = (await admin.get('/opportunities/reference-data').expect(200)).body;
    const stage20 = reference.stages.find((stage: { code: string }) => stage.code === '20');
    const created = await admin
      .post('/opportunities')
      .set('x-csrf-token', adminCsrf)
      .send({
        title: 'Manager B isolated opportunity',
        customerId: reference.customers[0].id,
        sellerId: sellerB.id,
        managerId: managerB.id,
        stageId: stage20.id,
        currency: 'USD',
        estimatedAmount: '25000',
        grossMarginPercent: '12',
        expectedCloseDate: '2026-10-25',
        lineItems: [
          {
            brandId: reference.brands[0].id,
            description: 'Manager B team line',
            amount: '25000',
          },
        ],
      })
      .expect(201);
    rbacOpportunityId = created.body.id;

    await managerA
      .patch(`/opportunities/${rbacOpportunityId}`)
      .set('x-csrf-token', managerACsrf)
      .send({ notes: 'Cross-team update must fail' })
      .expect(404);
    await managerA
      .post('/reviews')
      .set('x-csrf-token', managerACsrf)
      .send({ opportunityId, type: 'MANAGER_NOTE', body: 'Manager A scoped review' })
      .expect(201);
    await managerA
      .post('/reviews')
      .set('x-csrf-token', managerACsrf)
      .send({
        opportunityId: rbacOpportunityId,
        type: 'MANAGER_NOTE',
        body: 'Cross-team review must fail',
      })
      .expect(404);
    await seller
      .patch(`/opportunities/${rbacOpportunityId}`)
      .set('x-csrf-token', sellerCsrf)
      .send({ notes: 'Cross-owner update must fail' })
      .expect(404);

    for (const principal of [
      { email: executiveEmail, label: 'Executive' },
      { email: viewerEmail, label: 'Viewer' },
    ]) {
      const readOnly = request.agent(app.getHttpServer());
      const login = await readOnly
        .post('/auth/login')
        .send({ email: principal.email, password: testPassword })
        .expect(200);
      const readOnlyCsrf = csrfFrom(login);
      await readOnly.get(`/opportunities/${rbacOpportunityId}`).expect(200);
      await readOnly
        .patch(`/opportunities/${rbacOpportunityId}`)
        .set('x-csrf-token', readOnlyCsrf)
        .send({ notes: `${principal.label} mutation must fail` })
        .expect(403);
      await readOnly.post('/auth/logout').set('x-csrf-token', readOnlyCsrf).expect(204);
    }
    await admin
      .patch(`/opportunities/${opportunityId}`)
      .set('x-csrf-token', adminCsrf)
      .send({ notes: 'Tenant admin update for team A' })
      .expect(200);
    await admin
      .patch(`/opportunities/${rbacOpportunityId}`)
      .set('x-csrf-token', adminCsrf)
      .send({ notes: 'Tenant admin update for team B' })
      .expect(200);
  });

  it('calculates quota, billed, brand performance, GM, gap, and quarter coverage on the server', async () => {
    const dashboard = await admin.get('/analytics/dashboard').expect(200);
    expect(dashboard.body.kpis.quotaConfigured).toBe(true);
    expect(dashboard.body.kpis.pipelineCoverage).not.toBeNull();
    expect(dashboard.body.kpis.weightedCoverage).not.toBeNull();
    expect(dashboard.body.kpis.averageMargin).not.toBeNull();
    expect(dashboard.body.brandPerformance.length).toBeGreaterThan(0);
    expect(dashboard.body.brandPerformance[0]).toEqual(
      expect.objectContaining({
        brandId: expect.any(String),
        quota: expect.any(Number),
        billed: expect.any(Number),
        pipeline: expect.any(Number),
        forecast: expect.any(Number),
        commit: expect.any(Number),
        remainingQuota: expect.any(Number),
        projectedRevenue: expect.any(Number),
        projectedGap: expect.any(Number),
        projectedAttainment: expect.any(Number),
      }),
    );
    const config = await admin.get('/commercial/config').expect(200);
    expect(config.body.quotas.some((quota: { brandId: string | null }) => quota.brandId)).toBe(
      true,
    );
    const totalQuota = String(
      config.body.quotas.find(
        (quota: { assigneeId: string | null; brandId: string | null }) =>
          !quota.assigneeId && !quota.brandId,
      ).amount,
    );
    await admin
      .put('/commercial/config/settings')
      .set('x-csrf-token', adminCsrf)
      .send({
        fiscalYearStartMonth: config.body.settings.fiscalYearStartMonth,
        currency: config.body.settings.currency,
        defaultMarginThreshold: String(config.body.settings.defaultMarginThreshold),
      })
      .expect(200);
    await admin
      .put('/commercial/config/quotas')
      .set('x-csrf-token', adminCsrf)
      .send({
        totalQuota,
        brandQuotas: config.body.quotas
          .filter(
            (quota: { assigneeId: string | null; brandId: string | null }) =>
              !quota.assigneeId && quota.brandId,
          )
          .map((quota: { brandId: string; amount: number }) => ({
            brandId: quota.brandId,
            amount: String(quota.amount),
          })),
      })
      .expect(200);
    const sellerDashboard = await seller.get('/analytics/dashboard').expect(200);
    expect(sellerDashboard.body.kpis.quotaConfigured).toBe(false);
    expect(sellerDashboard.body.kpis.quota).toBeNull();
    expect(sellerDashboard.body.kpis.remainingQuota).toBeNull();
    expect(sellerDashboard.body.kpis.projectedGap).toBeNull();
    expect(sellerDashboard.body.kpis.projectedAttainment).toBeNull();
    await admin
      .put('/commercial/config/quotas')
      .set('x-csrf-token', adminCsrf)
      .send({ totalQuota: null })
      .expect(200);
    const dashboardWithoutQuota = await admin.get('/analytics/dashboard').expect(200);
    expect(dashboardWithoutQuota.body.kpis.quotaConfigured).toBe(false);
    expect(dashboardWithoutQuota.body.kpis.quota).toBeNull();
    await admin
      .put('/commercial/config/quotas')
      .set('x-csrf-token', adminCsrf)
      .send({ totalQuota })
      .expect(200);
  });

  it('keeps snapshots inside the fiscal quarter and exposes deterministic movement', async () => {
    const first = await admin
      .post('/forecast/snapshots')
      .set('x-csrf-token', adminCsrf)
      .expect(201);
    snapshotIds.push(first.body.id);
    const stored = await prisma.forecastSnapshotItem.findMany({
      where: { snapshotId: first.body.id },
    });
    expect(
      stored.every(
        (item) =>
          item.expectedCloseDate >= new Date('2026-09-01') &&
          item.expectedCloseDate <= new Date('2026-11-30'),
      ),
    ).toBe(true);
    await admin
      .patch(`/opportunities/${opportunityId}`)
      .set('x-csrf-token', adminCsrf)
      .send({ estimatedAmount: '55000', grossMarginPercent: '15' })
      .expect(200);
    const second = await admin
      .post('/forecast/snapshots')
      .set('x-csrf-token', adminCsrf)
      .expect(201);
    snapshotIds.push(second.body.id);
    const movement = await admin.get('/forecast/snapshots/latest-diff').expect(200);
    expect(
      movement.body.diff.amountChanges.some(
        (change: { opportunityId: string; delta: number }) =>
          change.opportunityId === opportunityId && change.delta === 5000,
      ),
    ).toBe(true);
  });

  it('validates CSV and imports Facturado Daily idempotently from XLSX', async () => {
    const beforeDryRun = await prisma.opportunity.count({ where: { tenantId } });
    const csv = Buffer.from(
      'Opportunity,Seller Email,Brand,Customer,Amount,Stage,Expected Close\n' +
        'CSV Phase 1,sofia@techdistribution.demo,Nutanix,Synthetic Customer 01,1000,20%,2026-10-15\n',
    );
    const csvAnalysis = await admin
      .post('/imports/analyze')
      .set('x-csrf-token', adminCsrf)
      .attach('file', csv, { filename: 'phase1.csv', contentType: 'text/csv' })
      .expect(201);
    const csvMapping = confirmedMappings(csvAnalysis.body);
    const csvValidation = await admin
      .post('/imports/validate')
      .set('x-csrf-token', adminCsrf)
      .field('mapping', JSON.stringify(csvMapping))
      .attach('file', csv, { filename: 'phase1.csv', contentType: 'text/csv' })
      .expect(201);
    expect(csvValidation.body.summary.status).toBe('READY');
    expect(await prisma.opportunity.count({ where: { tenantId } })).toBe(beforeDryRun);

    const workbook = new ExcelJS.Workbook();
    const opportunities = workbook.addWorksheet('Oppty');
    opportunities.addRow([
      'Opportunity',
      'Seller Email',
      'Brand',
      'Customer',
      'Amount',
      'GM %',
      'Stage',
      'Expected Close',
      'External ID',
    ]);
    opportunities.addRow([
      'XLSX Phase 1 opportunity',
      'sofia@techdistribution.demo',
      'Nutanix',
      'Synthetic Customer 01',
      2000,
      12,
      '90%',
      new Date('2026-10-20'),
      'XLSX-PHASE1',
    ]);
    const billing = workbook.addWorksheet('Facturado Daily');
    billing.addRow(['Vendor', 'Revenue USD', 'GP USD', 'Invoice', 'Opportunity External ID']);
    billing.addRow(['Nutanix', 1234, 123.4, 'INV-PHASE1', 'XLSX-PHASE1']);
    billing.addRow(['Nutanix', 500, 50, 'INV-BRAND-PHASE1', '']);
    workbook.addWorksheet('Resumen');
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    const xlsxAnalysis = await admin
      .post('/imports/analyze')
      .set('x-csrf-token', adminCsrf)
      .attach('file', buffer, {
        filename: 'facturado.xlsx',
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      .expect(201);
    const xlsxMapping = confirmedMappings(xlsxAnalysis.body);
    await admin
      .post('/imports/validate')
      .set('x-csrf-token', adminCsrf)
      .field('mapping', JSON.stringify(xlsxMapping))
      .field('asOfDate', '2026-02-31')
      .attach('file', buffer, {
        filename: 'facturado.xlsx',
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      .expect(400)
      .expect(({ body }) => expect(body.error.code).toBe('IMPORT_AS_OF_DATE_INVALID'));
    const unconfirmed = xlsxMapping.map((mapping) => ({ ...mapping, confirmed: false }));
    const blocked = await admin
      .post('/imports/validate')
      .set('x-csrf-token', adminCsrf)
      .field('mapping', JSON.stringify(unconfirmed))
      .field('asOfDate', '2026-10-15')
      .attach('file', buffer, {
        filename: 'facturado.xlsx',
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      .expect(201);
    expect(blocked.body.summary.status).toBe('BLOCKED');
    const beforeBilled = (await admin.get('/analytics/dashboard').expect(200)).body.kpis.billed;
    const first = await admin
      .post('/imports/execute')
      .set('x-csrf-token', adminCsrf)
      .field('mapping', JSON.stringify(xlsxMapping))
      .field('asOfDate', '2026-10-15')
      .attach('file', buffer, {
        filename: 'facturado.xlsx',
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      .expect(201);
    expect(first.body.summary.billingImported).toBe(2);
    expect(first.body.summary.opportunityImported).toBe(1);
    const importedOpportunity = await prisma.opportunity.findFirstOrThrow({
      where: { tenantId, externalReference: 'OPPTY-XLSX-PHASE1' },
      include: { stage: true },
    });
    expect(importedOpportunity.stage.code).toBe('100');
    expect(
      await prisma.billingRecord.findFirstOrThrow({
        where: { tenantId, externalReference: 'BILLING-INV-BRAND-PHASE1' },
      }),
    ).toMatchObject({ opportunityId: null });
    const afterBilled = (await admin.get('/analytics/dashboard').expect(200)).body.kpis.billed;
    expect(afterBilled - beforeBilled).toBe(1734);
    const second = await admin
      .post('/imports/execute')
      .set('x-csrf-token', adminCsrf)
      .field('mapping', JSON.stringify(xlsxMapping))
      .field('asOfDate', '2026-10-15')
      .attach('file', buffer, {
        filename: 'facturado.xlsx',
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      .expect(201);
    expect(second.body.summary.billingImported).toBe(0);
    expect(second.body.summary.opportunityImported).toBe(0);
    expect(second.body.summary.duplicates).toBeGreaterThan(0);
  });

  it('exposes only enabled future capabilities to authenticated clients', async () => {
    await prisma.tenantFeatureEntitlement.update({
      where: { tenantId_featureKey: { tenantId, featureKey: 'AI_CONTEXTUAL_REAL' } },
      data: { enabled: true },
    });
    const profile = await admin.get('/auth/me').expect(200);
    expect(profile.body.capabilities).toContain('AI_CONTEXTUAL_REAL');
    expect(profile.body.capabilities).not.toContain('AI_PREDICTIVE');
  });
});

function csrfFrom(response: request.Response): string {
  const cookies = response.headers['set-cookie'] as unknown as string[];
  const cookie = cookies.find((value) => value.startsWith('sip_csrf='));
  return cookie?.split(';')[0]?.split('=')[1] ?? '';
}

function confirmedMappings(analysis: {
  sheets: Array<{
    name: string;
    suggestedMappings: Array<{ sourceColumn: string; destinationField: string | null }>;
  }>;
}) {
  return analysis.sheets.flatMap((sheet) =>
    sheet.suggestedMappings
      .filter((mapping) => mapping.destinationField)
      .map((mapping) => ({
        sheet: sheet.name,
        sourceColumn: mapping.sourceColumn,
        destinationField: mapping.destinationField,
        confirmed: true,
      })),
  );
}

async function createTestApp() {
  const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = module.createNestApplication();
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());
  await app.init();
  return app;
}
