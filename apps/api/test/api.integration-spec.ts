import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module';
import { ApiExceptionFilter } from '../src/common/http/api-exception.filter';

describe('MVP API vertical slice', () => {
  let app: Awaited<ReturnType<typeof createTestApp>>;
  let agent: ReturnType<typeof request.agent>;
  let csrf = '';
  let createdOpportunityId = '';
  let reference: {
    stages: Array<{ id: string; code: string }>;
    brands: Array<{ id: string }>;
    customers: Array<{ id: string }>;
    users: Array<{ id: string; role: string }>;
  };

  beforeAll(async () => {
    app = await createTestApp();
    agent = request.agent(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  it('logs in with an opaque HttpOnly session and issues a CSRF cookie', async () => {
    const password = process.env.DEMO_ADMIN_PASSWORD;
    if (!password) throw new Error('DEMO_ADMIN_PASSWORD is required for integration tests');
    const response = await agent
      .post('/auth/login')
      .send({ email: 'admin@techdistribution.demo', password })
      .expect(200);
    const cookies = response.headers['set-cookie'] as unknown as string[];
    expect(
      cookies.some((cookie) => cookie.startsWith('sip_session=') && cookie.includes('HttpOnly')),
    ).toBe(true);
    expect(
      cookies.some(
        (cookie) => cookie.startsWith('sip_session=') && cookie.includes('SameSite=Lax'),
      ),
    ).toBe(true);
    const csrfCookie = cookies.find((cookie) => cookie.startsWith('sip_csrf='));
    csrf = csrfCookie?.split(';')[0]?.split('=')[1] ?? '';
    expect(csrf).not.toBe('');
  });

  it('resolves the active membership and dashboard tenant context', async () => {
    const me = await agent.get('/auth/me').expect(200);
    expect(me.body.tenant.slug).toBe('tech-distribution-demo');
    expect(me.body.role).toBe('TENANT_ADMIN');
    const dashboard = await agent.get('/analytics/dashboard').expect(200);
    expect(dashboard.body.kpis.pipeline).toBeGreaterThan(0);
    expect(dashboard.body.funnel.length).toBeGreaterThan(0);
  });

  it('rejects tenant mass assignment, then creates an opportunity from session context', async () => {
    reference = (await agent.get('/opportunities/reference-data').expect(200)).body;
    const seller = reference.users.find((user) => user.role === 'SELLER')!;
    const base = {
      title: 'Synthetic integration opportunity',
      customerId: reference.customers[0]!.id,
      sellerId: seller.id,
      stageId: reference.stages.find((stage) => stage.code === '20')!.id,
      forecastCategory: 'PIPELINE',
      currency: 'USD',
      estimatedAmount: '42000.00',
      grossProfit: '6300.00',
      expectedCloseDate: '2026-10-15',
      lineItems: [
        {
          brandId: reference.brands[0]!.id,
          description: 'Synthetic integration line',
          amount: '42000.00',
          cost: '35700.00',
        },
      ],
    };
    await agent
      .post('/opportunities')
      .set('x-csrf-token', csrf)
      .send({ ...base, tenantId: '00000000-0000-4000-8000-000000000000' })
      .expect(400);
    const created = await agent
      .post('/opportunities')
      .set('x-csrf-token', csrf)
      .send(base)
      .expect(201);
    createdOpportunityId = created.body.id;
    expect(created.body.health.score).toBeGreaterThan(0);
  });

  it('reads and updates the opportunity while recording stage history', async () => {
    await agent.get(`/opportunities/${createdOpportunityId}`).expect(200);
    const qualification = reference.stages.find((stage) => stage.code === '40')!;
    await agent
      .patch(`/opportunities/${createdOpportunityId}`)
      .set('x-csrf-token', csrf)
      .send({ stageId: qualification.id, forecastCategory: 'BEST_CASE' })
      .expect(400);
    const updated = await agent
      .patch(`/opportunities/${createdOpportunityId}`)
      .set('x-csrf-token', csrf)
      .send({ stageId: qualification.id, forecastCategory: 'PIPELINE' })
      .expect(200);
    expect(updated.body.stage.code).toBe('40');
    const detail = await agent.get(`/opportunities/${createdOpportunityId}`).expect(200);
    expect(detail.body.stageHistory.length).toBeGreaterThanOrEqual(2);
    expect(
      detail.body.auditTrail.some(
        (event: { action: string }) => event.action === 'OPPORTUNITY_STAGE_CHANGED',
      ),
    ).toBe(true);
  });

  it('captures a forecast snapshot and revokes the session on logout', async () => {
    await agent.post('/forecast/snapshots').set('x-csrf-token', csrf).expect(201);
    await agent.post('/auth/logout').set('x-csrf-token', csrf).expect(204);
    await agent.get('/auth/me').expect(401);
  });
});

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
