#!/bin/sh
set -eu

echo "[enhe-ai-tools] running database migrations..."
npx prisma migrate deploy

echo "[enhe-ai-tools] starting Next.js server on port 3000..."
exec node server.js
