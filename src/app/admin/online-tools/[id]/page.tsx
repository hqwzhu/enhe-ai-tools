import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentLocale } from "@/lib/i18n";
import { ToolEditor } from "../../tool-admin-list";

export default async function AdminOnlineToolEditorPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ id }, notice, locale] = await Promise.all([params, searchParams, getCurrentLocale()]);
  const [tool, categories, files] = await Promise.all([
    id === "new" ? Promise.resolve(null) : prisma.tool.findFirst({ where: { id, type: "online" }, include: { category: true, downloadFile: true } }),
    prisma.toolCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.file.findMany({ orderBy: { createdAt: "desc" } })
  ]);

  if (id !== "new" && !tool) notFound();

  return (
    <ToolEditor
      title={id === "new"
        ? (locale === "en" ? "New online tool" : "新增在线网页工具")
        : (locale === "en" ? "Edit online tool" : "编辑在线网页工具")}
      type="online"
      locale={locale}
      tool={tool ?? undefined}
      categories={categories}
      files={files}
      notice={notice}
    />
  );
}
