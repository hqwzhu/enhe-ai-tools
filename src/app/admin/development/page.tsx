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
  const summary = calculateDevelopmentSummary((selectedVersion?.items ?? []) as { status: DevelopmentItemStatus }[]);
  const groupedItems = selectedVersion ? groupDevelopmentItemsByModule(selectedVersion.items) : [];

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
              <h2 className="mt-2 text-3xl font-semibold">{selectedVersion ? `${selectedVersion.version} · ${selectedVersion.name}` : "尚未创建版本"}</h2>
              {selectedVersion?.description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-[#8B95A7]">{selectedVersion.description}</p> : null}
            </div>
            {selectedVersion ? (
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#8B95A7]">
                {versionStatusMeta[selectedVersion.status]}
              </span>
            ) : null}
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

      {selectedVersion ? (
        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {groupedItems.length ? (
              groupedItems.map((group) => (
                <section key={group.module} className="glass rounded-2xl p-6">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">{group.module}</h2>
                    <span className="text-xs text-[#8B95A7]">{group.items.length} 项</span>
                  </div>
                  <div className="space-y-4">
                    {group.items.map((item) => (
                      <DevelopmentItemCard key={item.id} item={item} versionId={selectedVersion.id} />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="glass rounded-2xl p-6 text-sm text-[#8B95A7]">当前版本还没有功能项，请在右侧新增。</div>
            )}
          </div>

          <div className="space-y-6">
            <DevelopmentItemForm versionId={selectedVersion.id} />
            <form action={deleteDevelopmentVersionAction} className="glass rounded-2xl border border-red-400/20 p-6">
              <input type="hidden" name="id" value={selectedVersion.id} />
              <h2 className="text-xl font-semibold text-red-100">删除当前版本</h2>
              <p className="mt-3 text-sm leading-6 text-[#8B95A7]">删除版本会同时删除该版本下的所有开发进度项。</p>
              <div className="mt-5">
                <DangerButton>删除版本</DangerButton>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="mt-8 glass rounded-2xl p-6 text-sm text-[#8B95A7]">请先创建一个版本，再维护开发进度项。</div>
      )}
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
