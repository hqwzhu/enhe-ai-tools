import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("admin tool editor source", () => {
  it("lets React control server action form encoding", () => {
    const source = readFileSync(join(process.cwd(), "src/app/admin/tool-admin-list.tsx"), "utf8");

    expect(source).not.toContain('action={upsertToolAction} encType=');
    expect(source).not.toContain('action={upsertToolAction} method=');
  });

  it("includes a direct download URL field for software tools", () => {
    const source = readFileSync(join(process.cwd(), "src/app/admin/tool-admin-list.tsx"), "utf8");

    expect(source).toContain('name="downloadFileUrl"');
    expect(source).toContain("downloadFileUrlHint");
  });
});
