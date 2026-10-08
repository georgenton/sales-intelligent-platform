import { createHash, randomUUID } from 'node:crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { RequestAuth } from '../../common/http/authenticated-request';
import { PrismaService } from '../../common/prisma/prisma.service';
import { requiredQualificationGates } from '../opportunities/commercial-domain';
import {
  analyzeCommercialWorkbook,
  parseCommercialWorkbook,
  publicImportPlan,
  type BillingImportRow,
  type CommercialImportContext,
  type ConfirmedImportMapping,
  type OpportunityImportRow,
} from './commercial-import.parser';

export interface UploadedCommercialFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface ImportRequestFields {
  mapping?: string;
  asOfDate?: string;
  sourceCutoff?: string;
  billingMode?: string;
  sourceCompleteness?: string;
}

type Transaction = Prisma.TransactionClient;
type ImportOutcome = { status: 'ADDED' | 'CHANGED' | 'UNCHANGED' | 'REJECTED'; id?: string };

const decimal = (value: Prisma.Decimal | null | undefined): number | null =>
  value === null || value === undefined ? null : value.toNumber();

@Injectable()
export class ImportsService {
  constructor(private readonly prisma: PrismaService) {}

  async analyze(file: UploadedCommercialFile) {
    this.assertFile(file);
    try {
      return await analyzeCommercialWorkbook(file.originalname, file.buffer);
    } catch {
      throw new BadRequestException({
        code: 'IMPORT_FILE_INVALID',
        message: 'The file is not a readable CSV or XLSX workbook',
      });
    }
  }

  async validate(file: UploadedCommercialFile, fields: ImportRequestFields) {
    this.assertFile(file);
    const plan = await this.parse(file, this.parseContext(fields));
    return publicImportPlan(plan);
  }

