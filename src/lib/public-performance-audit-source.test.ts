import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("public performance audit source contract", () => {
  it("ships a repeatable public-page performance and cache-header audit script", () => {
    const scriptPath = "scripts/audit-public-performance.mjs";
    const script = read(scriptPath);
    const packageJson = read("package.json");

    expect(existsSync(join(root, scriptPath))).toBe(true);
    expect(packageJson).toContain('"audit:performance"');
    expect(packageJson).toContain("node scripts/audit-public-performance.mjs");
    expect(script).toContain("PERFORMANCE_AUDIT_BASE_URL");
    expect(script).toContain("PAGE_SPEED_API_KEY");
    expect(script).toContain("Cache-Control");
    expect(script).toContain("Content-Language");
    expect(script).toContain("/sitemap.xml");
    expect(script).toContain("/llms.txt");
    expect(script).toContain("p50");
    expect(script).toContain("p95");
  });
});
