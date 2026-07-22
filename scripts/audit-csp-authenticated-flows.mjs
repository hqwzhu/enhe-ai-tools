import { chromium } from "@playwright/test";
import { createHash, randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const args = process.argv.slice(2);

function getArgument(name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

const baseUrl = getArgument("--base-url", "https://www.enhe-tech.com.cn").replace(/\/$/, "");
const outputPath = resolve(
  getArgument("--output", "output/playwright/2026-07-23-csp-authenticated-flow-audit.json"),
);
const paidToolPath = getArgument(
  "--paid-tool-path",
  "/software/ultimate-edition-ai-video-generation-suite",
);
const freeToolPath = getArgument("--free-tool-path", "/software/codex-api");

function redactUrl(value, referenceUrl = baseUrl) {
  if (!value) return null;
  try {
    const url = new URL(value, referenceUrl);
    url.search = "";
    url.hash = "";
    url.pathname = url.pathname
      .replace(/\/orders\/[^/]+/g, "/orders/[redacted]")
      .replace(/\/api\/tools\/[^/]+\/download/g, "/api/tools/[redacted]/download")
      .replace(/\/api\/payment-proofs\/[^/]+\/image/g, "/api/payment-proofs/[redacted]/image");
    return url.toString();
  } catch {
    return "[invalid-url]";
  }
}

function sanitizeText(value) {
  return String(value ?? "")
    .replace(/https?:\/\/[^\s"']+/gi, (url) => redactUrl(url) ?? "[redacted-url]")
    .replace(/\/orders\/[^/\s?]+/g, "/orders/[redacted]")
    .slice(0, 1000);
}

function createDisposableCredentials() {
  const suffix = `${Date.now()}-${randomBytes(4).toString("hex")}`;
  return {
    email: `csp-auth-${suffix}@example.invalid`,
    password: `Csp!${randomBytes(18).toString("base64url")}9a`,
  };
}

function createAccountTag(email) {
  return createHash("sha256").update(email).digest("hex").slice(0, 16);
}

function sanitizeViolation(violation, flow) {
  return {
    flow,
    effectiveDirective: violation.effectiveDirective || null,
    violatedDirective: violation.violatedDirective || null,
    disposition: violation.disposition || null,
    blockedUrl: redactUrl(violation.blockedUri),
    sourceFile: redactUrl(violation.sourceFile),
    lineNumber: Number.isFinite(violation.lineNumber) ? violation.lineNumber : null,
    columnNumber: Number.isFinite(violation.columnNumber) ? violation.columnNumber : null,
  };
}

async function capturePageViolations(page, flow) {
  const violations = await page.evaluate(() => window.__enheCspViolations ?? []);
  return violations.map((violation) => sanitizeViolation(violation, flow));
}

async function createSyntheticProofPng(context) {
  const proofPage = await context.newPage();
  await proofPage.setViewportSize({ width: 900, height: 420 });
  await proofPage.setContent(`
    <!doctype html>
    <html lang="en">
      <body style="margin:0;background:#f7f7f7;font-family:Arial,sans-serif">
        <main style="width:860px;height:380px;margin:20px;box-sizing:border-box;border:12px solid #b91c1c;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#7f1d1d;background:#fff">
          <strong style="font-size:48px;letter-spacing:2px">SYNTHETIC CSP TEST</strong>
          <span style="margin-top:28px;font-size:34px">NOT A PAYMENT PROOF</span>
          <span style="margin-top:24px;font-size:22px;color:#374151">No payment was made</span>
        </main>
      </body>
    </html>
  `);
  const png = await proofPage.locator("main").screenshot({ type: "png" });
  await proofPage.close();
  return png;
}

async function main() {
  const credentials = createDisposableCredentials();
  const accountTag = createAccountTag(credentials.email);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: false });
  const page = await context.newPage();
  const consoleViolations = [];
  const eventViolations = [];
  const browserReportRequests = [];
  let activeFlow = "startup";

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
      consoleViolations.push({ flow: activeFlow, message: sanitizeText(message.text()) });
    }
  });
  page.on("requestfinished", (request) => {
    if (request.method() === "POST" && request.url().includes("/api/csp-report")) {
      browserReportRequests.push({ flow: activeFlow, url: redactUrl(request.url()) });
    }
  });

  const registration = {
    passed: false,
    finalUrl: null,
    accountCreated: false,
    error: null,
  };
  const paymentHandoff = {
    passed: false,
    finalUrl: null,
    orderCreated: false,
    pendingPaymentRouteReached: false,
    providerArtifactDetected: false,
    paymentCompleted: false,
    error: null,
  };
  const proofUpload = {
    passed: false,
    status: null,
    redirectUrl: null,
    syntheticImage: true,
    fileName: "SYNTHETIC_CSP_TEST_NOT_PAYMENT_PROOF.png",
    fileBytes: 0,
    orderPageStatus: null,
    error: null,
  };
  const freeDownload = {
    passed: false,
    authenticatedSessionConfirmed: false,
    deliveryMode: null,
    route: null,
    status: null,
    destination: null,
    deliveryReachable: false,
    successfulDownloadRecorded: false,
    error: null,
  };

  let orderId = null;
  try {
    activeFlow = "registration";
    await page.goto(`${baseUrl}/register`, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await page.locator('input[name="email"]').fill(credentials.email);
    await page.locator('input[name="password"]').fill(credentials.password);
    await page.locator('form button[type="submit"]').click();
    await page.waitForURL((url) => url.pathname === "/user", { timeout: 45_000 });
    await page.waitForLoadState("domcontentloaded");
    registration.finalUrl = redactUrl(page.url());
    registration.accountCreated = true;
    registration.passed = true;
    eventViolations.push(...(await capturePageViolations(page, activeFlow)));
  } catch (error) {
    registration.finalUrl = redactUrl(page.url());
    registration.error = sanitizeText(error instanceof Error ? error.message : error);
  }

  if (registration.passed) {
    try {
      activeFlow = "pending_order_and_provider_handoff";
      await page.goto(`${baseUrl}${paidToolPath}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
      const purchaseForm = page.locator("form#download-purchase");
      await purchaseForm.waitFor({ state: "visible", timeout: 30_000 });
      await purchaseForm.locator('select[name="paymentMethod"]').selectOption("alipay");
      await purchaseForm.locator('button[type="submit"]').click();
      await page.waitForURL(/\/orders\/[^/]+\/pay(?:\?.*)?$/, { timeout: 60_000 });
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(2_000);
      const match = new URL(page.url()).pathname.match(/^\/orders\/([^/]+)\/pay$/);
      orderId = match?.[1] ?? null;
      const providerArtifactCount = await page
        .locator('a[target="_blank"], img[src*="qr" i], img[src*="pay" i]')
        .count();
      paymentHandoff.finalUrl = redactUrl(page.url());
      paymentHandoff.orderCreated = Boolean(orderId);
      paymentHandoff.pendingPaymentRouteReached = Boolean(orderId);
      paymentHandoff.providerArtifactDetected = providerArtifactCount > 0;
      paymentHandoff.passed = Boolean(orderId) && providerArtifactCount > 0;
      eventViolations.push(...(await capturePageViolations(page, activeFlow)));
    } catch (error) {
      paymentHandoff.finalUrl = redactUrl(page.url());
      paymentHandoff.error = sanitizeText(error instanceof Error ? error.message : error);
    }
  }

  if (orderId) {
    try {
      activeFlow = "synthetic_payment_proof_upload";
      const proofPng = await createSyntheticProofPng(context);
      proofUpload.fileBytes = proofPng.byteLength;
      const response = await context.request.post(`${baseUrl}/api/uploads/payment-proof`, {
        maxRedirects: 0,
        multipart: {
          orderId,
          paymentMethod: "alipay",
          paymentRemark: "SYNTHETIC CSP TEST ONLY - NO PAYMENT WAS MADE",
          file: {
            name: proofUpload.fileName,
            mimeType: "image/png",
            buffer: proofPng,
          },
        },
      });
      proofUpload.status = response.status();
      proofUpload.redirectUrl = redactUrl(response.headers().location);
      const orderResponse = await page.goto(`${baseUrl}/orders/${orderId}?uploaded=1`, {
        waitUntil: "domcontentloaded",
        timeout: 45_000,
      });
      proofUpload.orderPageStatus = orderResponse?.status() ?? null;
      proofUpload.passed = response.status() === 303 && proofUpload.orderPageStatus === 200;
      eventViolations.push(...(await capturePageViolations(page, activeFlow)));
    } catch (error) {
      proofUpload.error = sanitizeText(error instanceof Error ? error.message : error);
    }
  }

  if (registration.passed) {
    try {
      activeFlow = "authenticated_free_download";
      const userResponse = await page.goto(`${baseUrl}/user`, {
        waitUntil: "domcontentloaded",
        timeout: 45_000,
      });
      freeDownload.authenticatedSessionConfirmed =
        userResponse?.status() === 200 && new URL(page.url()).pathname === "/user";
      await page.goto(`${baseUrl}${freeToolPath}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
      const protectedDownloadHref = await page
        .locator('a[href^="/api/tools/"][href$="/download"]')
        .first()
        .getAttribute("href")
        .catch(() => null);
      const publicDownloadHref = protectedDownloadHref
        ? null
        : await page
            .locator('#download-links a[href^="http"]')
            .first()
            .getAttribute("href")
            .catch(() => null);
      const downloadHref = protectedDownloadHref ?? publicDownloadHref;
      if (!downloadHref) throw new Error("Authenticated free delivery entry was not found");
      const deliveryUrl = new URL(downloadHref, baseUrl).toString();
      const response = await context.request.get(deliveryUrl, {
        maxRedirects: 0,
      });
      freeDownload.deliveryMode = protectedDownloadHref
        ? "protected_internal_route"
        : "external_public_link";
      freeDownload.route = redactUrl(downloadHref);
      freeDownload.status = response.status();
      freeDownload.destination = redactUrl(response.headers().location, deliveryUrl);
      freeDownload.deliveryReachable = response.status() >= 200 && response.status() < 400;
      freeDownload.successfulDownloadRecorded =
        Boolean(protectedDownloadHref) && response.status() >= 300 && response.status() < 400;
      freeDownload.passed =
        freeDownload.authenticatedSessionConfirmed && freeDownload.deliveryReachable;
      eventViolations.push(...(await capturePageViolations(page, activeFlow)));
    } catch (error) {
      freeDownload.error = sanitizeText(error instanceof Error ? error.message : error);
    }
  }

  await browser.close();

  const flowResults = [registration, paymentHandoff, proofUpload, freeDownload];
  const allFlowsPassed = flowResults.every((result) => result.passed);
  const cspViolationCount = eventViolations.length + consoleViolations.length;
  const safeToEvaluateEnforcedCsp = allFlowsPassed && cspViolationCount === 0;
  const report = {
    reportType: "csp_authenticated_flow_audit",
    generatedAt: new Date().toISOString(),
    baseUrl,
    cspMode: "report_only",
    testAccount: {
      accountTag,
      domain: "example.invalid",
      disposable: true,
      created: registration.accountCreated,
      credentialsPrinted: false,
      credentialsPersisted: false,
      cleanupStatus: registration.accountCreated ? "manual_exact_record_cleanup_required" : "not_created",
    },
    registration,
    paymentHandoff,
    proofUpload,
    freeDownload,
    cspEvidence: {
      eventViolations,
      consoleViolations,
      browserReportRequests,
      violationCount: cspViolationCount,
    },
    safety: {
      realPaymentCompleted: false,
      refundTriggered: false,
      customerDataUsed: false,
      realPaymentProofUsed: false,
      syntheticPaymentProofUsed: proofUpload.passed,
      credentialValuesRecorded: false,
    },
    summary: {
      flowCount: flowResults.length,
      passedFlowCount: flowResults.filter((result) => result.passed).length,
      allFlowsPassed,
      cspViolationCount,
      safeToEvaluateEnforcedCsp,
      recommendation: safeToEvaluateEnforcedCsp
        ? "continue_report_only_until_24h_and_72h_observation_complete"
        : "keep_report_only_and_remediate_failed_authenticated_flow_or_csp_violation",
    },
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify({ outputPath, accountTag, ...report.summary }, null, 2)}\n`);
  if (!allFlowsPassed || cspViolationCount > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(sanitizeText(error instanceof Error ? error.message : error));
  process.exitCode = 1;
});
