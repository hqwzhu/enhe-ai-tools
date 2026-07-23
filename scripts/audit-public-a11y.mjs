#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const defaultBaseUrl = "http://localhost:3101";
const baseUrl = (
  process.env.A11Y_AUDIT_BASE_URL ||
  process.env.PLAYWRIGHT_BASE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  defaultBaseUrl
).replace(/\/+$/, "");
const outputDir = path.resolve(process.env.A11Y_AUDIT_OUTPUT_DIR || "output/a11y-smoke");
const maxSitemapRoutes = Math.max(0, Number.parseInt(process.env.A11Y_AUDIT_MAX_SITEMAP_ROUTES || "80", 10));
const machineReadablePathPattern = /\.(xml|txt|md)(?:$|\?)/i;
const seoExemptPathPattern = /(^|\/)(login|register)(\/|$)|\.(xml|txt|md)(?:$|\?)/i;
const extraPaths = [
  "/",
  "/en",
  "/about",
  "/en/about",
  "/software",
  "/en/software",
  "/account-services",
  "/en/account-services",
  "/skill-learning",
  "/en/skill-learning",
  "/tutorials",
  "/en/tutorials",
  "/ai-news",
  "/en/ai-news",
  "/ai-trends",
  "/en/ai-trends",
  "/pricing",
  "/en/pricing",
  "/login",
  "/en/login",
];
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

function urlFor(pathname) {
  return /^https?:\/\//i.test(pathname) ? pathname : `${baseUrl}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

function normalizePath(urlValue) {
  try {
    const parsed = new URL(urlValue, baseUrl);
    return `${parsed.pathname}${parsed.search || ""}`;
  } catch {
    return urlValue.startsWith("/") ? urlValue : `/${urlValue}`;
  }
}

function text(value, max = 240) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function extractXmlLocations(xml) {
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/gims)];
  return matches.map((match) => match[1].trim()).filter(Boolean);
}

async function readSitemapPaths() {
  const response = await fetch(urlFor("/sitemap.xml"), {
    headers: { Accept: "application/xml,text/xml,*/*" },
  }).catch(() => null);
  if (!response?.ok) return [];
  const xml = await response.text();
  return extractXmlLocations(xml)
    .map(normalizePath)
    .filter((pathname) => /^\/(en\/)?(about|software|account-services|skill-learning|tutorials|ai-news|ai-trends|pricing|legal)(\/|$)?/.test(pathname))
    .slice(0, maxSitemapRoutes);
}

async function collectRoutes() {
  const fromEnv = (process.env.A11Y_AUDIT_PATHS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const sitemapPaths = await readSitemapPaths();
  return [...new Set([...extraPaths, ...sitemapPaths, ...fromEnv])];
}

async function waitForSettled(page) {
  await page.waitForLoadState("domcontentloaded", { timeout: 20000 }).catch(() => {});
  await page.waitForLoadState("networkidle", { timeout: 7000 }).catch(() => {});
  await page.waitForTimeout(800);
}

async function runAxe(page) {
  const axeSource = await fs.readFile(require.resolve("axe-core/axe.min.js"), "utf8");
  await page.addScriptTag({ content: axeSource });
  return page.evaluate(async () => {
    const results = await window.axe.run(document, {
      resultTypes: ["violations"],
      rules: {
        "color-contrast": { enabled: true },
      },
    });
    return results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact || "unknown",
      help: violation.help,
      nodes: violation.nodes.length,
      sample: violation.nodes[0]?.html?.slice(0, 260) || "",
      targets: violation.nodes.slice(0, 4).map((node) => node.target.join(" ")),
    }));
  });
}

