# ENHE AI Growth Topic Clusters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a static bilingual AI topic cluster layer that grows SEO/GEO traffic and routes visitors into existing ENHE AI conversion pages.

**Architecture:** Store six static topic definitions in `src/lib/ai-topic-clusters.ts`. Render them through shared App Router page shells for the hub and detail pages, with zh and en route wrappers. Reuse existing SEO helpers, `StructuredData`, `Container`, and current dark UI surfaces.

**Tech Stack:** Next.js App Router, React Server Components, TypeScript, JSON-LD schema helpers, Vitest source-regression tests.

---

## File Structure

- Create: `src/lib/ai-topic-clusters.ts`
  - Source of truth for topic slugs, localized copy, FAQ, comparisons, and related links.
  - Exports lookup helpers and schema builders.
- Create: `src/app/ai-topics/page-shell.tsx`
  - Shared hub/detail UI and metadata functions for both locales.
- Create: `src/app/(zh-public)/ai-topics/page.tsx`
  - Chinese hub route.
- Create: `src/app/(zh-public)/ai-topics/[slug]/page.tsx`
  - Chinese topic detail route.
- Create: `src/app/en/ai-topics/page.tsx`
  - English hub route.
- Create: `src/app/en/ai-topics/[slug]/page.tsx`
  - English topic detail route.
- Modify: `src/app/sitemap.ts`
  - Add hub and detail routes with alternates.
- Modify: `src/app/page-shell.tsx`
  - Add homepage link to topic hub.
- Modify: `src/app/software/page-shell.tsx`
  - Add topic entry links for tool discovery intents.
- Modify: `src/app/skill-learning/page-shell.tsx`
  - Add topic entry links for learning path intent.
- Modify: `src/app/account-services/page-shell.tsx`
  - Add topic entry link for compliance/access intent.
- Create: `src/lib/ai-topic-clusters.test.ts`
  - Behavioral tests for topic helpers.
- Modify: `src/lib/seo-phase-two-source.test.ts`
  - Source contracts for route files, sitemap, schema, and internal links.

## Task 1: Add Topic Cluster Data With Tests

**Files:**
- Create: `src/lib/ai-topic-clusters.test.ts`
- Create: `src/lib/ai-topic-clusters.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/ai-topic-clusters.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  aiTopicClusters,
  aiTopicClusterSlugs,
  buildAiTopicBreadcrumbSchema,
  buildAiTopicCollectionSchema,
  getAiTopicCluster,
} from "@/lib/ai-topic-clusters";

describe("ai topic clusters", () => {
  it("defines six stable topic clusters", () => {
    expect(aiTopicClusterSlugs).toEqual([
      "ai-content-creation-tools",
      "ai-video-image-creation",
      "local-ai-deployment",
      "ai-agent-automation",
      "ai-skill-learning-path",
      "ai-account-service-compliance",
    ]);
    expect(aiTopicClusters).toHaveLength(6);
  });

  it("returns localized topic content by slug", () => {
    const topic = getAiTopicCluster("local-ai-deployment");

    expect(topic?.slug).toBe("local-ai-deployment");
    expect(topic?.content.zh.title).toContain("本地 AI");
    expect(topic?.content.en.title).toContain("Local AI");
    expect(topic?.content.zh.faqs.length).toBeGreaterThanOrEqual(3);
    expect(topic?.content.en.relatedLinks.map((link) => link.href)).toContain("/build-your-own-x");
  });

  it("builds visible-content-aligned schemas", () => {
    const topic = getAiTopicCluster("ai-agent-automation");
    expect(topic).toBeDefined();
    if (!topic) throw new Error("missing topic");

    const collection = buildAiTopicCollectionSchema(topic, "zh");
    const breadcrumb = buildAiTopicBreadcrumbSchema(topic, "en");

    expect(collection["@type"]).toBe("CollectionPage");
    expect(collection.name).toBe(topic.content.zh.title);
    expect(collection.mainEntity["@type"]).toBe("ItemList");
    expect(breadcrumb["@type"]).toBe("BreadcrumbList");
    expect(JSON.stringify(breadcrumb)).toContain("/en/ai-topics/ai-agent-automation");
  });
});
```

- [ ] **Step 2: Run failing test**

Run:

```powershell
npm test -- src/lib/ai-topic-clusters.test.ts
```

Expected: FAIL because `@/lib/ai-topic-clusters` does not exist.

- [ ] **Step 3: Implement topic data and helpers**

Create `src/lib/ai-topic-clusters.ts` with:

