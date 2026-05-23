export type PopularToolInput = {
  name: string;
  downloadCount: number;
  usageCount: number;
};

export type RankedPopularTool = PopularToolInput & {
  score: number;
};

export function calculateGrowthPercent(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function formatDashboardAmount(value: string | number | null | undefined) {
  return `¥${Number(value ?? 0).toFixed(2)}`;
}

export function rankPopularTools<T extends PopularToolInput>(tools: T[]): (T & RankedPopularTool)[] {
  return tools
    .map((tool) => ({
      ...tool,
      score: tool.downloadCount + tool.usageCount
    }))
    .sort((left, right) => right.score - left.score || right.downloadCount - left.downloadCount || left.name.localeCompare(right.name));
}
