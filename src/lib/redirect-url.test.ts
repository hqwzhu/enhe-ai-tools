import { describe, expect, it } from "vitest";
import { resolveFormRedirectUrl, resolveRedirectUrl } from "./redirect-url";

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

describe("resolveFormRedirectUrl", () => {
  it("prefers the browser origin for same-site form redirects", () => {
    expect(
      resolveFormRedirectUrl("/orders/order-1?uploaded=1", "http://localhost:3000/api/uploads/payment-proof", "http://127.0.0.1:3000").toString()
    ).toBe("http://127.0.0.1:3000/orders/order-1?uploaded=1");
  });

  it("rejects untrusted cross-site origins", () => {
    expect(
      resolveFormRedirectUrl("/orders/order-1?uploaded=1", "https://www.enhe-tech.com.cn/api/uploads/payment-proof", "https://evil.example").toString()
    ).toBe("https://www.enhe-tech.com.cn/orders/order-1?uploaded=1");
  });
});
