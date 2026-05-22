import Link from "next/link";
import type { DevelopmentItem, DevelopmentVersion } from "@prisma/client";
import {
  deleteDevelopmentItemAction,
  deleteDevelopmentVersionAction,
  upsertDevelopmentItemAction,
  upsertDevelopmentVersionAction
} from "@/app/admin/actions";
import { AdminSection, DangerButton, Field, inputClass, selectClass, SubmitButton, textareaClass } from "@/app/admin/admin-ui";
import { prisma } from "@/lib/db";
import {
  calculateDevelopmentSummary,
  groupDevelopmentItemsByModule,
  priorityMeta,
  statusMeta,
  versionStatusMeta,
  type DevelopmentItemStatus
} from "@/lib/development-progress";

type VersionWithItems = DevelopmentVersion & { items: DevelopmentItem[] };
type ReadonlyDevelopmentItem = Pick<DevelopmentItem, "id" | "module" | "name" | "status" | "priority" | "relatedFiles" | "notes" | "sortOrder" | "updatedAt">;

const defaultDevelopmentItems = [
  ["基础页面", "首页与工具入口", "completed", "medium", "src/app/page.tsx, src/app/software/page.tsx, src/app/online-tools/page.tsx", "首页、电脑软件工具、在线网页工具入口已具备。", 10],
  ["用户与权限", "注册登录与用户中心", "completed", "high", "src/app/(auth), src/app/user/page.tsx, src/lib/auth.ts", "已支持注册、登录、退出、用户中心和会话安全。", 20],
  ["用户与权限", "管理员后台权限", "completed", "high", "src/app/admin/layout.tsx, src/lib/auth.ts", "普通用户不能进入后台，管理员可访问后台菜单。", 30],
  ["工具系统", "工具分类后台自定义", "completed", "high", "src/app/admin/categories/page.tsx", "电脑软件与在线网页工具分类由后台维护。", 40],
  ["工具系统", "电脑软件工具管理", "completed", "high", "src/app/admin/software/page.tsx, src/app/admin/software/[id]/page.tsx", "已支持清单、详情编辑、封面上传、下载文件绑定和上架检查。", 50],
  ["工具系统", "在线网页工具管理", "completed", "high", "src/app/admin/online-tools/page.tsx, src/app/admin/online-tools/[id]/page.tsx", "已支持在线地址、权限和上架管理。", 60],
  ["工具系统", "工具详情页与教程", "completed", "high", "src/app/tools/[slug]/page.tsx, src/app/admin/tutorials/page.tsx", "详情页已展示教程、截图、评论和相关推荐；教程支持注意事项与常见错误。", 70],
  ["VIP 与订单", "会员套餐管理", "completed", "high", "src/app/admin/plans/page.tsx, src/app/pricing/page.tsx", "后台可维护套餐，前台可创建会员订单。", 80],
  ["VIP 与订单", "订单创建与取消", "completed", "high", "src/app/actions.ts, src/app/user/page.tsx", "用户可创建订单，并可取消允许取消状态的订单。", 90],
  ["VIP 与订单", "个人收款码支付页", "completed", "high", "src/app/orders/[id]/pay/page.tsx, public/images/payment", "支付页已展示支付宝和微信收款码，并提示备注订单号。", 100],
  ["VIP 与订单", "付款截图上传与预览", "completed", "high", "src/app/api/uploads/payment-proof/route.ts, src/app/orders/[id]/page.tsx", "上传后进入订单详情并展示付款凭证预览。", 110],
  ["VIP 与订单", "后台支付审核自动开通权益", "completed", "high", "src/app/actions.ts, src/lib/membership.ts", "审核通过统一调用 membership 服务，VIP 与软件购买权益分流处理。", 120],
  ["权限控制", "VIP 软件下载权限", "completed", "high", "src/app/api/tools/[id]/download/route.ts, src/lib/access.ts", "下载权限在服务端校验。", 130],
  ["权限控制", "在线工具使用权限", "completed", "high", "src/app/api/tools/[id]/use/route.ts, src/lib/access.ts", "在线工具入口在服务端校验权限并记录使用日志。", 140],
  ["内容互动", "用户评论与后台审核", "completed", "medium", "src/app/tools/[slug]/page.tsx, src/app/admin/comments/page.tsx", "评论需后台审核，支持置顶和删除。", 150],
  ["文件与存储", "文件上传与 COS 预留", "partial", "high", "src/lib/storage.ts, src/app/admin/files/page.tsx", "已支持本地上传、COS 环境变量自动切换和配置体检；后续可补 COS 对象删除。", 160],
  ["售后与通知", "退款/售后记录", "completed", "medium", "src/app/orders/[id]/page.tsx, src/app/admin/orders/page.tsx", "用户可申请售后/退款，后台可处理并记录。", 170],
  ["售后与通知", "站内通知", "completed", "medium", "src/app/user/page.tsx, src/lib/notifications.ts", "支付审核、退款处理、VIP 调整已通知用户。", 180],
  ["部署运维", "Docker 与腾讯云部署配置", "completed", "high", "Dockerfile, deploy.sh, deploy/enhe-ai-tools", "已拆分独立部署文件，避免影响旧项目端口。", 190],
  ["安全与质量", "关键流程测试", "partial", "medium", "src/lib/*.test.ts, tests/e2e/commercial-flow.spec.ts", "核心单元测试和商业闭环 E2E 已存在；后续可补更多管理端浏览器回归。", 200],
  ["下一阶段", "后台消息中心与更细审计筛选", "recommended", "low", "src/app/admin/audit/page.tsx", "建议后续补管理员侧消息中心和更细粒度审计查询。", 210]
] as const;

