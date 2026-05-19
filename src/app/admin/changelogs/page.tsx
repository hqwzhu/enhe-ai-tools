import { upsertToolChangelogAction } from "@/app/admin/actions";
import { AdminSection, Field, inputClass, selectClass, SubmitButton, textareaClass } from "@/app/admin/admin-ui";
import { prisma } from "@/lib/db";

export default async function AdminChangelogsPage() {
  const [changelogs, tools] = await Promise.all([
    prisma.toolChangelog.findMany({ include: { tool: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
    prisma.tool.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <AdminSection title="版本更新管理" intro="为工具详情页维护版本发布记录。">
      <ChangelogForm tools={tools} />
      <div className="mt-8 space-y-4">
        {changelogs.map((changelog) => <ChangelogForm key={changelog.id} changelog={changelog} tools={tools} />)}
      </div>
    </AdminSection>
  );
}

function ChangelogForm({
  changelog,
  tools
}: {
  changelog?: {
    id: string;
    toolId: string;
    version: string;
    title: string;
    content: string;
    releaseDate: Date | null;
    status: string;
    sortOrder: number;
  };
  tools: { id: string; name: string }[];
}) {
  return (
    <form action={upsertToolChangelogAction} className="glass grid gap-4 rounded-2xl p-6 md:grid-cols-2">
      {changelog ? <input type="hidden" name="id" value={changelog.id} /> : null}
      <Field label="工具">
        <select name="toolId" defaultValue={changelog?.toolId ?? ""} required className={selectClass}>
          <option value="">选择工具</option>
          {tools.map((tool) => <option key={tool.id} value={tool.id}>{tool.name}</option>)}
        </select>
      </Field>
      <Field label="版本"><input name="version" required defaultValue={changelog?.version ?? ""} className={inputClass} /></Field>
      <Field label="标题"><input name="title" required defaultValue={changelog?.title ?? ""} className={inputClass} /></Field>
      <Field label="发布日期"><input name="releaseDate" type="date" defaultValue={changelog?.releaseDate?.toISOString().slice(0, 10) ?? ""} className={inputClass} /></Field>
      <Field label="排序"><input name="sortOrder" type="number" defaultValue={changelog?.sortOrder ?? 0} className={inputClass} /></Field>
      <Field label="状态">
        <select name="status" defaultValue={changelog?.status ?? "active"} className={selectClass}>
          <option value="active">启用</option>
          <option value="disabled">禁用</option>
        </select>
      </Field>
      <Field label="更新内容" className="md:col-span-2"><textarea name="content" required defaultValue={changelog?.content ?? ""} className={textareaClass} /></Field>
      <div className="md:col-span-2"><SubmitButton>{changelog ? "保存版本记录" : "新增版本记录"}</SubmitButton></div>
    </form>
  );
}
