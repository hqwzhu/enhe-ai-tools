import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/csp-report/route";
import { CSP_REPORT_MAX_BODY_BYTES } from "@/lib/csp-report";

function createRequest(body: string, contentType: string, contentLength?: number) {
  const headers = new Headers({ "content-type": contentType });
  if (contentLength !== undefined) {
    headers.set("content-length", String(contentLength));
  }
  return new Request("https://www.enhe-tech.com.cn/api/csp-report", {
    method: "POST",
    headers,
    body,
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/csp-report", () => {
  it("accepts legacy reports, logs only sanitized data, and disables caching", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const request = createRequest(
      JSON.stringify({
        "csp-report": {
          "document-uri": "https://www.enhe-tech.com.cn/login?token=secret",
          "blocked-uri": "https://cdn.example.com/app.js?signature=secret",
          "effective-directive": "script-src-elem",
          disposition: "report",
        },
      }),
      "application/csp-report",
    );

    const response = await POST(request);

    expect(response.status).toBe(204);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(warn).toHaveBeenCalledTimes(1);
    const logged = warn.mock.calls[0]?.[0];
    expect(typeof logged).toBe("string");
    expect(JSON.parse(String(logged))).toEqual(
      expect.objectContaining({
        event: "csp_violation",
        documentUrl: "https://www.enhe-tech.com.cn/login",
        blockedUrl: "https://cdn.example.com/app.js",
      }),
    );
    expect(String(logged)).not.toContain("secret");
  });

  it("accepts Reporting API CSP batches", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const request = createRequest(
      JSON.stringify([
        {
          age: 10,
          type: "csp-violation",
          url: "https://www.enhe-tech.com.cn/pricing?source=private",
          body: {
            blockedURL: "inline",
            effectiveDirective: "script-src-elem",
            disposition: "report",
          },
        },
      ]),
      "application/reports+json; charset=utf-8",
    );

    const response = await POST(request);

    expect(response.status).toBe(204);
  });

  it("rejects unsupported, malformed, and oversized requests", async () => {
    const unsupported = await POST(createRequest("{}", "application/json"));
    const malformed = await POST(createRequest("{", "application/csp-report"));
    const declaredTooLarge = await POST(
      createRequest("{}", "application/csp-report", CSP_REPORT_MAX_BODY_BYTES + 1),
    );
    const streamedTooLarge = await POST(
      createRequest("x".repeat(CSP_REPORT_MAX_BODY_BYTES + 1), "application/csp-report"),
    );

    expect(unsupported.status).toBe(415);
    expect(malformed.status).toBe(400);
    expect(declaredTooLarge.status).toBe(413);
    expect(streamedTooLarge.status).toBe(413);
  });
});
