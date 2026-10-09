-- Edgar manager dashboard: traceable weekly imports, minimal customer visits,
-- configurable working rules, and line-level commercial classification.

CREATE TYPE "CommercialImportBatchStatus" AS ENUM ('PROCESSING', 'PUBLISHED', 'PARTIAL', 'FAILED');
CREATE TYPE "BillingImportMode" AS ENUM ('TRANSACTION', 'CUMULATIVE');

ALTER TABLE "tenant_settings"
  ADD COLUMN "stalled_opportunity_days" INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN "weekly_visit_target" INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN "pipeline_coverage_ratio" DECIMAL(5,2) NOT NULL DEFAULT 4;

ALTER TABLE "opportunity_line_items"
  ADD COLUMN "business_unit" TEXT,
  ADD COLUMN "product_line" TEXT;

ALTER TABLE "billing_records"
  ADD COLUMN "import_mode" "BillingImportMode" NOT NULL DEFAULT 'TRANSACTION',
  ADD COLUMN "import_batch_id" UUID;

CREATE TABLE "customer_visits" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "seller_id" UUID NOT NULL,
  "customer_id" UUID NOT NULL,
  "opportunity_id" UUID,
  "recorded_by_id" UUID NOT NULL,
  "visited_at" DATE NOT NULL,
  "found_opportunity" BOOLEAN NOT NULL,
  "idempotency_key" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "customer_visits_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "commercial_import_batches" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "created_by_id" UUID NOT NULL,
  "file_hash" TEXT NOT NULL,
  "source_cutoff" DATE,
  "status" "CommercialImportBatchStatus" NOT NULL,
  "is_partial" BOOLEAN NOT NULL DEFAULT false,
  "summary" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "commercial_import_batches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "opportunity_source_presence" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "batch_id" UUID NOT NULL,
  "opportunity_id" UUID NOT NULL,
  "source_row" INTEGER NOT NULL,
  CONSTRAINT "opportunity_source_presence_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "customer_visits_tenant_id_idempotency_key_key"
  ON "customer_visits"("tenant_id", "idempotency_key");
CREATE INDEX "customer_visits_tenant_id_seller_id_visited_at_idx"
  ON "customer_visits"("tenant_id", "seller_id", "visited_at");
CREATE INDEX "customer_visits_tenant_id_opportunity_id_idx"
  ON "customer_visits"("tenant_id", "opportunity_id");
CREATE UNIQUE INDEX "commercial_import_batches_tenant_id_file_hash_key"
  ON "commercial_import_batches"("tenant_id", "file_hash");
CREATE INDEX "commercial_import_batches_tenant_id_created_at_idx"
  ON "commercial_import_batches"("tenant_id", "created_at");
CREATE UNIQUE INDEX "opportunity_source_presence_batch_id_opportunity_id_key"
  ON "opportunity_source_presence"("batch_id", "opportunity_id");
CREATE INDEX "opportunity_source_presence_tenant_id_opportunity_id_idx"
  ON "opportunity_source_presence"("tenant_id", "opportunity_id");

ALTER TABLE "billing_records"
  ADD CONSTRAINT "billing_records_import_batch_id_fkey"
  FOREIGN KEY ("import_batch_id") REFERENCES "commercial_import_batches"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "customer_visits"
  ADD CONSTRAINT "customer_visits_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_visits"
  ADD CONSTRAINT "customer_visits_seller_id_fkey"
  FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "customer_visits"
  ADD CONSTRAINT "customer_visits_customer_id_fkey"
  FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "customer_visits"
  ADD CONSTRAINT "customer_visits_opportunity_id_fkey"
  FOREIGN KEY ("opportunity_id") REFERENCES "opportunities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "customer_visits"
  ADD CONSTRAINT "customer_visits_recorded_by_id_fkey"
  FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "commercial_import_batches"
  ADD CONSTRAINT "commercial_import_batches_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "commercial_import_batches"
  ADD CONSTRAINT "commercial_import_batches_created_by_id_fkey"
  FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "opportunity_source_presence"
  ADD CONSTRAINT "opportunity_source_presence_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "opportunity_source_presence"
  ADD CONSTRAINT "opportunity_source_presence_batch_id_fkey"
  FOREIGN KEY ("batch_id") REFERENCES "commercial_import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "opportunity_source_presence"
  ADD CONSTRAINT "opportunity_source_presence_opportunity_id_fkey"
  FOREIGN KEY ("opportunity_id") REFERENCES "opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DO $rls$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'customer_visits',
    'commercial_import_batches',
    'opportunity_source_presence'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', table_name);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I USING (tenant_id = nullif(current_setting(''app.current_tenant_id'', true), '''')::uuid) WITH CHECK (tenant_id = nullif(current_setting(''app.current_tenant_id'', true), '''')::uuid)',
      table_name
    );
  END LOOP;
END
$rls$;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  "customer_visits",
  "commercial_import_batches",
  "opportunity_source_presence"
TO app_runtime;

-- Import evidence is append-only from the application role.
REVOKE DELETE ON "commercial_import_batches" FROM app_runtime;
REVOKE UPDATE, DELETE ON "opportunity_source_presence" FROM app_runtime;
