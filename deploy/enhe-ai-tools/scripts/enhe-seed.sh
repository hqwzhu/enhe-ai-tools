#!/bin/sh
set -eu

APP_DIR="/opt/enhe-ai-tools"

cd "$APP_DIR"
docker compose exec app npx prisma db seed
