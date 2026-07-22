export const CSP_REPORT_MAX_BODY_BYTES = 32 * 1024;
export const CSP_REPORT_MAX_REPORTS = 20;

const maxTextLength = 512;
const maxUrlLength = 2048;

export type CspReportFormat = "legacy" | "reporting-api";

export type SanitizedCspReport = {
  format: CspReportFormat;
  documentUrl?: string;
  blockedUrl?: string;
  effectiveDirective?: string;
  violatedDirective?: string;
  disposition?: string;
  sourceFile?: string;
  lineNumber?: number;
  columnNumber?: number;
  statusCode?: number;
};

export class CspReportBodyTooLargeError extends Error {
  constructor() {
    super("CSP report body is too large");
    this.name = "CspReportBodyTooLargeError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sanitizeText(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxTextLength) : undefined;
}

function stripRelativeUrlDetails(value: string) {
  const queryIndex = value.indexOf("?");
  const hashIndex = value.indexOf("#");
  const indexes = [queryIndex, hashIndex].filter((index) => index >= 0);
  const end = indexes.length > 0 ? Math.min(...indexes) : value.length;
  return value.slice(0, end);
}

function sanitizeUrl(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, maxUrlLength);
  if (!trimmed) return undefined;

  if (trimmed.startsWith("/")) {
    return stripRelativeUrlDetails(trimmed);
  }

  if (!/^[a-z][a-z\d+.-]*:/i.test(trimmed)) {
    return sanitizeText(trimmed);
  }

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return url.protocol;
    }
    url.username = "";
    url.password = "";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return sanitizeText(trimmed);
  }
}

function sanitizeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : undefined;
}

function withoutUndefined(report: SanitizedCspReport): SanitizedCspReport {
  return Object.fromEntries(
    Object.entries(report).filter(([, value]) => value !== undefined),
  ) as SanitizedCspReport;
}

function normalizeLegacyReport(report: Record<string, unknown>) {
  return withoutUndefined({
    format: "legacy",
    documentUrl: sanitizeUrl(report["document-uri"]),
    blockedUrl: sanitizeUrl(report["blocked-uri"]),
    effectiveDirective: sanitizeText(report["effective-directive"]),
    violatedDirective: sanitizeText(report["violated-directive"]),
    disposition: sanitizeText(report.disposition),
    sourceFile: sanitizeUrl(report["source-file"]),
    lineNumber: sanitizeNumber(report["line-number"]),
    columnNumber: sanitizeNumber(report["column-number"]),
    statusCode: sanitizeNumber(report["status-code"]),
  });
}

function normalizeReportingApiReport(report: Record<string, unknown>) {
  const body = isRecord(report.body) ? report.body : {};
  return withoutUndefined({
    format: "reporting-api",
    documentUrl: sanitizeUrl(body.documentURL ?? report.url),
    blockedUrl: sanitizeUrl(body.blockedURL),
    effectiveDirective: sanitizeText(body.effectiveDirective),
    violatedDirective: sanitizeText(body.violatedDirective),
    disposition: sanitizeText(body.disposition),
    sourceFile: sanitizeUrl(body.sourceFile),
    lineNumber: sanitizeNumber(body.lineNumber),
    columnNumber: sanitizeNumber(body.columnNumber),
    statusCode: sanitizeNumber(body.statusCode),
  });
}

export function parseCspReportPayload(
  payload: unknown,
  contentType: "application/csp-report" | "application/reports+json",
): SanitizedCspReport[] {
  if (contentType === "application/csp-report") {
    if (!isRecord(payload) || !isRecord(payload["csp-report"])) {
      throw new Error("Invalid CSP report payload");
    }
    return [normalizeLegacyReport(payload["csp-report"])];
  }

  if (!Array.isArray(payload)) {
    throw new Error("Invalid CSP report payload");
  }

  return payload
    .slice(0, CSP_REPORT_MAX_REPORTS)
    .filter(
      (report): report is Record<string, unknown> =>
        isRecord(report) && report.type === "csp-violation" && isRecord(report.body),
    )
    .map(normalizeReportingApiReport);
}

export async function readCspReportBody(request: Request) {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > CSP_REPORT_MAX_BODY_BYTES) {
    throw new CspReportBodyTooLargeError();
  }

  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > CSP_REPORT_MAX_BODY_BYTES) {
      await reader.cancel();
      throw new CspReportBodyTooLargeError();
    }
    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}
