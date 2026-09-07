import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { RequestAuth } from '../../common/http/authenticated-request';
import { PrismaService } from '../../common/prisma/prisma.service';
import { requiredQualificationGates } from '../opportunities/commercial-domain';
import {
  parseCommercialWorkbook,
  publicImportPlan,
  type BillingImportRow,
  type OpportunityImportRow,
} from './commercial-import.parser';

export interface UploadedCommercialFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class ImportsService {
  constructor(private readonly prisma: PrismaService) {}

  async validate(file: UploadedCommercialFile) {
    this.assertFile(file);
    const plan = await this.parse(file);
    return publicImportPlan(plan);
  }

  async execute(file: UploadedCommercialFile, auth: RequestAuth, requestId: string) {
    this.assertFile(file);
    const plan = await this.parse(file);
    if (plan.summary.status === 'BLOCKED') {
      throw new BadRequestException({
        code: 'IMPORT_BLOCKED',
        message: 'The workbook has no importable source rows',
        validation: publicImportPlan(plan),
      });
    }
    const result = {
      ...plan.summary,
      imported: 0,
      opportunityImported: 0,
      billingImported: 0,
    };
    for (const row of plan.opportunities) {
      const outcome = await this.importOpportunity(auth.activeTenantId, auth.userId, row);
      if (outcome === 'IMPORTED') {
        result.imported += 1;
        result.opportunityImported += 1;
      } else if (outcome === 'DUPLICATE') {
        result.duplicates += 1;
      } else {
        result.blocked += 1;
      }
    }
    for (const row of plan.billing) {
      const outcome = await this.importBilling(auth.activeTenantId, row);
      if (outcome === 'IMPORTED') {
        result.imported += 1;
        result.billingImported += 1;
      } else if (outcome === 'DUPLICATE') {
        result.duplicates += 1;
      } else {
        result.blocked += 1;
      }
    }
    result.status =
      result.imported === 0 && result.blocked > 0
        ? 'BLOCKED'
        : result.blocked > 0 || result.warnings > 0
          ? 'WARNING'
          : 'READY';
    await this.prisma.withTenant(auth.activeTenantId, async (transaction) => {
      await transaction.auditEvent.create({
        data: {
          tenantId: auth.activeTenantId,
          actorId: auth.userId,
          action: 'COMMERCIAL_IMPORT_EXECUTED',
          entity: 'CommercialImport',
          requestId,
          metadata: {
            fileType: plan.fileType,
            sheets: plan.sheets.map((sheet) => ({
              name: sheet.name,
              disposition: sheet.disposition,
            })),
            rowsRead: result.rowsRead,
            imported: result.imported,
            warnings: result.warnings,
            blocked: result.blocked,
            duplicates: result.duplicates,
          },
        },
      });
    });
    return { fileType: plan.fileType, sheets: plan.sheets, summary: result };
  }

