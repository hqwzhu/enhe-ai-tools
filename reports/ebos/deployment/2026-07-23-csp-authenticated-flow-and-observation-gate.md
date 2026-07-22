# CSP Authenticated Flow and Observation Gate

## Decision

Keep CSP in Report-Only mode. The authenticated-flow gate passed, but the 24-hour and 72-hour observation gates are not complete.

## Production controls

- Persistent CSP log: `/app/logs/csp-report.jsonl` in the app container and `/opt/enhe-ai-tools/deploy/enhe-ai-tools/logs/csp-report.jsonl` on the host.
- Rotation: daily or 10 MB, seven rotations retained.
- Public collector proxy limit: 32 KB body, `1r/s` per IP, burst 10, HTTP 429 when limited.
- Concurrent verification: 30 requests produced 11 HTTP 204 responses and 19 HTTP 429 responses.

## Authenticated flow result

- Registration: passed.
- Pending order and unpaid provider handoff: passed; no payment was completed.
- Clearly labelled synthetic proof upload: passed with HTTP 303, followed by an HTTP 200 order page.
- Authenticated free delivery: passed through the product's external public delivery link.
- Internal download log claimed: no. The selected free delivery is external and does not use `/api/tools/.../download`.
- Browser CSP violations: 0.
- Credentials printed or persisted: no.

The first run applied a strict internal-download selector and correctly failed because the current software catalog has no free product using that route. The corrected full audit was rerun, so the read-only database check found two disposable accounts, two unpaid orders, two synthetic proofs, and zero download logs. Cleanup remains a separate exact-record operation; no broad deletion was attempted.

## Log comparison

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| Total events | 43 | 43 | 0 |
| Synthetic probes | 43 | 43 | 0 |
| Organic events | 0 | 0 | 0 |
| Invalid lines | 0 | 0 | 0 |

## Observation schedule

Automation `enhe-csp-24-72` is active and will run three read-only checkpoints at approximately 24, 48, and 72 hours. It is prohibited from enabling enforced CSP, deploying, running migrations or seeds, executing payments or refunds, and deleting test records.

Enforced CSP can enter review only after the 72-hour checkpoint if organic and invalid event counts remain zero and the authenticated audit remains 4/4 with no browser CSP violations.

## Quality checks

- CSP-focused tests: 5 files, 20 tests passed.
- Lint: passed.
- Typecheck: passed.
- Build: passed. Local static-data reads logged the existing missing `DATABASE_URL` warning, but the build completed with exit code 0; no value was read or printed.

## Evidence

- `reports/ebos/deployment/2026-07-23-csp-authenticated-flow-production.json`
- `output/playwright/2026-07-23-csp-before-authenticated-summary.json`
- `output/playwright/2026-07-23-csp-after-authenticated-summary.json`
