import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

type EnvLike = {
  NODE_ENV?: string;
  NEXT_PHASE?: string;
};

export function buildPrismaClientLogLevels(env: EnvLike = process.env): Array<"error" | "warn"> {
  if (env.NODE_ENV === "development") return ["error", "warn"];
  if (env.NEXT_PHASE === "phase-production-build") return [];
  return ["error"];
}

export function isRecoverablePrismaReadError(
  error: unknown,
  options: { missingTables?: string[] } = {}
) {
  if (!(error instanceof Error)) return false;

  const candidate = error as Error & { code?: unknown; meta?: { table?: unknown } };
  const code = typeof candidate.code === "string" ? candidate.code : "";
  const message = error.message;
  const table = typeof candidate.meta?.table === "string" ? candidate.meta.table : "";

  return (
    code === "P1001" ||
    /Can't reach database server/i.test(message) ||
    /ECONNREFUSED/i.test(message) ||
    /Environment variable not found:\s*DATABASE_URL/i.test(message) ||
    error.name === "PrismaClientInitializationError" ||
    (code === "P2021" && Boolean(options.missingTables?.some((missingTable) => table.includes(missingTable))))
  );
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: buildPrismaClientLogLevels()
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