  async execute(
    file: UploadedCommercialFile,
    fields: ImportRequestFields,
    auth: RequestAuth,
    requestId: string,
  ) {
    this.assertFile(file);
    const context = this.parseContext(fields);
    const plan = await this.parse(file, context);
    if (plan.summary.ready === 0) {
      throw new BadRequestException({
        code: 'IMPORT_BLOCKED',
        message: 'The workbook has no importable source rows',
        validation: publicImportPlan(plan),
      });
    }
    const sourceCutoff = this.parseDate(fields.sourceCutoff ?? fields.asOfDate, 'sourceCutoff');
    const explicitlyPartial = fields.sourceCompleteness === 'PARTIAL';
    const fileHash = createHash('sha256')
      .update(file.buffer)
      .update(
        JSON.stringify({
          mappings: context.mappings,
          asOfDate: context.asOfDate?.toISOString() ?? null,
          billingMode: context.billingMode,
          sourceCutoff: sourceCutoff?.toISOString() ?? null,
          explicitlyPartial,
        }),
      )
      .digest('hex');

    return this.prisma.withTenant(auth.activeTenantId, async (transaction) => {
      const existingBatch = await transaction.commercialImportBatch.findUnique({
        where: { tenantId_fileHash: { tenantId: auth.activeTenantId, fileHash } },
      });
      if (existingBatch) {
        return {
          fileType: plan.fileType,
          sheets: plan.sheets,
          summary: existingBatch.summary,
          batch: {
            id: existingBatch.id,
            status: existingBatch.status,
            sourceCutoff: existingBatch.sourceCutoff,
            reused: true,
          },
        };
      }
      const previousBatch = await transaction.commercialImportBatch.findFirst({
        where: { tenantId: auth.activeTenantId, status: 'PUBLISHED' },
        include: { sourcePresence: { select: { opportunityId: true } } },
        orderBy: { createdAt: 'desc' },
      });
      const batchId = randomUUID();
      await transaction.commercialImportBatch.create({
        data: {
          id: batchId,
          tenantId: auth.activeTenantId,
          createdById: auth.userId,
          fileHash,
          sourceCutoff,
          status: 'PROCESSING',
          isPartial: true,
          summary: plan.summary,
        },
      });
      const result = {
        status: 'PUBLISHED' as 'PUBLISHED' | 'PARTIAL',
        rowsRead: plan.summary.rowsRead,
        ready: plan.summary.ready,
        warnings: plan.summary.warnings,
        blocked: plan.summary.blocked,
        duplicates: plan.summary.duplicates,
        added: 0,
        changed: 0,
        unchanged: 0,
        pending: plan.summary.pending,
        rejected: plan.summary.blocked,
        missingFromLatest: 0,
        opportunityProcessed: 0,
        billingProcessed: 0,
      };
      const presentOpportunityIds = new Set<string>();
      for (const row of plan.opportunities) {
        const outcome = await this.importOpportunity(
          transaction,
          auth.activeTenantId,
          auth.userId,
          row,
        );
        this.countOutcome(result, outcome);
        if (outcome.id) {
          presentOpportunityIds.add(outcome.id);
          result.opportunityProcessed += 1;
          await transaction.opportunitySourcePresence.create({
            data: {
              tenantId: auth.activeTenantId,
              batchId,
              opportunityId: outcome.id,
              sourceRow: row.rowNumber,
            },
          });
        }
      }
      for (const row of plan.billing) {
        const outcome = await this.importBilling(
          transaction,
          auth.activeTenantId,
          auth.userId,
          batchId,
          row,
        );
        this.countOutcome(result, outcome);
        if (outcome.status !== 'REJECTED') result.billingProcessed += 1;
      }
      if (previousBatch) {
        result.missingFromLatest = previousBatch.sourcePresence.filter(
          (item) => !presentOpportunityIds.has(item.opportunityId),
        ).length;
      }
      const partial =
        explicitlyPartial || result.pending > 0 || result.rejected > 0 || plan.summary.warnings > 0;
      result.status = partial ? 'PARTIAL' : 'PUBLISHED';
      await transaction.commercialImportBatch.update({
        where: { id: batchId },
        data: { status: result.status, isPartial: partial, summary: result },
      });
      await transaction.auditEvent.create({
        data: {
          tenantId: auth.activeTenantId,
          actorId: auth.userId,
          action: 'COMMERCIAL_IMPORT_EXECUTED',
          entity: 'CommercialImportBatch',
          entityId: batchId,
          requestId,
          metadata: {
            fileType: plan.fileType,
            sheets: plan.sheets.map((sheet) => ({
              name: sheet.name,
              disposition: sheet.disposition,
            })),
            sourceCutoff: sourceCutoff?.toISOString().slice(0, 10) ?? null,
            ...result,
          },
        },
      });
      return {
        fileType: plan.fileType,
        sheets: plan.sheets,
        summary: result,
        batch: { id: batchId, status: result.status, sourceCutoff, reused: false },
      };
    });
  }

