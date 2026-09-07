import { randomBytes } from 'node:crypto';
import 'dotenv/config';
import * as argon2 from 'argon2';
import {
  ForecastCategory,
  MembershipRole,
  OpportunityStatus,
  Prisma,
  PrismaClient,
} from '@prisma/client';

const addDays = (date: Date, days: number): Date => new Date(date.getTime() + days * 86_400_000);

function fiscalQuarter(now: Date, fiscalStartMonth: number): { start: Date; end: Date } {
  const month = now.getUTCMonth();
  const fiscalStart = fiscalStartMonth - 1;
  const fiscalMonth = (month - fiscalStart + 12) % 12;
  const quarter = Math.floor(fiscalMonth / 3);
  const fiscalYearStart = month < fiscalStart ? now.getUTCFullYear() - 1 : now.getUTCFullYear();
  const start = new Date(Date.UTC(fiscalYearStart, fiscalStart + quarter * 3, 1));
  const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 3, 0));
  return { start, end };
}

async function main(): Promise<void> {
  const stagingBootstrap = process.argv.includes('--staging');
  if (stagingBootstrap) {
    if (process.env.APP_ENV !== 'staging' || process.env.ALLOW_STAGING_BOOTSTRAP !== 'true') {
      throw new Error(
        'Staging bootstrap requires APP_ENV=staging and ALLOW_STAGING_BOOTSTRAP=true',
      );
    }
    if (!process.env.MIGRATION_DATABASE_URL) {
      throw new Error('MIGRATION_DATABASE_URL is required for staging bootstrap');
    }
  } else if (process.env.NODE_ENV === 'production') {
    throw new Error('Development demo seed is disabled in production');
  }

  const stagingPassword = process.env.STAGING_ADMIN_PASSWORD;
  if (stagingBootstrap && (!stagingPassword || stagingPassword.length < 24)) {
    throw new Error('STAGING_ADMIN_PASSWORD must contain at least 24 characters');
  }
  if (stagingPassword === 'ChangeMe-Local-2026!') {
    throw new Error('The local demonstration password cannot be used for staging');
  }

  const generatedPassword = !stagingBootstrap && !process.env.DEMO_ADMIN_PASSWORD;
  const password = stagingBootstrap
    ? stagingPassword!
    : (process.env.DEMO_ADMIN_PASSWORD ?? `Local-${randomBytes(18).toString('base64url')}!`);
  const databaseUrl = stagingBootstrap
    ? process.env.MIGRATION_DATABASE_URL!
    : process.env.DATABASE_URL;
  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

  try {
    await seedDemo(prisma, password, generatedPassword, stagingBootstrap);
  } finally {
    await prisma.$disconnect();
  }
}

