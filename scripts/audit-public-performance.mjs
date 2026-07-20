#!/usr/bin/env node

const defaultBaseUrl = "https://www.enhe-tech.com.cn";
const baseUrl = (
  process.env.PERFORMANCE_AUDIT_BASE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  defaultBaseUrl
).replace(/\/+$/, "");
const repeatCount = Math.max(
  1,
  Number.parseInt(process.env.PERFORMANCE_AUDIT_REPEAT || "3", 10),
);
const timeoutMs = Math.max(
  1000,
  Number.parseInt(process.env.PERFORMANCE_AUDIT_TIMEOUT_MS || "15000", 10),
);
const paths = (
  process.env.PERFORMANCE_AUDIT_PATHS ||
  [
    "/",
    "/en",
    "/about",
    "/software",
    "/account-services",
    "/skill-learning",
    "/ai-news",
    "/sitemap.xml",
    "/llms.txt",
    "/pricing.md",
    "/okf/index.md",
  ].join(",")
)
  .split(",")
  .map((path) => path.trim())
  .filter(Boolean);

const pageSpeedApiKey = process.env.PAGE_SPEED_API_KEY;

function auditUrl(path) {
  return /^https?:\/\//i.test(path)
    ? path
    : `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function percentile(values, rank) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((rank / 100) * sorted.length) - 1),
  );
  return sorted[index];
}

async function fetchWithTiming(url) {
  const controller = new AbortController();
  const startedAt = performance.now();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "User-Agent": "ENHE-AI-public-performance-audit/1.0",
        Accept: "text/html,application/xml,text/plain,*/*",
      },
    });
    const body = await response.arrayBuffer();
    const elapsedMs = Math.round(performance.now() - startedAt);

    return {
      ok: response.status >= 200 && response.status < 400,
      status: response.status,
      elapsedMs,
      bytes: body.byteLength,
      cacheControl: response.headers.get("Cache-Control") || "",
      contentLanguage: response.headers.get("Content-Language") || "",
      location: response.headers.get("Location") || "",
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function auditPath(path) {
  const url = auditUrl(path);
  const samples = [];

  for (let index = 0; index < repeatCount; index += 1) {
    samples.push(await fetchWithTiming(url));
  }

  const timings = samples.map((sample) => sample.elapsedMs);
  const last = samples.at(-1);

  return {
    path,
    url,
    ok: samples.every((sample) => sample.ok),
    status: last.status,
    bytes: last.bytes,
    p50: percentile(timings, 50),
    p95: percentile(timings, 95),
    cacheControl: last.cacheControl,
    contentLanguage: last.contentLanguage,
    location: last.location,
  };
}

async function fetchPageSpeed(path) {
  if (!pageSpeedApiKey) return null;

  const params = new URLSearchParams({
    url: auditUrl(path),
    key: pageSpeedApiKey,
    strategy: "mobile",
    category: "performance",
  });
  const response = await fetch(
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`,
    { headers: { Accept: "application/json" } },
  );

  if (!response.ok) {
    return {
      path,
      error: `PageSpeed API returned ${response.status}`,
    };
  }

  const payload = await response.json();
  const lighthouse = payload.lighthouseResult;
  const audits = lighthouse?.audits || {};

  return {
    path,
    score:
      typeof lighthouse?.categories?.performance?.score === "number"
        ? Math.round(lighthouse.categories.performance.score * 100)
        : null,
    lcp: audits["largest-contentful-paint"]?.displayValue || null,
    cls: audits["cumulative-layout-shift"]?.displayValue || null,
    tbt: audits["total-blocking-time"]?.displayValue || null,
  };
}

function printResult(result) {
  const cache = result.cacheControl || "(missing)";
  const language = result.contentLanguage || "(missing)";
  const redirect = result.location ? ` location=${result.location}` : "";
  console.log(
    `${result.ok ? "PASS" : "FAIL"} ${result.path} status=${result.status}${redirect} bytes=${result.bytes} p50=${result.p50}ms p95=${result.p95}ms Cache-Control="${cache}" Content-Language="${language}"`,
  );
}

async function main() {
  console.log(
    `Auditing ${paths.length} public paths at ${baseUrl} (${repeatCount} sample${repeatCount === 1 ? "" : "s"} each)`,
  );

  const results = [];
  for (const path of paths) {
    const result = await auditPath(path);
    results.push(result);
    printResult(result);
  }

  if (pageSpeedApiKey) {
    console.log("PageSpeed API mobile checks:");
    for (const path of paths.filter((path) => !/\.(xml|txt|md)$/i.test(path))) {
      const result = await fetchPageSpeed(path);
      if (!result) continue;
      if (result.error) {
        console.log(`WARN ${path} ${result.error}`);
      } else {
        console.log(
          `INFO ${path} score=${result.score ?? "n/a"} LCP=${result.lcp ?? "n/a"} CLS=${result.cls ?? "n/a"} TBT=${result.tbt ?? "n/a"}`,
        );
      }
    }
  } else {
    console.log("Skipped PageSpeed API checks because PAGE_SPEED_API_KEY is not set.");
  }

  const failures = results.filter((result) => !result.ok);
  if (failures.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
