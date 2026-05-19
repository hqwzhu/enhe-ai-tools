# 恩禾 ENHE AI工具站独立部署说明

这套部署文件专门用于新项目 `/opt/enhe-ai-tools`，不会占用旧项目 `hot-content-os` 的端口，也不会修改旧项目文件或现有 Nginx。

## 端口与容器

- 新项目目录：`/opt/enhe-ai-tools`
- App 容器名：`enhe-ai-tools-app`
- DB 容器名：`enhe-ai-tools-db`
- Next.js 容器内部端口：`3000`
- 宿主机测试端口：`3001:3000`
- PostgreSQL：只在 Docker 网络内部暴露 `5432`，没有宿主机端口映射

不会使用这些宿主机端口：`80`、`3000`、`8000`、`5432`、`6379`。

## 文件放置

在服务器上准备目录：

```bash
sudo mkdir -p /opt/enhe-ai-tools
sudo chown -R $USER:$USER /opt/enhe-ai-tools
```

把项目代码放到 `/opt/enhe-ai-tools`，并使用本目录中的部署文件覆盖到项目根目录：

```bash
cd /opt/enhe-ai-tools
cp deploy/enhe-ai-tools/Dockerfile ./Dockerfile
cp deploy/enhe-ai-tools/docker-compose.yml ./docker-compose.yml
cp deploy/enhe-ai-tools/.env.example ./.env
```

编辑 `.env`：

```bash
nano .env
```

至少修改：

- `POSTGRES_PASSWORD`
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL=http://服务器IP:3001`

## 启动

```bash
cd /opt/enhe-ai-tools
docker compose up -d --build
```

应用启动时会自动执行：

```bash
npx prisma migrate deploy
```

首次部署如需导入演示数据：

```bash
docker compose exec app npx prisma db seed
```

## 访问测试

浏览器访问：

```text
http://服务器IP:3001
```

## 检查命令

```bash
docker compose ps
docker compose logs -f app
docker compose logs -f db
```

确认不会占用旧项目端口：

```bash
docker compose ps
ss -lntp | grep -E ':80|:3000|:3001|:8000|:5432|:6379'
```

应只看到新项目使用宿主机 `3001`，数据库 `5432` 不应出现在宿主机监听端口里。

## 停止新项目

只停止恩禾项目：

```bash
cd /opt/enhe-ai-tools
docker compose down
```

不要使用会影响全局 Docker 的清理命令，例如 `docker system prune`。

## 暂不修改 Nginx

本部署第一步只支持通过 `http://服务器IP:3001` 测试访问。暂时不要改现有 Nginx，也不要动 `hot-content-nginx` 配置。
