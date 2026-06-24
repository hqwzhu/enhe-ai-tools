import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const dictionariesSource = readFileSync(join(process.cwd(), "src/lib/dictionaries.ts"), "utf8");

describe("tool detail copy", () => {
  it("uses product introduction copy without the product-image helper sentence", () => {
    expect(dictionariesSource).toContain('introTitle: "产品介绍"');
    expect(dictionariesSource).not.toContain("图文结合展示工具功能、使用场景和关键界面。");
  });
});