```ts
import type { Locale } from "@/lib/dictionaries";
import {
  absoluteUrl,
  buildBreadcrumbSchema,
  buildLocalePath,
  type BreadcrumbItem,
} from "@/lib/seo";

export type AiTopicClusterSlug =
  | "ai-content-creation-tools"
  | "ai-video-image-creation"
  | "local-ai-deployment"
  | "ai-agent-automation"
  | "ai-skill-learning-path"
  | "ai-account-service-compliance";

type LocalizedLink = {
  href: string;
  label: string;
  description: string;
};

type AiTopicClusterContent = {
  title: string;
  shortTitle: string;
  description: string;
  answer: string;
  intents: Array<{ title: string; body: string; href: string }>;
  comparisonRows: Array<{
    dimension: string;
    optionA: string;
    optionB: string;
    nextStep: string;
  }>;
  faqs: Array<{ question: string; answer: string }>;
  relatedLinks: LocalizedLink[];
};

export type AiTopicCluster = {
  slug: AiTopicClusterSlug;
  updatedAt: string;
  content: Record<Locale, AiTopicClusterContent>;
};

export const aiTopicClusterSlugs: AiTopicClusterSlug[] = [
  "ai-content-creation-tools",
  "ai-video-image-creation",
  "local-ai-deployment",
  "ai-agent-automation",
  "ai-skill-learning-path",
  "ai-account-service-compliance",
];

export const aiTopicClusters: AiTopicCluster[] = [
  {
    slug: "ai-content-creation-tools",
    updatedAt: "2026-06-28",
    content: {
      zh: {
        title: "AI 内容创作工具怎么选",
        shortTitle: "内容创作",
        description: "面向写作、脚本、选题、资料整理和发布的 AI 内容创作工具选择指南。",
        answer:
          "选择 AI 内容创作工具时，先确认交付物是文章、脚本、短视频文案、封面说明还是运营素材，再比较资料输入、改写能力、批量处理、导出格式和教程支持。ENHE AI 建议从真实内容任务出发，先看趋势，再选工具，最后沉淀可复用模板。",
        intents: [
          { title: "写作与脚本", body: "适合选题、提纲、改写、脚本和发布前检查。", href: "/software" },
          { title: "内容工作流", body: "用课程把提示词、素材整理和发布流程固化。", href: "/skill-learning" },
          { title: "趋势选题", body: "从 AI 资讯和趋势页判断近期值得创作的话题。", href: "/ai-news" },
        ],
        comparisonRows: [
          { dimension: "输入材料", optionA: "短文本工具适合快速改写和摘要。", optionB: "长文档工具更适合资料整理和结构化输出。", nextStep: "先在软件页按任务筛选工具。" },
          { dimension: "交付结果", optionA: "个人创作者看重速度和风格稳定。", optionB: "团队内容生产更看重模板、协作和复盘。", nextStep: "用教程页沉淀可复用流程。" },
          { dimension: "成本边界", optionA: "免费工具适合试方向。", optionB: "付费工具适合高频生产和稳定交付。", nextStep: "购买前查看价格与服务边界。" },
        ],
        faqs: [
          { question: "AI 内容创作工具适合新手吗？", answer: "适合。新手应先从明确任务开始，例如生成提纲、改写段落、整理资料或制作短视频脚本，不要一开始追求全流程自动化。" },
          { question: "内容工具和 AI 技能课程怎么配合？", answer: "工具负责产出，课程负责方法。先用工具完成一次真实任务，再把提示词、步骤和检查清单整理为模板。" },
          { question: "如何避免生成内容空泛？", answer: "提供真实背景、受众、用途、素材和验收标准，并用趋势资讯补充上下文，输出后再进行人工编辑。" },
        ],
        relatedLinks: [
          { href: "/software", label: "AI 软件应用", description: "按内容创作任务筛选工具。" },
          { href: "/skill-learning", label: "AI 技能学习", description: "学习提示词和内容工作流。" },
          { href: "/ai-trends", label: "AI 趋势分析", description: "寻找创作选题和机会窗口。" },
        ],
      },
      en: {
        title: "How to choose AI content creation tools",
        shortTitle: "Content creation",
        description: "A practical guide for choosing AI tools for writing, scripts, research cleanup, and publishing.",
        answer:
          "Choose AI content creation tools by starting with the deliverable: article, script, short-video copy, cover notes, or operations material. Then compare input support, rewriting quality, batch workflow, export format, and tutorial support. ENHE AI recommends starting from a real content task, reading signals, choosing tools, and saving reusable templates.",
        intents: [
          { title: "Writing and scripts", body: "Use AI for outlines, rewriting, scripts, and publishing checks.", href: "/software" },
          { title: "Content workflows", body: "Turn prompts, research, and publishing steps into repeatable courses.", href: "/skill-learning" },
          { title: "Trend-led topics", body: "Use AI news and trend pages to decide what to create next.", href: "/ai-news" },
        ],
        comparisonRows: [
          { dimension: "Input material", optionA: "Short-text tools are good for rewriting and summaries.", optionB: "Long-document tools are better for research cleanup and structured output.", nextStep: "Filter tools by task on the software page." },
          { dimension: "Output goal", optionA: "Solo creators need speed and stable tone.", optionB: "Teams need templates, collaboration, and review loops.", nextStep: "Use tutorials to save reusable workflows." },
          { dimension: "Cost boundary", optionA: "Free tools are useful for testing direction.", optionB: "Paid tools fit high-frequency production.", nextStep: "Review pricing and service boundaries before purchase." },
        ],
        faqs: [
          { question: "Are AI content creation tools beginner-friendly?", answer: "Yes. Beginners should start with a clear task such as outlines, rewriting, research cleanup, or short-video scripts instead of trying to automate the entire workflow at once." },
          { question: "How should tools and AI courses work together?", answer: "Tools create the output while courses teach the method. Finish one real task, then save prompts, steps, and checks as a reusable template." },
          { question: "How do I avoid generic AI content?", answer: "Provide real context, audience, use case, source material, and acceptance criteria. Add trend context, then edit the result manually." },
        ],
        relatedLinks: [
          { href: "/software", label: "AI software apps", description: "Filter tools by content task." },
          { href: "/skill-learning", label: "AI skill learning", description: "Learn prompts and content workflows." },
          { href: "/ai-trends", label: "AI trends", description: "Find content opportunities and timing." },
        ],
      },
    },
  },
  {
    slug: "ai-video-image-creation",
    updatedAt: "2026-06-28",
    content: {
      zh: {
        title: "AI 视频与图像创作工具路线",
        shortTitle: "视频图像",
        description: "面向短视频、封面、视觉素材和多模态创作的 AI 工具选择路线。",
        answer:
          "AI 视频与图像工具应按产出场景选择：短视频脚本、分镜、封面、素材扩展、批量剪辑或图片处理。先确认素材来源和版权边界，再比较生成质量、编辑能力、导出规格、学习成本和是否能融入发布流程。",
        intents: [
          { title: "短视频生产", body: "把脚本、分镜、素材和剪辑连接成流程。", href: "/software" },
          { title: "封面与视觉资产", body: "为内容发布快速制作封面、配图和素材变体。", href: "/software" },
          { title: "创作方法学习", body: "学习提示词、镜头语言和多模态工作流。", href: "/skill-learning" },
        ],
        comparisonRows: [
          { dimension: "创作阶段", optionA: "图像工具适合封面、素材和视觉探索。", optionB: "视频工具更适合脚本、分镜和成片流程。", nextStep: "先按素材类型筛选软件。" },
          { dimension: "质量控制", optionA: "单图质量看细节、风格一致和可编辑性。", optionB: "视频质量看连贯性、节奏、字幕和导出规格。", nextStep: "用教程补齐制作流程。" },
          { dimension: "发布效率", optionA: "个人创作者需要快速试错。", optionB: "团队更需要模板化和批量产出。", nextStep: "沉淀模板后再购买高频工具。" },
        ],
        faqs: [
          { question: "AI 视频工具和 AI 图片工具应该先学哪个？", answer: "如果目标是短视频发布，先学脚本和素材流程；如果目标是封面、配图或视觉风格，先学图像工具。" },
          { question: "如何判断 AI 视觉工具是否适合长期使用？", answer: "看它是否支持稳定风格、可编辑输出、清晰授权说明、合理价格和可复用流程。" },
          { question: "创作者如何减少视觉工具试错成本？", answer: "先用一个真实项目定义验收标准，再筛选工具和教程，不要只按单张效果图决定。" },
        ],
        relatedLinks: [
          { href: "/software", label: "AI 创作工具", description: "筛选视频、图像与素材处理工具。" },
          { href: "/tutorials", label: "实用教程", description: "查看配置、制作和发布步骤。" },
          { href: "/ai-news", label: "AI 前沿资讯", description: "跟踪多模态工具更新。" },
        ],
      },
      en: {
        title: "AI video and image creation workflow",
        shortTitle: "Video and image",
        description: "A workflow guide for AI tools for short video, covers, visual assets, and multimodal creation.",
        answer:
          "Choose AI video and image tools by production scenario: scripts, storyboards, covers, asset expansion, batch editing, or image cleanup. Confirm source material and rights first, then compare generation quality, editing control, export specs, learning cost, and fit with publishing workflows.",
        intents: [
          { title: "Short video production", body: "Connect scripts, storyboards, assets, and editing steps.", href: "/software" },
          { title: "Covers and assets", body: "Create covers, illustrations, and material variants faster.", href: "/software" },
          { title: "Creation methods", body: "Learn prompts, shot language, and multimodal workflows.", href: "/skill-learning" },
        ],
        comparisonRows: [
          { dimension: "Creation stage", optionA: "Image tools fit covers, assets, and style exploration.", optionB: "Video tools fit scripts, storyboards, and final clips.", nextStep: "Filter software by material type." },
          { dimension: "Quality control", optionA: "Image quality depends on detail, style consistency, and editability.", optionB: "Video quality depends on continuity, pacing, subtitles, and export specs.", nextStep: "Use tutorials to learn production flow." },
          { dimension: "Publishing speed", optionA: "Solo creators need fast experiments.", optionB: "Teams need templates and batch output.", nextStep: "Save templates before buying high-frequency tools." },
        ],
        faqs: [
          { question: "Should I learn AI video or AI image tools first?", answer: "For short-video publishing, start with scripts and asset flow. For covers, illustrations, or visual style, start with image tools." },
          { question: "How do I judge long-term fit?", answer: "Look for stable style, editable output, clear rights notes, reasonable pricing, and repeatable workflow support." },
          { question: "How can creators reduce tool trial cost?", answer: "Define acceptance criteria with one real project before comparing tools and tutorials." },
        ],
        relatedLinks: [
          { href: "/software", label: "AI creator tools", description: "Filter video, image, and asset tools." },
          { href: "/tutorials", label: "Tutorials", description: "Review setup, production, and publishing steps." },
          { href: "/ai-news", label: "AI news", description: "Track multimodal tool updates." },
        ],
      },
    },
  },
  {
    slug: "local-ai-deployment",
    updatedAt: "2026-06-28",
    content: {
      zh: {
        title: "本地 AI 部署与开发路线",
        shortTitle: "本地 AI",
        description: "适合本地模型、离线处理、隐私保护和开发者项目练习的 AI 路线。",
        answer:
          "本地 AI 部署适合重视隐私、离线处理、素材安全、可控成本和工程练习的用户。开始前应确认硬件、模型、运行环境、数据边界和学习目标；如果目标是提升开发能力，可以把本地部署和 Build Your Own X 项目结合。",
        intents: [
          { title: "本地模型运行", body: "确认硬件、模型格式、推理工具和运行环境。", href: "/software" },
          { title: "开发项目练习", body: "通过项目路线补齐工程能力和作品集。", href: "/build-your-own-x" },
          { title: "教程与排错", body: "学习安装、配置、参数和常见错误处理。", href: "/tutorials" },
        ],
        comparisonRows: [
          { dimension: "部署方式", optionA: "本地部署更可控，适合隐私和离线任务。", optionB: "在线工具更快开始，适合轻量试用。", nextStep: "按任务选择本地或在线工具。" },
          { dimension: "学习成本", optionA: "本地方案需要理解模型、依赖和环境。", optionB: "在线方案更依赖平台规则和账号访问。", nextStep: "用教程补齐配置能力。" },
          { dimension: "作品价值", optionA: "本地项目能展示工程理解。", optionB: "在线工具更适合快速交付内容。", nextStep: "进入 Build Your Own X 选择项目。" },
        ],
        faqs: [
          { question: "本地 AI 部署适合普通用户吗？", answer: "如果只是快速使用 AI，在线工具更轻；如果重视隐私、离线处理或工程能力，本地部署更值得学习。" },
          { question: "学习本地 AI 应该先装工具还是先做项目？", answer: "先用简单工具跑通环境，再选一个小项目验证流程，避免一开始陷入复杂配置。" },
          { question: "本地 AI 和作品集有什么关系？", answer: "本地 AI 项目能展示模型选择、数据处理、部署、性能权衡和问题排查能力，适合技术型作品集。" },
        ],
        relatedLinks: [
          { href: "/software", label: "本地 AI 工具", description: "查找本地部署和桌面工具。" },
          { href: "/build-your-own-x", label: "Build Your Own X", description: "选择可展示的开发项目路线。" },
          { href: "/tutorials", label: "部署教程", description: "学习安装、配置和排错步骤。" },
        ],
      },
      en: {
        title: "Local AI deployment and developer path",
        shortTitle: "Local AI",
        description: "A path for local models, offline processing, privacy, and developer project practice.",
        answer:
          "Local AI deployment fits users who care about privacy, offline processing, asset safety, controllable cost, and engineering practice. Before starting, confirm hardware, model format, runtime, data boundary, and learning goal. If the goal is developer growth, combine local deployment with Build Your Own X projects.",
        intents: [
          { title: "Run local models", body: "Check hardware, model format, inference tools, and runtime.", href: "/software" },
          { title: "Practice projects", body: "Use project routes to build engineering proof and portfolio work.", href: "/build-your-own-x" },
          { title: "Setup tutorials", body: "Learn installation, configuration, parameters, and troubleshooting.", href: "/tutorials" },
        ],
        comparisonRows: [
          { dimension: "Deployment style", optionA: "Local deployment is more controllable for privacy and offline tasks.", optionB: "Online tools are faster for lightweight trials.", nextStep: "Choose local or online tools by task." },
          { dimension: "Learning cost", optionA: "Local workflows require model, dependency, and environment understanding.", optionB: "Online workflows depend more on platform rules and access.", nextStep: "Use tutorials to learn setup." },
          { dimension: "Portfolio value", optionA: "Local projects show engineering judgment.", optionB: "Online tools fit fast content delivery.", nextStep: "Open Build Your Own X for a project route." },
        ],
        faqs: [
          { question: "Is local AI deployment suitable for ordinary users?", answer: "For fast AI usage, online tools are lighter. For privacy, offline processing, or engineering growth, local deployment is worth learning." },
          { question: "Should I install tools or build projects first?", answer: "Run a simple tool first to verify the environment, then choose a small project to validate the workflow." },
          { question: "How does local AI help a portfolio?", answer: "Local AI projects show model choice, data handling, deployment, performance tradeoffs, and troubleshooting skills." },
        ],
        relatedLinks: [
          { href: "/software", label: "Local AI tools", description: "Find local deployment and desktop tools." },
          { href: "/build-your-own-x", label: "Build Your Own X", description: "Choose portfolio-ready developer projects." },
          { href: "/tutorials", label: "Deployment tutorials", description: "Learn setup, configuration, and debugging." },
        ],
      },
    },
  },
  {
    slug: "ai-agent-automation",
    updatedAt: "2026-06-28",
    content: {
      zh: {
        title: "AI Agent 与自动化工作流",
        shortTitle: "Agent 自动化",
        description: "面向重复任务、流程编排、AI Agent 和自动化工具的实践路线。",
        answer:
          "AI Agent 与自动化适合把重复、规则清晰、需要多步骤处理的任务交给 AI 辅助完成。开始前应先画出输入、判断、执行、检查和交付节点，再选择工具、提示词、课程和服务支持，避免把不清晰的问题直接交给 Agent。",
        intents: [
          { title: "流程自动化", body: "整理重复任务的输入、步骤、检查和输出。", href: "/skill-learning" },
          { title: "Agent 工具", body: "查找能执行多步骤任务的 AI 软件和插件。", href: "/software" },
          { title: "趋势跟踪", body: "关注 Agent 产品、框架和实践案例更新。", href: "/ai-news" },
        ],
        comparisonRows: [
          { dimension: "任务类型", optionA: "规则清晰任务适合自动化。", optionB: "目标含糊任务应先人工拆解。", nextStep: "先用课程学习流程设计。" },
          { dimension: "工具选择", optionA: "轻量任务可用现成工具。", optionB: "复杂任务需要脚本、API 或本地流程。", nextStep: "在软件页查找合适工具。" },
          { dimension: "风险控制", optionA: "低风险任务可逐步自动执行。", optionB: "高风险任务必须保留人工审核。", nextStep: "建立验收和回滚清单。" },
        ],
        faqs: [
          { question: "什么任务适合交给 AI Agent？", answer: "适合输入明确、步骤可描述、验收标准清楚、出错成本可控的任务，例如资料整理、内容初稿、格式转换和内部流程提醒。" },
          { question: "自动化前最重要的准备是什么？", answer: "先写清楚流程图和验收标准。没有明确流程时，Agent 只会放大混乱。" },
          { question: "AI Agent 会完全替代人工吗？", answer: "短期更现实的方式是人机协同。让 Agent 处理重复步骤，人负责目标、判断、审核和例外情况。" },
        ],
        relatedLinks: [
          { href: "/skill-learning", label: "AI 自动化课程", description: "学习流程拆解和提示词方法。" },
          { href: "/software", label: "Agent 工具", description: "查找自动化软件和插件。" },
          { href: "/ai-news/topics/ai-agent", label: "AI Agent 资讯", description: "跟踪智能体产品和框架。" },
        ],
      },
      en: {
        title: "AI agent and automation workflows",
        shortTitle: "Agent automation",
        description: "A practical path for repeated tasks, workflow orchestration, AI agents, and automation tools.",
        answer:
          "AI agents and automation work best for repeated, rule-based, multi-step tasks. Before choosing tools, map the input, decision, action, review, and output nodes. Then select software, prompts, courses, and support. Do not hand unclear problems to an agent before breaking down the workflow.",
        intents: [
          { title: "Workflow automation", body: "Map repeated tasks into inputs, steps, checks, and outputs.", href: "/skill-learning" },
          { title: "Agent tools", body: "Find AI software and plugins that execute multi-step tasks.", href: "/software" },
          { title: "Trend tracking", body: "Track agent products, frameworks, and real cases.", href: "/ai-news" },
        ],
        comparisonRows: [
          { dimension: "Task type", optionA: "Clear rule-based tasks fit automation.", optionB: "Vague goals need human breakdown first.", nextStep: "Learn workflow design in courses." },
          { dimension: "Tool choice", optionA: "Light tasks can use ready-made tools.", optionB: "Complex tasks may need scripts, APIs, or local workflows.", nextStep: "Find matching tools on software pages." },
          { dimension: "Risk control", optionA: "Low-risk tasks can gradually automate execution.", optionB: "High-risk tasks need human review.", nextStep: "Create acceptance and rollback checks." },
        ],
        faqs: [
          { question: "Which tasks fit AI agents?", answer: "Tasks with clear inputs, describable steps, acceptance criteria, and controllable error cost, such as research cleanup, drafts, format conversion, and internal reminders." },
          { question: "What matters most before automation?", answer: "Write the workflow and acceptance criteria first. Without a clear process, agents amplify confusion." },
          { question: "Will AI agents replace human work completely?", answer: "The practical near-term pattern is human-agent collaboration: agents handle repeated steps while people own goals, judgment, review, and exceptions." },
        ],
        relatedLinks: [
          { href: "/skill-learning", label: "AI automation courses", description: "Learn workflow breakdown and prompt methods." },
          { href: "/software", label: "Agent tools", description: "Find automation software and plugins." },
          { href: "/ai-news/topics/ai-agent", label: "AI agent news", description: "Track agent products and frameworks." },
        ],
      },
    },
  },
  {
    slug: "ai-skill-learning-path",
    updatedAt: "2026-06-28",
    content: {
      zh: {
        title: "AI 技能学习路线怎么规划",
        shortTitle: "技能路线",
        description: "从提示词、工具实战、本地部署到项目练习的 AI 技能学习路线。",
        answer:
          "AI 技能学习应围绕真实任务规划，而不是按工具热度追逐。推荐顺序是：先明确要交付的结果，再学习提示词和工具操作，然后用课程或教程完成一次真实任务，最后把步骤沉淀成模板或作品集项目。",
        intents: [
          { title: "提示词与工具基础", body: "从常用任务和清晰输入输出开始。", href: "/skill-learning" },
          { title: "项目化练习", body: "用 Build Your Own X 把学习变成作品。", href: "/build-your-own-x" },
          { title: "趋势辅助选课", body: "用趋势和资讯判断该学什么。", href: "/ai-trends" },
        ],
        comparisonRows: [
          { dimension: "学习起点", optionA: "新手先学提示词和工具基础。", optionB: "有基础者直接围绕项目练习。", nextStep: "进入技能学习页选课。" },
          { dimension: "学习材料", optionA: "教程适合解决具体操作。", optionB: "课程适合建立系统方法。", nextStep: "按目标选择课程或教程。" },
          { dimension: "成果沉淀", optionA: "效率型学习沉淀模板。", optionB: "开发型学习沉淀作品集。", nextStep: "进入 Build Your Own X 做项目。" },
        ],
        faqs: [
          { question: "学习 AI 技能应该先学提示词吗？", answer: "可以先学基础提示词，但更重要的是带着真实任务练习，让提示词服务于输出结果。" },
          { question: "AI 课程和免费教程有什么区别？", answer: "免费教程适合解决单点问题，课程更适合建立连续路径、案例和复盘方法。" },
          { question: "怎样证明自己真的掌握 AI 技能？", answer: "用可展示成果证明，例如内容模板、自动化流程、工具配置文档、本地 AI 项目或作品集页面。" },
        ],
        relatedLinks: [
          { href: "/skill-learning", label: "AI 技能学习", description: "选择课程和学习路径。" },
          { href: "/tutorials", label: "实用教程", description: "解决具体操作问题。" },
          { href: "/build-your-own-x", label: "项目练习", description: "把学习变成作品集。" },
        ],
      },
      en: {
        title: "How to plan an AI skill learning path",
        shortTitle: "Skill path",
        description: "An AI skill learning path from prompts and tool practice to local deployment and projects.",
        answer:
          "Plan AI skill learning around real tasks, not tool hype. Start with the deliverable, learn prompts and tool operation, finish one real task with a course or tutorial, then save the steps as a template or portfolio project.",
        intents: [
          { title: "Prompt and tool basics", body: "Start with common tasks and clear inputs and outputs.", href: "/skill-learning" },
          { title: "Project practice", body: "Use Build Your Own X to turn learning into portfolio work.", href: "/build-your-own-x" },
          { title: "Trend-led learning", body: "Use trend pages to decide what to learn next.", href: "/ai-trends" },
        ],
        comparisonRows: [
          { dimension: "Starting point", optionA: "Beginners should learn prompts and tool basics.", optionB: "Experienced users can learn through projects.", nextStep: "Choose courses on skill-learning pages." },
          { dimension: "Learning material", optionA: "Tutorials solve concrete operations.", optionB: "Courses build a systematic method.", nextStep: "Choose courses or tutorials by goal." },
          { dimension: "Proof of skill", optionA: "Productivity learning should save templates.", optionB: "Developer learning should save portfolio work.", nextStep: "Use Build Your Own X for projects." },
        ],
        faqs: [
          { question: "Should I learn prompts first?", answer: "Basic prompts help, but real tasks matter more. Prompts should serve a deliverable output." },
          { question: "What is the difference between AI courses and free tutorials?", answer: "Free tutorials solve single problems. Courses are better for continuous paths, cases, and review methods." },
          { question: "How can I prove AI skill mastery?", answer: "Show visible outputs such as content templates, automation workflows, setup docs, local AI projects, or portfolio pages." },
        ],
        relatedLinks: [
          { href: "/skill-learning", label: "AI skill learning", description: "Choose courses and learning paths." },
          { href: "/tutorials", label: "Tutorials", description: "Solve concrete operation issues." },
          { href: "/build-your-own-x", label: "Project practice", description: "Turn learning into portfolio work." },
        ],
      },
    },
  },
  {
    slug: "ai-account-service-compliance",
    updatedAt: "2026-06-28",
    content: {
      zh: {
        title: "AI 账号服务与合规访问指南",
        shortTitle: "账号合规",
        description: "购买或咨询 AI 账号服务前，理解访问方式、平台规则和服务边界。",
        answer:
          "AI 账号服务应被理解为订阅咨询、账号使用支持、访问说明和平台规则提醒，而不是绕过官方规则的捷径。使用第三方平台前，应以对应平台官方政策为准，并确认交付范围、售后边界、退款规则、账号安全和数据边界。",
        intents: [
          { title: "访问前检查", body: "确认平台规则、服务范围和账号安全边界。", href: "/account-services" },
          { title: "价格与交付", body: "购买前查看报价、交付说明和退款规则。", href: "/pricing" },
          { title: "先选工具再咨询", body: "先明确任务和工具，再判断是否需要账号支持。", href: "/software" },
        ],
        comparisonRows: [
          { dimension: "使用目的", optionA: "明确工具和任务后再咨询服务。", optionB: "不建议把账号服务当成替代官方授权。", nextStep: "先看软件和价格页。" },
          { dimension: "风险边界", optionA: "合规使用遵守平台政策。", optionB: "高风险承诺应避免依赖。", nextStep: "查看服务说明和官方规则。" },
          { dimension: "购买判断", optionA: "适合需要访问说明和交付支持的用户。", optionB: "不适合希望绕过规则的需求。", nextStep: "购买前阅读价格和退款说明。" },
        ],
        faqs: [
          { question: "AI 账号服务主要解决什么问题？", answer: "它帮助用户理解订阅方式、访问路径、交付说明、售后边界和平台规则，不应被理解为绕过官方限制。" },
          { question: "购买前必须检查什么？", answer: "检查平台官方政策、服务范围、交付材料、退款规则、账号安全、数据边界和售后响应方式。" },
          { question: "账号服务和 AI 软件页有什么关系？", answer: "更稳妥的路径是先确定工具和任务，再根据实际访问或订阅需求咨询账号服务。" },
        ],
        relatedLinks: [
          { href: "/account-services", label: "AI 账号服务", description: "查看访问说明和服务边界。" },
          { href: "/pricing", label: "价格说明", description: "购买前确认报价和交付规则。" },
          { href: "/software", label: "AI 软件应用", description: "先确定真正需要的工具。" },
        ],
      },
      en: {
        title: "AI account services and compliant access guide",
        shortTitle: "Account compliance",
        description: "Understand access paths, platform rules, and service boundaries before buying or requesting AI account service guidance.",
        answer:
          "AI account services should be understood as subscription guidance, account usage support, access notes, and platform policy reminders, not shortcuts around official rules. For third-party platforms, official policies should prevail. Review delivery scope, support boundaries, refund rules, account security, and data boundaries before use.",
        intents: [
          { title: "Access checks", body: "Confirm platform rules, service scope, and account safety boundaries.", href: "/account-services" },
          { title: "Pricing and delivery", body: "Review pricing, delivery notes, and refund rules before purchase.", href: "/pricing" },
          { title: "Choose tools first", body: "Clarify the task and tool before deciding whether access support is needed.", href: "/software" },
        ],
        comparisonRows: [
          { dimension: "Purpose", optionA: "Request service guidance after clarifying the tool and task.", optionB: "Do not treat account service as replacement for official authorization.", nextStep: "Read software and pricing pages first." },
          { dimension: "Risk boundary", optionA: "Compliant use follows platform policy.", optionB: "Avoid relying on high-risk promises.", nextStep: "Review service notes and official rules." },
          { dimension: "Purchase decision", optionA: "Useful for users who need access notes and delivery support.", optionB: "Not suitable for attempts to bypass rules.", nextStep: "Read pricing and refund notes before purchase." },
        ],
        faqs: [
          { question: "What does AI account service guidance solve?", answer: "It helps users understand subscription options, access paths, delivery notes, support boundaries, and platform rules. It should not be used to bypass official limits." },
          { question: "What must I check before purchase?", answer: "Check platform policy, service scope, delivery material, refund rules, account security, data boundaries, and support response." },
          { question: "How does account service relate to software pages?", answer: "The safer path is to define the tool and task first, then request account guidance only when access or subscription support is needed." },
        ],
        relatedLinks: [
          { href: "/account-services", label: "AI account services", description: "Review access notes and service boundaries." },
          { href: "/pricing", label: "Pricing", description: "Confirm quotes and delivery rules before purchase." },
          { href: "/software", label: "AI software apps", description: "Find the tool you actually need first." },
        ],
      },
    },
  },
];

export function getAiTopicCluster(slug: string) {
  return aiTopicClusters.find((topic) => topic.slug === slug);
}

export function getAiTopicPath(slug: string, locale: Locale) {
  return buildLocalePath(`/ai-topics/${slug}`, locale);
}

export function getAiTopicHubPath(locale: Locale) {
  return buildLocalePath("/ai-topics", locale);
}

export function buildAiTopicBreadcrumbSchema(
  topic: AiTopicCluster | null,
  locale: Locale,
) {
  const items: BreadcrumbItem[] = [
    { name: locale === "en" ? "Home" : "首页", path: buildLocalePath("/", locale) },
    {
      name: locale === "en" ? "AI Topics" : "AI 主题增长页",
      path: getAiTopicHubPath(locale),
    },
  ];

  if (topic) {
    items.push({
      name: topic.content[locale].shortTitle,
      path: getAiTopicPath(topic.slug, locale),
    });
  }

  return buildBreadcrumbSchema({ items });
}

export function buildAiTopicCollectionSchema(
  topic: AiTopicCluster,
  locale: Locale,
) {
  const content = topic.content[locale];

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: content.title,
    description: content.description,
    url: absoluteUrl(getAiTopicPath(topic.slug, locale)),
    inLanguage: locale === "en" ? "en-US" : "zh-CN",
    dateModified: topic.updatedAt,
    mainEntity: {
      "@type": "ItemList",
      name: content.title,
      itemListElement: content.comparisonRows.map((row, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: row.dimension,
        description: `${row.optionA} ${row.optionB} ${row.nextStep}`,
      })),
    },
    about: content.intents.map((intent) => intent.title),
    isPartOf: {
      "@type": "WebSite",
      name: "ENHE AI",
      url: absoluteUrl("/"),
    },
  };
}
```

