-- Phase 1 commercial domain: canonical stages, revenue attribution,
-- qualification evidence, durable review events, password recovery, and
-- future feature entitlements.

CREATE TYPE "QualificationAnswer" AS ENUM ('YES', 'NO', 'UNKNOWN');
CREATE TYPE "OpportunityReviewEventType" AS ENUM (
  'KEEP_COMMIT',
  'MOVE_BEST_CASE',
  'ASK_SELLER',
  'SELLER_RESPONSE',
  'MANAGER_NOTE',
  'GUIDED_ACTION',
  'OVERRIDE_QUALIFICATION'
);

ALTER TABLE "billing_records"
  ALTER COLUMN "opportunity_id" DROP NOT NULL,
  ADD COLUMN "brand_id" UUID,
  ADD COLUMN "gross_profit" DECIMAL(18,2),
  ADD COLUMN "source" TEXT NOT NULL DEFAULT 'MANUAL',
  ADD COLUMN "external_reference" TEXT;

CREATE TABLE "password_reset_tokens" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "token_hash" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "used_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "qualification_criteria" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "gate_code" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "label_en" TEXT NOT NULL,
  "label_es" TEXT NOT NULL,
  "description_en" TEXT,
  "description_es" TEXT,
  "required" BOOLEAN NOT NULL DEFAULT true,
  "evidence_required" BOOLEAN NOT NULL DEFAULT true,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "qualification_criteria_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "qualification_responses" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "opportunity_id" UUID NOT NULL,
  "criterion_id" UUID NOT NULL,
  "answer" "QualificationAnswer" NOT NULL DEFAULT 'UNKNOWN',
  "evidence" TEXT,
  "updated_by_id" UUID NOT NULL,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "qualification_responses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "opportunity_review_events" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "opportunity_id" UUID NOT NULL,
  "actor_id" UUID NOT NULL,
  "type" "OpportunityReviewEventType" NOT NULL,
  "target_user_id" UUID,
  "body" TEXT,
  "parent_event_id" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolved_at" TIMESTAMP(3),
  CONSTRAINT "opportunity_review_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tenant_feature_entitlements" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "feature_key" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "config" JSONB,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "tenant_feature_entitlements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key"
  ON "password_reset_tokens"("token_hash");
CREATE INDEX "password_reset_tokens_user_id_expires_at_idx"
  ON "password_reset_tokens"("user_id", "expires_at");
CREATE UNIQUE INDEX "qualification_criteria_tenant_id_gate_code_code_key"
  ON "qualification_criteria"("tenant_id", "gate_code", "code");
CREATE INDEX "qualification_criteria_tenant_id_gate_code_sort_order_idx"
  ON "qualification_criteria"("tenant_id", "gate_code", "sort_order");
CREATE UNIQUE INDEX "qualification_responses_opportunity_id_criterion_id_key"
  ON "qualification_responses"("opportunity_id", "criterion_id");
CREATE INDEX "qualification_responses_tenant_id_opportunity_id_idx"
  ON "qualification_responses"("tenant_id", "opportunity_id");
CREATE INDEX "opportunity_review_events_tenant_id_opportunity_id_created_at_idx"
  ON "opportunity_review_events"("tenant_id", "opportunity_id", "created_at");
CREATE INDEX "opportunity_review_events_tenant_id_target_user_id_resolved_at_idx"
  ON "opportunity_review_events"("tenant_id", "target_user_id", "resolved_at");
CREATE UNIQUE INDEX "tenant_feature_entitlements_tenant_id_feature_key_key"
  ON "tenant_feature_entitlements"("tenant_id", "feature_key");
CREATE INDEX "tenant_feature_entitlements_tenant_id_enabled_idx"
  ON "tenant_feature_entitlements"("tenant_id", "enabled");
CREATE UNIQUE INDEX "billing_records_tenant_id_external_reference_key"
  ON "billing_records"("tenant_id", "external_reference");
CREATE INDEX "billing_records_tenant_id_brand_id_billed_at_idx"
  ON "billing_records"("tenant_id", "brand_id", "billed_at");

