-- Phase 1 contractual corrections: stage/category compatibility and billing
-- source-of-truth reconciliation. This migration is forward-only so it is
-- safe even if the original Phase 1 migration was applied outside staging.

UPDATE opportunities AS opportunity
SET forecast_category = 'PIPELINE'::"ForecastCategory",
    updated_at = CURRENT_TIMESTAMP
FROM stages AS stage
WHERE opportunity.stage_id = stage.id
  AND stage.code = '40'
  AND opportunity.forecast_category = 'BEST_CASE';

-- Stage 100 is an observed billed outcome. Preserve real linked billing facts,
-- but move any unsupported stage-100 row back to Closing instead of fabricating
-- a BillingRecord. Record the correction in stage history before changing it.
INSERT INTO stage_history (
  id,
  tenant_id,
  opportunity_id,
  from_stage_id,
  to_stage_id,
  changed_by_id,
  reason,
  changed_at
)
SELECT
  gen_random_uuid(),
  opportunity.tenant_id,
  opportunity.id,
  billed_stage.id,
  closing_stage.id,
  opportunity.seller_id,
  'Phase 1 billing source-of-truth reconciliation',
  CURRENT_TIMESTAMP
FROM opportunities AS opportunity
JOIN stages AS billed_stage
  ON billed_stage.id = opportunity.stage_id
 AND billed_stage.code = '100'
JOIN stages AS closing_stage
  ON closing_stage.tenant_id = opportunity.tenant_id
 AND closing_stage.code = '90'
WHERE opportunity.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM billing_records AS billing
    WHERE billing.tenant_id = opportunity.tenant_id
      AND billing.opportunity_id = opportunity.id
  );

UPDATE opportunities AS opportunity
SET stage_id = closing_stage.id,
    status = CASE
      WHEN opportunity.status IN ('LOST', 'CANCELLED') THEN opportunity.status
      ELSE 'WON'
    END,
    forecast_category = CASE
      WHEN opportunity.status IN ('LOST', 'CANCELLED') THEN opportunity.forecast_category
      ELSE 'CLOSED'::"ForecastCategory"
    END,
    probability = closing_stage.probability,
    last_stage_changed_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
FROM stages AS billed_stage, stages AS closing_stage
WHERE opportunity.stage_id = billed_stage.id
  AND billed_stage.tenant_id = opportunity.tenant_id
  AND billed_stage.code = '100'
  AND closing_stage.tenant_id = opportunity.tenant_id
  AND closing_stage.code = '90'
  AND opportunity.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM billing_records AS billing
    WHERE billing.tenant_id = opportunity.tenant_id
      AND billing.opportunity_id = opportunity.id
  );
