import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCriterionDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsBoolean()
  evidenceRequired?: boolean;
}
