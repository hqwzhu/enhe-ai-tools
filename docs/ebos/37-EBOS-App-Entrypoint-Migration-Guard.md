# EBOS App Entrypoint Migration Guard

## 1. 为什么需要 migration guard

EBOS 的页面更新、报告更新、只读巡检和验证页 redeploy 不应该默认改变数据库 schema。生产容器启动时如果自动执行 `prisma migrate deploy`，即使命令结果是 `No pending migrations to apply`，也会让一次只读发布触碰高风险数据库操作边界。

因此 app entrypoint 必须显式区分：

- 普通页面/报告/只读发布：默认跳过 migration。
- 真正数据库变更发布：只有经过 migration 审查和用户明确授权后才执行 migration。

## 2. 本次为什么触发 entrypoint migration

Step 21S 没有手动执行 Prisma migration，也没有调用 `deploy.sh`。但 `docker compose up -d app` 启动容器时，现有 `app-entrypoint.sh` 无条件运行了：

```bash
npx prisma migrate deploy
```

服务器日志显示没有待应用迁移，但这个自动行为不符合 EBOS 只读/页面 redeploy 的安全边界。

## 3. 为什么页面/只读更新不应自动 migrate

页面文案、验证页、EBOS report、SEO/GEO 巡检和外部渠道发布记录都不是数据库 schema 变更。它们可以通过 build/redeploy 验证，不应在容器启动时默认触发 schema 操作。

自动 migration 的主要风险：

- 把页面发布和数据库发布混在同一个操作里。
- 让 EBOS 无法准确声明“本阶段没有执行 Prisma migration”。
- 未来如果存在 pending migration，普通 redeploy 可能意外应用数据库变更。

## 4. RUN_PRISMA_MIGRATE=1 使用规则

当前 guard 采用更安全的默认策略：

```bash
RUN_PRISMA_MIGRATE=1
```

只有当 `RUN_PRISMA_MIGRATE` 等于 `1` 时，`app-entrypoint.sh` 才允许执行：

```bash
npx prisma migrate deploy
```

未设置为 `1` 时，entrypoint 必须输出：

```text
Prisma migrate deploy skipped because RUN_PRISMA_MIGRATE is not set to 1.
```

## 5. 什么时候允许 migration

只有同时满足以下条件时，才允许设置 `RUN_PRISMA_MIGRATE=1`：

- 本次发布确实包含已审查的 Prisma migration。
- 已确认 migration 不会删除生产数据。
- 已完成数据库备份或确认可回滚策略。
- 用户明确授权执行数据库迁移。
- EBOS operator audit 已把 migration 命令标为 high risk / requires explicit approval。

## 6. 如何验证 migration 被 skipped

普通 redeploy 或页面 redeploy 后，查看 app 容器日志，必须能看到：

```text
Prisma migrate deploy skipped because RUN_PRISMA_MIGRATE is not set to 1.
```

同时应确认没有出现：

```text
Applying migration
```

或任何表示 migration 被实际执行的日志。

## 7. 风险边界

- 本阶段不执行 `prisma migrate deploy`。
- 本阶段不执行 `prisma migrate reset`。
- 本阶段不新增 migration。
- 本阶段不修改数据库 schema。
- 本阶段不打印 secret 或 `.env` 内容。
- 真正需要数据库迁移时，必须走单独审批和备份流程。
