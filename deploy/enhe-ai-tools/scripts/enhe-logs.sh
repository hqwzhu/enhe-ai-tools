#!/bin/sh
set -eu

APP_DIR="/opt/enhe-ai-tools"
SERVICE="${1:-app}"

cd "$APP_DIR"
docker compose logs -f "$SERVICE"
