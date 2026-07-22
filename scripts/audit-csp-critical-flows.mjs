import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const args = process.argv.slice(2);

function getArgument(name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

const baseUrl = getArgument("--base-url", "https://www.enhe-tech.com.cn").replace(/\/$/, "");
const outputPath = resolve(
  getArgument(
    "--output",
    "output/playwright/2026-07-22-csp-critical-flow-audit.json",
  ),
);
const submitInvalidLogin = args.includes("--submit-invalid-login");

const pageChecks = [
  { flow: "authentication", route: "/login", selector: 'form input[name="email"]' },
  { flow: "authentication", route: "/register", selector: 'form input[name="email"]' },
  { flow: "authentication", route: "/en/login", selector: 'form input[name="email"]' },
  { flow: "authentication", route: "/en/register", selector: 'form input[name="email"]' },
  { flow: "payment", route: "/pricing", selector: "main h1" },
  { flow: "payment", route: "/en/pricing", selector: "main h1" },
  {
    flow: "payment",
    route: "/software/ultimate-edition-ai-video-generation-suite",
    selector: '#tool-purchase select[name="paymentMethod"]',
  },
  {
    flow: "payment",
    route: "/en/software/ultimate-edition-ai-video-generation-suite",
    selector: '#tool-purchase select[name="paymentMethod"]',
  },
  {
    flow: "download",
    route: "/software/codex-api",
    selector: "main h1",
  },
];

function sanitizeUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value, baseUrl);
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return String(value).slice(0, 512);
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const pageResults = [];
  let routeConsoleViolations = [];
  let browserReportRequests = 0;

  await page.addInitScript(() => {
    window.__enheCspViolations = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      window.__enheCspViolations.push({
        blockedUri: event.blockedURI,
        effectiveDirective: event.effectiveDirective,
        violatedDirective: event.violatedDirective,
        disposition: event.disposition,
        sourceFile: event.sourceFile,
        lineNumber: event.lineNumber,
        columnNumber: event.columnNumber,
      });
    });
  });

  page.on("console", (message) => {
    if (/content security policy/i.test(message.text())) {
      routeConsoleViolations.push(message.text().slice(0, 1000));
    }
  });
  page.on("requestfinished", (request) => {
    if (request.method() === "POST" && request.url().includes("/api/csp-report")) {
      browserReportRequests += 1;
    }
  });

  let paidToolId = null;
  let freeDownloadHref = null;

  for (const check of pageChecks) {
    routeConsoleViolations = [];
    let error = null;
    let status = null;
    let selectorVisible = false;
    let eventViolations = [];
    let headers = {};

    try {
      const response = await page.goto(`${baseUrl}${check.route}`, {
        waitUntil: "domcontentloaded",
        timeout: 45_000,
      });
      await page.waitForTimeout(750);
      status = response?.status() ?? null;
      headers = response?.headers() ?? {};
      selectorVisible = await page.locator(check.selector).first().isVisible();
      eventViolations = await page.evaluate(() => window.__enheCspViolations ?? []);

      if (check.flow === "payment" && check.route.startsWith("/software/ultimate")) {
        paidToolId = await page.locator('input[name="toolId"]').first().getAttribute("value");
        const paymentSelect = page.locator('select[name="paymentMethod"]').first();
        if (await paymentSelect.isVisible()) {
          await paymentSelect.selectOption("alipay");
          await paymentSelect.selectOption("wechat");
        }
      }

      if (check.flow === "download") {
        freeDownloadHref = await page
          .locator('a[href^="/api/tools/"][href$="/download"]')
          .first()
          .getAttribute("href")
          .catch(() => null);
      }
    } catch (caught) {
      error = caught instanceof Error ? caught.message : String(caught);
    }

    pageResults.push({
      ...check,
      status,
      finalUrl: sanitizeUrl(page.url()),
      selectorVisible,
      reportOnlyHeaderPresent: Boolean(headers["content-security-policy-report-only"]),
      enforcedHeaderPresent: Boolean(headers["content-security-policy"]),
      reportingEndpointsPresent: Boolean(headers["reporting-endpoints"]),
      reportToPresent: Boolean(headers["report-to"]),
      eventViolations,
      consoleViolations: routeConsoleViolations,
      error,
      passed:
        status === 200 &&
        selectorVisible &&
        Boolean(headers["content-security-policy-report-only"]) &&
        Boolean(headers["reporting-endpoints"]) &&
        Boolean(headers["report-to"]) &&
        !headers["content-security-policy"] &&
        eventViolations.length === 0 &&
        routeConsoleViolations.length === 0 &&
        !error,
    });
  }

  let invalidLoginResult = {
    executed: false,
    passed: false,
    status: "manual_required",
    note: "Run with --submit-invalid-login to create one isolated failed-login telemetry row without changing a user.",
  };

  if (submitInvalidLogin) {
    routeConsoleViolations = [];
    await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
    await page.locator('input[name="email"]').fill(`csp-audit-${Date.now()}@example.invalid`);
    await page.locator('input[name="password"]').fill("CspAuditInvalidPass123!");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/login\?message=invalid/, { timeout: 30_000 });
    await page.waitForTimeout(500);
    const eventViolations = await page.evaluate(() => window.__enheCspViolations ?? []);
    invalidLoginResult = {
      executed: true,
      passed: eventViolations.length === 0 && routeConsoleViolations.length === 0,
      status: eventViolations.length === 0 && routeConsoleViolations.length === 0 ? "passed" : "failed",
      finalUrl: sanitizeUrl(page.url()),
      eventViolations,
      consoleViolations: routeConsoleViolations,
      note: "Created one failed-login telemetry row for a unique example.invalid identifier; no user was created or changed.",
    };
  }

  const protectedToolId = paidToolId ?? "csp-audit-nonexistent";
  const apiChecks = [
    {
      flow: "payment",
      method: "GET",
      path: "/api/orders/csp-audit-nonexistent/payment-status",
      expectedStatus: 401,
    },
    {
      flow: "upload",
      method: "POST",
      path: "/api/admin/upload",
      expectedStatus: 303,
      multipart: {},
    },
    {
      flow: "upload",
      method: "POST",
      path: "/api/uploads/payment-proof",
      expectedStatus: 303,
      multipart: {},
    },
    {
      flow: "download",
      method: "GET",
      path: freeDownloadHref ?? `/api/tools/${protectedToolId}/download`,
      expectedStatus: 307,
    },
    {
      flow: "download",
      method: "GET",
      path: "/api/uploads/csp-audit-file-does-not-exist.txt",
      expectedStatus: 404,
    },
  ];

  const apiResults = [];
  for (const check of apiChecks) {
    const response = await context.request.fetch(`${baseUrl}${check.path}`, {
      method: check.method,
      maxRedirects: 0,
      ...(check.multipart ? { multipart: check.multipart } : {}),
    });
    apiResults.push({
      ...check,
      actualStatus: response.status(),
      location: sanitizeUrl(response.headers().location ?? ""),
      passed: response.status() === check.expectedStatus,
    });
  }

  await browser.close();

  const eventViolationCount = pageResults.reduce(
    (total, result) => total + result.eventViolations.length + result.consoleViolations.length,
    0,
  );
  const allSafeChecksPassed =
    pageResults.every((result) => result.passed) &&
    apiResults.every((result) => result.passed) &&
    (!submitInvalidLogin || invalidLoginResult.passed);
  const manualRequired = [
    "authenticated successful payment creation and payment-provider handoff",
    "authenticated payment-proof upload with a disposable test order",
    "authenticated successful download with a disposable purchased/free test product",
  ];

  const report = {
    reportType: "csp_critical_flow_audit",
    generatedAt: new Date().toISOString(),
    baseUrl,
    cspMode: "report_only",
    pageResults,
    invalidLoginResult,
    apiResults,
    summary: {
      pageChecks: pageResults.length,
      pageChecksPassed: pageResults.filter((result) => result.passed).length,
      apiChecks: apiResults.length,
      apiChecksPassed: apiResults.filter((result) => result.passed).length,
      eventViolationCount,
      browserReportRequests,
      allSafeChecksPassed,
      authenticatedMutationCoverage: "manual_required",
      recommendation: "keep_report_only_pending_authenticated_mutation_coverage",
    },
    mutationSafety: {
      realOrderCreated: false,
      paymentSubmitted: false,
      fileUploaded: false,
      successfulDownloadRecorded: false,
      userCreatedOrChanged: false,
      failedLoginTelemetryCreated: submitInvalidLogin,
    },
    manualRequired,
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ outputPath, ...report.summary }, null, 2));
  if (!allSafeChecksPassed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
