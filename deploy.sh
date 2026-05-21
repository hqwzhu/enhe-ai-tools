#!/bin/bash
set -e

echo "===== 进入项目目录 ====="
cd /opt/enhe-ai-tools

echo "===== 拉取最新代码 ====="
git pull origin main

echo "===== 重新构建并启动 Docker ====="
docker compose -f deploy/enhe-ai-tools/docker-compose.yml up -d --build

echo "===== 同步数据库结构 ====="
docker compose -f deploy/enhe-ai-tools/docker-compose.yml exec app npx -y prisma@6.19.3 db push

echo "===== 查看容器状态 ====="
docker ps | grep enhe-ai-tools

echo "===== 测试应用 ====="
docker exec hot-content-nginx wget -qO- http://enhe-ai-tools-app:3000 | head -n 20

echo "===== 部署完成 ====="