async function collectSeoSnapshot(page) {
  return page.evaluate(() => {
    const extractJsonLdTypes = (value) => {
      if (Array.isArray(value)) return value.flatMap(extractJsonLdTypes);
      if (!value || typeof value !== "object") return [];

      const ownTypes = Array.isArray(value["@type"])
        ? value["@type"]
        : value["@type"]
          ? [value["@type"]]
          : [];
      const graphTypes = Array.isArray(value["@graph"])
        ? value["@graph"].flatMap(extractJsonLdTypes)
        : [];
      return [...ownTypes, ...graphTypes];
    };
    const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map((script) => {
        try {
          const parsed = JSON.parse(script.textContent || "{}");
          return extractJsonLdTypes(parsed);
        } catch {
          return "parse-error";
        }
      })
      .flat()
      .filter(Boolean);
    return {
      title: document.title,
      lang: document.documentElement.lang,
      canonical: document.querySelector('link[rel="canonical"]')?.href || "",
      robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") || "",
      alternates: [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((link) => ({
        hreflang: link.getAttribute("hreflang") || "",
        href: link.href,
      })),
      jsonLdTypes: jsonLd,
      mainCount: document.querySelectorAll("main").length,
      h1Count: document.querySelectorAll("h1").length,
      bodyTextLength: (document.body.innerText || "").replace(/\s+/g, " ").trim().length,
    };
  });
}

async function collectLayoutSnapshot(page, viewport) {
  return page.evaluate(({ viewport }) => {
    const trimText = (value, max = 240) => String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
    const visible = (el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
    };
    const box = (el) => {
      const rect = el.getBoundingClientRect();
      return {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        w: Math.round(rect.width),
        h: Math.round(rect.height),
        right: Math.round(rect.right),
      };
    };
    const overflow = [...document.querySelectorAll("body *")]
      .filter(visible)
      .filter((el) => {
        const cls = String(el.className || "");
        if (
          cls.includes("cursor-glow") ||
          cls.includes("home-hero-velocity-scroller") ||
          cls.includes("home-hero-velocity-copy")
        ) return false;
        const rect = el.getBoundingClientRect();
        return rect.left < -2 || rect.right > viewport.width + 2;
      })
      .slice(0, 20)
      .map((el) => ({ tag: el.tagName.toLowerCase(), cls: String(el.className || "").slice(0, 140), box: box(el), text: trimText(el.textContent, 120) }));
    const smallTargets = [...document.querySelectorAll("a, button, input, select, textarea, summary, [role='button']")]
      .filter(visible)
      .filter((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) return false;
        if (getComputedStyle(el).pointerEvents === "none") return false;
        return rect.width < 44 || rect.height < 44;
      })
      .slice(0, 30)
      .map((el) => ({ tag: el.tagName.toLowerCase(), text: trimText(el.innerText || el.getAttribute("aria-label") || el.getAttribute("name"), 120), box: box(el) }));
    const videos = [...document.querySelectorAll("video")].map((video) => ({
      src: video.currentSrc || video.src || video.dataset.src || "",
      readyState: video.readyState,
      paused: video.paused,
      autoplay: video.autoplay,
      muted: video.muted,
      preload: video.preload,
      currentTime: Math.round(video.currentTime * 10) / 10,
      box: box(video),
    }));
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      overflow,
      smallTargets,
      videos,
    };
  }, { viewport });
}

async function collectVitals(page) {
  return page.evaluate(() => new Promise((resolve) => {
    let lcp = 0;
    let cls = 0;
    let inp = 0;
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) lcp = entry.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
    } catch {}
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    } catch {}
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) inp = Math.max(inp, entry.duration || 0);
      }).observe({ type: "event", buffered: true, durationThreshold: 16 });
    } catch {}
    setTimeout(() => {
      const nav = performance.getEntriesByType("navigation")[0];
      resolve({
        lcp: Math.round(lcp),
        cls: Math.round(cls * 1000) / 1000,
        inp: Math.round(inp),
        ttfb: nav ? Math.round(nav.responseStart - nav.requestStart) : null,
        domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
      });
    }, 1800);
  }));
}

async function auditOne(browser, pathname, viewport) {
  const machineReadable = machineReadablePathPattern.test(pathname);
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.name === "mobile",
    hasTouch: viewport.name === "mobile",
  });
  const consoleMessages = [];
  const badResponses = [];
  const failedRequests = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      consoleMessages.push({ type: message.type(), text: text(message.text(), 500) });
    }
  });
  page.on("response", (response) => {
    const status = response.status();
    if (status >= 400) badResponses.push({ status, url: response.url() });
  });
  page.on("requestfailed", (request) => {
    failedRequests.push({ url: request.url(), failure: request.failure()?.errorText || "" });
  });

  let status = null;
  let error = null;
  try {
    const response = await page.goto(urlFor(pathname), { waitUntil: "domcontentloaded", timeout: 25000 });
    status = response?.status() ?? null;
    await waitForSettled(page);
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  const [axe, seo, layout] = await Promise.all([
    machineReadable
      ? Promise.resolve([])
      : runAxe(page).catch((err) => [{ id: "axe-run-failed", impact: "critical", help: err.message, nodes: 0, sample: "", targets: [] }]),
    collectSeoSnapshot(page).catch((err) => ({ error: err.message })),
    collectLayoutSnapshot(page, viewport).catch((err) => ({ error: err.message, overflow: [], smallTargets: [], videos: [] })),
  ]);
  const vitals = (pathname === "/" || pathname === "/en") && viewport.name === "desktop"
    ? await collectVitals(page).catch((err) => ({ error: err.message }))
    : null;
  await page.close().catch(() => {});

  return {
    path: pathname,
    viewport: viewport.name,
    machineReadable,
    status,
    finalUrl: page.url(),
    error,
    consoleMessages,
    badResponses,
    failedRequests,
    axe,
    seo,
    layout,
    vitals,
  };
}

