import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe("license generator admin panel source", () => {
  test("exposes Lumi OS mode without putting the Ed25519 private key in client code", () => {
    const panelSource = readFileSync(
      join(process.cwd(), "src/app/admin/license-generator/license-generator-panel.tsx"),
      "utf8"
    );
    const adminI18nSource = readFileSync(join(process.cwd(), "src/lib/admin-i18n.ts"), "utf8");
    const envExampleSource = readFileSync(join(process.cwd(), ".env.example"), "utf8");

    expect(panelSource).toContain('name="licenseProduct"');
    expect(panelSource).toContain('value="lumi-os"');
    expect(panelSource).toContain('name="expiresAt"');
    expect(adminI18nSource).toContain("lumiPrivateKeyHint");
    expect(envExampleSource).toContain("LUMI_LICENSE_PRIVATE_KEY_FILE");
    expect(panelSource).not.toContain("BEGIN PRIVATE KEY");
    expect(envExampleSource).not.toContain("BEGIN PRIVATE KEY");
  });
});
