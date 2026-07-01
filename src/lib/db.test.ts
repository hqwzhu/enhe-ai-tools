import { describe, expect, it } from "vitest";
import { buildPrismaClientLogLevels, isRecoverablePrismaReadError } from "./db";

describe("buildPrismaClientLogLevels", () => {
  it("suppresses Prisma error event logs during Next production builds", () => {
    expect(
      buildPrismaClientLogLevels({
        NODE_ENV: "production",
        NEXT_PHASE: "phase-production-build"
      })
    ).not.toContain("error");
  });

  it("keeps Prisma error event logs for production runtime", () => {
    expect(
      buildPrismaClientLogLevels({
        NODE_ENV: "production"
      })
    ).toContain("error");
  });

  it("treats missing DATABASE_URL as a recoverable public read error", () => {
    const error = Object.assign(
      new Error("Environment variable not found: DATABASE_URL."),
      { name: "PrismaClientInitializationError" }
    );

    expect(isRecoverablePrismaReadError(error)).toBe(true);
  });

  it("treats known missing tables as recoverable when requested", () => {
    const error = Object.assign(new Error("The table does not exist"), {
      code: "P2021",
      meta: { table: "public.ai_trend_briefings" }
    });

    expect(isRecoverablePrismaReadError(error, { missingTables: ["ai_trend_briefings"] })).toBe(true);
    expect(isRecoverablePrismaReadError(error)).toBe(false);
  });
});
