import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("LumiOS product removal source contract", () => {
  it("does not republish the removed LumiOS product during deployment", () => {
    const deployScript = readFileSync(join(root, "deploy.sh"), "utf8");
    const nextConfig = readFileSync(join(root, "next.config.ts"), "utf8");
    const aiNewsPageShell = readFileSync(
      join(root, "src/app/ai-news/[slug]/page-shell.tsx"),
      "utf8",
    );

    expect(deployScript).not.toContain("seed-lumios");
    expect(deployScript).not.toContain("发布 LumiOS 产品");
    expect(existsSync(join(root, "prisma/seed-lumios.cjs"))).toBe(false);
    expect(nextConfig).toContain('source: "/software/lumios-personal-ai-companion"');
    expect(nextConfig).toContain('destination: "/ai-news/chatbox-to-personal-ai-companion-desktop-execution"');
    expect(nextConfig).toContain('source: "/en/software/lumios-personal-ai-companion"');
    expect(nextConfig).toContain('destination: "/en/ai-news/chatbox-to-personal-ai-companion-desktop-execution"');
    expect(aiNewsPageShell).toContain("removedProductHrefReplacements");
    expect(aiNewsPageShell).toContain(
      '"/software/lumios-personal-ai-companion"',
    );
    expect(aiNewsPageShell).toContain(
      '"/en/software/lumios-personal-ai-companion"',
    );
    expect(aiNewsPageShell).toContain(
      "const href = normalizeAiNewsInternalHref(part.href);",
    );
  });
});
