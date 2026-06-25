import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("LumiOS product removal source contract", () => {
  it("does not republish the removed LumiOS product during deployment", () => {
    const deployScript = readFileSync(join(root, "deploy.sh"), "utf8");

    expect(deployScript).not.toContain("seed-lumios");
    expect(deployScript).not.toContain("发布 LumiOS 产品");
    expect(existsSync(join(root, "prisma/seed-lumios.cjs"))).toBe(false);
  });
});
