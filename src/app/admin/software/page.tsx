import { prisma } from "@/lib/db";
import { ToolAdminList } from "../tool-admin-list";

export default async function AdminSoftwarePage() {
  const [tools, categories, files] = await Promise.all([
    prisma.tool.findMany({ where: { type: "software" }, include: { category: true }, orderBy: { createdAt: "desc" } }),
    prisma.toolCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.file.findMany({ orderBy: { createdAt: "desc" } })
  ]);
  return <ToolAdminList title="电脑软件工具管理" type="software" tools={tools} categories={categories} files={files} />;
}
