const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const toolSlug = "lumios-personal-ai-companion";
const articleSlug = "chatbox-to-personal-ai-companion-desktop-execution";
const productName = "LumiOS 个人AI操作伴侣";
const englishName = "LumiOS Personal AI Companion";
const publicReleaseVersion = "3.0.4";
const readmeVersion = "3.0.5";

const releasePageUrl =
  "https://github.com/hqwzhu/lumi.new/releases/tag/windows-v3.0.4";
const installerUrl =
  "https://github.com/hqwzhu/lumi.new/releases/download/windows-v3.0.4/LumiOS-Windows-3.0.4-x64-setup.exe";
const zipUrl =
  "https://github.com/hqwzhu/lumi.new/releases/download/windows-v3.0.4/LumiOS-Windows-3.0.4.zip";
const checksumUrl =
  "https://github.com/hqwzhu/lumi.new/releases/download/windows-v3.0.4/SHA256SUMS.txt";
const readmeUrl = "https://github.com/hqwzhu/lumi.new/blob/main/README.md";
const githubRepoUrl = "https://github.com/hqwzhu/lumi.new";

const coverImage =
  "/images/products/enhe-visuals/lumios-personal-ai-companion/cover.png";
const newsCoverImage = "/images/ai-news/lumios-ai-desktop-companion-cover.png";

function bilingual(zh, en) {
  return `[[zh]]${zh}[[/zh]][[en]]${en}[[/en]]`;
}

function slugFromName(name, fallback) {
  const ascii = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (ascii) return ascii;
  const encoded = encodeURIComponent(name.trim())
    .replace(/%/g, "")
    .toLowerCase()
    .slice(0, 72);
  return encoded || fallback;
}

async function findOrCreateToolCategory() {
  const category = await prisma.toolCategory.findFirst({
    where: { name: "AI电脑软件", type: "software" },
  });
  if (category) {
    return prisma.toolCategory.update({
      where: { id: category.id },
      data: {
        description: "面向桌面、本地工作流和效率场景的 AI 软件。",
        status: "active",
        sortOrder: 10,
      },
    });
  }

  return prisma.toolCategory.create({
    data: {
      name: "AI电脑软件",
      type: "software",
      description: "面向桌面、本地工作流和效率场景的 AI 软件。",
      status: "active",
      sortOrder: 10,
    },
  });
}

async function findOrCreateNewsCategory() {
  return prisma.newsCategory.upsert({
    where: { slug: "trend-insights" },
    update: {
      name: "趋势解读",
      description: "从行业变化中提炼对个人和团队有用的判断。",
      status: "active",
      sortOrder: 50,
    },
    create: {
      name: "趋势解读",
      slug: "trend-insights",
      description: "从行业变化中提炼对个人和团队有用的判断。",
      status: "active",
      sortOrder: 50,
    },
  });
}

async function upsertToolTags(toolId, tagNames) {
  await prisma.toolTagLink.deleteMany({ where: { toolId } });

  for (const [index, name] of tagNames.entries()) {
    const tag = await prisma.toolTag.upsert({
      where: { name },
      update: { status: "active", sortOrder: index * 10 },
      create: {
        name,
        slug: slugFromName(name, `tool-tag-${index + 1}`),
        status: "active",
        sortOrder: index * 10,
      },
    });
    await prisma.toolTagLink.create({
      data: { toolId, tagId: tag.id },
    });
  }
}

async function upsertNewsTags(articleId, tagNames) {
  await prisma.newsArticleTag.deleteMany({ where: { articleId } });

  for (const [index, name] of tagNames.entries()) {
    const tag = await prisma.newsTag.upsert({
      where: { name },
      update: { status: "active", sortOrder: index * 10 },
      create: {
        name,
        slug: slugFromName(name, `news-tag-${index + 1}`),
        status: "active",
        sortOrder: index * 10,
      },
    });
    await prisma.newsArticleTag.create({
      data: { articleId, tagId: tag.id },
    });
  }
}

const shortDescription = bilingual(
  "LumiOS 不是又一个聊天窗口，而是一个留在桌面节奏里的个人 AI 操作伴侣。它把记忆、模型、工具与本地工作台放进同一个入口，让你少一点重复解释，多一点连续完成。",
  "LumiOS is not another chat window. It is a personal AI companion that stays closer to your desktop rhythm, bringing memory, models, tools, and a local workbench into one entry point."
);

