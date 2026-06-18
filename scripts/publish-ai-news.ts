import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

type PublishMode = "draft" | "published";

function readArg(name: string) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

function assertPublishMode(value: string | null): PublishMode {
  if (value === "published") return "published";
  return "draft";
}

async function main() {
  const file = readArg("--file");
  if (!file) {
    throw new Error("Missing --file path to AI news JSON payload.");
  }

  const importUrl = process.env.AI_NEWS_IMPORT_URL;
  const importToken = process.env.AI_NEWS_IMPORT_TOKEN;
  if (!importUrl) throw new Error("Missing AI_NEWS_IMPORT_URL.");
  if (!importToken) throw new Error("Missing AI_NEWS_IMPORT_TOKEN.");

  const publishMode = assertPublishMode(readArg("--mode"));
  const raw = await readFile(resolve(file), "utf8");
  const payload = JSON.parse(raw) as Record<string, unknown>;
  payload.publishMode = publishMode;

  const response = await fetch(importUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${importToken}`
    },
    body: JSON.stringify(payload)
  });

  const body = (await response.json()) as {
    ok?: boolean;
    error?: string;
    message?: string;
    articleId?: string;
    adminUrl?: string;
    publicUrl?: string | null;
  };

  if (!response.ok || !body.ok) {
    throw new Error(`${body.error ?? "IMPORT_FAILED"}: ${body.message ?? response.statusText}`);
  }

  console.log(`Imported AI news article: ${body.articleId}`);
  console.log(`Admin URL: ${body.adminUrl}`);
  if (body.publicUrl) {
    console.log(`Public URL: ${body.publicUrl}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
