-- Record the manager/seller team independently of current-period activity so
-- a seller with zero opportunities and zero visits remains visible.

ALTER TABLE "tenant_memberships"
  ADD COLUMN "manager_id" UUID;

ALTER TABLE "tenant_memberships"
  ADD CONSTRAINT "tenant_memberships_manager_id_fkey"
  FOREIGN KEY ("manager_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill only unambiguous existing seller/manager evidence. A seller linked
-- to multiple managers remains unassigned until the tenant resolves the team.
UPDATE "tenant_memberships" AS membership
SET "manager_id" = evidence."manager_id"
FROM (
  SELECT
    "tenant_id",
    "seller_id",
    MIN("manager_id"::TEXT)::UUID AS "manager_id"
  FROM "opportunities"
  WHERE "manager_id" IS NOT NULL AND "deleted_at" IS NULL
  GROUP BY "tenant_id", "seller_id"
  HAVING COUNT(DISTINCT "manager_id") = 1
) AS evidence
WHERE membership."tenant_id" = evidence."tenant_id"
  AND membership."user_id" = evidence."seller_id"
  AND membership."role" = 'SELLER';

CREATE INDEX "tenant_memberships_tenant_id_manager_id_role_status_idx"
  ON "tenant_memberships"("tenant_id", "manager_id", "role", "status");
