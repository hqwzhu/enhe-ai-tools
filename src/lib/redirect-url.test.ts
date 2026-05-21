import { describe, expect, it } from "vitest";
import { resolveRedirectUrl } from "./redirect-url";

describe("resolveRedirectUrl", () => {
  it("resolves relative redirect targets against the request URL", () => {
    expect(resolveRedirectUrl("/uploads/tool.zip", "http://localhost:3000/api/tools/abc/download").toString()).toBe(
      "http://localhost:3000/uploads/tool.zip"
    );
  });

  it("keeps absolute redirect targets unchanged", () => {
    expect(resolveRedirectUrl("https://example.com/tool", "http://localhost:3000/api/tools/abc/use").toString()).toBe(
      "https://example.com/tool"
    );
  });
});