const zhProductContent = [
  "## 标题",
  "LumiOS 个人AI操作伴侣",
  "## 简介",
  "LumiOS 面向希望把 AI 真正放进日常桌面流程的用户。它不把你困在一次性的问答里，而是围绕记忆、模型选择、MCP 工具生态、语音交互和本地工作台，帮助 AI 更自然地接住你的上下文与下一步动作。",
  "## 详细介绍",
  "很多人真正疲惫的不是 AI 不会回答，而是每换一个任务、窗口或工具，就要重新解释背景、偏好和目标。LumiOS 试图解决的正是这件事：让 AI 不再像第一次见你，而是像一个逐渐熟悉你工作节奏的桌面搭档。",
  "在 LumiOS 里，模型不是孤立入口。你可以从云端模型或本地模型开始，把对话、知识库、RAG、工具调用、语音输入输出和画布工作台组织到同一个使用路径中。对创作者、开发者、运营人员和高频知识工作者来说，这比单纯增加一个聊天窗口更接近真实工作。",
  "它的价值不在于堆满概念，而在于降低摩擦：少重复讲背景，少在多个工具之间来回切换，多保留一个可以继续推进任务的入口。你可以先用它完成研究整理、写作延续、项目跟进、知识库问答或桌面执行，再逐步打开更多模型与工具能力。",
  "## 核心能力",
  "- 个人记忆与人格：保留偏好、上下文和长期关系线索，让 AI 更像持续合作的伙伴。",
  "- 多模型接入：官方项目说明列出 11 个 LLM 提供商，覆盖国内、国际与本地模型入口。",
  "- MCP 工具生态：20 个 MCP 技能与 26 个内置工具模块，连接文件、网页、代码、PDF、图像视频处理和桌面自动化等场景。",
  "- 语音交互：支持 TTS、STT、语音唤醒和更自然的桌面交互路径。",
  "- 本地工作台：围绕画布、知识库、RAG、终端和桌面自动化，把想法推进到可执行步骤。",
  "## 当前版本与使用边界",
  `截至 2026-06-24，GitHub API 可验证的最新公开下载 Release 是 Windows v${publicReleaseVersion}，项目主分支 README 已指向 Windows v${readmeVersion}。页面下载入口优先连接到当前可访问的公开 Release，后续正式 Release 更新后可继续同步。`,
  "Windows 用户可下载安装包并按首次启动向导配置至少一个模型来源。macOS 方向仍处于开发与测试说明阶段，正式公开分发还需要签名和 notarization。使用前请以官方 GitHub 项目和 Release 页面为准。",
  "## 适合谁",
  "- 想减少重复解释上下文的创作者、写作者和研究型用户。",
  "- 希望把 AI 接入本地桌面流程的开发者和效率工具用户。",
  "- 需要在模型、知识库、工具调用和桌面执行之间持续切换的运营人员。",
  "- 不满足于一次性问答，想要一个长期陪跑型 AI 入口的高频知识工作者。",
  "## 下一步",
  "先从一个真实任务开始使用：整理资料、延续写作、拆解项目、连接知识库或完成一次桌面操作。让 AI 接住一条主线，比第一天就打开所有能力更容易形成长期使用习惯。",
].join("\n\n");

const enProductContent = [
  "## Title",
  "LumiOS Personal AI Companion",
  "## Introduction",
  "LumiOS is built for people who want AI to become part of their daily desktop flow. Instead of keeping AI inside one-off Q&A, it brings memory, model choice, MCP tools, voice interaction, and a local workbench into one place so the assistant can stay with the context and the next action.",
  "## Detailed Introduction",
  "The real fatigue for many users is not that AI cannot answer. It is that every new task, window, or tool asks them to explain the background again. LumiOS is designed around that friction: AI should feel less like a first meeting and more like a companion that gradually understands your working rhythm.",
  "In LumiOS, models are not isolated entry points. You can start from cloud or local models and keep conversations, knowledge bases, RAG, tool calls, voice input and output, and canvas workbench activity closer to the same workflow. For creators, developers, operators, and heavy knowledge workers, that is more useful than adding another chat tab.",
  "The point is not to pile on buzzwords. It is to reduce friction: less re-explaining, less switching between disconnected tools, and more continuity from thinking to doing. Start with research cleanup, writing continuation, project follow-up, knowledge-base Q&A, or a desktop execution task, then expand model and tool capabilities over time.",
  "## Core Capabilities",
  "- Personal memory and personality: preserves preferences, context, and relationship cues so AI feels more like a continuing partner.",
  "- Multi-model access: the official project materials list 11 LLM providers across China, international, and local model options.",
  "- MCP tool ecosystem: 20 MCP skills and 26 built-in tool modules connect files, web tasks, code, PDF, image/video processing, and desktop automation.",
  "- Voice interaction: supports TTS, STT, voice wake-up, and a more natural desktop interaction path.",
  "- Local workbench: connects canvas, knowledge base, RAG, terminal, and desktop automation to move ideas toward executable steps.",
  "## Current Release Context",
  `As of 2026-06-24, the latest public downloadable GitHub Release verified through the GitHub API is Windows v${publicReleaseVersion}, while the main README already points to Windows v${readmeVersion}. The download entry on this page links to the currently reachable public release and can be updated again when the newer release assets are public.`,
  "Windows users can download the installer and configure at least one model source in the first-launch guide. macOS is still described as in development and testing guidance, with public distribution still requiring signing and notarization. Always confirm the latest official state on the GitHub project and release pages before installing.",
  "## Who It Is For",
  "- Creators, writers, and researchers who are tired of repeating context.",
  "- Developers and productivity users who want AI inside a local desktop flow.",
  "- Operators who switch between models, knowledge bases, tools, and execution tasks.",
  "- Heavy knowledge workers who want a long-term AI entry point rather than one-off answers.",
  "## Next Step",
  "Start with one real task: organize research, continue writing, break down a project, connect a knowledge base, or complete a desktop action. Building one reliable path is more useful than turning on every capability on day one.",
].join("\n\n");

const productContent = bilingual(zhProductContent, enProductContent);