- [ ] **Step 4: Run tests**

Run:

```powershell
npm test -- src/lib/ai-topic-clusters.test.ts
```

Expected: PASS.

## Task 2: Add AI Topic Routes And Page Shells

**Files:**
- Create: `src/app/ai-topics/page-shell.tsx`
- Create: `src/app/(zh-public)/ai-topics/page.tsx`
- Create: `src/app/(zh-public)/ai-topics/[slug]/page.tsx`
- Create: `src/app/en/ai-topics/page.tsx`
- Create: `src/app/en/ai-topics/[slug]/page.tsx`
- Modify: `src/lib/seo-phase-two-source.test.ts`

- [ ] **Step 1: Add failing source contracts**

Append to `src/lib/seo-phase-two-source.test.ts`:

```ts
  it("keeps AI topic cluster routes, metadata, and schema wired", () => {
    const topicData = read("src/lib/ai-topic-clusters.ts");
    const shell = read("src/app/ai-topics/page-shell.tsx");
    const zhHub = read("src/app/(zh-public)/ai-topics/page.tsx");
    const zhDetail = read("src/app/(zh-public)/ai-topics/[slug]/page.tsx");
    const enHub = read("src/app/en/ai-topics/page.tsx");
    const enDetail = read("src/app/en/ai-topics/[slug]/page.tsx");

    for (const slug of [
      "ai-content-creation-tools",
      "ai-video-image-creation",
      "local-ai-deployment",
      "ai-agent-automation",
      "ai-skill-learning-path",
      "ai-account-service-compliance",
    ]) {
      expect(topicData).toContain(slug);
    }

    expect(shell).toContain("generateAiTopicsHubMetadata");
    expect(shell).toContain("generateAiTopicDetailMetadata");
    expect(shell).toContain("buildAiTopicCollectionSchema");
    expect(shell).toContain("buildFaqSchema");
    expect(shell).toContain("notFound()");
    expect(zhHub).toContain('forceLocale="zh"');
    expect(zhDetail).toContain('forceLocale="zh"');
    expect(enHub).toContain('forceLocale="en"');
    expect(enDetail).toContain('forceLocale="en"');
  });
```

