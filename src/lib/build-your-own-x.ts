import {
  buildYourOwnXGeneratedCategories,
  buildYourOwnXGeneratedProjects,
} from "@/lib/build-your-own-x-data.generated";

export type BuildYourOwnXDifficulty = "beginner" | "intermediate" | "advanced";
export type BuildYourOwnXTime = "weekend" | "week" | "month";
export type BuildYourOwnXGoal =
  | "backend"
  | "ai"
  | "systems"
  | "frontend"
  | "devtools"
  | "portfolio";

export type BuildYourOwnXProject = {
  slug: string;
  category: string;
  language: string;
  title: string;
  url: string;
  isVideo: boolean;
  difficulty: BuildYourOwnXDifficulty;
  time: BuildYourOwnXTime;
  goals: readonly BuildYourOwnXGoal[];
  output: string;
};

export type BuildYourOwnXRoute = {
  slug: string;
  title: string;
  titleEn: string;
  summary: string;
  summaryEn: string;
  goals: BuildYourOwnXGoal[];
  categories: string[];
  outcome: string;
  outcomeEn: string;
};

export const buildYourOwnXSource = {
  repository: "codecrafters-io/build-your-own-x",
  url: "https://github.com/codecrafters-io/build-your-own-x",
  rawReadme:
    "https://raw.githubusercontent.com/codecrafters-io/build-your-own-x/master/README.md",
  snapshotDate: "2026-06-28",
  licenseNote:
    "This tool indexes public tutorial links and original summaries. It does not republish third-party tutorial bodies.",
} as const;

export const buildYourOwnXProjects =
  buildYourOwnXGeneratedProjects as unknown as readonly BuildYourOwnXProject[];

export const buildYourOwnXCategories = buildYourOwnXGeneratedCategories;

export const buildYourOwnXGoalLabels: Record<
  BuildYourOwnXGoal,
  { zh: string; en: string }
> = {
  backend: { zh: "后端进阶", en: "Backend" },
  ai: { zh: "AI 工程", en: "AI engineering" },
  systems: { zh: "系统底层", en: "Systems" },
  frontend: { zh: "前端深度", en: "Frontend" },
  devtools: { zh: "开发工具", en: "Developer tools" },
  portfolio: { zh: "作品集项目", en: "Portfolio" },
};

export const buildYourOwnXDifficultyLabels: Record<
  BuildYourOwnXDifficulty,
  { zh: string; en: string }
> = {
  beginner: { zh: "入门", en: "Beginner" },
  intermediate: { zh: "进阶", en: "Intermediate" },
  advanced: { zh: "高阶", en: "Advanced" },
};

export const buildYourOwnXTimeLabels: Record<
  BuildYourOwnXTime,
  { zh: string; en: string }
> = {
  weekend: { zh: "周末可启动", en: "Weekend start" },
  week: { zh: "约 1-2 周", en: "About 1-2 weeks" },
  month: { zh: "约 1 个月+", en: "About 1 month+" },
};