export default async function AdminDevelopmentPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const versions = await prisma.developmentVersion.findMany({
    include: {
      items: {
        orderBy: [{ module: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }]
      }
    },
    orderBy: [{ sortOrder: "desc" }, { createdAt: "desc" }]
  });
  const selectedVersion = versions.find((version) => version.id === params.version) ?? versions.find((version) => version.status === "active") ?? versions[0] ?? null;
  const fallbackUpdatedAt = new Date("2026-05-22T00:00:00");
  const fallbackItems: ReadonlyDevelopmentItem[] = defaultDevelopmentItems.map(([module, name, status, priority, relatedFiles, notes, sortOrder]) => ({
    id: `default-${sortOrder}`,
    module,
    name,
    status,
    priority,
    relatedFiles,
    notes,
    sortOrder,
    updatedAt: fallbackUpdatedAt
  }));
  const displayVersion = selectedVersion ?? {
    version: "V1.0",
    name: "商业闭环版",
    description: "默认进度快照。创建版本或运行 seed 后可在数据库中维护这些进度项。",
    status: "active" as const
  };
  const displayItems = selectedVersion?.items ?? fallbackItems;
  const summary = calculateDevelopmentSummary(displayItems as { status: DevelopmentItemStatus }[]);
  const groupedItems = groupDevelopmentItemsByModule(displayItems);

  return (
    <AdminSection
      title="开发进度驾驶舱"
      intro="用于记录当前网站版本、功能完成状态、未完成模块、建议补强项和关联文件，让后续开发进度可以在后台直接维护。"
    >
      {params.deleted ? (
        <p className="mb-5 rounded-xl border border-[#48F5D3]/30 bg-[#48F5D3]/10 px-4 py-3 text-sm text-[#48F5D3]">
          已删除对应开发进度记录。
        </p>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="glass rounded-2xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[#48F5D3]">Current Version</p>
              <h2 className="mt-2 text-3xl font-semibold">{`${displayVersion.version} · ${displayVersion.name}`}</h2>
              {displayVersion.description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-[#8B95A7]">{displayVersion.description}</p> : null}
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#8B95A7]">
              {versionStatusMeta[displayVersion.status]}
            </span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-5">
            <ProgressStat label="整体完成度" value={`${summary.completionPercent}%`} accent />
            <ProgressStat label="总功能项" value={summary.total} />
            <ProgressStat label="已完成" value={summary.completed} />
            <ProgressStat label="部分完成" value={summary.partial} />
            <ProgressStat label="待处理" value={summary.notStarted + summary.recommended} />
          </div>
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/8">
            <div className="h-full rounded-full bg-gradient-to-r from-[#48F5D3] via-[#7AA7FF] to-[#A78BFA]" style={{ width: `${summary.completionPercent}%` }} />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {versions.map((version) => (
              <Link
                key={version.id}
                href={`/admin/development?version=${version.id}`}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  selectedVersion?.id === version.id
                    ? "border-[#48F5D3]/50 bg-[#48F5D3]/10 text-[#48F5D3]"
                    : "border-white/10 text-[#8B95A7] hover:border-[#48F5D3]/40 hover:text-[#48F5D3]"
                }`}
              >
                {version.version}
              </Link>
            ))}
          </div>
        </section>

        <VersionForm version={selectedVersion} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {groupedItems.map((group) => (
            <section key={group.module} className="glass rounded-2xl p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">{group.module}</h2>
                <span className="text-xs text-[#8B95A7]">{group.items.length} 项</span>
              </div>
              <div className="space-y-4">
                {group.items.map((item) =>
                  selectedVersion ? (
                    <DevelopmentItemCard key={item.id} item={item as DevelopmentItem} versionId={selectedVersion.id} />
                  ) : (
                    <ReadonlyDevelopmentItemCard key={item.id} item={item as ReadonlyDevelopmentItem} />
                  )
                )}
              </div>
            </section>
          ))}
        </div>

        <div className="space-y-6">
          {selectedVersion ? (
            <>
            <DevelopmentItemForm versionId={selectedVersion.id} />
            <form action={deleteDevelopmentVersionAction} className="glass rounded-2xl border border-red-400/20 p-6">
              <input type="hidden" name="id" value={selectedVersion.id} />
              <h2 className="text-xl font-semibold text-red-100">删除当前版本</h2>
              <p className="mt-3 text-sm leading-6 text-[#8B95A7]">删除版本会同时删除该版本下的所有开发进度项。</p>
              <div className="mt-5">
                <DangerButton>删除版本</DangerButton>
              </div>
            </form>
            </>
          ) : (
            <div className="glass rounded-2xl p-6 text-sm leading-6 text-[#8B95A7]">
              当前展示的是默认只读进度快照。右上方新增版本后，即可在数据库中维护版本和功能项。
            </div>
          )}
        </div>
      </div>
    </AdminSection>
  );
}

function ProgressStat({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/6 p-4">
      <p className="text-xs text-[#8B95A7]">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${accent ? "text-[#48F5D3]" : "text-[#E8EEF8]"}`}>{value}</p>
    </div>
  );
}

function VersionForm({ version }: { version: VersionWithItems | null }) {
  return (
    <form action={upsertDevelopmentVersionAction} className="glass grid gap-4 rounded-2xl p-6 md:grid-cols-2">
      {version ? <input type="hidden" name="id" value={version.id} /> : null}
      <h2 className="md:col-span-2 text-xl font-semibold">{version ? "编辑当前版本" : "新增开发版本"}</h2>
      <Field label="版本号"><input name="version" required defaultValue={version?.version ?? "V1.0"} className={inputClass} /></Field>
      <Field label="版本名称"><input name="name" required defaultValue={version?.name ?? ""} placeholder="商业闭环版" className={inputClass} /></Field>
      <Field label="状态">
        <select name="status" defaultValue={version?.status ?? "active"} className={selectClass}>
          {Object.entries(versionStatusMeta).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </Field>
      <Field label="排序"><input name="sortOrder" type="number" defaultValue={version?.sortOrder ?? 10} className={inputClass} /></Field>
      <Field label="开始日期"><input name="startedAt" type="date" defaultValue={formatDateInput(version?.startedAt)} className={inputClass} /></Field>
      <Field label="发布日期"><input name="releasedAt" type="date" defaultValue={formatDateInput(version?.releasedAt)} className={inputClass} /></Field>
      <Field label="版本说明" className="md:col-span-2">
        <textarea name="description" defaultValue={version?.description ?? ""} className={textareaClass} />
      </Field>
      <div className="md:col-span-2"><SubmitButton>{version ? "保存版本" : "新增版本"}</SubmitButton></div>
    </form>
  );
}

function DevelopmentItemCard({ item, versionId }: { item: DevelopmentItem; versionId: string }) {
  const meta = statusMeta[item.status];
  return (
    <details className="rounded-xl border border-white/10 bg-white/6 p-4" open={false}>
      <summary className="cursor-pointer list-none">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-[#E8EEF8]">{item.name}</h3>
            <p className="mt-2 text-xs text-[#8B95A7]">
              {priorityMeta[item.priority].label} · 更新于 {item.updatedAt.toLocaleDateString("zh-CN")}
            </p>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs ${meta.className}`}>{meta.label}</span>
        </div>
        {item.notes ? <p className="mt-3 text-sm leading-6 text-[#8B95A7]">{item.notes}</p> : null}
        {item.relatedFiles ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {splitRelatedFiles(item.relatedFiles).map((file) => (
              <code key={file} className="rounded-full border border-white/10 px-2 py-1 text-xs text-[#8B95A7]">{file}</code>
            ))}
          </div>
        ) : null}
      </summary>
      <div className="mt-5 border-t border-white/10 pt-5">
        <DevelopmentItemForm item={item} versionId={versionId} />
        <form action={deleteDevelopmentItemAction} className="mt-4">
          <input type="hidden" name="id" value={item.id} />
          <DangerButton>删除功能项</DangerButton>
        </form>
      </div>
    </details>
  );
}

function ReadonlyDevelopmentItemCard({ item }: { item: ReadonlyDevelopmentItem }) {
  const meta = statusMeta[item.status];
  return (
    <div className="rounded-xl border border-white/10 bg-white/6 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-[#E8EEF8]">{item.name}</h3>
          <p className="mt-2 text-xs text-[#8B95A7]">
            {priorityMeta[item.priority].label} · 更新于 {item.updatedAt.toLocaleDateString("zh-CN")}
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs ${meta.className}`}>{meta.label}</span>
      </div>
      {item.notes ? <p className="mt-3 text-sm leading-6 text-[#8B95A7]">{item.notes}</p> : null}
      {item.relatedFiles ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {splitRelatedFiles(item.relatedFiles).map((file) => (
            <code key={file} className="rounded-full border border-white/10 px-2 py-1 text-xs text-[#8B95A7]">{file}</code>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DevelopmentItemForm({ item, versionId }: { item?: DevelopmentItem; versionId: string }) {
  return (
    <form action={upsertDevelopmentItemAction} className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-2">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <input type="hidden" name="versionId" value={versionId} />
      <Field label="模块"><input name="module" required defaultValue={item?.module ?? ""} placeholder="订单 / 支付 / VIP" className={inputClass} /></Field>
      <Field label="功能名称"><input name="name" required defaultValue={item?.name ?? ""} placeholder="后台支付审核" className={inputClass} /></Field>
      <Field label="状态">
        <select name="status" defaultValue={item?.status ?? "not_started"} className={selectClass}>
          {Object.entries(statusMeta).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}
        </select>
      </Field>
      <Field label="优先级">
        <select name="priority" defaultValue={item?.priority ?? "medium"} className={selectClass}>
          {Object.entries(priorityMeta).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}
        </select>
      </Field>
      <Field label="排序"><input name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 10} className={inputClass} /></Field>
      <Field label="关联文件"><input name="relatedFiles" defaultValue={item?.relatedFiles ?? ""} placeholder="src/app/admin/orders/page.tsx" className={inputClass} /></Field>
      <Field label="备注" className="md:col-span-2">
        <textarea name="notes" defaultValue={item?.notes ?? ""} className={textareaClass} />
      </Field>
      <div className="md:col-span-2"><SubmitButton>{item ? "保存功能项" : "新增功能项"}</SubmitButton></div>
    </form>
  );
}

function formatDateInput(value?: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

function splitRelatedFiles(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
