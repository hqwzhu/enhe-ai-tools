import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { userHasVip } from "@/lib/membership";
import { canDownloadVipTool } from "@/lib/access-rules";

async function assertBaseToolAccess(toolId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tool = await prisma.tool.findUnique({ where: { id: toolId }, include: { downloadFile: true } });
  if (!tool || tool.status !== "published") throw new Error("工具不存在或未发布");

  if (!canDownloadVipTool({ isVipRequired: tool.isVipRequired, hasVip: await userHasVip(user.id) })) {
    redirect("/pricing");
  }

  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0] ?? null;
  const userAgent = headerStore.get("user-agent");

  return { tool, user, ip, userAgent };
}

export async function assertDownloadAccess(toolId: string) {
  const { tool, user, ip, userAgent } = await assertBaseToolAccess(toolId);
  if (!tool.downloadFileId || !tool.downloadFile) throw new Error("工具尚未配置下载文件");

  if (tool.isDownloadPaid) {
    const purchase = await prisma.toolPurchase.findUnique({
      where: { userId_toolId: { userId: user.id, toolId: tool.id } }
    });
    if (!purchase) redirect(`/tools/${tool.slug}?download=pay-required`);
  }

  await prisma.downloadLog.create({
    data: { userId: user.id, toolId: tool.id, fileId: tool.downloadFileId, ip, userAgent }
  });
  await prisma.tool.update({ where: { id: tool.id }, data: { downloadCount: { increment: 1 } } });
  await prisma.file.update({ where: { id: tool.downloadFileId }, data: { downloadCount: { increment: 1 } } });
  return tool.downloadFile;
}

export async function assertOnlineToolAccess(toolId: string) {
  const { tool, user, ip, userAgent } = await assertBaseToolAccess(toolId);
  await prisma.toolUsageLog.create({ data: { userId: user.id, toolId: tool.id, ip, userAgent } });
  await prisma.tool.update({ where: { id: tool.id }, data: { usageCount: { increment: 1 } } });
  return tool;
}
