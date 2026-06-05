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

  it("keeps the shared Tencent Cloud nginx proxy aligned with admin upload limits", () => {
    const deployScript = readFileSync(resolve(root, "deploy.sh"), "utf8");

    expect(deployScript).toContain("client_max_body_size 520m");
    expect(deployScript).toContain("/opt/hot-content-os/app/hot-content-os/infra/nginx/default.conf");
    expect(deployScript).toContain("docker compose -f /opt/hot-content-os/app/hot-content-os/docker-compose.yml up -d --force-recreate nginx");
    expect(deployScript).toContain("enhe-ai-tools-app:3000");
  });
});