ALTER TABLE "password_reset_tokens"
  ADD CONSTRAINT "password_reset_tokens_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "billing_records"
  ADD CONSTRAINT "billing_records_brand_id_fkey"
  FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "qualification_criteria"
  ADD CONSTRAINT "qualification_criteria_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "qualification_responses"
  ADD CONSTRAINT "qualification_responses_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "qualification_responses"
  ADD CONSTRAINT "qualification_responses_opportunity_id_fkey"
  FOREIGN KEY ("opportunity_id") REFERENCES "opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "qualification_responses"
  ADD CONSTRAINT "qualification_responses_criterion_id_fkey"
  FOREIGN KEY ("criterion_id") REFERENCES "qualification_criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "qualification_responses"
  ADD CONSTRAINT "qualification_responses_updated_by_id_fkey"
  FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "opportunity_review_events"
  ADD CONSTRAINT "opportunity_review_events_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "opportunity_review_events"
  ADD CONSTRAINT "opportunity_review_events_opportunity_id_fkey"
  FOREIGN KEY ("opportunity_id") REFERENCES "opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "opportunity_review_events"
  ADD CONSTRAINT "opportunity_review_events_actor_id_fkey"
  FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "opportunity_review_events"
  ADD CONSTRAINT "opportunity_review_events_target_user_id_fkey"
  FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "opportunity_review_events"
  ADD CONSTRAINT "opportunity_review_events_parent_event_id_fkey"
  FOREIGN KEY ("parent_event_id") REFERENCES "opportunity_review_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tenant_feature_entitlements"
  ADD CONSTRAINT "tenant_feature_entitlements_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Preserve stage identifiers whenever a tenant only has the legacy stage. If a
-- canonical target already exists, preserve all opportunity/history/snapshot
-- rows by moving their references before removing the redundant legacy row.
DO $migration$
DECLARE
  mapping record;
  legacy record;
  canonical_id uuid;
BEGIN
  FOR mapping IN
    SELECT * FROM (VALUES
      ('0',  '20', 'Prospecting',   20, 0, false, false),
      ('25', '40', 'Qualification', 40, 1, false, false),
      ('50', '60', 'Proposal',      60, 2, false, false),
      ('75', '80', 'Negotiation',   80, 3, false, false)
    ) AS definitions(old_code, new_code, canonical_name, probability, sort_order, is_closed_won, is_billed)
  LOOP
    FOR legacy IN SELECT id, tenant_id FROM stages WHERE code = mapping.old_code
    LOOP
      SELECT id INTO canonical_id
      FROM stages
      WHERE tenant_id = legacy.tenant_id AND code = mapping.new_code;

      IF canonical_id IS NULL THEN
        UPDATE stages
        SET code = mapping.new_code,
            name = mapping.canonical_name,
            probability = mapping.probability,
            sort_order = mapping.sort_order,
            is_closed_won = mapping.is_closed_won,
            is_billed = mapping.is_billed
        WHERE id = legacy.id;
      ELSE
        UPDATE opportunities SET stage_id = canonical_id WHERE stage_id = legacy.id;
        UPDATE stage_history SET from_stage_id = canonical_id WHERE from_stage_id = legacy.id;
        UPDATE stage_history SET to_stage_id = canonical_id WHERE to_stage_id = legacy.id;
        UPDATE forecast_snapshot_items SET stage_id = canonical_id WHERE stage_id = legacy.id;
        DELETE FROM stages WHERE id = legacy.id;
      END IF;
    END LOOP;
  END LOOP;
END
$migration$;

INSERT INTO stages (
  id, tenant_id, code, name, probability, sort_order, is_closed_won, is_billed, created_at
)
SELECT gen_random_uuid(), tenant.id, definition.code, definition.name,
       definition.probability, definition.sort_order,
       definition.is_closed_won, definition.is_billed, CURRENT_TIMESTAMP
FROM tenants AS tenant
CROSS JOIN (VALUES
  ('20',  'Prospecting',   20, 0, false, false),
  ('40',  'Qualification', 40, 1, false, false),
  ('60',  'Proposal',      60, 2, false, false),
  ('80',  'Negotiation',   80, 3, false, false),
  ('90',  'Closing',       90, 4, true,  false),
  ('100', 'Billed',       100, 5, true,  true)
) AS definition(code, name, probability, sort_order, is_closed_won, is_billed)
ON CONFLICT (tenant_id, code) DO UPDATE
SET probability = EXCLUDED.probability,
    sort_order = EXCLUDED.sort_order,
    is_closed_won = EXCLUDED.is_closed_won,
    is_billed = EXCLUDED.is_billed;

UPDATE opportunities AS opportunity
SET status = 'WON', forecast_category = 'CLOSED'
FROM stages AS stage
WHERE opportunity.stage_id = stage.id
  AND stage.code IN ('90', '100')
  AND opportunity.status NOT IN ('LOST', 'CANCELLED');

UPDATE opportunities AS opportunity
SET status = 'OPEN'
FROM stages AS stage
WHERE opportunity.stage_id = stage.id
  AND stage.code IN ('20', '40', '60', '80')
  AND opportunity.status = 'WON';