const faqs = [
  {
    sortOrder: 10,
    question: bilingual(
      "LumiOS 和普通聊天助手最大的不同是什么？",
      "How is LumiOS different from a normal chat assistant?"
    ),
    answer: bilingual(
      "普通聊天助手更像一次性问答窗口，LumiOS 更强调记忆、工具、模型和本地工作台的连续性。它希望让 AI 更自然地留在你的桌面工作流里，而不是每次都从空白聊天重新开始。",
      "A normal chat assistant often feels like a one-off Q&A window. LumiOS focuses more on continuity across memory, tools, models, and a local workbench so AI can stay closer to your desktop workflow."
    ),
  },
  {
    sortOrder: 20,
    question: bilingual(
      "首次使用前需要准备什么？",
      "What should I prepare before first use?"
    ),
    answer: bilingual(
      "建议先准备至少一个可用模型来源。你可以从熟悉的云端模型 API 或本地模型入口开始，完成首次启动向导和诊断后再进入主工作台。",
      "Prepare at least one usable model source. Start from a familiar cloud model API or local model option, complete the first-launch guide and diagnostics, then enter the main workspace."
    ),
  },
  {
    sortOrder: 30,
    question: bilingual(
      "当前可以下载哪个版本？",
      "Which version is currently downloadable?"
    ),
    answer: bilingual(
      `截至 2026-06-24，GitHub API 可验证的最新公开 Release 是 Windows v${publicReleaseVersion}。主分支 README 已指向 Windows v${readmeVersion}，但对应公开 Release 资产当前尚未可访问，因此页面下载入口暂时指向可访问的 v${publicReleaseVersion}。`,
      `As of 2026-06-24, the latest public release verified through the GitHub API is Windows v${publicReleaseVersion}. The main README points to Windows v${readmeVersion}, but the matching public release assets are not currently reachable, so this page links to the available v${publicReleaseVersion} release.`
    ),
  },
  {
    sortOrder: 40,
    question: bilingual(
      "它适合哪些用户？",
      "Who is LumiOS best suited for?"
    ),
    answer: bilingual(
      "它适合创作者、开发者、运营人员、研究型用户和高频知识工作者，尤其适合不想每次都重新解释背景、重新打开工具、重新组织任务上下文的人。",
      "It is best suited for creators, developers, operators, researchers, and heavy knowledge workers, especially people who do not want to re-explain context and rebuild workflow state every time."
    ),
  },
  {
    sortOrder: 50,
    question: bilingual(
      "LumiOS 是否完全离线？",
      "Is LumiOS fully offline?"
    ),
    answer: bilingual(
      "LumiOS 具备本地工作台、本地数据目录和本地模型入口，但是否离线取决于你选择的模型和功能。云端模型、部分语音或联网工具仍需要网络和相应服务配置。",
      "LumiOS includes local workbench behavior, a local data directory, and local model options, but offline use depends on the selected model and feature. Cloud models, some voice features, and web tools still require network access and service setup."
    ),
  },
];

const tutorials = [
  {
    sortOrder: 10,
    title: bilingual(
      "首次启动：先跑通一条主路径",
      "First launch: make one main path work"
    ),
    content: bilingual(
      "下载官方 Windows 安装包后，先按首次启动向导配置一个你最熟悉的模型来源。不要第一天就把所有模型和工具全部打开，先确认主工作台可以稳定进入，再逐步扩展语音、知识库、MCP 工具和桌面自动化能力。",
      "After downloading the official Windows installer, configure one model source you already understand. Do not try to enable every model and tool on day one. Confirm that the main workspace works first, then expand into voice, knowledge base, MCP tools, and desktop automation."
    ),
    notes: bilingual(
      "如果 Windows SmartScreen 出现提示，请只在安装包来自官方 GitHub Release 时继续。",
      "If Windows SmartScreen appears, continue only when the installer was downloaded from the official GitHub Release."
    ),
    commonErrors: bilingual(
      "常见问题是只填写 API Key 却没有保存或诊断，导致首次进入工作台前判断模型不可用。",
      "A common issue is entering an API key but not saving or running diagnostics before trying to continue."
    ),
  },
  {
    sortOrder: 20,
    title: bilingual(
      "把 LumiOS 放进真实任务，而不是只做测试聊天",
      "Use LumiOS in a real task, not just a test chat"
    ),
    content: bilingual(
      "从一个有上下文的任务开始，例如继续写一篇文章、整理一个项目、提炼一份资料或让知识库回答一组问题。真正能让 LumiOS 留下来的不是一次惊艳回答，而是它能不能减少你下一次重新解释背景的成本。",
      "Start with a task that has real context, such as continuing an article, organizing a project, extracting notes, or asking a knowledge base a set of questions. What makes LumiOS useful is not a single impressive answer, but whether it reduces the cost of re-explaining context next time."
    ),
    notes: bilingual(
      "建议把偏好、长期背景和常用工作流逐步沉淀下来。",
      "Gradually preserve preferences, long-term background, and repeated workflows."
    ),
    commonErrors: bilingual(
      "把它只当临时聊天框使用，会错过记忆、工具和工作台连续性的主要价值。",
      "Using it only as a temporary chat box misses the main value of memory, tools, and workbench continuity."
    ),
  },
];

