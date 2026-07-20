# EBOS Migration Guard Redeploy Check

- targetDate: 2026-07-03
- generatedAt: 2026-07-07T00:14:20.2615607+08:00
- deployed: true
- commit: a80959b
- pushedToOriginMain: true
- serverPath: /opt/enhe-ai-tools
- serverGitPull: success, 51f1336 -> a80959b
- dockerBuild: success
- dockerUp: success
- nginxReload: not_run
- migrationExecutedThisStep: false
- migrationCommandExecuted: false
- skipLogDetected: true

## Commands

- `git pull origin main`
- `docker compose --env-file deploy/enhe-ai-tools/.env -f deploy/enhe-ai-tools/docker-compose.yml build app`
- `docker compose --env-file deploy/enhe-ai-tools/.env -f deploy/enhe-ai-tools/docker-compose.yml up -d app`
- `docker logs --tail=120 enhe-ai-tools-app`
- `curl https://www.enhe-tech.com.cn/validation/ai-prompt-kit`
- `curl https://www.enhe-tech.com.cn/en/validation/ai-prompt-kit`

## Skip Evidence

```text
[enhe-ai-tools] Prisma migrate deploy skipped because RUN_PRISMA_MIGRATE is not set to 1.
```

No `No pending migrations to apply` or `Applying migration` log appeared in the checked app log tail.

## Public Checks

- https://www.enhe-tech.com.cn/validation/ai-prompt-kit: HTTP 200
- https://www.enhe-tech.com.cn/en/validation/ai-prompt-kit: HTTP 200

## Warnings

- Docker build logs contain build-time Prisma read errors because build-time static generation cannot reach `127.0.0.1:5432`; the Docker build still completed successfully.
- No Nginx reload was needed or executed.

## Next Actions

- Keep `RUN_PRISMA_MIGRATE` unset or `0` for EBOS page-only and read-only redeploys.
- Use `RUN_PRISMA_MIGRATE=1` only for separately approved database migration releases.
