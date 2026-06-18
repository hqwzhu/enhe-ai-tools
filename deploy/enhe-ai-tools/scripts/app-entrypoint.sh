#!/bin/sh
set -eu

cd /app

echo "[enhe-ai-tools] running database migrations..."
npx prisma migrate deploy

echo "[enhe-ai-tools] ensuring super admin account..."
node prisma/ensure-super-admin.js

echo "[enhe-ai-tools] starting Next.js server on port 3000..."
exec node server.js
