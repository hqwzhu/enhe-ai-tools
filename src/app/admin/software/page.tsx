import { prisma } from "@/lib/db";
import { ToolAdminList } from "../tool-admin-list";

export default async function AdminSoftwarePage() {
  const tools = await prisma.tool.findMany({ where: { type: "software" }, include: { category: true }, orderBy: { createdAt: "desc" } });
  return <ToolAdminList title="电脑软件工具管理" tools={tools} />;
}
