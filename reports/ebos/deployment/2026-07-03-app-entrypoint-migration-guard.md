# EBOS App Entrypoint Migration Guard Report

- targetDate: 2026-07-03
- generatedAt: 2026-07-06T23:37:20.2494209+08:00
- guardImplemented: true
- guardVariable: RUN_PRISMA_MIGRATE
- defaultBehavior: skip_unless_explicit
- migrationExecutedThisStep: false
- migrationRequiresExplicitApproval: true
- migrationGuardDetected: true
- defaultMigrationBehavior: skip_unless_explicit
- migrationCommandRequiresExplicitApproval: true

## Changed Files

- `deploy/enhe-ai-tools/scripts/app-entrypoint.sh`
- `deploy/enhe-ai-tools/docker-compose.yml`
- `deploy/enhe-ai-tools/README.md`
- `src/lib/ebos/deployment/deployment-types.ts`
- `src/lib/ebos/deployment/deployment-config-reader.ts`
- `src/lib/ebos/deployment/deployment-preflight-checker.ts`
- `src/lib/ebos/deployment/deployment-preflight-markdown.ts`
- `src/lib/ebos/deployment/__tests__/deployment-config-reader.test.ts`
- `src/lib/ebos/deployment/__tests__/deployment-preflight-checker.test.ts`
- `src/lib/ebos/deployment/__tests__/deployment-preflight-markdown.test.ts`
- `src/lib/ebos/deployment/__tests__/deployment-migration-guard-artifacts.test.ts`
- `src/lib/ebos/deployment-execution/__tests__/deployment-approval-gate.test.ts`
- `src/lib/ebos/deployment-operator/deployment-operator-types.ts`
- `src/lib/ebos/deployment-operator/deployment-command-auditor.ts`
- `src/lib/ebos/deployment-operator/deployment-operator-markdown.ts`
- `src/lib/ebos/deployment-operator/__tests__/deployment-command-auditor.test.ts`
- `src/lib/ebos/weekly/__tests__/deployment-preflight-weekly-report-plan.test.ts`
- `src/lib/ebos/monthly/__tests__/deployment-preflight-monthly-review-plan.test.ts`
- `scripts/check-ebos-production-deployment-preflight.ts`
- `docs/ebos/26-EBOS-Production-Deployment-Preflight.md`
- `docs/ebos/30-EBOS-Production-Deployment-Operator-Checklist.md`
- `docs/ebos/31-EBOS-Production-Deployment-Execution.md`
- `docs/ebos/37-EBOS-App-Entrypoint-Migration-Guard.md`
- `reports/ebos/deployment/2026-07-03-production-deployment-preflight.json`
- `reports/ebos/deployment/2026-07-03-production-deployment-preflight.md`
- `reports/ebos/deployment/2026-07-03-app-entrypoint-migration-guard.json`
- `reports/ebos/deployment/2026-07-03-app-entrypoint-migration-guard.md`

## Guard Rule

`app-entrypoint.sh` now runs `npx prisma migrate deploy` only when:

```bash
RUN_PRISMA_MIGRATE=1
```

Default app startup must log:

```text
Prisma migrate deploy skipped because RUN_PRISMA_MIGRATE is not set to 1.
```

## Verification Commands

- `npm run test -- src/lib/ebos`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Warnings

- This report does not execute `prisma migrate deploy`.
- This report does not prove production logs until an optional guarded redeploy is performed.

## Next Actions

- Run EBOS tests and project quality checks.
- Optionally deploy the guard with `RUN_PRISMA_MIGRATE` unset or `0` and verify the skip log.
- Use `RUN_PRISMA_MIGRATE=1` only for a separately approved database migration release.
