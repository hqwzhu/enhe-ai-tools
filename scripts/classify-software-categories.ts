import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    name: "视频生成",
    description: "视频创作、文生视频、图生视频与短片生成工具",
    sortOrder: 10,
  },
  {
    name: "语音生成",
    description: "语音、旁白、配音、音频与声音生成工具",
    sortOrder: 20,
  },
  {
    name: "智能体",
    description: "智能体、自动执行、工作流与本地 AI 工作台工具",
    sortOrder: 30,
  },
  {
    name: "视频/图片处理",
    description: "视频图片编辑、增强、修复、换脸、抠图与素材处理工具",
    sortOrder: 40,
  },
  {
    name: "提升效率",
    description: "写作、办公、资料整理、研究、开发与日常提效工具",
    sortOrder: 50,
  },
] as const;

type CategoryName = (typeof categories)[number]["name"];

const primaryRules: Array<{ category: CategoryName; patterns: RegExp[] }> = [
  {
    category: "视频生成",
    patterns: [
      /video\s*studio|视频生成|文生视频|图生视频|短视频|生成视频|视频创作|video\s*generation|generate\s*video|text\s*to\s*video|image\s*to\s*video|runway|kling|sora/i,
    ],
  },
  {
    category: "视频/图片处理",
    patterns: [
      /faceswap|face\s*swap|换脸|人像合成|截图|图片处理|图像处理|照片|抠图|去水印|修复|增强|放大|retouch|restore|upscale|enhance/i,
    ],
  },
  {
    category: "语音生成",
    patterns: [/语音生成|配音|旁白|音频|voice|audio|speech|tts|narration/i],
  },
  {
    category: "智能体",
    patterns: [/lumios|智能体|agent|mcp|操作系统|操作伴侣|自动执行|autonomous/i],
  },
  {
    category: "提升效率",
    patterns: [/二维码|效率|办公|写作|文档|资料|研究|搜索|总结|翻译|代码|productivity|office|writing|document|research|coding/i],
  },
];

const fallbackRules: Array<{ category: CategoryName; patterns: RegExp[] }> = [
  {
    category: "语音生成",
    patterns: [
      /语音|声音|配音|旁白|音频|播客|克隆声音|voice|audio|speech|tts|narration|podcast/i,
    ],
  },
  {
    category: "视频/图片处理",
    patterns: [
      /换脸|修复|增强|放大|抠图|去水印|图片处理|图像处理|照片|人像|剪辑|编辑|素材处理|face\s*swap|image|photo|upscale|enhance|remove|retouch|edit|restore|processing/i,
    ],
  },
  {
    category: "视频生成",
    patterns: [
      /视频生成|文生视频|图生视频|短视频|生成视频|视频创作|video\s*generation|generate\s*video|text\s*to\s*video|image\s*to\s*video|runway|kling|sora/i,
    ],
  },
  {
    category: "智能体",
    patterns: [
      /智能体|agent|mcp|工作流|自动化|自动执行|操作系统|操作伴侣|工作台|workflow|automation|autonomous|lumios/i,
    ],
  },
  {
    category: "提升效率",
    patterns: [
      /效率|办公|写作|文档|资料|研究|搜索|总结|翻译|代码|编程|productivity|office|writing|document|research|search|summary|translate|coding|developer/i,
    ],
  },
];

function resolveCategoryName(tool: {
  name: string;
  englishName: string | null;
  slug: string;
  shortDescription: string;
  content: string;
}): CategoryName {
  const primaryHaystack = [
    tool.name,
    tool.englishName,
    tool.slug,
    tool.shortDescription,
  ]
    .filter(Boolean)
    .join(" ");
  const fallbackHaystack = [primaryHaystack, tool.content].join(" ");

  for (const rule of primaryRules) {
    if (rule.patterns.some((pattern) => pattern.test(primaryHaystack))) {
      return rule.category;
    }
  }

  for (const rule of fallbackRules) {
    if (rule.patterns.some((pattern) => pattern.test(fallbackHaystack))) {
      return rule.category;
    }
  }

  return "提升效率";
}

async function main() {
  const categoryByName = new Map<string, string>();

  for (const category of categories) {
    const existing = await prisma.toolCategory.findFirst({
      where: { type: "software", name: category.name },
      select: { id: true },
    });
    const saved = existing
      ? await prisma.toolCategory.update({
          where: { id: existing.id },
          data: {
            description: category.description,
            sortOrder: category.sortOrder,
            status: "active",
          },
          select: { id: true },
        })
      : await prisma.toolCategory.create({
          data: {
            name: category.name,
            type: "software",
            description: category.description,
            sortOrder: category.sortOrder,
            status: "active",
          },
          select: { id: true },
        });

    categoryByName.set(category.name, saved.id);
  }

  const tools = await prisma.tool.findMany({
    where: { type: "software" },
    select: {
      id: true,
      name: true,
      englishName: true,
      slug: true,
      shortDescription: true,
      content: true,
      categoryId: true,
    },
  });

  let updated = 0;

  for (const tool of tools) {
    const categoryName = resolveCategoryName(tool);
    const categoryId = categoryByName.get(categoryName);
    if (!categoryId || tool.categoryId === categoryId) continue;

    await prisma.tool.update({
      where: { id: tool.id },
      data: { categoryId },
    });
    updated += 1;
    console.log(`${tool.name} -> ${categoryName}`);
  }

  console.log(`Classified ${updated}/${tools.length} software tools.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
