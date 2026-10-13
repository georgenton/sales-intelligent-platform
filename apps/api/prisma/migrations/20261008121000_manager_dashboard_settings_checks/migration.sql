-- Keep the configurable Edgar working rules inside their supported domain.

ALTER TABLE "tenant_settings"
  ADD CONSTRAINT "tenant_settings_stalled_opportunity_days_check"
    CHECK ("stalled_opportunity_days" BETWEEN 1 AND 365),
  ADD CONSTRAINT "tenant_settings_weekly_visit_target_check"
    CHECK ("weekly_visit_target" BETWEEN 1 AND 31),
  ADD CONSTRAINT "tenant_settings_pipeline_coverage_ratio_check"
    CHECK ("pipeline_coverage_ratio" > 0 AND "pipeline_coverage_ratio" <= 20);