export const buildYourOwnXRoutes: readonly BuildYourOwnXRoute[] = [
  {
    slug: "backend-systems",
    title: "后端底层能力路线",
    titleEn: "Backend systems route",
    summary: "从 HTTP、缓存、数据库、容器和分布式系统入手，适合准备中高级后端面试和系统设计。",
    summaryEn:
      "Start with HTTP, cache, databases, containers, and distributed systems for backend interviews and system design.",
    goals: ["backend"],
    categories: ["Web Server", "Database", "Docker", "Git", "Distributed Systems"],
    outcome: "沉淀 2-3 个可写进简历的后端基础设施项目。",
    outcomeEn: "Create 2-3 backend infrastructure projects suitable for a portfolio.",
  },
  {
    slug: "ai-engineering",
    title: "AI 工程路线",
    titleEn: "AI engineering route",
    summary: "围绕 LLM、RAG、神经网络、搜索和视觉识别建立 AI 工程理解。",
    summaryEn:
      "Build practical AI engineering understanding around LLMs, RAG, neural networks, search, and visual recognition.",
    goals: ["ai"],
    categories: ["AI Model", "Neural Network", "Search Engine", "Visual Recognition System", "Bot"],
    outcome: "形成从模型理解到 AI 应用工程落地的项目组合。",
    outcomeEn: "Build a project set from model fundamentals to practical AI applications.",
  },
  {
    slug: "computer-systems",
    title: "计算机系统路线",
    titleEn: "Computer systems route",
    summary: "从 Shell、操作系统、虚拟机、编译器和处理器理解计算机底层机制。",
    summaryEn:
      "Understand low-level computing through shells, operating systems, virtual machines, compilers, and processors.",
    goals: ["systems"],
    categories: ["Shell", "Operating System", "Emulator / Virtual Machine", "Programming Language", "Processor"],
    outcome: "适合补齐 CS 基础，并构建高区分度技术作品。",
    outcomeEn: "Useful for CS fundamentals and technically distinctive projects.",
  },
  {
    slug: "frontend-depth",
    title: "前端深度路线",
    titleEn: "Frontend depth route",
    summary: "从模板引擎、前端框架、浏览器和文本编辑器理解前端运行机制。",
    summaryEn:
      "Learn frontend internals through template engines, frameworks, browsers, and editors.",
    goals: ["frontend"],
    categories: ["Template Engine", "Front-end Framework / Library", "Web Browser", "Text Editor"],
    outcome: "从框架使用者转向能解释原理和工程取舍的前端开发者。",
    outcomeEn: "Move from framework user to developer who can explain internals and tradeoffs.",
  },
  {
    slug: "developer-tools",
    title: "开发工具路线",
    titleEn: "Developer tools route",
    summary: "围绕 CLI、Git、Shell、编辑器和自动化 Bot 构建日常效率工具。",
    summaryEn:
      "Build practical productivity tools around CLIs, Git, shells, editors, and automation bots.",
    goals: ["devtools"],
    categories: ["Command-Line Tool", "Git", "Shell", "Text Editor", "Bot"],
    outcome: "适合做能直接提升开发效率的个人工具集。",
    outcomeEn: "Good for building personal tools that directly improve development speed.",
  },
] as const;

export function getBuildYourOwnXStats() {
  const languages = new Set<string>();
  for (const project of buildYourOwnXProjects) {
    for (const part of project.language.split("/")) {
      const normalized = part.trim();
      if (normalized) languages.add(normalized);
    }
  }
  return {
    projectCount: buildYourOwnXProjects.length,
    categoryCount: buildYourOwnXCategories.length,
    languageCount: languages.size,
    routeCount: buildYourOwnXRoutes.length,
  };
}

export function getBuildYourOwnXProjectsByRoute(route: BuildYourOwnXRoute) {
  return buildYourOwnXProjects.filter((project) =>
    route.categories.includes(project.category),
  );
}

export function getBuildYourOwnXTopLanguages(limit = 18) {
  const counts = new Map<string, number>();
  for (const project of buildYourOwnXProjects) {
    for (const part of project.language.split("/")) {
      const language = part.trim();
      if (!language) continue;
      counts.set(language, (counts.get(language) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

export function buildYourOwnXJsonLd() {
  const url = "https://www.enhe-tech.com.cn/build-your-own-x";
  return {
    webApplication: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Build Your Own X 项目导航器",
      alternateName: "Build Your Own X Navigator",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      url,
      isAccessibleForFree: true,
      description:
        "免费开发者项目导航工具，帮助用户按目标、语言、难度和时间筛选 Build Your Own X 开源教程。",
      creator: {
        "@type": "Organization",
        name: "ENHE AI",
        url: "https://www.enhe-tech.com.cn",
      },
    },
    itemList: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Build Your Own X curated project routes",
      itemListElement: buildYourOwnXRoutes.map((route, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: route.title,
        description: route.summary,
        url: `${url}#route-${route.slug}`,
      })),
    },
  };
}
