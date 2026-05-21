import { prisma } from "@/lib/db";
import { uploadFileAdminAction, upsertFileAction } from "@/app/admin/actions";
import { AdminSection, Field, inputClass, selectClass, SubmitButton } from "@/app/admin/admin-ui";

export default async function AdminFilesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const [files, tools] = await Promise.all([
    prisma.file.findMany({ include: { tool: true }, orderBy: { createdAt: "desc" } }),
    prisma.tool.findMany({ orderBy: { name: "asc" } })
  ]);
  return (
    <AdminSection title="文件管理" intro="上传后会自动创建文件记录；配置腾讯云 COS 环境变量后会上传到 COS，否则落到本地 uploads 目录。">
      {params.uploaded ? (
        <p className="mb-5 rounded-xl border border-[#48F5D3]/30 bg-[#48F5D3]/10 px-4 py-3 text-sm text-[#48F5D3]">
          上传成功，已自动创建文件记录。
        </p>
      ) : null}
      {params.error ? (
        <p className="mb-5 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          上传失败：{params.error}
        </p>
      ) : null}
      <div className="glass mb-8 rounded-2xl p-6">
        <h2 className="text-xl font-semibold">上传文件</h2>
        <form action={uploadFileAdminAction} encType="multipart/form-data" className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
          <input name="file" type="file" required className={inputClass} />
          <button className="rounded-full bg-[#48F5D3] px-5 py-3 text-sm font-semibold text-[#05110e]">上传并创建记录</button>
        </form>
        <p className="mt-3 text-xs text-[#8B95A7]">推荐软件安装包命名包含工具名和版本号。COS 环境变量完整时自动使用 COS。</p>
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
