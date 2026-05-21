import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../..");

describe("server deployment compose config", () => {
  it("builds the app image from the repository root", () => {
    const compose = readFileSync(resolve(root, "deploy/enhe-ai-tools/docker-compose.yml"), "utf8");

    expect(compose).toContain("context: ../..");
    expect(compose).toContain("dockerfile: deploy/enhe-ai-tools/Dockerfile");
  });
});
