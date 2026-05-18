import { prisma } from "@/lib/db";
import { ToolAdminList } from "../tool-admin-list";

export default async function AdminOnlineToolsPage() {
  const tools = await prisma.tool.findMany({ where: { type: "online" }, include: { category: true }, orderBy: { createdAt: "desc" } });
  return <ToolAdminList title="在线网页工具管理" tools={tools} />;
}
