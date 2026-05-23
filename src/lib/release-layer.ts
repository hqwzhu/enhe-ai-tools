export const releaseLayerLabels = {
  development: "开发版本",
  product: "产品版本",
  tool: "工具版本"
} as const;

export type ReleaseLayerKey = keyof typeof releaseLayerLabels;

export const productReleaseStatusMeta = {
  planned: { label: "规划中", className: "border-white/10 bg-white/5 text-[#8B95A7]" },
  active: { label: "发布准备中", className: "border-[#7AA7FF]/30 bg-[#7AA7FF]/10 text-[#9BBCFF]" },
  released: { label: "已发布", className: "border-[#48F5D3]/30 bg-[#48F5D3]/10 text-[#48F5D3]" },
  archived: { label: "已归档", className: "border-[#FFB86B]/30 bg-[#FFB86B]/10 text-[#FFB86B]" }
} as const;

export function summarizeReleaseLayers(counts: {
  developmentVersions: number;
  productReleases: number;
  toolChangelogs: number;
}) {
  return [
    { key: "development" as const, label: releaseLayerLabels.development, count: counts.developmentVersions },
    { key: "product" as const, label: releaseLayerLabels.product, count: counts.productReleases },
    { key: "tool" as const, label: releaseLayerLabels.tool, count: counts.toolChangelogs }
  ];
}
