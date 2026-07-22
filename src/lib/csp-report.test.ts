import { describe, expect, it } from "vitest";
import {
  CSP_REPORT_MAX_REPORTS,
  parseCspReportPayload,
} from "@/lib/csp-report";

describe("CSP report normalization", () => {
  it("normalizes and sanitizes a legacy CSP report", () => {
    const [report] = parseCspReportPayload(
      {
        "csp-report": {
          "document-uri": "https://www.enhe-tech.com.cn/login?token=secret#form",
          "blocked-uri": "https://cdn.example.com/app.js?signature=secret#chunk",
          "effective-directive": "script-src-elem",
          "violated-directive": "script-src-elem https://cdn.example.com",
          disposition: "report",
          "source-file": "https://www.enhe-tech.com.cn/_next/app.js?key=secret",
          "line-number": 12,
          "column-number": 7,
          "status-code": 200,
        },
      },
      "application/csp-report",
    );

    expect(report).toEqual({
      format: "legacy",
      documentUrl: "https://www.enhe-tech.com.cn/login",
      blockedUrl: "https://cdn.example.com/app.js",
      effectiveDirective: "script-src-elem",
      violatedDirective: "script-src-elem https://cdn.example.com",
      disposition: "report",
      sourceFile: "https://www.enhe-tech.com.cn/_next/app.js",
      lineNumber: 12,
      columnNumber: 7,
      statusCode: 200,
    });
    expect(JSON.stringify(report)).not.toContain("secret");
  });

  it("accepts Reporting API batches, ignores other report types, and caps the batch", () => {
    const payload = Array.from({ length: CSP_REPORT_MAX_REPORTS + 5 }, (_, index) => ({
      age: index,
      type: index === 0 ? "deprecation" : "csp-violation",
      url: `https://www.enhe-tech.com.cn/pricing?request=${index}`,
      body: {
        blockedURL: "data:text/javascript,secret",
        effectiveDirective: "script-src-elem",
        disposition: "report",
        sourceFile: "/_next/static/chunk.js?token=secret",
      },
    }));

    const reports = parseCspReportPayload(payload, "application/reports+json");

    expect(reports).toHaveLength(CSP_REPORT_MAX_REPORTS - 1);
    expect(reports[0]).toEqual(
      expect.objectContaining({
        format: "reporting-api",
        documentUrl: "https://www.enhe-tech.com.cn/pricing",
        blockedUrl: "data:",
        sourceFile: "/_next/static/chunk.js",
      }),
    );
    expect(JSON.stringify(reports)).not.toContain("secret");
  });

  it("rejects malformed payload shapes", () => {
    expect(() =>
      parseCspReportPayload({ unexpected: true }, "application/csp-report"),
    ).toThrow("Invalid CSP report payload");
    expect(() =>
      parseCspReportPayload({ unexpected: true }, "application/reports+json"),
    ).toThrow("Invalid CSP report payload");
  });
});
