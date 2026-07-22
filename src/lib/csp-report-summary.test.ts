import { describe, expect, it } from "vitest";
import { summarizeCspReportLines } from "@/lib/csp-report-summary";

describe("CSP report observation summaries", () => {
  it("separates synthetic probes from organic reports", () => {
    const summary = summarizeCspReportLines([
      JSON.stringify({
        event: "csp_violation",
        collectedAt: "2026-07-23T00:00:00.000Z",
        format: "legacy",
        blockedUrl: "https://example.invalid/probe.js",
        effectiveDirective: "script-src-elem",
      }),
      JSON.stringify({
        event: "csp_violation",
        collectedAt: "2026-07-23T01:00:00.000Z",
        format: "reporting-api",
        blockedUrl: "https://cdn.example.com/app.js",
        effectiveDirective: "script-src-elem",
      }),
      "not-json",
    ]);

    expect(summary).toEqual({
      eventCount: 2,
      syntheticProbeCount: 1,
      organicEventCount: 1,
      invalidLineCount: 1,
      directives: { "script-src-elem": 2 },
      blockedOrigins: {
        "https://example.invalid": 1,
        "https://cdn.example.com": 1,
      },
    });
  });

  it("filters events before the requested observation window", () => {
    const summary = summarizeCspReportLines(
      [
        JSON.stringify({
          event: "csp_violation",
          collectedAt: "2026-07-22T23:59:59.000Z",
          format: "legacy",
        }),
        JSON.stringify({
          event: "csp_violation",
          collectedAt: "2026-07-23T00:00:00.000Z",
          format: "legacy",
        }),
      ],
      new Date("2026-07-23T00:00:00.000Z"),
    );

    expect(summary.eventCount).toBe(1);
  });
});
