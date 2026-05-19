import { prisma } from "@/lib/db";
import { upsertFileAction } from "@/app/admin/actions";
import { AdminSection, Field, inputClass, selectClass, SubmitButton } from "@/app/admin/admin-ui";

export default async function AdminFilesPage() {
  const [files, tools] = await Promise.all([
    prisma.file.findMany({ include: { tool: true }, orderBy: { createdAt: "desc" } }),
    prisma.tool.findMany({ orderBy: { name: "asc" } })
  ]);
  return (
    <AdminSection title="文件管理" intro="文件表已预留本地路径、公开 URL、版本、大小、MIME 与腾讯云 COS 接入字段。可先用 /admin/upload 上传到本地 uploads 目录。">
      <div className="glass mb-8 rounded-2xl p-6">
        <h2 className="text-xl font-semibold">上传文件</h2>
        <form action="/api/admin/upload" method="post" encType="multipart/form-data" className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
          <input name="file" type="file" required className={inputClass} />
          <button className="rounded-full bg-[#48F5D3] px-5 py-3 text-sm font-semibold text-[#05110e]">上传到本地</button>
        </form>
        <p className="mt-3 text-xs text-[#8B95A7]">上传成功会返回 JSON，复制其中 url 到下方文件 URL；COS 正式接入时替换同一字段即可。</p>
      </div>
      <FileForm tools={tools} />
      <div className="mt-8 space-y-3">
        {files.map((file) => (
          <div key={file.id} className="glass rounded-2xl p-5">
            <form action={upsertFileAction} className="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="id" value={file.id} />
              <Field label="文件名"><input name="fileName" defaultValue={file.fileName} className={inputClass} /></Field>
              <Field label="绑定工具">
                <select name="toolId" defaultValue={file.toolId ?? ""} className={selectClass}>
                  <option value="">不绑定</option>
                  {tools.map((tool) => <option key={tool.id} value={tool.id}>{tool.name}</option>)}
                </select>
              </Field>
              <Field label="文件路径"><input name="filePath" defaultValue={file.filePath} className={inputClass} /></Field>
              <Field label="文件 URL"><input name="fileUrl" defaultValue={file.fileUrl ?? ""} className={inputClass} /></Field>
              <Field label="版本"><input name="version" defaultValue={file.version ?? ""} className={inputClass} /></Field>
              <Field label="MIME"><input name="mimeType" defaultValue={file.mimeType ?? ""} className={inputClass} /></Field>
              <Field label="大小 bytes"><input name="fileSize" type="number" defaultValue={file.fileSize?.toString() ?? ""} className={inputClass} /></Field>
              <div className="flex items-end"><SubmitButton>保存文件</SubmitButton></div>
            </form>
          </div>
        ))}
      </div>
    </AdminSection>
  );
}

function FileForm({ tools }: { tools: { id: string; name: string }[] }) {
  return (
    <form action={upsertFileAction} className="glass grid gap-4 rounded-2xl p-6 md:grid-cols-2">
      <Field label="文件名"><input name="fileName" required className={inputClass} /></Field>
      <Field label="绑定工具">
        <select name="toolId" className={selectClass}>
          <option value="">不绑定</option>
          {tools.map((tool) => <option key={tool.id} value={tool.id}>{tool.name}</option>)}
        </select>
      </Field>
      <Field label="文件路径"><input name="filePath" required placeholder="/uploads/app.exe 或 cos://..." className={inputClass} /></Field>
      <Field label="文件 URL"><input name="fileUrl" placeholder="/uploads/app.exe 或 https://..." className={inputClass} /></Field>
      <Field label="版本"><input name="version" className={inputClass} /></Field>
      <Field label="MIME"><input name="mimeType" className={inputClass} /></Field>
      <Field label="大小 bytes"><input name="fileSize" type="number" className={inputClass} /></Field>
      <div className="flex items-end"><SubmitButton>新增文件</SubmitButton></div>
    </form>
  );
}
