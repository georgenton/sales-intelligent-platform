import { IsDateString, IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ManagerDashboardQueryDto {
  @IsOptional()
  @IsIn(['current', 'next'])
  period: 'current' | 'next' = 'current';

  @IsOptional()
  @IsUUID()
  brandId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  line?: string;

  @IsOptional()
  @IsUUID()
  sellerId?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  weekStart?: string;
}
