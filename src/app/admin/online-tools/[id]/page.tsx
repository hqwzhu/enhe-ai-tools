import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ToolEditor } from "../../tool-admin-list";

export default async function AdminOnlineToolEditorPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ id }, notice] = await Promise.all([params, searchParams]);
  const [tool, categories, files] = await Promise.all([
    id === "new" ? Promise.resolve(null) : prisma.tool.findFirst({ where: { id, type: "online" }, include: { category: true } }),
    prisma.toolCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.file.findMany({ orderBy: { createdAt: "desc" } })
  ]);

  if (id !== "new" && !tool) notFound();

  return (
    <ToolEditor
      title={id === "new" ? "新增在线网页工具" : "编辑在线网页工具"}
      type="online"
      tool={tool ?? undefined}
      categories={categories}
      files={files}
      notice={notice}
    />
  );
}
