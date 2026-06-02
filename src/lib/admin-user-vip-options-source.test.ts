import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("admin user manual VIP options", () => {
  it("includes a 1-day VIP duration option in user details", () => {
    const source = readFileSync(new URL("../app/admin/users/[id]/page.tsx", import.meta.url), "utf8");

    expect(source).toContain('vip1: "1天VIP"');
    expect(source).toContain('vip1: "1-day VIP"');
    expect(source).toContain("<option value={1}>{t.vip1}</option>");
  });
});