const articleTitle =
  "从聊天框到个人AI操作伴侣：AI助手正在进入桌面执行时代";
const articleEnglishTitle =
  "From Chat Boxes to Personal AI Companions: AI Assistants Are Entering the Desktop Execution Era";

const articleSummary =
  "AI 助手正在从“回答问题”走向“持续执行任务”。AI agent、MCP 工具生态、个人记忆和本地工作台，正在一起推动这场变化。对用户来说，真正重要的不是多一个聊天框，而是少一点重复解释，多一点把事情继续做下去的能力。";
const articleEnglishSummary =
  "AI assistants are moving from answering questions toward continuing real tasks. AI agents, MCP tool ecosystems, personal memory, and local workbenches are pushing this shift together. For users, the real value is not another chat box, but less repeated context setup and more continuity from thinking to doing.";

const articleContent = [
  "## 直接结论：AI 助手正在离开单一聊天框",
  "过去几年，很多人使用 AI 的方式仍然停留在聊天框里：提问、等待回答、复制内容、回到自己的工具继续做事。这个阶段很重要，但它不是终点。越来越多产品开始把 AI 从“回答入口”推向“桌面执行入口”。",
  "这背后有四个明显信号：AI agent 让助手开始规划和调用工具，MCP 让模型更容易连接外部数据与工具，个人记忆让 AI 能持续理解用户，本地工作台则把这些能力带回用户自己的桌面环境。",
  "## 为什么聊天框不够了？",
  "聊天框擅长快速问答，却不擅长长期陪跑。用户真正反复遇到的摩擦，是每次换任务都要重新解释背景，每次换工具都要重新组织上下文，每次重新打开会话都像第一次见面。",
  "当 AI 开始进入写作、开发、运营、研究、知识管理和桌面自动化场景时，用户需要的不再只是“更聪明的回答”，而是一个能接住上下文、选择模型、调用工具、保留记忆并继续推进任务的入口。",
  "## AI agent 把价值从回答推向执行",
  "AI agent 的意义不只是一个新名词。它改变的是用户预期：AI 不应该只给建议，还应该在可控边界内理解目标、拆解步骤、调用工具并把结果带回工作流。",
  "这也解释了为什么 Google 在面向网站的 AI 功能指南中开始提到 agentic experiences。未来的 AI 不只是总结页面，也可能理解页面结构、可执行信息和下一步动作。对产品和网站来说，清晰、可访问、可被理解的内容结构会越来越重要。",
  "## MCP 工具生态让桌面 AI 不再孤立",
  "MCP 的核心价值，是给 AI 应用与外部工具、数据源之间提供更标准化的连接方式。对于个人 AI 产品来说，这意味着 AI 不必停在单个模型窗口里，而可以连接文件、网页、知识库、命令行、自动化工具和更多本地能力。",
  "当工具生态被接进桌面，AI 才更接近“能帮你继续做事”的状态。模型能力当然重要，但如果没有工具和上下文，很多任务仍然会停在建议层面。",
  "## 个人记忆和本地工作台正在成为分水岭",
  "对高频用户来说，一个 AI 产品能不能长期留下来，往往取决于它是否记得你。这里的记忆不是简单保存聊天记录，而是保留偏好、项目背景、关系线索、常用任务方式和你希望 AI 如何配合你。",
  "本地工作台则解决另一个问题：AI 不应该永远漂在网页聊天里。它需要靠近用户真实工作的文件、窗口、知识库、终端和桌面动作。只有这样，AI 才更像长期搭档，而不是临时问答工具。",
  "## LumiOS 是这个趋势的一个具体样本",
  `[LumiOS 个人AI操作伴侣](/software/${toolSlug}) 正好落在这条趋势线上。根据官方 GitHub 项目说明，它围绕个人记忆、多模型接入、MCP 工具生态、语音交互、知识库/RAG、画布工作台和桌面自动化组织能力。它的产品方向不是再造一个聊天框，而是把 AI 放进更连续的桌面节奏。`,
  `截至 2026-06-24，GitHub API 可验证的最新公开下载 Release 是 Windows v${publicReleaseVersion}；项目主分支 README 已指向 Windows v${readmeVersion}。这说明 LumiOS 正在快速迭代，但用户下载时仍应以当前可访问的官方 Release 为准。`,
  "## 对 SEO 和 GEO 的启发",
  "这类产品页和资讯页不能只堆关键词。更适合的做法，是用清楚的问答结构解释它是什么、适合谁、能解决什么摩擦、当前版本是什么、如何开始使用，以及有哪些官方来源可以验证。这样的内容更容易被搜索引擎、AI 搜索和用户同时理解。",
  "如果一个用户或 AI 助手在搜索“个人 AI 操作伴侣是什么”“桌面 AI agent 工具如何选择”“MCP 工具生态有什么用”“本地 AI 工作台适合谁”，页面应该能给出直接、可信、可引用的答案，而不是只给口号。",
  "## 实用判断清单",
  "- 如果你经常重复解释同一类背景，优先关注个人记忆能力。",
  "- 如果你在多个模型之间切换，优先关注多模型和诊断体验。",
  "- 如果你希望 AI 真的执行任务，优先关注 MCP、工具调用和桌面自动化。",
  "- 如果你处理大量资料，优先关注知识库、RAG 和本地数据路径。",
  "- 如果你想长期使用，优先关注是否能融入自己的桌面节奏。",
  "## 结论：下一代 AI 助手会更像陪你做事的入口",
  "下一代 AI 助手的竞争，不会只发生在“谁回答得更漂亮”。真正会留下来的产品，更可能赢在是否能记住用户、连接工具、进入桌面、减少重复解释，并持续把任务往前推。",
  `如果你想从具体产品理解这条趋势，可以从 [LumiOS 产品页](/software/${toolSlug}) 开始，再回到 [ENHE AI 资讯](/ai-news) 继续关注 AI agent、MCP、本地 AI 和桌面执行工作流。`,
].join("\n\n");

