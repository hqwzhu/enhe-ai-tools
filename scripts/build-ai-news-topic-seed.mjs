import { mkdir, writeFile } from "node:fs/promises";

const outputPath = new URL("../prisma/seed-ai-news-topics-data.cjs", import.meta.url);

async function main() {
  const topicsModule = await import("../src/lib/ai-news-topics.ts");
  const rows = topicsModule.aiNewsTopics.map((topic, index) => ({
    slug: topic.slug,
    sortOrder: (index + 1) * 10,
    title: topic.zh.title,
    description: topic.zh.description,
    intro: topic.zh.intro,
    answer: topic.zh.answer,
    searchQuery: topic.zh.searchQuery,
    keywords: topic.zh.keywords,
    whyItMatters: topic.zh.whyItMatters,
    actionLinks: topic.zh.actionLinks,
    faqs: topic.zh.faqs,
    sourceLinks: topic.sourceLinks,
    englishTitle: topic.en.title,
    englishDescription: topic.en.description,
    englishIntro: topic.en.intro,
    englishAnswer: topic.en.answer,
    englishSearchQuery: topic.en.searchQuery,
    englishKeywords: topic.en.keywords,
    englishWhyItMatters: topic.en.whyItMatters,
    englishActionLinks: topic.en.actionLinks,
    englishFaqs: topic.en.faqs,
  }));

  await mkdir(new URL("../prisma/", import.meta.url), { recursive: true });
  await writeFile(
    outputPath,
    `module.exports = ${JSON.stringify(rows, null, 2)};\n`,
    "utf8",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
