import { prisma } from "@/lib/db";
import { ToolAdminList } from "../tool-admin-list";

export default async function AdminSoftwarePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const tools = await prisma.tool.findMany({
    where: { type: "software" },
    include: { category: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
  });

  return <ToolAdminList title="电脑软件工具管理" type="software" tools={tools} notice={params} />;
}
