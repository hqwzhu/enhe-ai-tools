import { prisma } from "@/lib/db";

export default async function AdminFilesPage() {
  const files = await prisma.file.findMany({ include: { tool: true }, orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="text-3xl font-semibold">文件管理</h1>
      <p className="mt-3 text-[#8B95A7]">文件表已预留本地路径、公开 URL、版本、大小、MIME 与腾讯云 COS 接入字段。</p>
      <div className="mt-8 space-y-3">
        {files.map((file) => (
          <div key={file.id} className="glass rounded-2xl p-5">
            <p className="font-semibold">{file.fileName}</p>
            <p className="mt-2 text-sm text-[#8B95A7]">{file.tool?.name ?? "未绑定工具"} · {file.fileUrl ?? file.filePath}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