const articleEnglishContent = [
  "## Direct Takeaway: AI Assistants Are Moving Beyond the Chat Box",
  "For the past few years, many people have used AI through a simple pattern: ask a question, wait for an answer, copy the result, and return to their own tools. That phase matters, but it is not the destination. More products are now moving AI from an answer interface into a desktop execution entry point.",
  "Four signals explain the shift: AI agents make assistants plan and call tools, MCP makes it easier to connect models with external data and tools, personal memory helps AI understand users over time, and local workbenches bring these capabilities closer to the user's own machine.",
  "## Why the Chat Box Is No Longer Enough",
  "A chat box is good at fast answers, but weak at long-term continuity. The friction users repeatedly feel is having to explain background again, rebuild context across tools, and reopen conversations that feel like a first meeting.",
  "As AI enters writing, development, operations, research, knowledge management, and desktop automation, users need more than smarter answers. They need an entry point that can hold context, choose models, call tools, preserve memory, and keep the work moving.",
  "## AI Agents Move Value From Answering to Executing",
  "The importance of AI agents is not the label itself. It is the change in user expectation: AI should not only suggest what to do, but also understand goals, break down steps, call tools within clear boundaries, and bring results back into the workflow.",
  "This also explains why Google's guidance around AI features discusses agentic experiences. Future AI experiences may not only summarize pages. They may inspect structure, actionable information, and next steps. For products and websites, clear and accessible content structure will matter more.",
  "## MCP Makes Desktop AI Less Isolated",
  "MCP matters because it gives AI applications a more standardized way to connect with external tools and data sources. For personal AI products, that means AI does not have to stay inside a single model window. It can connect files, web tasks, knowledge bases, command lines, automation tools, and local capabilities.",
  "When the tool ecosystem comes into the desktop, AI gets closer to continuing real work. Model quality still matters, but without tools and context, many tasks remain stuck at the suggestion layer.",
  "## Personal Memory and Local Workbenches Are Becoming the Divider",
  "For frequent users, whether an AI product lasts often depends on whether it remembers them. Memory here is not just saving chat logs. It means preserving preferences, project background, relationship cues, repeated task patterns, and the way the user wants AI to collaborate.",
  "A local workbench solves another problem: AI should not always float inside a web chat. It needs to sit closer to the user's files, windows, knowledge base, terminal, and desktop actions. That is when AI begins to feel like a long-term companion rather than a temporary Q&A tool.",
  "## LumiOS Is a Concrete Example of This Shift",
  `[LumiOS Personal AI Companion](/en/software/${toolSlug}) sits directly on this trend line. According to the official GitHub project materials, it organizes capabilities around personal memory, multi-model access, MCP tools, voice interaction, knowledge base/RAG, canvas workbench, and desktop automation. Its direction is not to add another chat box, but to place AI inside a more continuous desktop rhythm.`,
  `As of 2026-06-24, the latest public downloadable GitHub Release verified through the GitHub API is Windows v${publicReleaseVersion}; the main README already points to Windows v${readmeVersion}. This shows LumiOS is moving quickly, while users should still rely on the currently reachable official release before installing.`,
  "## What This Means for SEO and GEO",
  "Product pages and news articles in this category should not rely on keyword stuffing. A better structure explains what the product is, who it is for, what friction it solves, what the current release status is, how to start, and which official sources verify the claims. That makes the content easier for users, search engines, and AI search systems to understand.",
  "If a user or AI assistant searches for what a personal AI companion is, how to choose desktop AI agent tools, why MCP tool ecosystems matter, or who local AI workbenches are for, the page should provide direct and trustworthy answers instead of slogans.",
  "## Practical Evaluation Checklist",
  "- If you repeatedly explain the same background, prioritize personal memory.",
  "- If you switch between models, prioritize multi-model access and diagnostics.",
  "- If you want AI to execute tasks, prioritize MCP, tool use, and desktop automation.",
  "- If you handle many documents, prioritize knowledge base, RAG, and local data paths.",
  "- If you want long-term use, prioritize whether the product fits your desktop rhythm.",
  "## Conclusion: The Next AI Assistant Will Feel More Like a Work Companion",
  "The next generation of AI assistants will not compete only on prettier answers. The products that last are more likely to remember users, connect tools, enter the desktop, reduce repeated context setup, and keep tasks moving.",
  `If you want a concrete product lens for this trend, start with the [LumiOS product page](/en/software/${toolSlug}), then continue through [ENHE AI News](/en/ai-news) for more coverage of AI agents, MCP, local AI, and desktop execution workflows.`,
].join("\n\n");

