# CSP Reporting and Critical Flow Coverage

## Current mode

The site uses `Content-Security-Policy-Report-Only`. Do not switch to an enforced CSP until authenticated payment, upload, and successful download checks are completed with an explicitly authorized disposable account and disposable order data.

## Collection endpoint

- Endpoint: `POST /api/csp-report`
- Accepted media types: `application/csp-report` and `application/reports+json`
- Maximum body: 32 KB
- Maximum reports processed per request: 20
- Persistence: structured stdout plus `/app/logs/csp-report.jsonl`; no database writes
- Response: `204` with `Cache-Control: no-store`

The endpoint removes URL query strings, fragments, and credentials before logging. It truncates untrusted text, omits source samples and unknown properties, and logs one JSON object per CSP violation.

Production mounts `deploy/enhe-ai-tools/logs` into `/app/logs`, so JSONL evidence survives app-container replacement. Host logrotate keeps seven rotations and rotates daily or at 10 MB. The public proxy applies a 32 KB request limit and a per-IP `1r/s` rate with a burst of 10; the application-level body and batch limits remain the final boundary.

Summarize an observation window without printing raw report bodies:

```powershell
npx tsx scripts/summarize-csp-report-log.ts --file deploy/enhe-ai-tools/logs/csp-report.jsonl --since 2026-07-23T00:00:00.000Z
```

## Browser headers

The application sends both modern and compatibility reporting headers:

- `Reporting-Endpoints: csp-endpoint="https://www.enhe-tech.com.cn/api/csp-report"`
- `Report-To` with the `csp-endpoint` group
- `report-to csp-endpoint` in the report-only policy
- `report-uri /api/csp-report` as a legacy fallback

## Safe automated audit

Run:

```powershell
node scripts/audit-csp-critical-flows.mjs --base-url https://www.enhe-tech.com.cn --output output/playwright/csp-critical-flow-audit.json --submit-invalid-login
```

The script renders Chinese and English login, registration, pricing, paid-product, and free-product surfaces. It changes the payment-method selector without submitting an order. It checks unauthenticated payment-status, upload, and protected-download boundaries without following redirects.

`--submit-invalid-login` uses a unique `example.invalid` identifier. It creates one failed-login telemetry row but does not create or change a user.

## Manual coverage gate

The following checks require explicit authorization and disposable production-safe test data:

1. Successful authenticated order creation and payment-provider handoff.
2. Payment-proof upload against a disposable unpaid order.
3. Successful protected download after entitlement is granted.

Do not use a real customer, real payment, real proof image, or real paid entitlement for this gate. Keep CSP in Report-Only mode while any item remains `manual_required` or while collected violations remain unresolved.
