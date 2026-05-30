import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentLocale } from "@/lib/i18n";
import { ToolEditor } from "../../tool-admin-list";

export default async function AdminSoftwareToolEditorPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ id }, notice, locale] = await Promise.all([params, searchParams, getCurrentLocale()]);
  const [tool, categories, files] = await Promise.all([
    id === "new" ? Promise.resolve(null) : prisma.tool.findFirst({ where: { id, type: "software" }, include: { category: true } }),
    prisma.toolCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.file.findMany({ orderBy: { createdAt: "desc" } })
  ]);

  if (id !== "new" && !tool) notFound();

  return (
    <ToolEditor
      title={id === "new"
        ? (locale === "en" ? "New software tool" : "新增电脑软件工具")
        : (locale === "en" ? "Edit software tool" : "编辑电脑软件工具")}
      type="software"
      locale={locale}
      tool={tool ?? undefined}
      categories={categories}
      files={files}
      notice={notice}
    />
  );
}