async function main() {
  const [toolCategory, newsCategory] = await Promise.all([
    findOrCreateToolCategory(),
    findOrCreateNewsCategory(),
  ]);

  const tool = await prisma.tool.upsert({
    where: { slug: toolSlug },
    update: {
      name: productName,
      englishName,
      type: "software",
      categoryId: toolCategory.id,
      shortDescription,
      content: productContent,
      coverImage,
      screenshots: [],
      version: `${publicReleaseVersion} public release`,
      systemRequirement: "Windows 10 / 11",
      isVipRequired: false,
      isDownloadPaid: false,
      isDownloadLinkVipOnly: false,
      isHomeRecommended: true,
      downloadPrice: "0",
      onlineUrl: githubRepoUrl,
      status: "published",
      sortOrder: 12,
    },
    create: {
      name: productName,
      englishName,
      slug: toolSlug,
      type: "software",
      categoryId: toolCategory.id,
      shortDescription,
      content: productContent,
      coverImage,
      screenshots: [],
      version: `${publicReleaseVersion} public release`,
      systemRequirement: "Windows 10 / 11",
      isVipRequired: false,
      isDownloadPaid: false,
      isDownloadLinkVipOnly: false,
      isHomeRecommended: true,
      downloadPrice: "0",
      onlineUrl: githubRepoUrl,
      status: "published",
      sortOrder: 12,
    },
  });

  const directFile = await prisma.file.upsert({
    where: { id: `${toolSlug}-download` },
    update: {
      toolId: tool.id,
      fileName: `LumiOS-Windows-${publicReleaseVersion}-x64-setup.exe`,
      filePath: installerUrl,
      fileUrl: installerUrl,
      version: publicReleaseVersion,
      mimeType: "application/x-msdownload",
    },
    create: {
      id: `${toolSlug}-download`,
      toolId: tool.id,
      fileName: `LumiOS-Windows-${publicReleaseVersion}-x64-setup.exe`,
      filePath: installerUrl,
      fileUrl: installerUrl,
      version: publicReleaseVersion,
      mimeType: "application/x-msdownload",
    },
  });

  await prisma.tool.update({
    where: { id: tool.id },
    data: { downloadFileId: directFile.id },
  });

  await prisma.toolFaq.deleteMany({ where: { toolId: tool.id } });
  await prisma.tutorial.deleteMany({ where: { toolId: tool.id } });
  await prisma.toolChangelog.deleteMany({ where: { toolId: tool.id } });

  for (const faq of faqs) {
    await prisma.toolFaq.create({
      data: {
        toolId: tool.id,
        question: faq.question,
        answer: faq.answer,
        status: "active",
        sortOrder: faq.sortOrder,
      },
    });
  }

  for (const tutorial of tutorials) {
    await prisma.tutorial.create({
      data: {
        toolId: tool.id,
        title: tutorial.title,
        content: tutorial.content,
        notes: tutorial.notes,
        commonErrors: tutorial.commonErrors,
        status: "active",
        sortOrder: tutorial.sortOrder,
      },
    });
  }

  await prisma.toolChangelog.createMany({
    data: [
      {
        toolId: tool.id,
        version: `Windows v${publicReleaseVersion}`,
        title: bilingual(
          "当前公开下载版本",
          "Current public downloadable release"
        ),
        content: bilingual(
          "GitHub API 当前可验证的最新公开 Release，包含 Windows 安装包、ZIP 包、发布说明和 SHA256 校验文件。",
          "The latest public release currently verified through the GitHub API, with Windows installer, ZIP package, release notes, and SHA256 checksum file."
        ),
        releaseDate: new Date("2026-06-23T03:29:38.000Z"),
        status: "active",
        sortOrder: 10,
      },
      {
        toolId: tool.id,
        version: `README v${readmeVersion}`,
        title: bilingual(
          "主分支说明已推进",
          "Main README has moved ahead"
        ),
        content: bilingual(
          "项目主分支 README 已指向 Windows v3.0.5，但公开 Release 资产当前尚未可访问；下载前请以官方 Release 页面为准。",
          "The main README points to Windows v3.0.5, but the public release assets are not currently reachable; check the official release page before installing."
        ),
        releaseDate: new Date("2026-06-24T00:00:00.000Z"),
        status: "active",
        sortOrder: 20,
      },
    ],
  });

  await upsertToolTags(tool.id, [
    "桌面AI",
    "个人AI伴侣",
    "AI Agent",
    "MCP工具生态",
    "本地工作台",
  ]);

  const article = await prisma.newsArticle.upsert({
    where: { slug: articleSlug },
    update: {
      title: articleTitle,
      englishTitle: articleEnglishTitle,
      subtitle:
        "AI agent、MCP 工具生态、个人记忆与本地工作台，正在把 AI 助手推向更接近真实工作的桌面入口。",
      englishSubtitle:
        "AI agents, MCP tool ecosystems, personal memory, and local workbenches are pushing assistants toward real desktop execution.",
      description:
        "这篇趋势解读从 AI agent、MCP 工具生态、个人记忆和本地工作台切入，解释 AI 助手为什么正在从聊天框走向桌面执行，并自然连接到 LumiOS 产品页。",
      englishDescription:
        "This trend analysis explains why AI assistants are moving from chat boxes toward desktop execution, connecting AI agents, MCP tools, personal memory, local workbenches, and the LumiOS product page.",
      keywords:
        "个人AI操作伴侣,桌面AI,AI agent,MCP工具生态,本地工作台,LumiOS,AI前沿资讯",
      englishKeywords:
        "personal AI companion,desktop AI,AI agent,MCP tool ecosystem,local workbench,LumiOS,AI frontier news",
      summary: articleSummary,
      englishSummary: articleEnglishSummary,
      content: articleContent,
      englishContent: articleEnglishContent,
      coverImage: newsCoverImage,
      author: "ENHE AI",
      status: "published",
      categoryId: newsCategory.id,
      publishedAt: new Date("2026-06-24T02:00:00.000Z"),
      readingTime: 7,
      isFeatured: true,
      isPinned: false,
      sortOrder: 18,
      seoTitle:
        "从聊天框到个人AI操作伴侣：AI助手正在进入桌面执行时代 | ENHE AI",
      seoDescription:
        "AI agent、MCP工具生态、个人记忆和本地工作台正在推动AI助手从聊天框走向桌面执行。阅读趋势解读，并了解 LumiOS 个人AI操作伴侣。",
      seoKeywords:
        "个人AI操作伴侣,桌面AI,AI agent,MCP工具生态,LumiOS,AI助手,本地工作台",
      englishSeoTitle:
        "From Chat Boxes to Personal AI Companions: Desktop AI Execution | ENHE AI",
      englishSeoDescription:
        "AI agents, MCP tool ecosystems, personal memory, and local workbenches are moving assistants beyond chat boxes and toward desktop execution, with LumiOS as a product example.",
      englishSeoKeywords:
        "personal AI companion,desktop AI execution,AI agent,MCP tools,LumiOS,local workbench",
      keyTakeaways: [
        "AI 助手正在从回答问题走向持续执行任务。",
        "MCP 工具生态让 AI 更容易连接文件、网页、知识库、命令行和本地工具。",
        "个人记忆和本地工作台正在成为长期使用体验的关键分水岭。",
        "LumiOS 是理解个人 AI 操作伴侣趋势的一个具体产品样本。",
      ],
      englishKeyTakeaways: [
        "AI assistants are moving from answering questions toward continuing real tasks.",
        "MCP tool ecosystems make it easier for AI to connect files, web tasks, knowledge bases, command lines, and local tools.",
        "Personal memory and local workbenches are becoming key dividers for long-term product use.",
        "LumiOS is a concrete product example for understanding the personal AI companion trend.",
      ],
      impactNotes:
        "这场变化会影响创作者、开发者、运营人员和高频知识工作者的日常工作方式。用户会更关注 AI 是否能记住上下文、连接工具、进入桌面，并减少重复解释背景的成本。",
      englishImpactNotes:
        "This shift affects creators, developers, operators, and heavy knowledge workers. Users will care more about whether AI can remember context, connect tools, enter the desktop, and reduce the cost of repeated setup.",
      conclusion:
        "更强的模型仍然重要，但下一阶段更有留存能力的 AI 产品，会更像能陪你继续做事的桌面入口。LumiOS 的产品方向，正是这条趋势的一个具体落点。",
      englishConclusion:
        "Stronger models still matter, but the next durable AI products will feel more like desktop entry points that continue the work with the user. LumiOS is one concrete expression of that trend.",
      relatedToolIds: [tool.id],
      relatedArticleIds: [],
      relatedTutorialIds: [],
    },
    create: {
      title: articleTitle,
      slug: articleSlug,
      englishTitle: articleEnglishTitle,
      subtitle:
        "AI agent、MCP 工具生态、个人记忆与本地工作台，正在把 AI 助手推向更接近真实工作的桌面入口。",
      englishSubtitle:
        "AI agents, MCP tool ecosystems, personal memory, and local workbenches are pushing assistants toward real desktop execution.",
      description:
        "这篇趋势解读从 AI agent、MCP 工具生态、个人记忆和本地工作台切入，解释 AI 助手为什么正在从聊天框走向桌面执行，并自然连接到 LumiOS 产品页。",
      englishDescription:
        "This trend analysis explains why AI assistants are moving from chat boxes toward desktop execution, connecting AI agents, MCP tools, personal memory, local workbenches, and the LumiOS product page.",
      keywords:
        "个人AI操作伴侣,桌面AI,AI agent,MCP工具生态,本地工作台,LumiOS,AI前沿资讯",
      englishKeywords:
        "personal AI companion,desktop AI,AI agent,MCP tool ecosystem,local workbench,LumiOS,AI frontier news",
      summary: articleSummary,
      englishSummary: articleEnglishSummary,
      content: articleContent,
      englishContent: articleEnglishContent,
      coverImage: newsCoverImage,
      author: "ENHE AI",
      status: "published",
      categoryId: newsCategory.id,
      publishedAt: new Date("2026-06-24T02:00:00.000Z"),
      readingTime: 7,
      isFeatured: true,
      isPinned: false,
      sortOrder: 18,
      seoTitle:
        "从聊天框到个人AI操作伴侣：AI助手正在进入桌面执行时代 | ENHE AI",
      seoDescription:
        "AI agent、MCP工具生态、个人记忆和本地工作台正在推动AI助手从聊天框走向桌面执行。阅读趋势解读，并了解 LumiOS 个人AI操作伴侣。",
      seoKeywords:
        "个人AI操作伴侣,桌面AI,AI agent,MCP工具生态,LumiOS,AI助手,本地工作台",
      englishSeoTitle:
        "From Chat Boxes to Personal AI Companions: Desktop AI Execution | ENHE AI",
      englishSeoDescription:
        "AI agents, MCP tool ecosystems, personal memory, and local workbenches are moving assistants beyond chat boxes and toward desktop execution, with LumiOS as a product example.",
      englishSeoKeywords:
        "personal AI companion,desktop AI execution,AI agent,MCP tools,LumiOS,local workbench",
      keyTakeaways: [
        "AI 助手正在从回答问题走向持续执行任务。",
        "MCP 工具生态让 AI 更容易连接文件、网页、知识库、命令行和本地工具。",
        "个人记忆和本地工作台正在成为长期使用体验的关键分水岭。",
        "LumiOS 是理解个人 AI 操作伴侣趋势的一个具体产品样本。",
      ],
      englishKeyTakeaways: [
        "AI assistants are moving from answering questions toward continuing real tasks.",
        "MCP tool ecosystems make it easier for AI to connect files, web tasks, knowledge bases, command lines, and local tools.",
        "Personal memory and local workbenches are becoming key dividers for long-term product use.",
        "LumiOS is a concrete product example for understanding the personal AI companion trend.",
      ],
      impactNotes:
        "这场变化会影响创作者、开发者、运营人员和高频知识工作者的日常工作方式。用户会更关注 AI 是否能记住上下文、连接工具、进入桌面，并减少重复解释背景的成本。",
      englishImpactNotes:
        "This shift affects creators, developers, operators, and heavy knowledge workers. Users will care more about whether AI can remember context, connect tools, enter the desktop, and reduce the cost of repeated setup.",
      conclusion:
        "更强的模型仍然重要，但下一阶段更有留存能力的 AI 产品，会更像能陪你继续做事的桌面入口。LumiOS 的产品方向，正是这条趋势的一个具体落点。",
      englishConclusion:
        "Stronger models still matter, but the next durable AI products will feel more like desktop entry points that continue the work with the user. LumiOS is one concrete expression of that trend.",
      relatedToolIds: [tool.id],
      relatedArticleIds: [],
      relatedTutorialIds: [],
    },
  });

  await upsertNewsTags(article.id, [
    "AI前沿资讯",
    "趋势解读",
    "AI Agent",
    "MCP工具生态",
    "桌面AI",
    "LumiOS",
  ]);

  await prisma.newsExternalSource.deleteMany({
    where: { articleId: article.id },
  });
  await prisma.newsExternalSource.createMany({
    data: [
      {
        articleId: article.id,
        title: "LumiOS GitHub Repository",
        url: githubRepoUrl,
        sourceType: "official",
        description:
          "LumiOS 官方 GitHub 项目，用于核实产品定位、功能列表、平台支持和开源许可。",
        sortOrder: 10,
      },
      {
        articleId: article.id,
        title: `LumiOS Windows v${publicReleaseVersion} Release`,
        url: releasePageUrl,
        sourceType: "official",
        description:
          "当前可访问的 LumiOS Windows 公开 Release 页面，包含安装包、ZIP 包、发布说明和 SHA256 校验文件。",
        sortOrder: 20,
      },
      {
        articleId: article.id,
        title: "LumiOS Main README",
        url: readmeUrl,
        sourceType: "official",
        description:
          "LumiOS 主分支 README，用于核实项目当前说明、能力列表和版本指向。",
        sortOrder: 30,
      },
      {
        articleId: article.id,
        title: "Model Context Protocol Introduction",
        url: "https://modelcontextprotocol.io/introduction",
        sourceType: "official",
        description:
          "MCP 官方介绍，说明 AI 应用与外部工具、数据源之间的开放连接思路。",
        sortOrder: 40,
      },
      {
        articleId: article.id,
        title: "Google Search: AI features and your website",
        url: "https://developers.google.com/search/docs/fundamentals/ai-optimization-guide",
        sourceType: "official",
        description:
          "Google 官方关于 AI 搜索功能、网站内容质量和 agentic experiences 的说明。",
        sortOrder: 50,
      },
      {
        articleId: article.id,
        title: "LumiOS Windows Installer",
        url: installerUrl,
        sourceType: "official",
        description: "LumiOS 当前公开 Windows 安装包直链。",
        sortOrder: 60,
      },
      {
        articleId: article.id,
        title: "LumiOS Windows ZIP Package",
        url: zipUrl,
        sourceType: "official",
        description: "LumiOS 当前公开 Windows 完整 ZIP 包。",
        sortOrder: 70,
      },
      {
        articleId: article.id,
        title: "LumiOS SHA256 Checksum",
        url: checksumUrl,
        sourceType: "official",
        description: "LumiOS 当前公开安装文件校验信息。",
        sortOrder: 80,
      },
    ],
  });

  console.log(`LumiOS product seed completed: ${tool.slug}`);
  console.log(`LumiOS article seed completed: ${article.slug}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
