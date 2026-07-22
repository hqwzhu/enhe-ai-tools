import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createCspViolationEvents,
  writeCspViolationEvents,
} from "@/lib/csp-report-log";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(
    temporaryDirectories.splice(0).map((path) =>
      rm(path, { recursive: true, force: true }),
    ),
  );
});

describe("CSP report persistent logging", () => {
  it("writes sanitized JSONL events to the configured persistent path", async () => {
    const directory = await mkdtemp(join(tmpdir(), "enhe-csp-report-"));
    temporaryDirectories.push(directory);
    const logPath = join(directory, "nested", "csp-report.jsonl");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const events = createCspViolationEvents(
      [
        {
          format: "legacy",
          documentUrl: "https://www.enhe-tech.com.cn/login",
          blockedUrl: "https://example.invalid/script.js",
        },
      ],
      "2026-07-23T00:00:00.000Z",
    );

    const result = await writeCspViolationEvents(events, logPath);
    const persisted = await readFile(logPath, "utf8");

    expect(result).toEqual({ persisted: true, eventCount: 1 });
    expect(warn).toHaveBeenCalledWith(JSON.stringify(events[0]));
    expect(persisted.trim()).toBe(JSON.stringify(events[0]));
  });

  it("keeps stdout logging when persistent storage is not configured", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const events = createCspViolationEvents([{ format: "reporting-api" }]);

    await expect(writeCspViolationEvents(events, "")).resolves.toEqual({
      persisted: false,
      eventCount: 1,
    });
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