- [ ] **Step 2: Run failing test**

Run:

```powershell
npm test -- src/lib/seo-phase-two-source.test.ts
```

Expected: FAIL because route files do not exist.

- [ ] **Step 3: Create shared page shell**

Create `src/app/ai-topics/page-shell.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StructuredData } from "@/components/structured-data";
import { Container, SectionTitle } from "@/components/ui";
import type { Locale } from "@/lib/dictionaries";
import {
  aiTopicClusters,
  aiTopicClusterSlugs,
  buildAiTopicBreadcrumbSchema,
  buildAiTopicCollectionSchema,
  getAiTopicCluster,
  getAiTopicHubPath,
  getAiTopicPath,
} from "@/lib/ai-topic-clusters";
import {
  buildFaqSchema,
  buildLocalePath,
  buildMetadataTitle,
  buildPageMetadata,
} from "@/lib/seo";

const hubText = {
  zh: {
    title: "AI 主题增长页",
    intro:
      "按创作目标、工具场景和学习路线进入 ENHE AI。这里把 AI 软件、课程、资讯、账号服务和项目练习连接成可搜索、可引用的主题路径。",
    metaDescription:
      "ENHE AI 主题增长页聚合 AI 内容创作、视频图像、本地部署、Agent 自动化、技能学习和账号服务合规指南，帮助年轻 AI 用户和创作者快速选择工具、课程、教程与项目路线。",
    answerTitle: "如何使用 ENHE AI 主题页？",
    answer:
      "先选择你当前最接近的 AI 目标，例如内容创作、本地部署、Agent 自动化或技能学习。每个主题页都会提供直接答案、对比维度、常见问题和下一步链接，帮助你从搜索意图进入具体工具、课程、教程、资讯或服务说明。",
    updatedLabel: "最后更新",
  },
  en: {
    title: "AI Topic Hub",
    intro:
      "Enter ENHE AI by creator goal, tool scenario, and learning path. These topic pages connect software, courses, news, account guidance, and project practice into searchable and citable paths.",
    metaDescription:
      "ENHE AI topic hub covers AI content creation, video and image creation, local AI deployment, agent automation, skill learning, and compliant account-service access for young AI users and creators.",
    answerTitle: "How should you use ENHE AI topic pages?",
    answer:
      "Start with the AI goal closest to your current task, such as content creation, local deployment, agent automation, or skill learning. Each topic page gives direct answers, comparison dimensions, FAQ, and next-step links into tools, courses, tutorials, news, or service notes.",
    updatedLabel: "Last updated",
  },
} as const;

const tableLabels = {
  zh: {
    comparison: "主题对比与下一步",
    dimension: "维度",
    optionA: "路径 A",
    optionB: "路径 B",
    nextStep: "下一步",
    faq: "常见问题",
    related: "继续查看",
    intents: "适合的使用场景",
  },
  en: {
    comparison: "Topic comparison and next step",
    dimension: "Dimension",
    optionA: "Path A",
    optionB: "Path B",
    nextStep: "Next step",
    faq: "FAQ",
    related: "Continue with",
    intents: "Best-fit scenarios",
  },
} as const;

export function generateAiTopicStaticParams() {
  return aiTopicClusterSlugs.map((slug) => ({ slug }));
}

export async function generateAiTopicsHubMetadata(
  forceLocale: Locale,
): Promise<Metadata> {
  const text = hubText[forceLocale];
  return buildPageMetadata({
    title: buildMetadataTitle({ pageTitle: text.title }),
    description: text.metaDescription,
    path: "/ai-topics",
    locale: forceLocale === "en" ? "en_US" : "zh_CN",
    localeKey: forceLocale,
  });
}

export async function generateAiTopicDetailMetadata({
  slug,
  forceLocale,
}: {
  slug: string;
  forceLocale: Locale;
}): Promise<Metadata> {
  const topic = getAiTopicCluster(slug);
  if (!topic) return {};

  const content = topic.content[forceLocale];
  return buildPageMetadata({
    title: buildMetadataTitle({ pageTitle: content.title }),
    description: content.description,
    path: `/ai-topics/${topic.slug}`,
    locale: forceLocale === "en" ? "en_US" : "zh_CN",
    localeKey: forceLocale,
  });
}

export function AiTopicsHubPageShell({ forceLocale }: { forceLocale: Locale }) {
  const text = hubText[forceLocale];
  const breadcrumbSchema = buildAiTopicBreadcrumbSchema(null, forceLocale);
  const hubSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: text.title,
    description: text.metaDescription,
    url: getAiTopicHubPath(forceLocale),
    inLanguage: forceLocale === "en" ? "en-US" : "zh-CN",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: aiTopicClusters.map((topic, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: topic.content[forceLocale].title,
        url: getAiTopicPath(topic.slug, forceLocale),
      })),
    },
  };

  return (
    <main>
      <Container className="py-14">
        <StructuredData data={[breadcrumbSchema, hubSchema]} />
        <SectionTitle as="h1" title={text.title} intro={text.intro} />
        <section className="surface-panel mt-8 p-6">
          <h2 className="text-2xl font-black text-[var(--marketing-text)]">
            {text.answerTitle}
          </h2>
          <p className="mt-3 max-w-4xl text-sm font-semibold leading-7 text-[var(--marketing-muted)] md:text-base md:leading-8">
            {text.answer}
          </p>
        </section>
        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {aiTopicClusters.map((topic) => {
            const content = topic.content[forceLocale];
            return (
              <Link
                key={topic.slug}
                href={getAiTopicPath(topic.slug, forceLocale)}
                className="surface-panel-soft block p-5 transition hover:-translate-y-0.5 hover:border-[var(--marketing-accent)]"
              >
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--marketing-accent)]">
                  {content.shortTitle}
                </p>
                <h2 className="mt-3 text-xl font-black leading-snug text-[var(--marketing-text)]">
                  {content.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[var(--marketing-muted)]">
                  {content.description}
                </p>
              </Link>
            );
          })}
        </section>
        <p className="mt-8 text-xs font-bold text-[var(--marketing-muted)]">
          {text.updatedLabel}: <time dateTime="2026-06-28">2026-06-28</time>
        </p>
      </Container>
    </main>
  );
}

export function AiTopicDetailPageShell({
  slug,
  forceLocale,
}: {
  slug: string;
  forceLocale: Locale;
}) {
  const topic = getAiTopicCluster(slug);
  if (!topic) notFound();

  const content = topic.content[forceLocale];
  const labels = tableLabels[forceLocale];
  const breadcrumbSchema = buildAiTopicBreadcrumbSchema(topic, forceLocale);
  const collectionSchema = buildAiTopicCollectionSchema(topic, forceLocale);
  const faqSchema = buildFaqSchema({ items: content.faqs });

  return (
    <main>
      <Container className="py-14">
        <StructuredData data={[breadcrumbSchema, collectionSchema, faqSchema]} />
        <div className="mb-6">
          <Link
            href={getAiTopicHubPath(forceLocale)}
            className="text-sm font-bold text-[var(--marketing-accent)] hover:text-[var(--marketing-text)]"
          >
            {forceLocale === "en" ? "AI Topic Hub" : "AI 主题增长页"}
          </Link>
        </div>
        <SectionTitle as="h1" title={content.title} intro={content.description} />

        <section className="surface-panel mt-8 p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--marketing-accent)]">
            {forceLocale === "en" ? "Direct answer" : "可摘录答案"}
          </p>
          <p className="mt-4 max-w-4xl text-base font-semibold leading-8 text-[var(--marketing-text)]">
            {content.answer}
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-black text-[var(--marketing-text)]">
            {labels.intents}
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {content.intents.map((intent) => (
              <Link
                key={intent.title}
                href={buildLocalePath(intent.href, forceLocale)}
                className="surface-panel-soft block p-5 transition hover:-translate-y-0.5 hover:border-[var(--marketing-accent)]"
              >
                <h3 className="text-lg font-black leading-snug text-[var(--marketing-text)]">
                  {intent.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--marketing-muted)]">
                  {intent.body}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="glass mt-8 rounded-2xl p-6">
          <h2 className="text-2xl font-black text-[var(--marketing-text)]">
            {labels.comparison}
          </h2>
          <div className="mt-5 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] border-separate border-spacing-0 overflow-hidden rounded-2xl border border-white/10 text-left text-sm">
              <thead>
                <tr className="bg-white/10 text-[var(--marketing-text)]">
                  <th className="border-b border-white/10 px-4 py-3 font-black">{labels.dimension}</th>
                  <th className="border-b border-white/10 px-4 py-3 font-black">{labels.optionA}</th>
                  <th className="border-b border-white/10 px-4 py-3 font-black">{labels.optionB}</th>
                  <th className="border-b border-white/10 px-4 py-3 font-black">{labels.nextStep}</th>
                </tr>
              </thead>
              <tbody>
                {content.comparisonRows.map((row) => (
                  <tr key={row.dimension} className="align-top">
                    <th className="border-b border-white/10 px-4 py-4 font-black text-[var(--marketing-text)]">{row.dimension}</th>
                    <td className="border-b border-white/10 px-4 py-4 leading-7 text-[var(--marketing-muted)]">{row.optionA}</td>
                    <td className="border-b border-white/10 px-4 py-4 leading-7 text-[var(--marketing-muted)]">{row.optionB}</td>
                    <td className="border-b border-white/10 px-4 py-4 leading-7 text-[var(--marketing-muted)]">{row.nextStep}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 grid gap-4 md:hidden">
            {content.comparisonRows.map((row) => (
              <article key={row.dimension} className="surface-panel-soft p-4">
                <h3 className="text-base font-black text-[var(--marketing-text)]">
                  {row.dimension}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--marketing-muted)]">
                  {row.optionA}
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--marketing-muted)]">
                  {row.optionB}
                </p>
                <p className="mt-2 text-sm font-bold leading-7 text-[var(--marketing-accent)]">
                  {row.nextStep}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.78fr]">
          <div className="surface-panel p-6">
            <h2 className="text-2xl font-black text-[var(--marketing-text)]">
              {labels.faq}
            </h2>
            <div className="mt-5 space-y-4">
              {content.faqs.map((item) => (
                <article key={item.question} className="rounded-2xl border border-white/10 bg-white/7 p-5">
                  <h3 className="text-base font-black leading-snug text-[var(--marketing-text)]">
                    {item.question}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--marketing-muted)]">
                    {item.answer}
                  </p>
                </article>
              ))}
            </div>
          </div>
          <aside className="surface-panel-soft p-6">
            <h2 className="text-2xl font-black text-[var(--marketing-text)]">
              {labels.related}
            </h2>
            <div className="mt-5 space-y-3">
              {content.relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={buildLocalePath(link.href, forceLocale)}
                  className="block rounded-2xl border border-white/10 bg-white/7 p-4 transition hover:border-[var(--marketing-accent)]"
                >
                  <strong className="text-sm font-black text-[var(--marketing-text)]">
                    {link.label}
                  </strong>
                  <span className="mt-2 block text-sm leading-6 text-[var(--marketing-muted)]">
                    {link.description}
                  </span>
                </Link>
              ))}
            </div>
            <p className="mt-5 text-xs font-bold text-[var(--marketing-muted)]">
              {hubText[forceLocale].updatedLabel}:{" "}
              <time dateTime={topic.updatedAt}>{topic.updatedAt}</time>
            </p>
          </aside>
        </section>
      </Container>
    </main>
  );
}
```

