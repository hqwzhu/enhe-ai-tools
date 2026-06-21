import { getCoreBaiduSitemapUrls, recordBaiduPushResult, submitBaiduUrls } from "@/lib/baidu-push";
import { prisma } from "@/lib/db";

function getArgValue(name: string) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const includeEnglish = process.argv.includes("--include-en");
  const limitValue = getArgValue("--limit");
  const limit = limitValue ? Number.parseInt(limitValue, 10) : undefined;
  const urls = await getCoreBaiduSitemapUrls({
    includeEnglish,
    ...(Number.isFinite(limit) && limit && limit > 0 ? { limit } : {})
  });

  if (dryRun) {
    console.log(JSON.stringify({ dryRun: true, count: urls.length, urls }, null, 2));
    return;
  }

  const result = await submitBaiduUrls(urls);
  await recordBaiduPushResult(result, { source: "manual-sitemap-script", includeEnglish, limit: limit ?? null });
  console.log(JSON.stringify(result, null, 2));

  if (!result.ok) {
    process.exitCode = result.reason === "no-urls" ? 0 : 1;
  }
}

main()
  .catch((error) => {
    console.error("[baidu-push] sitemap push failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
