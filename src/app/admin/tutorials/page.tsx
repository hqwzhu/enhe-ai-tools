import { prisma } from "@/lib/db";
import { upsertTutorialAction } from "@/app/admin/actions";
import { AdminSection, Field, inputClass, selectClass, SubmitButton, textareaClass } from "@/app/admin/admin-ui";

export default async function AdminTutorialsPage() {
  const [tutorials, tools] = await Promise.all([
    prisma.tutorial.findMany({ include: { tool: true }, orderBy: { sortOrder: "asc" } }),
    prisma.tool.findMany({ orderBy: { name: "asc" } })
  ]);
  return (
    <AdminSection title="教程管理" intro="为每个工具维护独立教程、图片、视频链接、排序和启用状态。">
      <TutorialForm tools={tools} />
      <div className="mt-8 space-y-3">
        {tutorials.map((tutorial) => (
          <div key={tutorial.id} className="glass rounded-2xl p-5">
            <TutorialForm tutorial={tutorial} tools={tools} />
          </div>
        ))}
      </div>
    </AdminSection>
  );
}

function TutorialForm({
  tutorial,
  tools
}: {
  tutorial?: {
    id: string;
    toolId: string;
    title: string;
    content: string;
    imageUrl: string | null;
    videoUrl: string | null;
    notes: string | null;
    commonErrors: string | null;
    sortOrder: number;
    status: string;
  };
  tools: { id: string; name: string }[];
}) {
  return (
    <form action={upsertTutorialAction} className="grid gap-4 md:grid-cols-2">
      {tutorial ? <input type="hidden" name="id" value={tutorial.id} /> : null}
      <Field label="工具">
        <select name="toolId" defaultValue={tutorial?.toolId ?? ""} required className={selectClass}>
          <option value="">选择工具</option>
          {tools.map((tool) => <option key={tool.id} value={tool.id}>{tool.name}</option>)}
        </select>
      </Field>
      <Field label="教程标题"><input name="title" required defaultValue={tutorial?.title ?? ""} className={inputClass} /></Field>
      <Field label="图片地址"><input name="imageUrl" defaultValue={tutorial?.imageUrl ?? ""} className={inputClass} /></Field>
      <Field label="视频链接"><input name="videoUrl" defaultValue={tutorial?.videoUrl ?? ""} className={inputClass} /></Field>
      <Field label="排序"><input name="sortOrder" type="number" defaultValue={tutorial?.sortOrder ?? 0} className={inputClass} /></Field>
      <Field label="状态">
        <select name="status" defaultValue={tutorial?.status ?? "active"} className={selectClass}>
          <option value="active">启用</option>
          <option value="disabled">禁用</option>
        </select>
      </Field>
      <Field label="教程正文" className="md:col-span-2"><textarea name="content" required defaultValue={tutorial?.content ?? ""} className={textareaClass} /></Field>
      <Field label="注意事项" className="md:col-span-2"><textarea name="notes" defaultValue={tutorial?.notes ?? ""} className={textareaClass} /></Field>
      <Field label="常见错误" className="md:col-span-2"><textarea name="commonErrors" defaultValue={tutorial?.commonErrors ?? ""} className={textareaClass} /></Field>
      <div className="md:col-span-2"><SubmitButton>{tutorial ? "保存教程" : "新增教程"}</SubmitButton></div>
    </form>
  );
}
