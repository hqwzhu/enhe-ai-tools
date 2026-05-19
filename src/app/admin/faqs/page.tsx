import { upsertToolFaqAction } from "@/app/admin/actions";
import { AdminSection, Field, inputClass, selectClass, SubmitButton, textareaClass } from "@/app/admin/admin-ui";
import { prisma } from "@/lib/db";

export default async function AdminFaqsPage() {
  const [faqs, tools] = await Promise.all([
    prisma.toolFaq.findMany({ include: { tool: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
    prisma.tool.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <AdminSection title="FAQ 管理" intro="为工具详情页维护常见问题。">
      <FaqForm tools={tools} />
      <div className="mt-8 space-y-4">
        {faqs.map((faq) => <FaqForm key={faq.id} faq={faq} tools={tools} />)}
      </div>
    </AdminSection>
  );
}

function FaqForm({
  faq,
  tools
}: {
  faq?: { id: string; toolId: string; question: string; answer: string; status: string; sortOrder: number };
  tools: { id: string; name: string }[];
}) {
  return (
    <form action={upsertToolFaqAction} className="glass grid gap-4 rounded-2xl p-6 md:grid-cols-2">
      {faq ? <input type="hidden" name="id" value={faq.id} /> : null}
      <Field label="工具">
        <select name="toolId" defaultValue={faq?.toolId ?? ""} required className={selectClass}>
          <option value="">选择工具</option>
          {tools.map((tool) => <option key={tool.id} value={tool.id}>{tool.name}</option>)}
        </select>
      </Field>
      <Field label="排序"><input name="sortOrder" type="number" defaultValue={faq?.sortOrder ?? 0} className={inputClass} /></Field>
      <Field label="状态">
        <select name="status" defaultValue={faq?.status ?? "active"} className={selectClass}>
          <option value="active">启用</option>
          <option value="disabled">禁用</option>
        </select>
      </Field>
      <Field label="问题" className="md:col-span-2"><input name="question" required defaultValue={faq?.question ?? ""} className={inputClass} /></Field>
      <Field label="答案" className="md:col-span-2"><textarea name="answer" required defaultValue={faq?.answer ?? ""} className={textareaClass} /></Field>
      <div className="md:col-span-2"><SubmitButton>{faq ? "保存 FAQ" : "新增 FAQ"}</SubmitButton></div>
    </form>
  );
}