  private async importOpportunity(
    transaction: Transaction,
    tenantId: string,
    actorId: string,
    row: OpportunityImportRow,
  ): Promise<ImportOutcome> {
    const existing = await transaction.opportunity.findFirst({
      where: { tenantId, externalReference: row.externalReference },
      include: { stage: true, lineItems: true },
    });
    const [seller, manager, stage] = await Promise.all([
      transaction.tenantMembership.findFirst({
        where: {
          tenantId,
          status: 'ACTIVE',
          role: 'SELLER',
          user: { email: row.sellerEmail },
        },
        select: { userId: true },
      }),
      row.managerEmail
        ? transaction.tenantMembership.findFirst({
            where: {
              tenantId,
              status: 'ACTIVE',
              role: 'MANAGER',
              user: { email: row.managerEmail },
            },
            select: { userId: true },
          })
        : Promise.resolve(null),
      transaction.stage.findFirst({ where: { tenantId, code: row.stageCode } }),
    ]);
    const managerId = manager?.userId ?? existing?.managerId ?? null;
    if (!seller || !stage || !managerId) return { status: 'REJECTED' };
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
    if (existing) {
      const importedLine = existing.lineItems[0];
      const changed =
        existing.title !== row.title ||
        existing.sellerId !== seller.userId ||
        existing.managerId !== managerId ||
        existing.customerId !== customer.id ||
        existing.partnerId !== (partner?.id ?? null) ||
        existing.stageId !== stage.id ||
        decimal(existing.estimatedAmount) !== row.amount ||
        decimal(existing.grossProfit) !== row.grossProfit ||
        existing.expectedCloseDate.getTime() !== row.expectedCloseDate.getTime() ||
        existing.expectedBillingDate?.getTime() !== row.expectedBillingDate?.getTime() ||
        Boolean(
          importedLine &&
          (importedLine.brandId !== brand.id ||
            decimal(importedLine.amount) !== row.amount ||
            importedLine.businessUnit !== row.businessUnit ||
            importedLine.productLine !== row.productLine),
        );
      if (!changed) return { status: 'UNCHANGED', id: existing.id };
      const stageChanged = existing.stageId !== stage.id;
      await transaction.opportunity.update({
        where: { id: existing.id },
        data: {
          sellerId: seller.userId,
          managerId,
          customerId: customer.id,
          partnerId: partner?.id ?? null,
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
          ...(stageChanged ? { lastStageChangedAt: new Date() } : {}),
        },
      });
      if (importedLine) {
        await transaction.opportunityLineItem.update({
          where: { id: importedLine.id },
          data: {
            brandId: brand.id,
            description: `${row.brand} imported commercial line`,
            businessUnit: row.businessUnit,
            productLine: row.productLine,
            amount: new Prisma.Decimal(row.amount),
            cost:
              row.grossProfit === null ? null : new Prisma.Decimal(row.amount - row.grossProfit),
          },
        });
      } else {
        await transaction.opportunityLineItem.create({
          data: {
            tenantId,
            opportunityId: existing.id,
            brandId: brand.id,
            description: `${row.brand} imported commercial line`,
            businessUnit: row.businessUnit,
            productLine: row.productLine,
            amount: new Prisma.Decimal(row.amount),
            cost:
              row.grossProfit === null ? null : new Prisma.Decimal(row.amount - row.grossProfit),
          },
        });
      }
      if (stageChanged) {
        await transaction.stageHistory.create({
          data: {
            tenantId,
            opportunityId: existing.id,
            fromStageId: existing.stageId,
            toStageId: stage.id,
            changedById: actorId,
            reason: `Commercial import ${row.sheet} row ${row.rowNumber}`,
          },
        });
      }
      await transaction.auditEvent.create({
        data: {
          tenantId,
          actorId,
          action: 'OPPORTUNITY_IMPORT_UPDATED',
          entity: 'Opportunity',
          entityId: existing.id,
          metadata: { sheet: row.sheet, rowNumber: row.rowNumber, stageChanged },
        },
      });
      return { status: 'CHANGED', id: existing.id };
    }

    const opportunity = await transaction.opportunity.create({
      data: {
        tenantId,
        sellerId: seller.userId,
        managerId,
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
            businessUnit: row.businessUnit,
            productLine: row.productLine,
            amount: new Prisma.Decimal(row.amount),
            cost:
              row.grossProfit === null ? null : new Prisma.Decimal(row.amount - row.grossProfit),
          },
        },
        stageHistory: {
          create: {
            tenantId,
            toStageId: stage.id,
            changedById: actorId,
            reason: `Commercial import ${row.sheet} row ${row.rowNumber}`,
          },
        },
      },
    });
    if (requiredQualificationGates(stage.code).length > 0) {
      await transaction.alert.upsert({
        where: {
          tenantId_opportunityId_code: {
            tenantId,
            opportunityId: opportunity.id,
            code: 'QUALIFICATION_INCOMPLETE',
          },
        },
        update: { resolvedAt: null },
        create: {
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
    return { status: 'ADDED', id: opportunity.id };
  }

  private async importBilling(
    transaction: Transaction,
    tenantId: string,
    actorId: string,
    batchId: string,
    row: BillingImportRow,
  ): Promise<ImportOutcome> {
    const existing = await transaction.billingRecord.findFirst({
      where: { tenantId, externalReference: row.externalReference },
    });
    const opportunity = row.opportunityExternalReference
      ? await transaction.opportunity.findFirst({
          where: { tenantId, externalReference: row.opportunityExternalReference, deletedAt: null },
          include: { stage: true },
        })
      : null;
    if (row.opportunityExternalReference && !opportunity) return { status: 'REJECTED' };
    const brand = await transaction.brand.upsert({
      where: { tenantId_name: { tenantId, name: row.brand } },
      update: {},
      create: { tenantId, name: row.brand },
    });
    let billingId: string;
    let status: ImportOutcome['status'];
    if (existing) {
      const changed =
        row.importMode === 'CUMULATIVE' &&
        (decimal(existing.amount) !== row.amount ||
          decimal(existing.grossProfit) !== row.grossProfit ||
          existing.billedAt.getTime() !== row.billedAt.getTime());
      if (!changed) return { status: 'UNCHANGED', id: existing.id };
      const updated = await transaction.billingRecord.update({
        where: { id: existing.id },
        data: {
          amount: new Prisma.Decimal(row.amount),
          grossProfit: row.grossProfit === null ? null : new Prisma.Decimal(row.grossProfit),
          billedAt: row.billedAt,
          brandId: brand.id,
          opportunityId: opportunity?.id ?? existing.opportunityId,
          importBatchId: batchId,
        },
      });
      billingId = updated.id;
      status = 'CHANGED';
    } else {
      const billing = await transaction.billingRecord.create({
        data: {
          tenantId,
          opportunityId: opportunity?.id,
          brandId: brand.id,
          invoiceNumber: row.invoiceNumber || null,
          amount: new Prisma.Decimal(row.amount),
          grossProfit: row.grossProfit === null ? null : new Prisma.Decimal(row.grossProfit),
          currency: row.currency,
          billedAt: row.billedAt,
          source: 'FACTURADO_DAILY_IMPORT',
          externalReference: row.externalReference,
          importMode: row.importMode,
          importBatchId: batchId,
        },
      });
      billingId = billing.id;
      status = 'ADDED';
    }
    if (opportunity?.stage.code === '90' && opportunity.status === 'WON') {
      const aggregate = await transaction.billingRecord.aggregate({
        where: { tenantId, opportunityId: opportunity.id },
        _sum: { amount: true },
      });
      if ((aggregate._sum.amount?.toNumber() ?? 0) >= opportunity.estimatedAmount.toNumber()) {
        const billedStage = await transaction.stage.findFirst({ where: { tenantId, code: '100' } });
        if (billedStage) {
          await transaction.opportunity.update({
            where: { id: opportunity.id },
            data: {
              stageId: billedStage.id,
              status: 'WON',
              forecastCategory: 'CLOSED',
              probability: billedStage.probability,
              lastStageChangedAt: new Date(),
            },
          });
          await transaction.stageHistory.create({
            data: {
              tenantId,
              opportunityId: opportunity.id,
              fromStageId: opportunity.stageId,
              toStageId: billedStage.id,
              changedById: actorId,
              reason: `Billing fully confirmed by ${row.sheet} import`,
            },
          });
        }
      }
    }
    await transaction.auditEvent.create({
      data: {
        tenantId,
        actorId,
        action: status === 'ADDED' ? 'BILLING_RECORD_IMPORTED' : 'BILLING_CUMULATIVE_UPDATED',
        entity: 'BillingRecord',
        entityId: billingId,
        metadata: {
          source: 'FACTURADO_DAILY_IMPORT',
          opportunityLinked: Boolean(opportunity),
          importMode: row.importMode,
        },
      },
    });
    return { status, id: billingId };
  }

  private countOutcome(
    result: { added: number; changed: number; unchanged: number; rejected: number },
    outcome: ImportOutcome,
  ): void {
    if (outcome.status === 'ADDED') result.added += 1;
    else if (outcome.status === 'CHANGED') result.changed += 1;
    else if (outcome.status === 'UNCHANGED') result.unchanged += 1;
    else result.rejected += 1;
  }

  private assertFile(file: UploadedCommercialFile): void {
    if (!file?.buffer?.length) throw new BadRequestException('A non-empty file is required');
    if (file.size > 10 * 1024 * 1024) throw new BadRequestException('File exceeds the 10 MB limit');
    if (!/\.(csv|xlsx)$/i.test(file.originalname)) {
      throw new BadRequestException('Only .csv and .xlsx files are supported');
    }
  }

  private parseContext(fields: ImportRequestFields = {}): CommercialImportContext {
    let mappings: ConfirmedImportMapping[] = [];
    try {
      const parsed = JSON.parse(fields.mapping ?? '[]') as unknown;
      if (!Array.isArray(parsed) || parsed.length > 500) throw new Error('Invalid mapping array');
      mappings = parsed.map((item) => {
        if (!item || typeof item !== 'object') throw new Error('Invalid mapping item');
        const candidate = item as Record<string, unknown>;
        if (
          typeof candidate.sheet !== 'string' ||
          !candidate.sheet.trim() ||
          candidate.sheet.length > 100 ||
          typeof candidate.sourceColumn !== 'string' ||
          !candidate.sourceColumn.trim() ||
          candidate.sourceColumn.length > 200 ||
          (candidate.destinationField !== null && typeof candidate.destinationField !== 'string') ||
          typeof candidate.confirmed !== 'boolean'
        ) {
          throw new Error('Invalid mapping item');
        }
        return {
          sheet: candidate.sheet,
          sourceColumn: candidate.sourceColumn,
          destinationField: candidate.destinationField,
          confirmed: candidate.confirmed,
        };
      });
    } catch {
      throw new BadRequestException({
        code: 'IMPORT_MAPPING_INVALID',
        message: 'A valid confirmed column mapping is required',
      });
    }
    const asOfDate = this.parseDate(fields.asOfDate, 'asOfDate');
    const billingMode =
      fields.billingMode === 'TRANSACTION' || fields.billingMode === 'CUMULATIVE'
        ? fields.billingMode
        : null;
    if (fields.billingMode && !billingMode) {
      throw new BadRequestException({
        code: 'IMPORT_BILLING_MODE_INVALID',
        message: 'billingMode must be TRANSACTION or CUMULATIVE',
      });
    }
    if (fields.sourceCompleteness && !['COMPLETE', 'PARTIAL'].includes(fields.sourceCompleteness)) {
      throw new BadRequestException({
        code: 'IMPORT_SOURCE_COMPLETENESS_INVALID',
        message: 'sourceCompleteness must be COMPLETE or PARTIAL',
      });
    }
    return { mappings, asOfDate, billingMode };
  }

  private parseDate(value: string | undefined, field: string): Date | null {
    if (!value) return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new BadRequestException({
        code: field === 'asOfDate' ? 'IMPORT_AS_OF_DATE_INVALID' : 'IMPORT_SOURCE_CUTOFF_INVALID',
        message: `${field} must use YYYY-MM-DD`,
      });
    }
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
      throw new BadRequestException({
        code: field === 'asOfDate' ? 'IMPORT_AS_OF_DATE_INVALID' : 'IMPORT_SOURCE_CUTOFF_INVALID',
        message: `${field} must be a real calendar date`,
      });
    }
    return date;
  }

  private async parse(file: UploadedCommercialFile, context: CommercialImportContext) {
    try {
      return await parseCommercialWorkbook(file.originalname, file.buffer, context);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException({
        code: 'IMPORT_FILE_INVALID',
        message: 'The file is not a readable CSV or XLSX workbook',
      });
    }
  }
}
