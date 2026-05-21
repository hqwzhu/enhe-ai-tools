# 恩禾 ENHE AI工具站独立部署说明

这套部署文件专门用于新项目 `/opt/enhe-ai-tools`。它不会修改 `hot-content-os`，不会改现有 Nginx，也不会占用旧项目正在使用的宿主机端口。

## 端口与容器

旧项目已占用：

- `80`: hot-content-nginx
- `3000`: hot-content-frontend
- `8000`: hot-content-backend
- `5432`: hot-content-postgres
- `6379`: hot-content-redis

新项目固定使用：

- 项目目录：`/opt/enhe-ai-tools`
- App 容器名：`enhe-ai-tools-app`
- DB 容器名：`enhe-ai-tools-db`
- Next.js 容器内部端口：`3000`
- 宿主机测试端口：`3001:3000`
- PostgreSQL：只在 Docker 网络内部 `expose: "5432"`，不映射宿主机 `5432`

新项目不要使用宿主机 `80`、`3000`、`8000`、`5432`、`6379`。

## 准备目录

```bash
sudo mkdir -p /opt/enhe-ai-tools
sudo chown -R $USER:$USER /opt/enhe-ai-tools
```

把项目代码放到 `/opt/enhe-ai-tools` 后，复制环境变量示例即可。不要把 Compose 文件复制到项目根目录，避免误用默认 `docker compose` 影响已有项目：

```bash
cd /opt/enhe-ai-tools
cp deploy/enhe-ai-tools/.env.example ./.env
chmod +x deploy/enhe-ai-tools/scripts/*.sh
```

## 配置环境变量

编辑 `.env`：

```bash
nano /opt/enhe-ai-tools/.env
```

至少修改：

```env
POSTGRES_PASSWORD=换成强密码
AUTH_SECRET=换成长随机字符串
NEXT_PUBLIC_APP_URL=http://服务器IP:3001
TENCENT_COS_SIGNED_URL_EXPIRES_SECONDS=600
```

如果使用腾讯云 COS 保存软件安装包，建议将 COS Bucket 设为私有读，并在后台文件记录中使用 `cos://bucket/key` 作为文件路径。用户下载时系统会先做 VIP / 付费权限校验，再生成短期签名下载链接。

数据库连接在 `docker-compose.yml` 中自动生成，连接到内部容器 `enhe-ai-tools-db:5432`，不会连接宿主机 `5432`。

## 启动

推荐使用脚本：

```bash
/opt/enhe-ai-tools/deploy/enhe-ai-tools/scripts/enhe-start.sh
```

等价命令：

```bash
cd /opt/enhe-ai-tools
docker compose -f deploy/enhe-ai-tools/docker-compose.yml up -d --build
```

App 容器启动时会自动执行：

```bash
npx prisma migrate deploy
```

## 首次导入演示数据

如果需要默认管理员、演示用户、套餐和示例工具：

```bash
/opt/enhe-ai-tools/deploy/enhe-ai-tools/scripts/enhe-seed.sh
```

默认账号：

- 管理员：`admin@enhe.ai` / `EnheAdmin123!`
- 普通用户：`user@enhe.ai` / `EnheUser123!`

上线前请修改默认账号密码或删除演示用户。

## 访问测试

浏览器访问：

```text
http://服务器IP:3001
```

健康检查：

```bash
curl http://127.0.0.1:3001/api/health
```

正常响应示例：

```json
{
  "app": "enhe-ai-tools",
  "status": "ok",
  "database": "ok",
  "checkedAt": "2026-05-19T00:00:00.000Z"
}
```

## 日志与排查

查看 App 日志：

```bash
/opt/enhe-ai-tools/deploy/enhe-ai-tools/scripts/enhe-logs.sh app
```

查看数据库日志：

```bash
/opt/enhe-ai-tools/deploy/enhe-ai-tools/scripts/enhe-logs.sh db
```

查看容器状态：

```bash
cd /opt/enhe-ai-tools
docker compose -f deploy/enhe-ai-tools/docker-compose.yml ps
```

## 端口验收清单

确认新项目只占用宿主机 `3001`：

```bash
ss -lntp | grep -E ':80|:3000|:3001|:8000|:5432|:6379'
```

预期：

- 旧项目仍占用 `80`、`3000`、`8000`、`5432`、`6379`
- 新项目只新增 `3001`
- 不应出现 `enhe-ai-tools-db` 监听宿主机 `5432`

检查 Compose 文件没有宿主机数据库映射：

```bash
grep -n '5432:5432' /opt/enhe-ai-tools/deploy/enhe-ai-tools/docker-compose.yml || echo 'OK: no host postgres port mapping'
```

## 停止新项目

只停止恩禾项目：

```bash
/opt/enhe-ai-tools/deploy/enhe-ai-tools/scripts/enhe-stop.sh
```

不要执行会影响全局 Docker 的清理命令，例如：

```bash
docker system prune
docker stop $(docker ps -q)
```

## 暂不修改 Nginx

当前阶段只支持通过 `http://服务器IP:3001` 测试访问。暂时不要修改现有 Nginx，也不要改 `hot-content-nginx` 配置。
