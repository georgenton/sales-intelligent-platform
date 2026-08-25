## Summary

Describe the user or platform outcome.

## Security and tenancy

- [ ] No secrets, real customer data or private workbooks are included.
- [ ] Tenant-owned queries use `withTenant` and apply explicit application filters.
- [ ] DTOs do not accept an authoritative `tenantId`.
- [ ] Schema changes include a reviewed migration and RLS policy/grant changes where required.

## Verification

- [ ] `pnpm format:check`
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm test:integration`
- [ ] `pnpm test:tenant-isolation`
- [ ] `pnpm build`

## Deployment notes

List migrations, environment changes, rollout or rollback considerations.
