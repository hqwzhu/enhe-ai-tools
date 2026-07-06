import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { detectMigrationGuard } from "../deployment-config-reader";

describe("deployment migration guard artifacts", () => {
  test("app entrypoint gates prisma migrate deploy behind RUN_PRISMA_MIGRATE=1", async () => {
    const source = await readFile(join(process.cwd(), "deploy", "enhe-ai-tools", "scripts", "app-entrypoint.sh"), "utf8");

    expect(source).toContain("${RUN_PRISMA_MIGRATE:-0}");
    expect(source).toContain("Prisma migrate deploy explicitly enabled by RUN_PRISMA_MIGRATE=1.");
    expect(source).toContain("Prisma migrate deploy skipped because RUN_PRISMA_MIGRATE is not set to 1.");
    expect(source.indexOf("npx prisma migrate deploy")).toBeGreaterThan(source.indexOf("${RUN_PRISMA_MIGRATE:-0}"));
  });

  test("docker compose defaults RUN_PRISMA_MIGRATE to 0", async () => {
    const source = await readFile(join(process.cwd(), "deploy", "enhe-ai-tools", "docker-compose.yml"), "utf8");

    expect(source).toContain("RUN_PRISMA_MIGRATE: ${RUN_PRISMA_MIGRATE:-0}");
  });

  test("deployment checker detects skip unless explicit migration guard", async () => {
    const guard = await detectMigrationGuard(process.cwd());

    expect(guard).toEqual(expect.objectContaining({
      migrationGuardDetected: true,
      guardVariable: "RUN_PRISMA_MIGRATE",
      defaultMigrationBehavior: "skip_unless_explicit",
      migrationCommandRequiresExplicitApproval: true
    }));
  });

  test("docs and report state that no migration was executed this step", async () => {
    const doc = await readFile(join(process.cwd(), "docs", "ebos", "37-EBOS-App-Entrypoint-Migration-Guard.md"), "utf8");
    const report = JSON.parse(await readFile(
      join(process.cwd(), "reports", "ebos", "deployment", "2026-07-03-app-entrypoint-migration-guard.json"),
      "utf8"
    )) as { migrationExecutedThisStep?: boolean; defaultBehavior?: string };

    expect(doc).toContain("本阶段不执行 `prisma migrate deploy`");
    expect(report.migrationExecutedThisStep).toBe(false);
    expect(report.defaultBehavior).toBe("skip_unless_explicit");
  });
});
