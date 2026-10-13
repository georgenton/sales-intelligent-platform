import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class BrandQuotaDto {
  @IsUUID()
  brandId!: string;

  @IsNumberString()
  amount!: string;
}

export class SellerQuotaDto {
  @IsUUID()
  sellerId!: string;

  @IsNumberString()
  amount!: string;
}

export class LineQuotaDto {
  @IsUUID()
  brandId!: string;

  @IsString()
  @MaxLength(120)
  line!: string;

  @IsNumberString()
  amount!: string;
}

export class UpdateQuotasDto {
  @IsOptional()
  @IsNumberString()
  totalQuota?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => BrandQuotaDto)
  brandQuotas?: BrandQuotaDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => LineQuotaDto)
  lineQuotas?: LineQuotaDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => SellerQuotaDto)
  sellerQuotas?: SellerQuotaDto[];
}
