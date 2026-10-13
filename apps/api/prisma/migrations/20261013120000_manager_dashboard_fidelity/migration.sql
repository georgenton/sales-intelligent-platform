-- Preserve the commercial dimensions used at each weekly cutoff and allow
-- explicitly configured line quotas without redistributing parent quotas.

ALTER TABLE "quotas"
  ADD COLUMN "product_line" TEXT;

ALTER TABLE "forecast_snapshot_items"
  ADD COLUMN "seller_id" UUID,
  ADD COLUMN "commercial_dimensions" JSONB;

CREATE INDEX "quotas_tenant_id_brand_id_product_line_idx"
  ON "quotas"("tenant_id", "brand_id", "product_line");
