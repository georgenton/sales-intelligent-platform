import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNumberString,
  IsOptional,
  IsUUID,
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
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => SellerQuotaDto)
  sellerQuotas?: SellerQuotaDto[];
}
