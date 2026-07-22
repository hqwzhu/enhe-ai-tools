# CSP Report-Only Production Verification

- Date: 2026-07-22
- Production: `https://www.enhe-tech.com.cn`
- CSP mode: `report_only`
- Enforcement decision: `keep_report_only_pending_authenticated_mutation_coverage`

## Deployment

- Git pull: passed
- Docker build: passed
- Docker app update: passed
- `AUTH_SECRET` image-history matches: 0
- `RUN_PRISMA_MIGRATE`: `0`
- Entrypoint log confirmed Prisma migration was skipped
- Prisma migration executed: no
- Seed executed: no
- Nginx command executed: no

## Reporting Endpoint

`POST /api/csp-report` returned HTTP 204 and `Cache-Control: no-store` for a synthetic legacy CSP report. The container log retained only sanitized URLs; credentials, query strings, and fragments were absent. Reports are written as structured container logs and are not persisted to the database.

## Critical Flows

- Browser page checks: 9/9 passed
- Safe API authorization checks: 5/5 passed
- Covered flows: authentication, payment, upload, download
- Browser-observed CSP violations: 0
- Browser-generated report requests: 0
- Real order/payment/upload/download mutation: none
- Invalid-login check: one failed-login telemetry row only; no user was created or changed

Authenticated payment creation, payment-proof upload, and successful entitlement download remain `manual_required`. They require explicit authorization plus disposable test account, order, and file data.

## Decision

Keep CSP in Report-Only mode. A short clean browser run is not sufficient evidence for enforcement because no organic reports were observed and authenticated mutation paths were not exercised. Review a representative production log window and complete the authorized authenticated-flow checks before enabling enforced CSP.
