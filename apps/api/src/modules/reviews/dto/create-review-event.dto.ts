import { OpportunityReviewEventType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateReviewEventDto {
  @IsUUID()
  opportunityId!: string;

  @IsEnum(OpportunityReviewEventType)
  type!: OpportunityReviewEventType;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(2_000)
  body?: string;

  @IsOptional()
  @IsUUID()
  parentEventId?: string;
}
