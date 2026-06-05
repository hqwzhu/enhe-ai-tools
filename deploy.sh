#!/bin/bash
set -e

echo "===== 进入项目目录 ====="
cd /opt/enhe-ai-tools

if [ "${SKIP_GIT_PULL:-0}" = "1" ]; then
  echo "===== Skip git pull (SKIP_GIT_PULL=1) ====="
else
  echo "===== 拉取最新代码 ====="
  git pull origin main
fi

echo "===== 重新构建并启动 Docker ====="
docker compose --env-file deploy/enhe-ai-tools/.env -f deploy/enhe-ai-tools/docker-compose.yml up -d --build

echo "===== 同步数据库结构 ====="
docker compose --env-file deploy/enhe-ai-tools/.env -f deploy/enhe-ai-tools/docker-compose.yml exec app npx -y prisma@6.19.3 db push

echo "===== 查看容器状态 ====="
docker ps | grep enhe-ai-tools

echo "===== 测试应用 ====="
docker exec hot-content-nginx wget -qO- --header="Host: www.enhe-tech.com.cn" http://enhe-ai-tools-app:3000/api/health | head -n 20

echo "===== 确保 Nginx 支持后台大文件表单 ====="
HOT_NGINX_CONF="/opt/hot-content-os/app/hot-content-os/infra/nginx/default.conf"
HOT_NGINX_COMPOSE="/opt/hot-content-os/app/hot-content-os/docker-compose.yml"
NGINX_CONFIG_CHANGED=0

if [ -f "$HOT_NGINX_CONF" ]; then
  BEFORE_NGINX_CONF="$(mktemp)"
  cp "$HOT_NGINX_CONF" "$BEFORE_NGINX_CONF"

  if grep -q "server_name www.enhe-tech.com.cn;" "$HOT_NGINX_CONF"; then
    if ! grep -q "client_max_body_size 520m;" "$HOT_NGINX_CONF"; then
      sed -i '/server_name www.enhe-tech.com.cn;/a\    client_max_body_size 520m;' "$HOT_NGINX_CONF"
    fi
    sed -i 's/enhe-ai-tools-app-1:3000/enhe-ai-tools-app:3000/g' "$HOT_NGINX_CONF"
  else
    echo "未找到 www.enhe-tech.com.cn 的 Nginx server 配置，跳过自动修正。"
  fi

  if ! cmp -s "$BEFORE_NGINX_CONF" "$HOT_NGINX_CONF"; then
    NGINX_CONFIG_CHANGED=1
    echo "已更新 hot-content-nginx 配置：client_max_body_size 520m。"
  fi
  rm -f "$BEFORE_NGINX_CONF"
else
  echo "未找到 hot-content-nginx 宿主机配置文件，跳过自动修正：$HOT_NGINX_CONF"
fi

echo "===== 重载 Nginx 代理 ====="
if docker ps --format '{{.Names}}' | grep -qx 'hot-content-nginx'; then
  if [ "$NGINX_CONFIG_CHANGED" = "1" ] && [ -f "$HOT_NGINX_COMPOSE" ]; then
    docker compose -f /opt/hot-content-os/app/hot-content-os/docker-compose.yml up -d --force-recreate nginx
  fi
  docker exec hot-content-nginx nginx -t
  docker exec hot-content-nginx nginx -s reload
else
  echo "hot-content-nginx 未运行，跳过 Nginx 重载。"
fi

echo "===== 部署完成 ====="
