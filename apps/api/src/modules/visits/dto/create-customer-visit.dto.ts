import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCustomerVisitDto {
  @IsUUID()
  sellerId!: string;

  @IsUUID()
  customerId!: string;

  @IsDateString({ strict: true })
  visitedAt!: string;

  @IsBoolean()
  foundOpportunity!: boolean;

  @IsOptional()
  @IsUUID()
  opportunityId?: string;

  @IsString()
  @MinLength(12)
  @MaxLength(120)
  idempotencyKey!: string;
}
