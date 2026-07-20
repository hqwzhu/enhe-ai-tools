export type VisibleToolMetric = {
  type: "download" | "usage";
  count: number;
};

export function getVisibleToolMetrics(input: {
  downloadCount: number;
  usageCount: number;
}): VisibleToolMetric[] {
  return [
    input.downloadCount > 0
      ? ({ type: "download", count: input.downloadCount } as const)
      : null,
    input.usageCount > 0
      ? ({ type: "usage", count: input.usageCount } as const)
      : null,
  ].filter((metric): metric is VisibleToolMetric => Boolean(metric));
}
