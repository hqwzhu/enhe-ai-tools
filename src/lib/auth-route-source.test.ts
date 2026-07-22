import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../..");

describe("authentication route source boundaries", () => {
  it("renders authentication routes at request time so CSRF tokens never use build-time secrets", () => {
    for (const path of [
      "src/app/(auth)/login/page.tsx",
      "src/app/(auth)/register/page.tsx",
      "src/app/en/(auth)/login/page.tsx",
      "src/app/en/(auth)/register/page.tsx",
    ]) {
      const source = readFileSync(resolve(root, path), "utf8");
      expect(source).toContain('export const dynamic = "force-dynamic"');
    }
  });
});
