import { IsInt, IsNumberString, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class UpdateCommercialSettingsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  fiscalYearStartMonth?: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsOptional()
  @IsNumberString()
  defaultMarginThreshold?: string;
}
