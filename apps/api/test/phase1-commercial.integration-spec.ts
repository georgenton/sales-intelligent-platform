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
  let managerB: ReturnType<typeof request.agent>;
  let executive: ReturnType<typeof request.agent>;
  let viewer: ReturnType<typeof request.agent>;
  let adminCsrf = '';
  let sellerCsrf = '';
  let managerACsrf = '';
  let managerBCsrf = '';
  let executiveCsrf = '';
  let viewerCsrf = '';
  let tenantId = '';
  let opportunityId = '';
  let rbacOpportunityId = '';
  let managerAUserId = '';
  let managerBUserId = '';
  let sellerBUserId = '';
  let managerBEmail = '';
  let sellerBEmail = '';
  let executiveEmail = '';
  let viewerEmail = '';
  let roleScopeBrandAId = '';
  let roleScopeBrandBId = '';
  const rbacUserIds: string[] = [];
  const snapshotIds: string[] = [];
  const quotaIds: string[] = [];
  const importBatchIds: string[] = [];
  const managerImportOpportunityReferences: string[] = [];
  const managerImportBillingReferences: string[] = [];
  const managerVisitIds: string[] = [];
  const managerPeriodOpportunityIds: string[] = [];
  const roleScopeBillingReferences = [
    'ROLE-SCOPE-BILLING-A',
    'ROLE-SCOPE-BILLING-B',
    'ROLE-SCOPE-BILLING-UNATTRIBUTED',
  ];

  beforeAll(async () => {
    app = await createTestApp();
    admin = request.agent(app.getHttpServer());
    seller = request.agent(app.getHttpServer());
    managerA = request.agent(app.getHttpServer());
    managerB = request.agent(app.getHttpServer());
    executive = request.agent(app.getHttpServer());
    viewer = request.agent(app.getHttpServer());
    const password = process.env.DEMO_ADMIN_PASSWORD;
    if (!password) throw new Error('DEMO_ADMIN_PASSWORD is required for integration tests');
    const adminLogin = await admin
      .post('/auth/login')
      .set('x-railway-request-id', 'phase1-admin-login')
      .set('x-railway-edge', 'integration-test')
      .set('x-real-ip', '192.0.2.10')
      .send({ email: 'admin@techdistribution.demo', password })
      .expect(200);
    adminCsrf = csrfFrom(adminLogin);
    const sellerLogin = await seller
      .post('/auth/login')
      .set('x-railway-request-id', 'phase1-seller-login')
      .set('x-railway-edge', 'integration-test')
      .set('x-real-ip', '192.0.2.11')
      .send({ email: 'sofia@techdistribution.demo', password })
      .expect(200);
    sellerCsrf = csrfFrom(sellerLogin);
    const managerLogin = await managerA
      .post('/auth/login')
      .set('x-railway-request-id', 'phase1-manager-a-login')
      .set('x-railway-edge', 'integration-test')
      .set('x-real-ip', '192.0.2.12')
      .send({ email: 'manager@techdistribution.demo', password })
      .expect(200);
    managerACsrf = csrfFrom(managerLogin);
    tenantId = (
      await prisma.tenant.findUniqueOrThrow({ where: { slug: 'tech-distribution-demo' } })
    ).id;
    managerAUserId = (
      await prisma.user.findUniqueOrThrow({ where: { email: 'manager@techdistribution.demo' } })
    ).id;

    const adminUser = await prisma.user.findUniqueOrThrow({
      where: { email: 'admin@techdistribution.demo' },
      include: { localCredential: true },
    });
    const suffix = Date.now();
    managerBEmail = `manager-b-${suffix}@example.test`;
    sellerBEmail = `seller-b-${suffix}@example.test`;
    executiveEmail = `executive-${suffix}@example.test`;
    viewerEmail = `viewer-${suffix}@example.test`;
    const users = await Promise.all(
      [
        { name: 'Manager B', email: managerBEmail, role: 'MANAGER' as const },
        { name: 'Seller B', email: sellerBEmail, role: 'SELLER' as const },
        { name: 'Executive read only', email: executiveEmail, role: 'EXECUTIVE' as const },
        { name: 'Viewer read only', email: viewerEmail, role: 'VIEWER' as const },
      ].map((principal) =>
        prisma.user.create({
          data: {
            name: principal.name,
            email: principal.email,
            identities: { create: { provider: 'LOCAL', providerSubject: principal.email } },
            localCredential: {
              create: { passwordHash: adminUser.localCredential!.passwordHash },
            },
            memberships: { create: { tenantId, role: principal.role, status: 'ACTIVE' } },
          },
        }),
      ),
    );
    rbacUserIds.push(...users.map((user) => user.id));
    managerBUserId = users[0]!.id;
    sellerBUserId = users[1]!.id;

    const [brandA, brandB] = await Promise.all([
      prisma.brand.create({ data: { tenantId, name: `Role Scope Brand A ${suffix}` } }),
      prisma.brand.create({ data: { tenantId, name: `Role Scope Brand B ${suffix}` } }),
    ]);
    roleScopeBrandAId = brandA.id;
    roleScopeBrandBId = brandB.id;

    const managerBLogin = await managerB
      .post('/auth/login')
      .set('x-railway-request-id', 'phase1-manager-b-login')
      .set('x-railway-edge', 'integration-test')
      .set('x-real-ip', '192.0.2.13')
      .send({ email: managerBEmail, password })
      .expect(200);
    managerBCsrf = csrfFrom(managerBLogin);
    const executiveLogin = await executive
      .post('/auth/login')
      .set('x-railway-request-id', 'phase1-executive-login')
      .set('x-railway-edge', 'integration-test')
      .set('x-real-ip', '192.0.2.14')
      .send({ email: executiveEmail, password })
      .expect(200);
    executiveCsrf = csrfFrom(executiveLogin);
    const viewerLogin = await viewer
      .post('/auth/login')
      .set('x-railway-request-id', 'phase1-viewer-login')
      .set('x-railway-edge', 'integration-test')
      .set('x-real-ip', '192.0.2.15')
      .send({ email: viewerEmail, password })
      .expect(200);
    viewerCsrf = csrfFrom(viewerLogin);
  });

  afterAll(async () => {
    if (snapshotIds.length) {
      await prisma.forecastSnapshot.deleteMany({ where: { id: { in: snapshotIds } } });
    }
    if (tenantId) {
      await prisma.billingRecord.deleteMany({
        where: {
          tenantId,
          externalReference: {
            in: [
              'BILLING-INV-PHASE1',
              'BILLING-INV-BRAND-PHASE1',
              ...roleScopeBillingReferences,
              ...managerImportBillingReferences,
            ],
          },
        },
      });
      if (managerVisitIds.length) {
        await prisma.customerVisit.deleteMany({ where: { id: { in: managerVisitIds } } });
      }
      if (quotaIds.length) await prisma.quota.deleteMany({ where: { id: { in: quotaIds } } });
      await prisma.opportunity.deleteMany({
        where: {
          id: {
            in: [opportunityId, rbacOpportunityId, ...managerPeriodOpportunityIds].filter(Boolean),
          },
        },
      });
      await prisma.opportunity.deleteMany({
        where: {
          tenantId,
          externalReference: {
            in: ['OPPTY-XLSX-PHASE1', ...managerImportOpportunityReferences],
          },
        },
      });
      if (importBatchIds.length) {
        await prisma.commercialImportBatch.deleteMany({ where: { id: { in: importBatchIds } } });
      }
      await prisma.tenantFeatureEntitlement.updateMany({
        where: { tenantId, featureKey: 'AI_CONTEXTUAL_REAL' },
        data: { enabled: false },
      });
      await prisma.brand.deleteMany({
        where: { id: { in: [roleScopeBrandAId, roleScopeBrandBId].filter(Boolean) } },
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
        estimatedAmount: '100000',
        grossMarginPercent: '15',
        expectedCloseDate: '2026-10-15',
        lineItems: [
          {
            brandId: roleScopeBrandAId,
            description: 'Phase 1 commercial line',
            amount: '100000',
          },
        ],
      })
      .expect(201);
    opportunityId = created.body.id;
    expect(created.body.grossProfit).toBe(15000);
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

    const reference = (await admin.get('/opportunities/reference-data').expect(200)).body;
    const stage20 = reference.stages.find((stage: { code: string }) => stage.code === '20');
    const created = await admin
      .post('/opportunities')
      .set('x-csrf-token', adminCsrf)
      .send({
        title: 'Manager B isolated opportunity',
        customerId: reference.customers[0].id,
        sellerId: sellerBUserId,
        managerId: managerBUserId,
        stageId: stage20.id,
        currency: 'USD',
        estimatedAmount: '900000',
        grossMarginPercent: '12',
        expectedCloseDate: '2026-10-25',
        lineItems: [
          {
            brandId: roleScopeBrandBId,
            description: 'Manager B team line',
            amount: '900000',
          },
        ],
      })
      .expect(201);
    rbacOpportunityId = created.body.id;

    const managerASearch = await managerA
      .get('/opportunities?search=Manager%20B%20isolated%20opportunity')
      .expect(200);
    expect(managerASearch.body.items).toEqual([]);

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
      { agent: executive, csrf: executiveCsrf, label: 'Executive' },
      { agent: viewer, csrf: viewerCsrf, label: 'Viewer' },
    ]) {
      await principal.agent.get(`/opportunities/${rbacOpportunityId}`).expect(200);
      await principal.agent
        .patch(`/opportunities/${rbacOpportunityId}`)
        .set('x-csrf-token', principal.csrf)
        .send({ notes: `${principal.label} mutation must fail` })
        .expect(403);
      await principal.agent
        .post('/opportunities')
        .set('x-csrf-token', principal.csrf)
        .send({})
        .expect(403);
      await principal.agent
        .put(`/qualification/opportunities/${rbacOpportunityId}/responses`)
        .set('x-csrf-token', principal.csrf)
        .send({ criterionId: opportunityId, answer: 'YES', evidence: 'Must not persist' })
        .expect(403);
      await principal.agent
        .post('/reviews')
        .set('x-csrf-token', principal.csrf)
        .send({
          opportunityId: rbacOpportunityId,
          type: 'MANAGER_NOTE',
          body: `${principal.label} review mutation must fail`,
        })
        .expect(403);
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

  it('forces manager ownership while preserving the selected active seller on creation', async () => {
    const reference = (await managerA.get('/opportunities/reference-data').expect(200)).body;
    const stage20 = reference.stages.find((stage: { code: string }) => stage.code === '20');
    const created = await managerA
      .post('/opportunities')
      .set('x-csrf-token', managerACsrf)
      .send({
        title: 'Manager A seller preservation check',
        customerId: reference.customers[0].id,
        sellerId: sellerBUserId,
        managerId: managerBUserId,
        stageId: stage20.id,
        currency: 'USD',
        estimatedAmount: '11111',
        expectedCloseDate: '2026-10-26',
        lineItems: [
          {
            brandId: roleScopeBrandAId,
            description: 'Manager assignment contract check',
            amount: '11111',
          },
        ],
      })
      .expect(201);
    expect(created.body.seller.id).toBe(sellerBUserId);
    expect(created.body.manager.id).toBe(managerAUserId);
    await managerA
      .patch(`/opportunities/${created.body.id}`)
      .set('x-csrf-token', managerACsrf)
      .send({ notes: 'Forced Manager A ownership remains updateable' })
      .expect(200);
    await prisma.opportunity.delete({ where: { id: created.body.id } });
  });

  it('isolates Manager A and Manager B analytics, alerts, sellers, brands, and quotas', async () => {
    await prisma.alert.createMany({
      data: [
        {
          tenantId,
          opportunityId,
          code: 'ROLE_SCOPE_ALERT_A',
          severity: 'HIGH',
          message: 'Manager A only',
        },
        {
          tenantId,
          opportunityId: rbacOpportunityId,
          code: 'ROLE_SCOPE_ALERT_B',
          severity: 'HIGH',
          message: 'Manager B only',
        },
      ],
      skipDuplicates: true,
    });

    const [managerADashboard, managerBDashboard, adminDashboard] = await Promise.all([
      managerA.get('/analytics/dashboard').expect(200),
      managerB.get('/analytics/dashboard').expect(200),
      admin.get('/analytics/dashboard').expect(200),
    ]);
    const brandA = managerADashboard.body.brandPerformance.find(
      (brand: { brandId: string }) => brand.brandId === roleScopeBrandAId,
    );
    const brandB = managerBDashboard.body.brandPerformance.find(
      (brand: { brandId: string }) => brand.brandId === roleScopeBrandBId,
    );
    expect(brandA.pipeline).toBe(100000);
    expect(brandB.pipeline).toBe(900000);
    expect(
      managerADashboard.body.brandPerformance.some(
        (brand: { brandId: string }) => brand.brandId === roleScopeBrandBId,
      ),
    ).toBe(false);
    expect(
      managerBDashboard.body.brandPerformance.some(
        (brand: { brandId: string }) => brand.brandId === roleScopeBrandAId,
      ),
    ).toBe(false);
    expect(
      managerADashboard.body.sellerPerformance.some(
        (performance: { seller: string }) => performance.seller === 'Seller B',
      ),
    ).toBe(false);
    expect(
      managerBDashboard.body.sellerPerformance.map(
        (performance: { seller: string }) => performance.seller,
      ),
    ).toEqual(['Seller B']);
    expect(
      adminDashboard.body.brandPerformance.some(
        (brand: { brandId: string; pipeline: number }) =>
          brand.brandId === roleScopeBrandAId && brand.pipeline === 100000,
      ),
    ).toBe(true);
    expect(
      adminDashboard.body.brandPerformance.some(
        (brand: { brandId: string; pipeline: number }) =>
          brand.brandId === roleScopeBrandBId && brand.pipeline === 900000,
      ),
    ).toBe(true);

    const [managerAOpportunities, managerBOpportunities, managerAAlerts, managerBAlerts] =
      await Promise.all([
        managerA.get('/opportunities?perPage=100').expect(200),
        managerB.get('/opportunities?perPage=100').expect(200),
        managerA.get('/alerts').expect(200),
        managerB.get('/alerts').expect(200),
      ]);
    expect(
      managerAOpportunities.body.items.some(
        (opportunity: { id: string }) => opportunity.id === rbacOpportunityId,
      ),
    ).toBe(false);
    expect(managerBOpportunities.body.items.map((item: { id: string }) => item.id)).toEqual([
      rbacOpportunityId,
    ]);
    expect(managerAAlerts.body.map((alert: { code: string }) => alert.code)).toContain(
      'ROLE_SCOPE_ALERT_A',
    );
    expect(managerAAlerts.body.map((alert: { code: string }) => alert.code)).not.toContain(
      'ROLE_SCOPE_ALERT_B',
    );
    expect(managerBAlerts.body.map((alert: { code: string }) => alert.code)).toContain(
      'ROLE_SCOPE_ALERT_B',
    );
    expect(managerBAlerts.body.map((alert: { code: string }) => alert.code)).not.toContain(
      'ROLE_SCOPE_ALERT_A',
    );

    const managerQuota = await prisma.quota.create({
      data: {
        tenantId,
        assigneeId: managerAUserId,
        periodStart: new Date(managerADashboard.body.period.start),
        periodEnd: new Date(managerADashboard.body.period.end),
        currency: managerADashboard.body.currency,
        amount: 500000,
      },
    });
    quotaIds.push(managerQuota.id);
    const [managerAWithQuota, managerBWithoutQuota, adminAfterManagerQuota] = await Promise.all([
      managerA.get('/analytics/dashboard').expect(200),
      managerB.get('/analytics/dashboard').expect(200),
      admin.get('/analytics/dashboard').expect(200),
    ]);
    expect(managerAWithQuota.body.kpis.quota).toBe(500000);
    expect(managerAWithQuota.body.kpis.quotaConfigured).toBe(true);
    expect(managerBWithoutQuota.body.kpis.quota).toBeNull();
    expect(managerBWithoutQuota.body.kpis.quotaConfigured).toBe(false);
    expect(adminAfterManagerQuota.body.kpis.quota).toBe(adminDashboard.body.kpis.quota);
  });

  it('attributes manager billing only through team opportunities', async () => {
    const [beforeManagerA, beforeManagerB, beforeSeller, beforeAdmin] = await Promise.all([
      managerA.get('/analytics/dashboard').expect(200),
      managerB.get('/analytics/dashboard').expect(200),
      seller.get('/analytics/dashboard').expect(200),
      admin.get('/analytics/dashboard').expect(200),
    ]);
    await prisma.billingRecord.createMany({
      data: [
        {
          tenantId,
          opportunityId,
          brandId: roleScopeBrandAId,
          amount: 20000,
          grossProfit: 3000,
          currency: 'USD',
          billedAt: new Date(beforeAdmin.body.period.start),
          source: 'ROLE_SCOPE_TEST',
          externalReference: roleScopeBillingReferences[0],
        },
        {
          tenantId,
          opportunityId: rbacOpportunityId,
          brandId: roleScopeBrandBId,
          amount: 80000,
          grossProfit: 9600,
          currency: 'USD',
          billedAt: new Date(beforeAdmin.body.period.start),
          source: 'ROLE_SCOPE_TEST',
          externalReference: roleScopeBillingReferences[1],
        },
        {
          tenantId,
          brandId: roleScopeBrandAId,
          amount: 10000,
          grossProfit: 1500,
          currency: 'USD',
          billedAt: new Date(beforeAdmin.body.period.start),
          source: 'ROLE_SCOPE_TEST',
          externalReference: roleScopeBillingReferences[2],
        },
      ],
    });
    const [afterManagerA, afterManagerB, afterSeller, afterAdmin] = await Promise.all([
      managerA.get('/analytics/dashboard').expect(200),
      managerB.get('/analytics/dashboard').expect(200),
      seller.get('/analytics/dashboard').expect(200),
      admin.get('/analytics/dashboard').expect(200),
    ]);
    expect(afterManagerA.body.kpis.billed - beforeManagerA.body.kpis.billed).toBe(20000);
    expect(afterManagerB.body.kpis.billed - beforeManagerB.body.kpis.billed).toBe(80000);
    expect(afterSeller.body.kpis.billed - beforeSeller.body.kpis.billed).toBe(20000);
    expect(afterAdmin.body.kpis.billed - beforeAdmin.body.kpis.billed).toBe(110000);
  });

  it('calculates quota, billed, brand performance, GM, gap, and quarter coverage on the server', async () => {
    const dashboard = await admin.get('/analytics/dashboard').expect(200);
    expect(dashboard.body.kpis.quotaConfigured).toBe(true);
    expect(dashboard.body.kpis.pipelineCoverage).not.toBeNull();
    expect(dashboard.body.kpis.weightedCoverage).not.toBeNull();
    expect(dashboard.body.kpis.averageMargin).not.toBeNull();
    expect(dashboard.body.brandPerformance.length).toBeGreaterThan(0);
    const configuredBrand = dashboard.body.brandPerformance.find(
      (brand: { quota: number | null }) => brand.quota !== null,
    );
    expect(configuredBrand).toEqual(
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
    const managerQuotaPreserved = await managerA.get('/analytics/dashboard').expect(200);
    expect(managerQuotaPreserved.body.kpis.quota).toBe(500000);
  });

  it('isolates team snapshots and computes diffs only against a compatible manager scope', async () => {
    const managerAFirst = await managerA
      .post('/forecast/snapshots')
      .set('x-csrf-token', managerACsrf)
      .expect(201);
    const managerBFirst = await managerB
      .post('/forecast/snapshots')
      .set('x-csrf-token', managerBCsrf)
      .expect(201);
    snapshotIds.push(managerAFirst.body.id, managerBFirst.body.id);
    expect(managerAFirst.body).toMatchObject({ scopeType: 'TEAM', scopeUserId: managerAUserId });
    expect(managerBFirst.body).toMatchObject({ scopeType: 'TEAM', scopeUserId: managerBUserId });

    const [managerAItems, managerBItems] = await Promise.all([
      prisma.forecastSnapshotItem.findMany({ where: { snapshotId: managerAFirst.body.id } }),
      prisma.forecastSnapshotItem.findMany({ where: { snapshotId: managerBFirst.body.id } }),
    ]);
    expect(managerAItems.some((item) => item.opportunityId === opportunityId)).toBe(true);
    expect(managerAItems.some((item) => item.opportunityId === rbacOpportunityId)).toBe(false);
    expect(managerBItems.map((item) => item.opportunityId)).toEqual([rbacOpportunityId]);

    await managerB
      .patch(`/opportunities/${rbacOpportunityId}`)
      .set('x-csrf-token', managerBCsrf)
      .send({ estimatedAmount: '910000', grossMarginPercent: '12' })
      .expect(200);
    const managerBSecond = await managerB
      .post('/forecast/snapshots')
      .set('x-csrf-token', managerBCsrf)
      .expect(201);
    const managerASecond = await managerA
      .post('/forecast/snapshots')
      .set('x-csrf-token', managerACsrf)
      .expect(201);
    snapshotIds.push(managerBSecond.body.id, managerASecond.body.id);

    const [managerADiff, managerBDiff, managerAList, managerBList] = await Promise.all([
      managerA.get('/forecast/snapshots/latest-diff').expect(200),
      managerB.get('/forecast/snapshots/latest-diff').expect(200),
      managerA.get('/forecast/snapshots').expect(200),
      managerB.get('/forecast/snapshots').expect(200),
    ]);
    expect(managerADiff.body.currentSnapshotId).toBe(managerASecond.body.id);
    expect(managerADiff.body.previousSnapshotId).toBe(managerAFirst.body.id);
    expect(
      managerADiff.body.diff.amountChanges.some(
        (change: { opportunityId: string }) => change.opportunityId === rbacOpportunityId,
      ),
    ).toBe(false);
    expect(managerBDiff.body.currentSnapshotId).toBe(managerBSecond.body.id);
    expect(managerBDiff.body.previousSnapshotId).toBe(managerBFirst.body.id);
    expect(managerBDiff.body.diff.amountChanges).toContainEqual(
      expect.objectContaining({ opportunityId: rbacOpportunityId, delta: 10000 }),
    );
    expect(
      managerAList.body.every(
        (snapshot: { scopeType: string; scopeUserId: string }) =>
          snapshot.scopeType === 'TEAM' && snapshot.scopeUserId === managerAUserId,
      ),
    ).toBe(true);
    expect(
      managerBList.body.every(
        (snapshot: { scopeType: string; scopeUserId: string }) =>
          snapshot.scopeType === 'TEAM' && snapshot.scopeUserId === managerBUserId,
      ),
    ).toBe(true);
    await seller.post('/forecast/snapshots').set('x-csrf-token', sellerCsrf).expect(403);
    expect((await seller.get('/forecast/snapshots').expect(200)).body).toEqual([]);
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
      .send({ estimatedAmount: '105000', grossMarginPercent: '15' })
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
    for (const principal of [
      { agent: executive, csrf: executiveCsrf },
      { agent: viewer, csrf: viewerCsrf },
    ]) {
      const tenantSnapshots = await principal.agent.get('/forecast/snapshots').expect(200);
      expect(
        tenantSnapshots.body.every(
          (snapshot: { scopeType: string; scopeUserId: string | null }) =>
            snapshot.scopeType === 'TENANT' && snapshot.scopeUserId === null,
        ),
      ).toBe(true);
      await principal.agent
        .post('/forecast/snapshots')
        .set('x-csrf-token', principal.csrf)
        .expect(403);
    }
  });

  it('validates CSV and imports Facturado Daily idempotently from XLSX', async () => {
    const beforeDryRun = await prisma.opportunity.count({ where: { tenantId } });
    const csv = Buffer.from(
      'ID,Opportunity,Seller Email,Brand,Customer,Amount,Stage,Expected Close\n' +
        'CSV-PHASE1,CSV Phase 1,sofia@techdistribution.demo,Nutanix,Synthetic Customer 01,1000,20%,2026-10-15\n',
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
      'Manager Email',
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
      'manager@techdistribution.demo',
    ]);
    const billing = workbook.addWorksheet('Facturado Daily');
    billing.getCell('B1').value = new Date('2026-10-15');
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
      .field('billingMode', 'TRANSACTION')
      .field('sourceCutoff', '2026-10-15')
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
      .field('billingMode', 'TRANSACTION')
      .field('sourceCutoff', '2026-10-15')
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
      .field('billingMode', 'TRANSACTION')
      .field('sourceCutoff', '2026-10-15')
      .field('sourceCompleteness', 'COMPLETE')
      .attach('file', buffer, {
        filename: 'facturado.xlsx',
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      .expect(201);
    expect(first.body.summary.billingProcessed).toBe(2);
    expect(first.body.summary.opportunityProcessed).toBe(1);
    importBatchIds.push(first.body.batch.id);
    const importedOpportunity = await prisma.opportunity.findFirstOrThrow({
      where: { tenantId, externalReference: 'OPPTY-XLSX-PHASE1' },
      include: { stage: true },
    });
    expect(importedOpportunity.stage.code).toBe('90');
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
      .field('billingMode', 'TRANSACTION')
      .field('sourceCutoff', '2026-10-15')
      .field('sourceCompleteness', 'COMPLETE')
      .attach('file', buffer, {
        filename: 'facturado.xlsx',
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      .expect(201);
    expect(second.body.batch.reused).toBe(true);
    expect(second.body.batch.id).toBe(first.body.batch.id);
  });

  it('updates stable opportunity identities, preserves history, and reports later absence', async () => {
    const suffix = Date.now();
    const reference = `OPPTY-EDGAR-TRACE-${suffix}`;
    const replacementReference = `OPPTY-EDGAR-REPLACEMENT-${suffix}`;
    managerImportOpportunityReferences.push(reference, replacementReference);

    const firstBuffer = await opportunityWorkbookBuffer({
      reference,
      title: 'Edgar traceable opportunity',
      amount: 1000,
      stage: '20%',
    });
    const firstAnalysis = await admin
      .post('/imports/analyze')
      .set('x-csrf-token', adminCsrf)
      .attach('file', firstBuffer, xlsxAttachment('edgar-trace-1.xlsx'))
      .expect(201);
    const mapping = confirmedMappings(firstAnalysis.body);
    const first = await executeWorkbook(admin, adminCsrf, firstBuffer, mapping, {
      filename: 'edgar-trace-1.xlsx',
      sourceCutoff: '2026-10-02',
    });
    importBatchIds.push(first.body.batch.id);
    expect(first.body.summary).toEqual(expect.objectContaining({ added: 1, changed: 0 }));
    const original = await prisma.opportunity.findFirstOrThrow({
      where: { tenantId, externalReference: reference },
      include: { stage: true },
    });
    expect(original.stage.code).toBe('20');

    const changedBuffer = await opportunityWorkbookBuffer({
      reference,
      title: 'Edgar traceable opportunity',
      amount: 1200,
      stage: '40%',
    });
    const changedAnalysis = await admin
      .post('/imports/analyze')
      .set('x-csrf-token', adminCsrf)
      .attach('file', changedBuffer, xlsxAttachment('edgar-trace-2.xlsx'))
      .expect(201);
    const changed = await executeWorkbook(
      admin,
      adminCsrf,
      changedBuffer,
      confirmedMappings(changedAnalysis.body),
      { filename: 'edgar-trace-2.xlsx', sourceCutoff: '2026-10-09' },
    );
    importBatchIds.push(changed.body.batch.id);
    expect(changed.body.summary.changed).toBe(1);
    const updated = await prisma.opportunity.findFirstOrThrow({
      where: { tenantId, externalReference: reference },
      include: { stage: true, stageHistory: { orderBy: { changedAt: 'asc' } } },
    });
    expect(updated.id).toBe(original.id);
    expect(updated.estimatedAmount.toNumber()).toBe(1200);
    expect(updated.stage.code).toBe('40');
    expect(
      updated.stageHistory.some(
        (history) =>
          history.fromStageId === original.stageId &&
          history.toStageId === updated.stageId &&
          history.reason?.startsWith('Commercial import'),
      ),
    ).toBe(true);

    const replay = await executeWorkbook(
      admin,
      adminCsrf,
      changedBuffer,
      confirmedMappings(changedAnalysis.body),
      { filename: 'edgar-trace-2.xlsx', sourceCutoff: '2026-10-09' },
    );
    expect(replay.body.batch).toEqual(
      expect.objectContaining({ id: changed.body.batch.id, reused: true }),
    );
    expect(
      await prisma.opportunity.count({ where: { tenantId, externalReference: reference } }),
    ).toBe(1);

    const replacementBuffer = await opportunityWorkbookBuffer({
      reference: replacementReference,
      title: 'Edgar replacement source row',
      amount: 800,
      stage: '20%',
    });
    const replacementAnalysis = await admin
      .post('/imports/analyze')
      .set('x-csrf-token', adminCsrf)
      .attach('file', replacementBuffer, xlsxAttachment('edgar-trace-3.xlsx'))
      .expect(201);
    const replacement = await executeWorkbook(
      admin,
      adminCsrf,
      replacementBuffer,
      confirmedMappings(replacementAnalysis.body),
      { filename: 'edgar-trace-3.xlsx', sourceCutoff: '2026-10-16' },
    );
    importBatchIds.push(replacement.body.batch.id);
    expect(replacement.body.summary.missingFromLatest).toBeGreaterThanOrEqual(1);
    expect(
      await prisma.opportunity.count({ where: { tenantId, externalReference: reference } }),
    ).toBe(1);
  });

  it('updates cumulative billing from 300 to 350 instead of summing it to 650', async () => {
    const firstBuffer = await cumulativeBillingWorkbookBuffer(300);
    const firstAnalysis = await admin
      .post('/imports/analyze')
      .set('x-csrf-token', adminCsrf)
      .attach('file', firstBuffer, xlsxAttachment('edgar-cumulative-300.xlsx'))
      .expect(201);
    const mapping = confirmedMappings(firstAnalysis.body);
    const first = await executeWorkbook(admin, adminCsrf, firstBuffer, mapping, {
      filename: 'edgar-cumulative-300.xlsx',
      sourceCutoff: '2026-10-05',
      billingMode: 'CUMULATIVE',
    });
    importBatchIds.push(first.body.batch.id);
    const firstRecord = await prisma.billingRecord.findFirstOrThrow({
      where: { tenantId, importBatchId: first.body.batch.id, importMode: 'CUMULATIVE' },
    });
    managerImportBillingReferences.push(firstRecord.externalReference!);
    expect(firstRecord.amount.toNumber()).toBe(300);

    const secondBuffer = await cumulativeBillingWorkbookBuffer(350);
    const secondAnalysis = await admin
      .post('/imports/analyze')
      .set('x-csrf-token', adminCsrf)
      .attach('file', secondBuffer, xlsxAttachment('edgar-cumulative-350.xlsx'))
      .expect(201);
    const second = await executeWorkbook(
      admin,
      adminCsrf,
      secondBuffer,
      confirmedMappings(secondAnalysis.body),
      {
        filename: 'edgar-cumulative-350.xlsx',
        sourceCutoff: '2026-10-12',
        billingMode: 'CUMULATIVE',
      },
    );
    importBatchIds.push(second.body.batch.id);
    const records = await prisma.billingRecord.findMany({
      where: { tenantId, externalReference: firstRecord.externalReference },
    });
    expect(records).toHaveLength(1);
    expect(records[0]!.amount.toNumber()).toBe(350);
  });

  it('publishes an explicitly partial source as visible and not reconciled', async () => {
    const reference = `OPPTY-EDGAR-PARTIAL-${Date.now()}`;
    managerImportOpportunityReferences.push(reference);
    const buffer = await opportunityWorkbookBuffer({
      reference,
      title: 'Edgar partial source row',
      amount: 700,
      stage: '20%',
    });
    const analysis = await admin
      .post('/imports/analyze')
      .set('x-csrf-token', adminCsrf)
      .attach('file', buffer, xlsxAttachment('edgar-partial.xlsx'))
      .expect(201);
    const result = await executeWorkbook(
      admin,
      adminCsrf,
      buffer,
      confirmedMappings(analysis.body),
      {
        filename: 'edgar-partial.xlsx',
        sourceCutoff: '2026-10-19',
        sourceCompleteness: 'PARTIAL',
      },
    );
    importBatchIds.push(result.body.batch.id);
    expect(result.body).toEqual(
      expect.objectContaining({
        summary: expect.objectContaining({ status: 'PARTIAL' }),
        batch: expect.objectContaining({ status: 'PARTIAL', reused: false }),
      }),
    );
    const dashboard = await admin.get('/analytics/manager-dashboard').expect(200);
    expect(dashboard.body.importState).toEqual(
      expect.objectContaining({ status: 'PARTIAL', partial: true, sourceCutoff: '2026-10-19' }),
    );
  });

  it('serves one filter-consistent manager dashboard without cross-team leakage', async () => {
    const managerDashboard = await managerA.get('/analytics/manager-dashboard').expect(200);
    const managerBSet = new Set(
      managerDashboard.body.stages.flatMap(
        (stage: { opportunityIds: string[] }) => stage.opportunityIds,
      ),
    );
    expect(managerBSet.has(rbacOpportunityId)).toBe(false);
    expect(managerDashboard.body).toEqual(
      expect.objectContaining({
        currency: 'USD',
        summary: expect.objectContaining({
          billed: expect.any(Number),
          pipeline: expect.any(Number),
          forecast: expect.any(Number),
          backlog: expect.any(Number),
        }),
        coverage: expect.objectContaining({ ratio: 4 }),
        brandHierarchy: expect.objectContaining({ label: 'Data Center' }),
      }),
    );

    const brand = managerDashboard.body.filters.brands[0];
    expect(brand).toBeTruthy();
    const filtered = await managerA
      .get(`/analytics/manager-dashboard?brandId=${brand.id}`)
      .expect(200);
    expect(filtered.body.brandHierarchy.brands).toHaveLength(1);
    expect(filtered.body.brandHierarchy.brands[0].brandId).toBe(brand.id);
    for (const line of filtered.body.brandHierarchy.brands[0].lines) {
      expect(line).toEqual(
        expect.objectContaining({
          quota: null,
          billed: expect.any(Number),
          pipeline: expect.any(Number),
          forecast: expect.any(Number),
          backlog: expect.any(Number),
          forecastAndBacklog: expect.any(Number),
        }),
      );
    }
    const filteredIds = new Set<string>(
      filtered.body.stages
        .filter((stage: { stageCode: string }) => stage.stageCode !== '100')
        .flatMap((stage: { opportunityIds: string[] }) => stage.opportunityIds),
    );
    const linked = filteredIds.size
      ? await prisma.opportunity.count({
          where: {
            id: { in: [...filteredIds] },
            lineItems: { some: { brandId: brand.id } },
          },
        })
      : 0;
    expect(linked).toBe(filteredIds.size);

    const managerBView = await managerB.get('/analytics/manager-dashboard').expect(200);
    const managerBIds = managerBView.body.stages.flatMap(
      (stage: { opportunityIds: string[] }) => stage.opportunityIds,
    );
    expect(managerBIds).toEqual([]);
    await executive.get('/analytics/manager-dashboard').expect(200);
    await viewer.get('/analytics/manager-dashboard').expect(200);
  });

  it('moves November backlog to December context without duplication or fictitious loss', async () => {
    const [stage90, sellerUser, customer, brand] = await Promise.all([
      prisma.stage.findFirstOrThrow({ where: { tenantId, code: '90' } }),
      prisma.user.findUniqueOrThrow({ where: { email: 'sofia@techdistribution.demo' } }),
      prisma.customer.findFirstOrThrow({ where: { tenantId } }),
      prisma.brand.findFirstOrThrow({ where: { tenantId, name: 'Nutanix' } }),
    ]);
    const opportunity = await prisma.opportunity.create({
      data: {
        tenantId,
        sellerId: sellerUser.id,
        managerId: managerAUserId,
        customerId: customer.id,
        title: 'Edgar November to December backlog',
        status: 'WON',
        stageId: stage90.id,
        forecastCategory: 'COMMIT',
        currency: 'USD',
        estimatedAmount: 1000,
        probability: stage90.probability,
        expectedCloseDate: new Date('2026-10-15'),
        expectedBillingDate: new Date('2026-11-15'),
        source: 'INTEGRATION_FIXTURE',
        lineItems: {
          create: {
            tenantId,
            brandId: brand.id,
            description: 'Synthetic Data Center backlog',
            productLine: 'Infrastructure',
            amount: 1000,
          },
        },
      },
    });
    managerPeriodOpportunityIds.push(opportunity.id);
    const november = await managerA.get('/analytics/manager-dashboard').expect(200);
    await prisma.opportunity.update({
      where: { id: opportunity.id },
      data: { expectedBillingDate: new Date('2026-12-15') },
    });
    const december = await managerA.get('/analytics/manager-dashboard').expect(200);
    expect(november.body.summary.backlog - december.body.summary.backlog).toBe(1000);
    expect(
      december.body.alerts.some(
        (alert: { code: string; opportunityId?: string; kind: string }) =>
          alert.code === 'A06' &&
          alert.opportunityId === opportunity.id &&
          alert.kind === 'CONTEXT',
      ),
    ).toBe(true);
    expect(await prisma.opportunity.count({ where: { id: opportunity.id } })).toBe(1);
  });

  it('records distinct-customer visits idempotently and enforces read-only mutation rules', async () => {
    const reference = (await managerA.get('/opportunities/reference-data').expect(200)).body;
    const sofia = reference.users.find((user: { name: string }) => user.name === 'Sofía Torres');
    const teamOpportunities = (await managerA.get('/opportunities?perPage=100').expect(200)).body
      .items;
    const linkTarget = teamOpportunities.find(
      (opportunity: { seller: { id: string } }) => opportunity.seller.id === sofia.id,
    );
    expect(linkTarget).toBeTruthy();
    const customer = reference.customers.find(
      (item: { id: string }) => item.id === linkTarget.customer.id,
    );
    expect(customer).toBeTruthy();
    const visitedAt = new Date().toISOString().slice(0, 10);
    const noVisit = {
      sellerId: sofia.id,
      customerId: customer.id,
      visitedAt,
      foundOpportunity: false,
      idempotencyKey: `phase1-edgar-no-${Date.now()}`,
    };
    const created = await managerA
      .post('/visits')
      .set('x-csrf-token', managerACsrf)
      .send(noVisit)
      .expect(201);
    managerVisitIds.push(created.body.id);
    expect(created.body).toEqual(expect.objectContaining({ foundOpportunity: false }));
    const replay = await managerA
      .post('/visits')
      .set('x-csrf-token', managerACsrf)
      .send(noVisit)
      .expect(201);
    expect(replay.body.id).toBe(created.body.id);
    await managerB.post('/visits').set('x-csrf-token', managerBCsrf).send(noVisit).expect(403);

    const pending = await managerA
      .post('/visits')
      .set('x-csrf-token', managerACsrf)
      .send({
        ...noVisit,
        foundOpportunity: true,
        idempotencyKey: `phase1-edgar-yes-${Date.now()}`,
      })
      .expect(201);
    managerVisitIds.push(pending.body.id);
    expect(pending.body.linkStatus).toBe('PENDING_LINK');
    const dashboard = await managerA
      .get(`/analytics/manager-dashboard?weekStart=${visitedAt}`)
      .expect(200);
    expect(dashboard.body.alerts).toContainEqual(
      expect.objectContaining({
        code: 'A04',
        entity: expect.objectContaining({ id: pending.body.id }),
      }),
    );
    const sellerPerformance = dashboard.body.sellerPerformance.find(
      (row: { sellerId: string }) => row.sellerId === sofia.id,
    );
    expect(sellerPerformance.visitedCustomers).toBeGreaterThanOrEqual(1);

    await managerB
      .patch(`/visits/${pending.body.id}/opportunity`)
      .set('x-csrf-token', managerBCsrf)
      .send({ opportunityId: linkTarget.id })
      .expect(403);
    const linked = await managerA
      .patch(`/visits/${pending.body.id}/opportunity`)
      .set('x-csrf-token', managerACsrf)
      .send({ opportunityId: linkTarget.id })
      .expect(200);
    expect(linked.body).toEqual(
      expect.objectContaining({
        id: pending.body.id,
        linkStatus: 'COMPLETE',
        opportunity: expect.objectContaining({ id: linkTarget.id }),
      }),
    );
    await managerA
      .patch(`/visits/${pending.body.id}/opportunity`)
      .set('x-csrf-token', managerACsrf)
      .send({ opportunityId: linkTarget.id })
      .expect(200);
    const afterLink = await managerA
      .get(`/analytics/manager-dashboard?weekStart=${visitedAt}`)
      .expect(200);
    expect(
      afterLink.body.alerts.some(
        (alert: { code: string; entity: { id: string } }) =>
          alert.code === 'A04' && alert.entity.id === pending.body.id,
      ),
    ).toBe(false);
    expect(
      await prisma.auditEvent.count({
        where: {
          tenantId,
          action: 'CUSTOMER_VISIT_OPPORTUNITY_LINKED',
          entityId: pending.body.id,
        },
      }),
    ).toBe(1);

    for (const principal of [
      { agent: executive, csrf: executiveCsrf },
      { agent: viewer, csrf: viewerCsrf },
    ]) {
      await principal.agent
        .post('/visits')
        .set('x-csrf-token', principal.csrf)
        .send({ ...noVisit, idempotencyKey: `read-only-${Date.now()}-${Math.random()}` })
        .expect(403);
    }
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

function xlsxAttachment(filename: string) {
  return {
    filename,
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
}

async function opportunityWorkbookBuffer(input: {
  reference: string;
  title: string;
  amount: number;
  stage: string;
}) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Oppty');
  sheet.addRow([
    'Opportunity',
    'Seller Email',
    'Manager Email',
    'Brand',
    'Customer',
    'Amount',
    'GM %',
    'Stage',
    'Expected Close',
    'Expected Billing',
    'External ID',
    'BU',
    'Product Line',
  ]);
  sheet.addRow([
    input.title,
    'sofia@techdistribution.demo',
    'manager@techdistribution.demo',
    'Nutanix',
    'Synthetic Customer 01',
    input.amount,
    12,
    input.stage,
    new Date('2026-10-20'),
    new Date('2026-11-15'),
    input.reference,
    'Data Center',
    'Infrastructure',
  ]);
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

async function cumulativeBillingWorkbookBuffer(amount: number) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Facturado Daily');
  sheet.getCell('B1').value = new Date('2026-10-05');
  sheet.addRow(['Vendor', 'Revenue USD', 'GP USD']);
  sheet.addRow(['Nutanix', amount, amount * 0.1]);
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

async function executeWorkbook(
  agent: ReturnType<typeof request.agent>,
  csrf: string,
  buffer: Buffer,
  mapping: Array<{
    sheet: string;
    sourceColumn: string;
    destinationField: string | null;
    confirmed: boolean;
  }>,
  options: {
    filename: string;
    sourceCutoff: string;
    billingMode?: 'TRANSACTION' | 'CUMULATIVE';
    sourceCompleteness?: 'COMPLETE' | 'PARTIAL';
  },
) {
  return agent
    .post('/imports/execute')
    .set('x-csrf-token', csrf)
    .field('mapping', JSON.stringify(mapping))
    .field('asOfDate', options.sourceCutoff)
    .field('billingMode', options.billingMode ?? 'TRANSACTION')
    .field('sourceCutoff', options.sourceCutoff)
    .field('sourceCompleteness', options.sourceCompleteness ?? 'COMPLETE')
    .attach('file', buffer, xlsxAttachment(options.filename))
    .expect(201);
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