- [ ] **Step 4: Create route wrappers**

Create `src/app/(zh-public)/ai-topics/page.tsx`:

```tsx
import {
  AiTopicsHubPageShell,
  generateAiTopicsHubMetadata,
} from "@/app/ai-topics/page-shell";

export const revalidate = 300;

export const metadata = generateAiTopicsHubMetadata("zh");

export default function Page() {
  return <AiTopicsHubPageShell forceLocale="zh" />;
}
```

Create `src/app/en/ai-topics/page.tsx`:

```tsx
import {
  AiTopicsHubPageShell,
  generateAiTopicsHubMetadata,
} from "@/app/ai-topics/page-shell";

export const revalidate = 300;

export const metadata = generateAiTopicsHubMetadata("en");

export default function Page() {
  return <AiTopicsHubPageShell forceLocale="en" />;
}
```

Create `src/app/(zh-public)/ai-topics/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";
import {
  AiTopicDetailPageShell,
  generateAiTopicDetailMetadata,
  generateAiTopicStaticParams,
} from "@/app/ai-topics/page-shell";

export const revalidate = 300;

export function generateStaticParams() {
  return generateAiTopicStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return generateAiTopicDetailMetadata({ slug, forceLocale: "zh" });
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <AiTopicDetailPageShell slug={slug} forceLocale="zh" />;
}
```

