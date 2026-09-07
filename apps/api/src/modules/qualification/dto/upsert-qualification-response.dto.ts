import { QualificationAnswer } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpsertQualificationResponseDto {
  @IsUUID()
  criterionId!: string;

  @IsEnum(QualificationAnswer)
  answer!: QualificationAnswer;

  @IsOptional()
  @IsString()
  @MaxLength(2_000)
  evidence?: string;
}
