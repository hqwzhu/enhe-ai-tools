export type DevelopmentItemStatus = "completed" | "partial" | "not_started" | "recommended";

export type DevelopmentProgressItem = {
  id?: string;
  module: string;
  sortOrder: number;
};

export const statusMeta: Record<DevelopmentItemStatus, { label: string; weight: number; className: string }> = {
  completed: {
    label: "已完成",
    weight: 1,
    className: "border-[#48F5D3]/30 bg-[#48F5D3]/10 text-[#48F5D3]"
  },
  partial: {
    label: "部分完成",
    weight: 0.5,
    className: "border-[#7AA7FF]/30 bg-[#7AA7FF]/10 text-[#9BBCFF]"
  },
  not_started: {
    label: "未开始",
    weight: 0,
    className: "border-white/10 bg-white/5 text-[#8B95A7]"
  },
  recommended: {
    label: "建议补强",
    weight: 0,
    className: "border-[#FFB86B]/30 bg-[#FFB86B]/10 text-[#FFB86B]"
  }
};

export const priorityMeta = {
  high: { label: "高优先级", className: "text-red-200" },
  medium: { label: "中优先级", className: "text-[#FFB86B]" },
  low: { label: "低优先级", className: "text-[#8B95A7]" }
} as const;

export const versionStatusMeta = {
  active: "开发中",
  planned: "规划中",
  released: "已发布",
  archived: "已归档"
} as const;

export function calculateDevelopmentSummary(items: { status: DevelopmentItemStatus }[]) {
  const total = items.length;
  const completed = items.filter((item) => item.status === "completed").length;
  const partial = items.filter((item) => item.status === "partial").length;
  const recommended = items.filter((item) => item.status === "recommended").length;
  const notStarted = items.filter((item) => item.status === "not_started").length;
  const weighted = items.reduce((sum, item) => sum + statusMeta[item.status].weight, 0);

  return {
    total,
    completed,
    partial,
    recommended,
    notStarted,
    completionPercent: total ? Math.round((weighted / total) * 100) : 0
  };
}

export function groupDevelopmentItemsByModule<T extends DevelopmentProgressItem>(items: T[]) {
  const moduleOrder = new Map<string, number>();
  const grouped = new Map<string, T[]>();

  for (const item of items) {
    if (!moduleOrder.has(item.module)) moduleOrder.set(item.module, moduleOrder.size);
    grouped.set(item.module, [...(grouped.get(item.module) ?? []), item]);
  }

  return Array.from(grouped.entries())
    .sort(([left], [right]) => (moduleOrder.get(left) ?? 0) - (moduleOrder.get(right) ?? 0))
    .map(([module, moduleItems]) => ({
      module,
      items: [...moduleItems].sort((left, right) => left.sortOrder - right.sortOrder)
    }));
}
