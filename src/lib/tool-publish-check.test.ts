import { describe, expect, it } from "vitest";
import { getToolPublishIssues } from "@/lib/tool-publish-check";

const baseTool = {
  type: "software" as const,
  categoryId: "cat-1",
  shortDescription: "Short",
  content: "Content",
  coverImage: "/cover.jpg",
  downloadFileId: "file-1",
  downloadFileUrl: null,
  onlineUrl: null,
  isDownloadPaid: false,
  downloadPrice: 0
};

describe("getToolPublishIssues", () => {
  it("requires software download files before publishing confidently", () => {
    expect(getToolPublishIssues({ ...baseTool, downloadFileId: null })).toContain("未绑定下载文件");
  });

  it("accepts a direct software download URL as a publishable download source", () => {
    expect(getToolPublishIssues({ ...baseTool, downloadFileId: null, downloadFileUrl: "https://example.com/app.zip" })).not.toContain("未绑定下载文件");
  });

  it("requires online tool URL before publishing confidently", () => {
    expect(getToolPublishIssues({ ...baseTool, type: "online", downloadFileId: null, onlineUrl: null })).toContain("未配置在线地址");
  });

  it("requires positive price for paid downloads", () => {
    expect(getToolPublishIssues({ ...baseTool, isDownloadPaid: true, downloadPrice: 0 })).toContain("付费下载价格需大于 0");
  });

  it("returns no issues for a complete software tool", () => {
    expect(getToolPublishIssues(baseTool)).toEqual([]);
  });
});
