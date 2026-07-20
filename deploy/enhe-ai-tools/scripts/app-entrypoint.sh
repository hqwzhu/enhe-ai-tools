#!/bin/sh
set -eu

cd /app

if [ "${RUN_PRISMA_MIGRATE:-0}" = "1" ]; then
  echo "[enhe-ai-tools] Prisma migrate deploy explicitly enabled by RUN_PRISMA_MIGRATE=1."
  npx prisma migrate deploy
else
  echo "[enhe-ai-tools] Prisma migrate deploy skipped because RUN_PRISMA_MIGRATE is not set to 1."
fi

echo "[enhe-ai-tools] ensuring super admin account..."
node prisma/ensure-super-admin.js

echo "[enhe-ai-tools] starting Next.js server on port 3000..."
exec node server.js
