import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { middleware } from "@/middleware";

describe("locale switch redirects", () => {
  it("permanently redirects legacy locale query URLs to their canonical path", () => {
    const response = middleware(
      new NextRequest(
        "https://www.enhe-tech.com.cn/en/ai-news/copilot-cli-byok?locale=en",
      ),
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://www.enhe-tech.com.cn/en/ai-news/copilot-cli-byok",
    );
  });
});
