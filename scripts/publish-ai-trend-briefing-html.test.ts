import { execFile } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const scriptPath = join(process.cwd(), "scripts", "publish-ai-trend-briefing-html.ts");

type ScriptResult = {
  code: number;
  stdout: string;
  stderr: string;
};

async function createFiles({
  html = "\uFEFF<article><h1>AI 需求趋势</h1><p>完整内容</p></article>",
  summary = {
    date: "2026-06-19",
    title: "AI 需求趋势分析",
    summary: "公开摘要",
    coreConclusion: "核心结论",
    publicHighlights: ["工作效率", "视频生成"],
    sourceSignals: [
      {
        title: "Google Trends",
        url: "https://trends.google.com/trends/",
        sourceType: "search trend",
        observedSignal: "AI demand remains visible."
      }
    ]
  }
} = {}) {
  const dir = await mkdtemp(join(tmpdir(), "publish-ai-trend-briefing-"));
  const htmlFile = join(dir, "briefing.html");
  const summaryFile = join(dir, "briefing.summary.json");
  await writeFile(htmlFile, html, "utf8");
  await writeFile(summaryFile, JSON.stringify(summary), "utf8");
  return { htmlFile, summaryFile };
}

async function runScript(args: string[], env: Record<string, string> = {}): Promise<ScriptResult> {
  try {
    const result = await execFileAsync(process.execPath, ["--import", "tsx", scriptPath, ...args], {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: "", ...env },
      timeout: 10000
    });
    return { code: 0, stdout: result.stdout, stderr: result.stderr };
  } catch (error) {
    const failure = error as Error & { code?: number; stdout?: string; stderr?: string };
    return {
      code: typeof failure.code === "number" ? failure.code : 1,
      stdout: failure.stdout ?? "",
      stderr: failure.stderr ?? failure.message
    };
  }
}

describe("publish-ai-trend-briefing-html script", () => {
  it("requires both HTML and summary file paths", async () => {
    const result = await runScript([]);

    expect(result.code).toBe(1);
    expect(result.stderr).toContain("Missing --file");
  });

  it("validates summary and rejects source-less published reports before database writes", async () => {
    const { htmlFile, summaryFile } = await createFiles({
      summary: {
        date: "2026-06-19",
        title: "AI 需求趋势分析",
        summary: "公开摘要",
        coreConclusion: "核心结论",
        publicHighlights: [],
        sourceSignals: []
      }
    });

    const result = await runScript(["--file", htmlFile, "--summary-file", summaryFile, "--mode", "published", "--dry-run"]);

    expect(result.code).toBe(1);
    expect(result.stderr).toContain("source");
  });

  it("strips UTF-8 BOM and validates dry-run payloads without writing to the database", async () => {
    const { htmlFile, summaryFile } = await createFiles();

    const result = await runScript(["--file", htmlFile, "--summary-file", summaryFile, "--mode", "published", "--dry-run"]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Validated AI trend briefing: 2026-06-19");
    expect(result.stdout).toContain("Dry run: database upsert skipped.");
    expect(result.stdout).not.toContain("\uFEFF");
  });
});
