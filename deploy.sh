#!/bin/bash
set -e

echo "===== 进入项目目录 ====="
cd /opt/enhe-ai-tools

echo "===== 拉取最新代码 ====="
git pull origin main

echo "===== 重新构建并启动 Docker ====="
docker compose --env-file deploy/enhe-ai-tools/.env -f deploy/enhe-ai-tools/docker-compose.yml up -d --build

echo "===== 同步数据库结构 ====="
docker compose --env-file deploy/enhe-ai-tools/.env -f deploy/enhe-ai-tools/docker-compose.yml exec app npx -y prisma@6.19.3 db push

echo "===== 查看容器状态 ====="
docker ps | grep enhe-ai-tools

echo "===== 测试应用 ====="
docker exec hot-content-nginx wget -qO- --header="Host: www.enhe-tech.com.cn" http://enhe-ai-tools-app:3000/api/health | head -n 20

echo "===== 重载 Nginx 代理 ====="
if docker ps --format '{{.Names}}' | grep -qx 'hot-content-nginx'; then
  docker exec hot-content-nginx nginx -t
  docker exec hot-content-nginx nginx -s reload
else
  echo "hot-content-nginx 未运行，跳过 Nginx 重载。"
fi

echo "===== 部署完成 ====="
