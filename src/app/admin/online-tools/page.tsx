import { prisma } from "@/lib/db";
import { ToolAdminList } from "../tool-admin-list";

export default async function AdminOnlineToolsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const tools = await prisma.tool.findMany({
    where: { type: "online" },
    include: { category: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
  });

  return <ToolAdminList title="在线网页工具管理" type="online" tools={tools} notice={params} />;
}