UPDATE opportunities AS opportunity
SET forecast_category = CASE stage.code
  WHEN '20' THEN 'PIPELINE'::"ForecastCategory"
  WHEN '40' THEN 'PIPELINE'::"ForecastCategory"
  WHEN '60' THEN 'BEST_CASE'::"ForecastCategory"
  ELSE opportunity.forecast_category
END
FROM stages AS stage
WHERE opportunity.stage_id = stage.id
  AND (
    (stage.code = '20' AND opportunity.forecast_category NOT IN ('PIPELINE', 'OMITTED')) OR
    (stage.code = '40' AND opportunity.forecast_category NOT IN ('PIPELINE', 'BEST_CASE', 'OMITTED')) OR
    (stage.code = '60' AND opportunity.forecast_category NOT IN ('PIPELINE', 'BEST_CASE', 'OMITTED'))
  );

-- Existing billed rows are attributed to a brand when their opportunity has a
-- single unambiguous brand. Multi-brand records remain opportunity-attributed.
UPDATE billing_records AS billing
SET brand_id = attribution.brand_id
FROM (
  SELECT opportunity_id, min(brand_id::text)::uuid AS brand_id
  FROM opportunity_line_items
  GROUP BY opportunity_id
  HAVING count(DISTINCT brand_id) = 1
) AS attribution
WHERE billing.opportunity_id = attribution.opportunity_id
  AND billing.brand_id IS NULL;

INSERT INTO qualification_criteria (
  id, tenant_id, gate_code, code, label_en, label_es,
  required, evidence_required, sort_order, enabled, created_at, updated_at
)
SELECT gen_random_uuid(), tenant.id, criterion.gate_code, criterion.code,
       criterion.label_en, criterion.label_es, true, true,
       criterion.sort_order, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tenants AS tenant
CROSS JOIN (VALUES
  ('60', 'BUDGET_CONFIRMED',              'Budget confirmed',                       'Presupuesto confirmado',                       10),
  ('60', 'BUSINESS_NEED_CONFIRMED',       'Business need confirmed',                'Necesidad de negocio confirmada',               20),
  ('60', 'DECISION_MAKER_IDENTIFIED',     'Decision maker identified',              'Decisor identificado',                          30),
  ('60', 'BUYING_PROCESS_UNDERSTOOD',     'Buying process understood',              'Proceso de compra entendido',                   40),
  ('60', 'KEY_STAKEHOLDER_ACCESS',        'Access to key stakeholders',             'Acceso a interesados clave',                    50),
  ('60', 'TARGET_DATE_EXISTS',            'Target date exists',                     'Existe fecha objetivo',                         60),
  ('60', 'TECHNICAL_SOLUTION_VALIDATED',  'Technical solution validated',           'Solución técnica validada',                     70),
  ('60', 'COMPETITION_IDENTIFIED',        'Competition identified',                 'Competencia identificada',                      80),
  ('80', 'FINAL_PROPOSAL_VALIDATED',      'Final proposal validated',               'Propuesta final validada',                      10),
  ('80', 'COMMERCIAL_TERMS_ACCEPTED',     'Commercial conditions accepted',         'Condiciones comerciales aceptadas',             20),
  ('80', 'PROCUREMENT_ALIGNED',           'Procurement aligned',                    'Compras alineadas',                             30),
  ('80', 'EXPECTED_ORDER_DATE_KNOWN',     'Expected order date known',              'Fecha esperada de orden conocida',              40),
  ('80', 'PO_PROCESS_CONFIRMED',          'PO expected or process confirmed',       'OC esperada o proceso confirmado',              50),
  ('80', 'PARTNER_READY',                 'Partner ready',                          'Canal listo',                                   60),
  ('80', 'COMMERCIAL_CREDIT_AVAILABLE',   'Commercial credit available',            'Crédito comercial disponible',                  70),
  ('80', 'FINANCE_VALIDATED',             'Internal finance validation completed',  'Validación financiera interna completada',      80),
  ('80', 'BILLING_DATE_REALISTIC',        'Billing date realistic',                 'Fecha de facturación realista',                 90)
) AS criterion(gate_code, code, label_en, label_es, sort_order)
ON CONFLICT (tenant_id, gate_code, code) DO UPDATE
SET label_en = EXCLUDED.label_en,
    label_es = EXCLUDED.label_es,
    sort_order = EXCLUDED.sort_order;

DO $rls$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'qualification_criteria',
    'qualification_responses',
    'opportunity_review_events',
    'tenant_feature_entitlements'
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
  qualification_criteria,
  qualification_responses,
  opportunity_review_events,
  tenant_feature_entitlements,
  password_reset_tokens
TO app_runtime;