async function seedDemo(
  prisma: PrismaClient,
  password: string,
  generatedPassword: boolean,
  stagingBootstrap: boolean,
): Promise<void> {
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
  });

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'tech-distribution-demo' },
    update: { name: 'Tech Distribution Demo', status: 'ACTIVE' },
    create: { name: 'Tech Distribution Demo', slug: 'tech-distribution-demo', status: 'ACTIVE' },
  });
  await prisma.tenantSetting.upsert({
    where: { tenantId: tenant.id },
    update: {
      fiscalYearStartMonth: 12,
      fiscalYearEndMonth: 11,
      timezone: 'America/Guayaquil',
      currency: 'USD',
      defaultMarginThreshold: 10,
    },
    create: {
      tenantId: tenant.id,
      fiscalYearStartMonth: 12,
      fiscalYearEndMonth: 11,
      timezone: 'America/Guayaquil',
      currency: 'USD',
      defaultMarginThreshold: 10,
    },
  });
  await prisma.tenantAuthProvider.upsert({
    where: { tenantId_providerType: { tenantId: tenant.id, providerType: 'LOCAL' } },
    update: { enabled: true },
    create: { tenantId: tenant.id, providerType: 'LOCAL', enabled: true },
  });

  const people: Array<{ name: string; email: string; role: MembershipRole }> = [
    {
      name: 'Alex Rivera',
      email: 'admin@techdistribution.demo',
      role: MembershipRole.TENANT_ADMIN,
    },
    { name: 'Morgan Silva', email: 'manager@techdistribution.demo', role: MembershipRole.MANAGER },
    { name: 'Sofía Torres', email: 'sofia@techdistribution.demo', role: MembershipRole.SELLER },
    { name: 'Diego Andrade', email: 'diego@techdistribution.demo', role: MembershipRole.SELLER },
    { name: 'Camila Paz', email: 'camila@techdistribution.demo', role: MembershipRole.SELLER },
  ];
  const users = [];
  for (const person of people) {
    const credentialHash =
      stagingBootstrap && person.email !== 'admin@techdistribution.demo'
        ? await argon2.hash(randomBytes(48).toString('base64url'), {
            type: argon2.argon2id,
            memoryCost: 19_456,
            timeCost: 2,
            parallelism: 1,
          })
        : passwordHash;
    const user = await prisma.user.upsert({
      where: { email: person.email },
      update: {
        name: person.name,
        status: 'ACTIVE',
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
      create: { name: person.name, email: person.email, status: 'ACTIVE' },
    });
    await prisma.localCredential.upsert({
      where: { userId: user.id },
      update: { passwordHash: credentialHash, passwordChangedAt: new Date() },
      create: { userId: user.id, passwordHash: credentialHash },
    });
    await prisma.authIdentity.upsert({
      where: { provider_providerSubject: { provider: 'LOCAL', providerSubject: person.email } },
      update: { userId: user.id },
      create: { userId: user.id, provider: 'LOCAL', providerSubject: person.email },
    });
    await prisma.tenantMembership.upsert({
      where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
      update: { role: person.role, status: 'ACTIVE' },
      create: { tenantId: tenant.id, userId: user.id, role: person.role, status: 'ACTIVE' },
    });
    users.push({ ...user, role: person.role });
  }

  const stageDefinitions = [
    { code: '20', name: 'Prospecting', probability: 20, sortOrder: 0 },
    { code: '40', name: 'Qualification', probability: 40, sortOrder: 1 },
    { code: '60', name: 'Proposal', probability: 60, sortOrder: 2 },
    { code: '80', name: 'Negotiation', probability: 80, sortOrder: 3 },
    {
      code: '90',
      name: 'Closing',
      probability: 90,
      sortOrder: 4,
      isClosedWon: true,
    },
    {
      code: '100',
      name: 'Billed',
      probability: 100,
      sortOrder: 5,
      isClosedWon: true,
      isBilled: true,
    },
  ];
  const stages = [];
  for (const definition of stageDefinitions) {
    stages.push(
      await prisma.stage.upsert({
        where: { tenantId_code: { tenantId: tenant.id, code: definition.code } },
        update: definition,
        create: { tenantId: tenant.id, ...definition },
      }),
    );
  }

  const qualificationDefinitions = [
    ['60', 'BUDGET_CONFIRMED', 'Budget confirmed', 'Presupuesto confirmado'],
    ['60', 'BUSINESS_NEED_CONFIRMED', 'Business need confirmed', 'Necesidad de negocio confirmada'],
    ['60', 'DECISION_MAKER_IDENTIFIED', 'Decision maker identified', 'Decisor identificado'],
    ['60', 'BUYING_PROCESS_UNDERSTOOD', 'Buying process understood', 'Proceso de compra entendido'],
    ['60', 'KEY_STAKEHOLDER_ACCESS', 'Access to key stakeholders', 'Acceso a interesados clave'],
    ['60', 'TARGET_DATE_EXISTS', 'Target date exists', 'Existe fecha objetivo'],
    [
      '60',
      'TECHNICAL_SOLUTION_VALIDATED',
      'Technical solution validated',
      'Solución técnica validada',
    ],
    ['60', 'COMPETITION_IDENTIFIED', 'Competition identified', 'Competencia identificada'],
    ['80', 'FINAL_PROPOSAL_VALIDATED', 'Final proposal validated', 'Propuesta final validada'],
    [
      '80',
      'COMMERCIAL_TERMS_ACCEPTED',
      'Commercial conditions accepted',
      'Condiciones comerciales aceptadas',
    ],
    ['80', 'PROCUREMENT_ALIGNED', 'Procurement aligned', 'Compras alineadas'],
    [
      '80',
      'EXPECTED_ORDER_DATE_KNOWN',
      'Expected order date known',
      'Fecha esperada de orden conocida',
    ],
    [
      '80',
      'PO_PROCESS_CONFIRMED',
      'PO expected or process confirmed',
      'OC esperada o proceso confirmado',
    ],
    ['80', 'PARTNER_READY', 'Partner ready', 'Canal listo'],
    [
      '80',
      'COMMERCIAL_CREDIT_AVAILABLE',
      'Commercial credit available',
      'Crédito comercial disponible',
    ],
    [
      '80',
      'FINANCE_VALIDATED',
      'Internal finance validation completed',
      'Validación financiera interna completada',
    ],
    ['80', 'BILLING_DATE_REALISTIC', 'Billing date realistic', 'Fecha de facturación realista'],
  ] as const;
  const qualificationCriteria = [];
  for (const [index, [gateCode, code, labelEn, labelEs]] of qualificationDefinitions.entries()) {
    qualificationCriteria.push(
      await prisma.qualificationCriterion.upsert({
        where: { tenantId_gateCode_code: { tenantId: tenant.id, gateCode, code } },
        update: { labelEn, labelEs, required: true, evidenceRequired: true, sortOrder: index },
        create: {
          tenantId: tenant.id,
          gateCode,
          code,
          labelEn,
          labelEs,
          required: true,
          evidenceRequired: true,
          sortOrder: index,
        },
      }),
    );
  }
  for (const featureKey of [
    'CRM_PROCESS_INTELLIGENCE',
    'CHANNEL_CUTOFF_INTELLIGENCE',
    'AI_CONTEXTUAL_REAL',
    'AI_MANAGER_BRIEF',
    'AI_PREDICTIVE',
  ]) {
    await prisma.tenantFeatureEntitlement.upsert({
      where: { tenantId_featureKey: { tenantId: tenant.id, featureKey } },
      update: {},
      create: { tenantId: tenant.id, featureKey, enabled: false },
    });
  }

  const brands = [];
  for (const name of ['HP', 'Lenovo', 'Nutanix', 'Dell', 'Hitachi']) {
    brands.push(
      await prisma.brand.upsert({
        where: { tenantId_name: { tenantId: tenant.id, name } },
        update: {},
        create: { tenantId: tenant.id, name },
      }),
    );
  }
  const partners = [];
  for (const name of [
    'Andes Technology',
    'CloudBridge',
    'Digital Core',
    'Enterprise Hub',
    'Nova Systems',
    'Pacific IT',
  ]) {
    partners.push(
      await prisma.partner.upsert({
        where: { tenantId_name: { tenantId: tenant.id, name } },
        update: {},
        create: { tenantId: tenant.id, name },
      }),
    );
  }
  const customers = [];
  const industries = ['Banking', 'Retail', 'Public sector', 'Telecommunications', 'Healthcare'];
  for (let index = 1; index <= 15; index += 1) {
    const name = `Synthetic Customer ${String(index).padStart(2, '0')}`;
    customers.push(
      await prisma.customer.upsert({
        where: { tenantId_name: { tenantId: tenant.id, name } },
        update: { industry: industries[index % industries.length] },
        create: { tenantId: tenant.id, name, industry: industries[index % industries.length] },
      }),
    );
  }

  const now = new Date();
  const period = fiscalQuarter(now, 12);
  const manager = users.find((user) => user.role === MembershipRole.MANAGER)!;
  const sellers = users.filter((user) => user.role === MembershipRole.SELLER);
  await prisma.quota.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.quota.create({
    data: {
      tenantId: tenant.id,
      periodStart: period.start,
      periodEnd: period.end,
      currency: 'USD',
      amount: new Prisma.Decimal(2_200_000),
    },
  });
  for (const brand of brands) {
    await prisma.quota.create({
      data: {
        tenantId: tenant.id,
        brandId: brand.id,
        periodStart: period.start,
        periodEnd: period.end,
        currency: 'USD',
        amount: new Prisma.Decimal(440_000),
      },
    });
  }

  for (let index = 0; index < 40; index += 1) {
    const stage = stages[index % stages.length]!;
    const seller = sellers[index % sellers.length]!;
    const amount = 20_000 + index * 8_500;
    const marginPercent = [5, 8, 11, 14, 18][index % 5]!;
    const status =
      index % 13 === 0
        ? OpportunityStatus.LOST
        : stage.probability >= 90
          ? OpportunityStatus.WON
          : OpportunityStatus.OPEN;
    const forecastCategory =
      status === OpportunityStatus.WON
        ? ForecastCategory.CLOSED
        : stage.probability >= 80
          ? ForecastCategory.COMMIT
          : stage.probability >= 60
            ? ForecastCategory.BEST_CASE
            : ForecastCategory.PIPELINE;
    const externalReference = `DEMO-${String(index + 1).padStart(3, '0')}`;
    const expectedCloseDate = addDays(now, -55 + index * 4);
    const expectedBillingDate =
      stage.probability >= 80 && index % 7 !== 0 ? addDays(expectedCloseDate, 14) : null;
    const poNumber = stage.probability >= 90 && index % 2 === 1 ? `PO-DEMO-${index + 1}` : null;
    const opportunity = await prisma.opportunity.upsert({
      where: { tenantId_externalReference: { tenantId: tenant.id, externalReference } },
      update: {
        sellerId: seller.id,
        managerId: manager.id,
        customerId: customers[index % customers.length]!.id,
        partnerId: partners[index % partners.length]!.id,
        title: `${brands[index % brands.length]!.name} modernization initiative ${index + 1}`,
        status,
        stageId: stage.id,
        forecastCategory,
        estimatedAmount: amount,
        grossProfit: (amount * marginPercent) / 100,
        probability: stage.probability,
        expectedCloseDate,
        expectedBillingDate,
        poNumber,
        lastStageChangedAt: addDays(now, index % 9 === 0 ? -45 : -(index % 20)),
        deletedAt: null,
      },
      create: {
        tenantId: tenant.id,
        sellerId: seller.id,
        managerId: manager.id,
        customerId: customers[index % customers.length]!.id,
        partnerId: partners[index % partners.length]!.id,
        title: `${brands[index % brands.length]!.name} modernization initiative ${index + 1}`,
        status,
        stageId: stage.id,
        forecastCategory,
        currency: 'USD',
        estimatedAmount: amount,
        grossProfit: (amount * marginPercent) / 100,
        probability: stage.probability,
        expectedCloseDate,
        expectedBillingDate,
        poNumber,
        source: 'DEMO_SEED',
        externalReference,
        lastStageChangedAt: addDays(now, index % 9 === 0 ? -45 : -(index % 20)),
      },
    });
    await prisma.opportunityLineItem.deleteMany({ where: { opportunityId: opportunity.id } });
    await prisma.opportunityLineItem.create({
      data: {
        tenantId: tenant.id,
        opportunityId: opportunity.id,
        brandId: brands[index % brands.length]!.id,
        description: 'Synthetic product and services bundle',
        amount,
        cost: amount - (amount * marginPercent) / 100,
      },
    });
    if (!(await prisma.stageHistory.findFirst({ where: { opportunityId: opportunity.id } }))) {
      await prisma.stageHistory.create({
        data: {
          tenantId: tenant.id,
          opportunityId: opportunity.id,
          toStageId: stage.id,
          changedById: seller.id,
          reason: 'Synthetic demo seed',
        },
      });
    }
    const applicableCriteria = qualificationCriteria.filter(
      (criterion) => Number(criterion.gateCode) <= stage.probability,
    );
    for (const criterion of applicableCriteria) {
      await prisma.qualificationResponse.upsert({
        where: {
          opportunityId_criterionId: {
            opportunityId: opportunity.id,
            criterionId: criterion.id,
          },
        },
        update: {
          answer: 'YES',
          evidence: 'Synthetic UAT seed evidence',
          updatedById: seller.id,
        },
        create: {
          tenantId: tenant.id,
          opportunityId: opportunity.id,
          criterionId: criterion.id,
          answer: 'YES',
          evidence: 'Synthetic UAT seed evidence',
          updatedById: seller.id,
        },
      });
    }
    await prisma.alert.deleteMany({ where: { opportunityId: opportunity.id } });
    const alerts = [];
    if (stage.probability >= 90 && !poNumber) {
      alerts.push({
        code: 'MISSING_PO',
        severity: 'CRITICAL' as const,
        message: 'Purchase order is required at this stage',
      });
    }
    if (marginPercent < 10) {
      alerts.push({
        code: 'LOW_MARGIN',
        severity: 'WARNING' as const,
        message: 'Margin is below the tenant threshold',
      });
    }
    if (index % 9 === 0) {
      alerts.push({
        code: 'STAGE_STAGNATION',
        severity: 'WARNING' as const,
        message: 'Opportunity has remained more than 30 days in stage',
      });
    }
    if (alerts.length) {
      await prisma.alert.createMany({
        data: alerts.map((alert) => ({
          tenantId: tenant.id,
          opportunityId: opportunity.id,
          ...alert,
        })),
      });
    }
  }

  await prisma.billingRecord.deleteMany({ where: { tenantId: tenant.id } });
  const billedOpportunities = await prisma.opportunity.findMany({
    where: { tenantId: tenant.id, stage: { isBilled: true }, status: 'WON' },
  });
  for (const [index, opportunity] of billedOpportunities.entries()) {
    await prisma.billingRecord.create({
      data: {
        tenantId: tenant.id,
        opportunityId: opportunity.id,
        brandId: brands[index % brands.length]!.id,
        invoiceNumber: `INV-DEMO-${index + 1}`,
        amount: opportunity.estimatedAmount,
        grossProfit: opportunity.grossProfit,
        currency: 'USD',
        billedAt: addDays(period.start, 10 + index * 7),
        source: 'DEMO_SEED',
        externalReference: `BILLING-DEMO-${index + 1}`,
      },
    });
  }

  console.log(`Seeded tenant ${tenant.slug} with 40 synthetic opportunities.`);
  console.log('Demo admin: admin@techdistribution.demo');
  if (generatedPassword) console.log(`One-time generated demo password: ${password}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Seed failed');
  process.exitCode = 1;
});
