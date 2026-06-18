import { execFile } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const scriptPath = join(process.cwd(), "scripts", "publish-ai-news.ts");

type ScriptResult = {
  code: number;
  stdout: string;
  stderr: string;
};

const servers: Array<{ close: () => Promise<void> }> = [];

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.close()));
});

async function createPayloadFile() {
  const dir = await mkdtemp(join(tmpdir(), "publish-ai-news-"));
  const file = join(dir, "payload.json");
  await writeFile(file, JSON.stringify({ title: "AI News" }), "utf8");
  return file;
}

async function createBomPayloadFile() {
  const dir = await mkdtemp(join(tmpdir(), "publish-ai-news-"));
  const file = join(dir, "payload.json");
  await writeFile(file, `\uFEFF${JSON.stringify({ title: "AI News" })}`, "utf8");
  return file;
}

async function runScript(args: string[], env: Record<string, string>): Promise<ScriptResult> {
  try {
    const result = await execFileAsync(process.execPath, ["--import", "tsx", scriptPath, ...args], {
      cwd: process.cwd(),
      env: { ...process.env, ...env },
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

async function withServer(handler: (req: IncomingMessage, res: ServerResponse) => void) {
  const server = createServer(handler);
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Expected TCP server address.");
  }
  servers.push({
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      })
  });
  return `http://127.0.0.1:${address.port}/import`;
}

describe("publish-ai-news script", () => {
  it("rejects plaintext remote import URLs before publishing", async () => {
    const file = await createPayloadFile();

    const result = await runScript(["--file", file], {
      AI_NEWS_IMPORT_URL: "http://example.com/import",
      AI_NEWS_IMPORT_TOKEN: "secret"
    });

    expect(result.code).toBe(1);
    expect(result.stderr).toContain("Refusing to send AI_NEWS_IMPORT_TOKEN to plaintext remote URL");
  });

  it("rejects missing flag values", async () => {
    const result = await runScript(["--file", "--mode", "draft"], {
      AI_NEWS_IMPORT_URL: "http://localhost:3000/import",
      AI_NEWS_IMPORT_TOKEN: "secret"
    });

    expect(result.code).toBe(1);
    expect(result.stderr).toContain("Missing value for --file.");
  });

  it("rejects invalid publish modes", async () => {
    const file = await createPayloadFile();

    const result = await runScript(["--file", file, "--mode", "live"], {
      AI_NEWS_IMPORT_URL: "http://localhost:3000/import",
      AI_NEWS_IMPORT_TOKEN: "secret"
    });

    expect(result.code).toBe(1);
    expect(result.stderr).toContain("Invalid --mode live. Expected draft or published.");
  });

  it("reports HTTP status and response text when import response is not JSON", async () => {
    const file = await createPayloadFile();
    const url = await withServer((_req, res) => {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("plain failure from import endpoint");
    });

    const result = await runScript(["--file", file], {
      AI_NEWS_IMPORT_URL: url,
      AI_NEWS_IMPORT_TOKEN: "secret"
    });

    expect(result.code).toBe(1);
    expect(result.stderr).toContain("Import failed with HTTP 500");
    expect(result.stderr).toContain("plain failure from import endpoint");
  });

  it("accepts UTF-8 BOM JSON files", async () => {
    const file = await createBomPayloadFile();
    let receivedBody = "";
    const url = await withServer((req, res) => {
      req.setEncoding("utf8");
      req.on("data", (chunk) => {
        receivedBody += chunk;
      });
      req.on("end", () => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, articleId: "article-1", adminUrl: "/admin/ai-news/article-1" }));
      });
    });

    const result = await runScript(["--file", file], {
      AI_NEWS_IMPORT_URL: url,
      AI_NEWS_IMPORT_TOKEN: "secret"
    });

    expect(result.code).toBe(0);
    expect(JSON.parse(receivedBody)).toMatchObject({ title: "AI News", publishMode: "draft" });
    expect(result.stdout).toContain("Imported AI news article: article-1");
  });
});