Create `src/app/en/ai-topics/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";
import {
  AiTopicDetailPageShell,
  generateAiTopicDetailMetadata,
  generateAiTopicStaticParams,
} from "@/app/ai-topics/page-shell";

export const revalidate = 300;

export function generateStaticParams() {
  return generateAiTopicStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return generateAiTopicDetailMetadata({ slug, forceLocale: "en" });
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <AiTopicDetailPageShell slug={slug} forceLocale="en" />;
}
```

- [ ] **Step 5: Run focused tests**

Run:

```powershell
npm test -- src/lib/ai-topic-clusters.test.ts src/lib/seo-phase-two-source.test.ts
```

Expected: PASS.

## Task 3: Wire Sitemap And Internal Links

**Files:**
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/page-shell.tsx`
- Modify: `src/app/software/page-shell.tsx`
- Modify: `src/app/skill-learning/page-shell.tsx`
- Modify: `src/app/account-services/page-shell.tsx`
- Modify: `src/lib/seo-phase-two-source.test.ts`

- [ ] **Step 1: Add failing source contracts**

Append to `src/lib/seo-phase-two-source.test.ts`:

```ts
  it("keeps AI topic cluster sitemap and internal links discoverable", () => {
    const sitemap = read("src/app/sitemap.ts");
    const home = read("src/app/page-shell.tsx");
    const software = read("src/app/software/page-shell.tsx");
    const skillLearning = read("src/app/skill-learning/page-shell.tsx");
    const accountServices = read("src/app/account-services/page-shell.tsx");

    expect(sitemap).toContain("aiTopicClusters");
    expect(sitemap).toContain('"/ai-topics"');
    expect(sitemap).toContain('"/en/ai-topics"');
    expect(sitemap).toContain("getAiTopicPath");
    expect(home).toContain('"/ai-topics"');
    expect(software).toContain('"/ai-topics/ai-content-creation-tools"');
    expect(software).toContain('"/ai-topics/local-ai-deployment"');
    expect(skillLearning).toContain('"/ai-topics/ai-skill-learning-path"');
    expect(accountServices).toContain('"/ai-topics/ai-account-service-compliance"');
  });
