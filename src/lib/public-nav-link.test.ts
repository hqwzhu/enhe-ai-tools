import { describe, expect, it } from "vitest";
import { isActivePublicPath } from "@/components/public-nav-link";

describe("public navigation active path matching", () => {
  it("keeps parent routes active for their detail and filtered pages", () => {
    expect(isActivePublicPath("/software", "/software", new URLSearchParams("categoryName=Agents"))).toBe(true);
    expect(isActivePublicPath("/software/tool-slug", "/software", new URLSearchParams())).toBe(true);
    expect(isActivePublicPath("/en/software", "/en/software", new URLSearchParams("categoryName=Agents"))).toBe(true);
  });

  it("does not activate category links when the base listing has no category query", () => {
    expect(
      isActivePublicPath(
        "/software",
        "/software?categoryName=Video%20generation",
        new URLSearchParams(),
      ),
    ).toBe(false);
  });

  it("activates only the category link whose query value matches", () => {
    const current = new URLSearchParams("categoryName=Video+generation&sort=popular");

    expect(
      isActivePublicPath(
        "/software",
        "/software?categoryName=Video%20generation",
        current,
      ),
    ).toBe(true);
    expect(
      isActivePublicPath(
        "/software",
        "/software?categoryName=Voice%20generation",
        current,
      ),
    ).toBe(false);
  });

  it("supports exact matching for a base dropdown child", () => {
    expect(
      isActivePublicPath(
        "/skill-learning/ai-prompt-management",
        "/skill-learning",
        new URLSearchParams(),
        true,
      ),
    ).toBe(false);
    expect(
      isActivePublicPath(
        "/skill-learning",
        "/skill-learning",
        new URLSearchParams(),
        true,
      ),
    ).toBe(true);
  });
});