  private async importOpportunity(
    tenantId: string,
    actorId: string,
    row: OpportunityImportRow,
  ): Promise<'IMPORTED' | 'DUPLICATE' | 'BLOCKED'> {
    return this.prisma.withTenant(tenantId, async (transaction) => {
      const duplicate = await transaction.opportunity.findFirst({
        where: { tenantId, externalReference: row.externalReference },
        select: { id: true },
      });
      if (duplicate) return 'DUPLICATE';
      const [membership, stage] = await Promise.all([
        transaction.tenantMembership.findFirst({
          where: { tenantId, status: 'ACTIVE', user: { email: row.sellerEmail } },
          select: { userId: true },
        }),
        transaction.stage.findFirst({ where: { tenantId, code: row.stageCode } }),
      ]);
      if (!membership || !stage) return 'BLOCKED';
      const [customer, brand] = await Promise.all([
        transaction.customer.upsert({
          where: { tenantId_name: { tenantId, name: row.customer } },
          update: {},
          create: { tenantId, name: row.customer },
        }),
        transaction.brand.upsert({
          where: { tenantId_name: { tenantId, name: row.brand } },
          update: {},
          create: { tenantId, name: row.brand },
        }),
      ]);
      const partner = row.partner
        ? await transaction.partner.upsert({
            where: { tenantId_name: { tenantId, name: row.partner } },
            update: {},
            create: { tenantId, name: row.partner },
          })
        : null;
      const opportunity = await transaction.opportunity.create({
        data: {
          tenantId,
          sellerId: membership.userId,
          customerId: customer.id,
          partnerId: partner?.id,
          title: row.title,
          status: row.status,
          stageId: stage.id,
          forecastCategory: row.forecastCategory,
          currency: 'USD',
          estimatedAmount: new Prisma.Decimal(row.amount),
          grossProfit: row.grossProfit === null ? null : new Prisma.Decimal(row.grossProfit),
          probability: stage.probability,
          expectedCloseDate: row.expectedCloseDate,
          expectedBillingDate: row.expectedBillingDate,
          poNumber: row.poNumber || null,
          source: 'WORKBOOK_IMPORT',
          externalReference: row.externalReference,
          lineItems: {
            create: {
              tenantId,
              brandId: brand.id,
              description: `${row.brand} imported commercial line`,
              amount: new Prisma.Decimal(row.amount),
              cost:
                row.grossProfit === null ? null : new Prisma.Decimal(row.amount - row.grossProfit),
            },
          },
          stageHistory: {
            create: {
              tenantId,
              toStageId: stage.id,
              changedById: membership.userId,
              reason: `Commercial import ${row.sheet} row ${row.rowNumber}`,
            },
          },
        },
      });
      if (requiredQualificationGates(stage.code).length > 0) {
        await transaction.alert.create({
          data: {
            tenantId,
            opportunityId: opportunity.id,
            code: 'QUALIFICATION_INCOMPLETE',
            severity: 'HIGH',
            message: 'Imported opportunity requires qualification evidence review',
          },
        });
      }
      await transaction.auditEvent.create({
        data: {
          tenantId,
          actorId,
          action: 'OPPORTUNITY_IMPORTED',
          entity: 'Opportunity',
          entityId: opportunity.id,
          metadata: { sheet: row.sheet, rowNumber: row.rowNumber, stageCode: stage.code },
        },
      });
      return 'IMPORTED';
    });
  }

  private async importBilling(
    tenantId: string,
    row: BillingImportRow,
  ): Promise<'IMPORTED' | 'DUPLICATE' | 'BLOCKED'> {
    return this.prisma.withTenant(tenantId, async (transaction) => {
      const duplicate = await transaction.billingRecord.findFirst({
        where: { tenantId, externalReference: row.externalReference },
        select: { id: true },
      });
      if (duplicate) return 'DUPLICATE';
      const brand = await transaction.brand.upsert({
        where: { tenantId_name: { tenantId, name: row.brand } },
        update: {},
        create: { tenantId, name: row.brand },
      });
      await transaction.billingRecord.create({
        data: {
          tenantId,
          brandId: brand.id,
          invoiceNumber: row.invoiceNumber || null,
          amount: new Prisma.Decimal(row.amount),
          grossProfit: row.grossProfit === null ? null : new Prisma.Decimal(row.grossProfit),
          currency: row.currency,
          billedAt: row.billedAt,
          source: 'FACTURADO_DAILY_IMPORT',
          externalReference: row.externalReference,
        },
      });
      return 'IMPORTED';
    });
  }

  private assertFile(file: UploadedCommercialFile): void {
    if (!file?.buffer?.length) throw new BadRequestException('A non-empty file is required');
    if (file.size > 10 * 1024 * 1024) throw new BadRequestException('File exceeds the 10 MB limit');
    if (!/\.(csv|xlsx)$/i.test(file.originalname)) {
      throw new BadRequestException('Only .csv and .xlsx files are supported');
    }
  }

  private async parse(file: UploadedCommercialFile) {
    try {
      return await parseCommercialWorkbook(file.originalname, file.buffer);
    } catch {
      throw new BadRequestException({
        code: 'IMPORT_FILE_INVALID',
        message: 'The file is not a readable CSV or XLSX workbook',
      });
    }
  }
}