```

- [ ] **Step 2: Run failing test**

Run:

```powershell
npm test -- src/lib/seo-phase-two-source.test.ts
```

Expected: FAIL because sitemap/internal links are not wired.

- [ ] **Step 3: Add sitemap imports and routes**

In `src/app/sitemap.ts`, add imports:

```ts
import { aiTopicClusters, getAiTopicPath } from "@/lib/ai-topic-clusters";
```

Add `"/ai-topics"` and `"/en/ai-topics"` to `staticRoutes`.

Add last-modified entries:

```ts
  "/ai-topics": new Date("2026-06-28T00:00:00.000Z"),
  "/en/ai-topics": new Date("2026-06-28T00:00:00.000Z"),
```

Inside `entries`, after static routes or after `aiTrendTopicPaths`, add:

```ts
    ...aiTopicClusters.flatMap((topic) =>
      (["zh", "en"] as const).map((locale) => {
        const path = getAiTopicPath(topic.slug, locale);
        return {
          url: absoluteSitemapUrl(path),
          lastModified: new Date(topic.updatedAt),
          alternates: {
            languages: buildAvailableLanguageAlternates(
              `/ai-topics/${topic.slug}`,
              ["zh", "en"],
            ),
          },
          changeFrequency: "weekly" as const,
          priority: 0.73,
        };
      }),
    ),
