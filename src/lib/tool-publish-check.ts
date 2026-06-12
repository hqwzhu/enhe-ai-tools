export type ToolPublishCheckInput = {
  type: "software" | "online";
  categoryId: string | null;
  shortDescription: string | null;
  content: string | null;
  coverImage: string | null;
  downloadFileId: string | null;
  downloadFileUrl?: string | null;
  onlineUrl: string | null;
  isDownloadPaid: boolean;
  downloadPrice: unknown;
};

export function getToolPublishIssues(tool: ToolPublishCheckInput) {
  const issues: string[] = [];

  if (!tool.categoryId) issues.push("未选择分类");
  if (!tool.coverImage?.trim()) issues.push("未设置封面图");
  if (!tool.shortDescription?.trim()) issues.push("未填写简介");
  if (!tool.content?.trim()) issues.push("未填写详细介绍");

  if (tool.type === "software" && !tool.downloadFileId && !tool.downloadFileUrl?.trim()) issues.push("未绑定下载文件");
  if (tool.type === "software" && tool.isDownloadPaid && Number(tool.downloadPrice) <= 0) {
    issues.push("付费下载价格需大于 0");
  }

  return issues;
}