function summarize(results) {
  const rows = results.map((result) => ({
    path: result.path,
    viewport: result.viewport,
    status: result.status,
    console: result.consoleMessages.length,
    badResponses: result.badResponses.length,
    failedRequests: result.failedRequests.length,
    axe: result.axe.length,
    severeAxe: result.axe.filter((item) => ["critical", "serious"].includes(item.impact)).length,
    moderateRegion: result.axe.filter((item) => item.impact === "moderate" && ["region", "landmark-one-main", "landmark-complementary-is-top-level"].includes(item.id)).length,
    machineReadable: Boolean(result.machineReadable),
    seoExempt: seoExemptPathPattern.test(result.path) || Boolean(result.machineReadable),
    mainCount: result.seo.mainCount,
    h1Count: result.seo.h1Count,
    canonical: result.seo.canonical,
    jsonLdTypes: result.seo.jsonLdTypes,
    alternates: result.seo.alternates?.length || 0,
    overflow: result.layout.overflow?.length || 0,
    smallTargets: result.layout.smallTargets?.length || 0,
    videos: result.layout.videos?.length || 0,
    lcp: result.vitals?.lcp ?? null,
    cls: result.vitals?.cls ?? null,
  }));
  const totals = {
    pages: results.length,
    console: rows.reduce((sum, row) => sum + row.console, 0),
    badResponses: rows.reduce((sum, row) => sum + row.badResponses, 0),
    failedRequests: rows.reduce((sum, row) => sum + row.failedRequests, 0),
    severeAxe: rows.reduce((sum, row) => sum + row.severeAxe, 0),
    moderateRegion: rows.reduce((sum, row) => sum + row.moderateRegion, 0),
    overflow: rows.reduce((sum, row) => sum + row.overflow, 0),
    pagesWithoutCanonical: rows.filter((row) => !row.seoExempt && !row.canonical && row.status === 200).length,
    pagesWithoutSchema: rows.filter((row) => row.status === 200 && row.jsonLdTypes.length === 0 && !row.seoExempt).length,
  };
  return { rows, totals };
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const routes = await collectRoutes();
  console.log(`A11y smoke scanning ${routes.length} paths at ${baseUrl}`);
  const browser = await chromium.launch({ headless: true });
  const results = [];
  for (const viewport of viewports) {
    for (const route of routes) {
      console.log(`${viewport.name} ${route}`);
      results.push(await auditOne(browser, route, viewport));
    }
  }
  await browser.close();

  const summary = summarize(results);
  const payload = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    routes,
    viewports,
    ...summary,
    results,
  };
  await fs.writeFile(path.join(outputDir, "a11y-smoke-results.json"), JSON.stringify(payload, null, 2), "utf8");
  await fs.writeFile(path.join(outputDir, "a11y-smoke-summary.json"), JSON.stringify(summary, null, 2), "utf8");

  for (const row of summary.rows) {
    const rowHasFailure =
      row.console ||
      row.badResponses ||
      row.severeAxe ||
      row.moderateRegion ||
      (!row.machineReadable && row.overflow);
    console.log(
      `${rowHasFailure ? "FAIL" : "PASS"} ${row.viewport} ${row.path} status=${row.status} machine=${row.machineReadable ? "yes" : "no"} axe=${row.axe} severe=${row.severeAxe} region=${row.moderateRegion} console=${row.console} bad=${row.badResponses} overflow=${row.overflow} schema=${row.jsonLdTypes.length} canonical=${row.canonical ? "yes" : "no"}`,
    );
  }

  const failures = summary.rows.filter((row) =>
    row.status >= 400 ||
    row.console > 0 ||
    row.badResponses > 0 ||
    row.severeAxe > 0 ||
    row.moderateRegion > 0 ||
    (!row.machineReadable && row.overflow > 0) ||
    (!row.seoExempt && row.mainCount !== 1) ||
    (!row.seoExempt && row.h1Count !== 1) ||
    (!row.seoExempt && !row.canonical),
  );

  if (failures.length) {
    console.error(`A11y smoke failed on ${failures.length} page states. See ${path.join(outputDir, "a11y-smoke-results.json")}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
});
