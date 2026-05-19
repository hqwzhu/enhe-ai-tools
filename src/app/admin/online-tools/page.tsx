import { prisma } from "@/lib/db";
import { ToolAdminList } from "../tool-admin-list";

export default async function AdminOnlineToolsPage() {
  const [tools, categories, files] = await Promise.all([
    prisma.tool.findMany({ where: { type: "online" }, include: { category: true }, orderBy: { createdAt: "desc" } }),
    prisma.toolCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.file.findMany({ orderBy: { createdAt: "desc" } })
  ]);
  return <ToolAdminList title="在线网页工具管理" type="online" tools={tools} categories={categories} files={files} />;
}
