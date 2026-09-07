import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ForecastCategory, OpportunityStatus } from '@prisma/client';

export class OpportunityLineItemDto {
  @IsUUID()
  brandId!: string;

  @IsString()
  @MaxLength(300)
  description!: string;

  @IsNumberString()
  amount!: string;

  @IsOptional()
  @IsNumberString()
  cost?: string;
}

export class CreateOpportunityDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsUUID()
  sellerId?: string;

  @IsOptional()
  @IsUUID()
  managerId?: string;

  @IsUUID()
  customerId!: string;

  @IsOptional()
  @IsUUID()
  partnerId?: string;

  @IsUUID()
  stageId!: string;

  @IsOptional()
  @IsEnum(OpportunityStatus)
  status?: OpportunityStatus;

  @IsOptional()
  @IsEnum(ForecastCategory)
  forecastCategory?: ForecastCategory;

  @IsString()
  @Length(3, 3)
  currency = 'USD';

  @IsNumberString()
  estimatedAmount!: string;

  @IsOptional()
  @IsNumberString()
  grossProfit?: string;

  @IsOptional()
  @IsNumberString()
  grossMarginPercent?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  probability?: number;

  @IsDateString()
  expectedCloseDate!: string;

  @IsOptional()
  @IsDateString()
  expectedBillingDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  poNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5_000)
  notes?: string;

  @IsOptional()
  @IsString()
  @Length(10, 500)
  qualificationOverrideReason?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => OpportunityLineItemDto)
  lineItems: OpportunityLineItemDto[] = [];
}
