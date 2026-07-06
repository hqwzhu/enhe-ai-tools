import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { buildGatewayApp } from "./app";
import { createApiKeySecret, formatApiKeyPrefix, hashApiKey } from "@/features/enhe-api/server/api-key-crypto";

const prisma = new PrismaClient();
const testPepper = "phase-nine-gateway-test-pepper-32chars";

type TestAccount = {
  userId: string;
  developerProfileId: string;
  activeKey: string;
  revokedKey: string;
  suspendedKey: string;
  disabledUserKey: string;
};

describe("ENHE API Gateway", () => {
  let account: TestAccount;
  const previousPepper = process.env.ENHE_API_KEY_PEPPER;
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    process.env.ENHE_API_KEY_PEPPER = testPepper;
    account = await createTestAccount("active", "active");
    const revoked = await createApiKeyForAccount(account.userId, account.developerProfileId, "revoked");
    const suspended = await createTestAccount("suspended", "active");
    const disabled = await createTestAccount("active", "disabled");
    account.revokedKey = revoked;
    account.suspendedKey = suspended.activeKey;
    account.disabledUserKey = disabled.activeKey;
  });

  afterAll(async () => {
    if (createdUserIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
    if (previousPepper === undefined) {
      delete process.env.ENHE_API_KEY_PEPPER;
    } else {
      process.env.ENHE_API_KEY_PEPPER = previousPepper;
    }
    await prisma.$disconnect();
  });

  test("GET /health returns liveness without database details", async () => {
    const app = buildGatewayApp();
    const response = await app.inject({ method: "GET", url: "/health" });
    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "ok",
      service: "enhe-api-gateway"
    });
  });

  test("GET /v1/models without API key returns 401", async () => {
    const app = buildGatewayApp();
    const response = await app.inject({ method: "GET", url: "/v1/models" });
    await app.close();

    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe("invalid_api_key");
  });

  test("GET /v1/models with malformed API key returns 401", async () => {
    const app = buildGatewayApp();
    const response = await app.inject({
      method: "GET",
      url: "/v1/models",
      headers: { authorization: "Bearer not-an-enhe-key" }
    });
    await app.close();

    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe("invalid_api_key");
  });

  test("GET /v1/models with unknown API key returns 401", async () => {
    const app = buildGatewayApp();
    const unknownKey = createApiKeySecret();
    const response = await app.inject({
      method: "GET",
      url: "/v1/models",
      headers: { authorization: `Bearer ${unknownKey}` }
    });
    await app.close();

    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe("invalid_api_key");
  });

  test("GET /v1/models with revoked API key returns 401", async () => {
    const app = buildGatewayApp();
    const response = await app.inject({
      method: "GET",
      url: "/v1/models",
      headers: { authorization: `Bearer ${account.revokedKey}` }
    });
    await app.close();

    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe("invalid_api_key");
  });

  test("GET /v1/models with active API key returns OpenAI-compatible model list", async () => {
    const app = buildGatewayApp();
    const response = await app.inject({
      method: "GET",
      url: "/v1/models",
      headers: { authorization: `Bearer ${account.activeKey}` }
    });
    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      object: "list",
      data: [
        { id: "enhe-chat-lite", object: "model", created: 1760000000, owned_by: "enhe" },
        { id: "enhe-coder-lite", object: "model", created: 1760000000, owned_by: "enhe" },
        { id: "enhe-claude-compatible", object: "model", created: 1760000000, owned_by: "enhe" }
      ]
    });
  });

  test("GET /v1/models with suspended developer returns 403", async () => {
    const app = buildGatewayApp();
    const response = await app.inject({
      method: "GET",
      url: "/v1/models",
      headers: { authorization: `Bearer ${account.suspendedKey}` }
    });
    await app.close();

    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("developer_suspended");
  });

  test("GET /v1/models with disabled user returns 403", async () => {
    const app = buildGatewayApp();
    const response = await app.inject({
      method: "GET",
      url: "/v1/models",
      headers: { authorization: `Bearer ${account.disabledUserKey}` }
    });
    await app.close();

    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("developer_suspended");
  });

  async function createTestAccount(
    developerStatus: "active" | "suspended" | "closed",
    userStatus: "active" | "disabled"
  ): Promise<TestAccount> {
    const suffix = `${Date.now()}-${randomBytes(6).toString("hex")}`;
    const user = await prisma.user.create({
      data: {
        email: `gateway-test-${suffix}@example.test`,
        passwordHash: "gateway-test-password-hash",
        nickname: "Gateway Test",
        status: userStatus
      },
      select: { id: true }
    });
    createdUserIds.push(user.id);

    const profile = await prisma.apiDeveloperProfile.create({
      data: {
        userId: user.id,
        developerId: `enhe_dev_${randomBytes(4).toString("hex")}`,
        displayName: "Gateway Test",
        status: developerStatus
      },
      select: { id: true }
    });

    const activeKey = await createApiKeyForAccount(user.id, profile.id, "active");
    return {
      userId: user.id,
      developerProfileId: profile.id,
      activeKey,
      revokedKey: "",
      suspendedKey: "",
      disabledUserKey: ""
    };
  }

  async function createApiKeyForAccount(
    userId: string,
    developerProfileId: string,
    status: "active" | "revoked"
  ) {
    const plainKey = createApiKeySecret();
    const hash = hashApiKey(plainKey);
    if (!hash.ok) throw new Error("Test API key hash failed.");

    await prisma.apiKey.create({
      data: {
        userId,
        developerProfileId,
        name: `Gateway ${status} key`,
        keyPrefix: formatApiKeyPrefix(plainKey),
        keyHash: hash.hash,
        keyHashVersion: hash.hashVersion,
        status,
        revokedAt: status === "revoked" ? new Date() : null
      }
    });

    return plainKey;
  }
});
