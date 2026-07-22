import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const temporaryDirectories: string[] = [];
const root = resolve(__dirname, "..");

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((path) =>
      rm(path, { recursive: true, force: true }),
    ),
  );
});

describe("summarize-csp-report-log CLI", () => {
  it("runs through the project CommonJS tsx configuration", async () => {
    const directory = await mkdtemp(join(tmpdir(), "enhe-csp-summary-cli-"));
    temporaryDirectories.push(directory);
    const logPath = join(directory, "csp-report.jsonl");
    await writeFile(
      logPath,
      `${JSON.stringify({
        event: "csp_violation",
        collectedAt: "2026-07-23T00:00:00.000Z",
        format: "legacy",
        blockedUrl: "https://example.invalid/probe.js",
      })}\n`,
      "utf8",
    );

    const { stdout } = await execFileAsync(
      process.execPath,
      [
        "--import",
        "tsx",
        "scripts/summarize-csp-report-log.ts",
        "--file",
        logPath,
      ],
      { cwd: root },
    );
    const output = JSON.parse(stdout) as {
      eventCount: number;
      syntheticProbeCount: number;
    };

    expect(output.eventCount).toBe(1);
    expect(output.syntheticProbeCount).toBe(1);
  });
});