```

- [ ] **Step 4: Add homepage entry link**

In `src/app/page-shell.tsx`, add `/ai-topics` to an existing homepage link group. Use visible localized text:

```tsx
{
  label: forceLocale === "en" ? "AI topic paths" : "AI 主题路径",
  note: forceLocale === "en" ? "Choose by goal" : "按目标选择",
  href: "/ai-topics",
}
```

Use `buildLocalePath(item.href, forceLocale)` like existing homepage path strip links.

- [ ] **Step 5: Add listing page topic entry links**

In `src/app/software/page-shell.tsx`, add a small topic link array inside `SoftwareGeoBlock`:

```tsx
    {
      label: { zh: "AI 内容创作工具路线", en: "AI content creation path" },
      href: buildLocalePath("/ai-topics/ai-content-creation-tools", forceLocale),
    },
    {
      label: { zh: "本地 AI 部署路线", en: "Local AI deployment path" },
      href: buildLocalePath("/ai-topics/local-ai-deployment", forceLocale),
    },
```

In `src/app/skill-learning/page-shell.tsx`, add:

```tsx
    {
      label: { zh: "AI 技能学习路线", en: "AI skill learning path" },
      href: buildLocalePath("/ai-topics/ai-skill-learning-path", forceLocale),
    },
```

In `src/app/account-services/page-shell.tsx`, add:

```tsx
    {
      label: { zh: "账号服务合规指南", en: "Account compliance guide" },
      href: buildLocalePath("/ai-topics/ai-account-service-compliance", forceLocale),
    },
```

- [ ] **Step 6: Run tests**

Run:

```powershell
npm test -- src/lib/seo-phase-two-source.test.ts src/lib/ai-topic-clusters.test.ts
```

Expected: PASS.

## Task 4: Verify And Ship

**Files:**
- No new source changes unless checks expose a defect.

- [ ] **Step 1: Run focused tests**

Run:

```powershell
npm test -- src/lib/ai-topic-clusters.test.ts src/lib/seo-phase-two-source.test.ts src/lib/home-redesign-source.test.ts src/lib/site-audit-regressions.test.ts src/lib/seo.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run static checks**

Run:

```powershell
npm run lint
npm run typecheck
git diff --check
```

Expected: PASS.

- [ ] **Step 3: Run local route smoke check**

Run a dev server with temporary env if needed:

```powershell
$env:DATABASE_URL='postgresql://codex:codex@127.0.0.1:65432/enhe'
$env:AUTH_SECRET='codex-local-dev-secret-20260628'
npm run dev -- --hostname 0.0.0.0 --port 49152
```

Check:

```powershell
curl.exe -sS -o NUL -w "%{http_code}`n" http://localhost:49152/ai-topics
curl.exe -sS -o NUL -w "%{http_code}`n" http://localhost:49152/ai-topics/local-ai-deployment
curl.exe -sS -o NUL -w "%{http_code}`n" http://localhost:49152/en/ai-topics
curl.exe -sS -o NUL -w "%{http_code}`n" http://localhost:49152/en/ai-topics/local-ai-deployment
```

Expected: all `200`.

- [ ] **Step 4: Commit**

Run:

```powershell
git add docs/superpowers/specs/2026-06-28-growth-topic-clusters-design.md docs/superpowers/plans/2026-06-28-growth-topic-clusters.md src/lib/ai-topic-clusters.ts src/lib/ai-topic-clusters.test.ts src/app/ai-topics/page-shell.tsx src/app/(zh-public)/ai-topics/page.tsx src/app/(zh-public)/ai-topics/[slug]/page.tsx src/app/en/ai-topics/page.tsx src/app/en/ai-topics/[slug]/page.tsx src/app/sitemap.ts src/app/page-shell.tsx src/app/software/page-shell.tsx src/app/skill-learning/page-shell.tsx src/app/account-services/page-shell.tsx src/lib/seo-phase-two-source.test.ts
git commit -m "feat: add ai topic growth clusters"
```

- [ ] **Step 5: Push and deploy**

Run:

```powershell
git fetch origin
git push origin HEAD:main
```

Deploy using direct SSH pull, or bundle fallback if server GitHub TLS fails.

- [ ] **Step 6: Public checks**

Run:

```powershell
curl.exe -sS -o NUL -w "topics:%{http_code}`n" https://www.enhe-tech.com.cn/ai-topics
curl.exe -sS -o NUL -w "topic:%{http_code}`n" https://www.enhe-tech.com.cn/ai-topics/local-ai-deployment
curl.exe -sS -o NUL -w "en-topics:%{http_code}`n" https://www.enhe-tech.com.cn/en/ai-topics
curl.exe -sS -o NUL -w "health:%{http_code}`n" https://www.enhe-tech.com.cn/api/health
```

Expected: all `200`.

## Self-Review

Spec coverage:

- Static bilingual hub and detail routes: Task 2.
- Six stable topics: Task 1.
- Metadata and structured data: Task 2.
- Sitemap: Task 3.
- Homepage/listing page internal links: Task 3.
- Verification, push, deploy: Task 4.

No task changes Prisma schema, admin routes, payment, auth, order, user center, or access logic.
