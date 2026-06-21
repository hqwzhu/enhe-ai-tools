import {
  buildBaiduPushUrls,
  extractBaiduUrlsFromSitemapXml,
  getCoreBaiduSitemapUrls,
  recordBaiduPushResult,
  submitBaiduUrls
} from "@/lib/baidu-push";
import { prisma } from "@/lib/db";

const defaultSitemapUrl = "https://www.enhe-tech.com.cn/sitemap.xml";

function getArgValue(name: string) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const includeEnglish = process.argv.includes("--include-en");
  const fromDb = process.argv.includes("--from-db");
  const limitValue = getArgValue("--limit");
  const sitemapUrl = getArgValue("--sitemap") ?? defaultSitemapUrl;
  const limit = limitValue ? Number.parseInt(limitValue, 10) : undefined;
  const limitOptions = Number.isFinite(limit) && limit && limit > 0 ? { limit } : {};
  const urls = fromDb
    ? await getCoreBaiduSitemapUrls({
        includeEnglish,
        ...limitOptions
      })
    : await getCoreBaiduSitemapUrlsFromRemoteSitemap(sitemapUrl, { includeEnglish, ...limitOptions });

  if (dryRun) {
    console.log(JSON.stringify({ dryRun: true, count: urls.length, urls }, null, 2));
    return;
  }

  const result = await submitBaiduUrls(urls);
  await recordBaiduPushResult(result, {
    source: "manual-sitemap-script",
    mode: fromDb ? "database" : "remote-sitemap",
    sitemapUrl: fromDb ? null : sitemapUrl,
    includeEnglish,
    limit: limit ?? null
  });
  console.log(JSON.stringify(result, null, 2));

  if (!result.ok) {
    process.exitCode = result.reason === "no-urls" ? 0 : 1;
  }
}

async function getCoreBaiduSitemapUrlsFromRemoteSitemap(
  sitemapUrl: string,
  options: { includeEnglish?: boolean; limit?: number } = {}
) {
  const response = await fetch(sitemapUrl, {
    headers: { Accept: "application/xml,text/xml;q=0.9,*/*;q=0.1" }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`);
  }

  const urls = extractBaiduUrlsFromSitemapXml(await response.text(), { includeEnglish: options.includeEnglish });
  return buildBaiduPushUrls(typeof options.limit === "number" && options.limit > 0 ? urls.slice(0, options.limit) : urls);
}

main()
  .catch((error) => {
    console.error("[baidu-push] sitemap push failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
