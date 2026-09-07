-- Existing snapshots were created as tenant-wide records before explicit snapshot scope existed.
CREATE TYPE "ForecastSnapshotScopeType" AS ENUM ('TENANT', 'TEAM', 'OWN');

ALTER TABLE "forecast_snapshots"
  ADD COLUMN "scope_type" "ForecastSnapshotScopeType" NOT NULL DEFAULT 'TENANT',
  ADD COLUMN "scope_user_id" UUID;

ALTER TABLE "forecast_snapshots"
  ADD CONSTRAINT "forecast_snapshots_scope_check"
  CHECK (
    ("scope_type" = 'TENANT' AND "scope_user_id" IS NULL)
    OR
    ("scope_type" IN ('TEAM', 'OWN') AND "scope_user_id" IS NOT NULL)
  );

CREATE INDEX "forecast_snapshots_tenant_id_scope_type_scope_user_id_created_at_idx"
  ON "forecast_snapshots"("tenant_id", "scope_type", "scope_user_id", "created_at");
