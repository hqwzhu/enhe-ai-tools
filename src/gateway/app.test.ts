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
  zeroWalletKey: string;
};

describe("ENHE API Gateway", () => {
  let account: TestAccount;
  const previousPepper = process.env.ENHE_API_KEY_PEPPER;
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    process.env.ENHE_API_KEY_PEPPER = testPepper;
    account = await createTestAccount("active", "active");
    await createWalletForAccount(account.userId, account.developerProfileId, "0.01000000");
    const revoked = await createApiKeyForAccount(account.userId, account.developerProfileId, "revoked");
    const suspended = await createTestAccount("suspended", "active");
    const disabled = await createTestAccount("active", "disabled");
    const zeroWallet = await createTestAccount("active", "active");
    await createWalletForAccount(zeroWallet.userId, zeroWallet.developerProfileId, "0");
    account.revokedKey = revoked;
    account.suspendedKey = suspended.activeKey;
    account.disabledUserKey = disabled.activeKey;
    account.zeroWalletKey = zeroWallet.activeKey;
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

  test("POST /v1/chat/completions without API key returns 401", async () => {
    const app = buildGatewayApp();
    const response = await app.inject({
      method: "POST",
      url: "/v1/chat/completions",
      payload: validChatPayload()
    });
    await app.close();

    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe("invalid_api_key");
  });

  test("POST /v1/chat/completions with revoked API key returns 401", async () => {
    const app = buildGatewayApp();
    const response = await app.inject({
      method: "POST",
      url: "/v1/chat/completions",
      headers: { authorization: `Bearer ${account.revokedKey}` },
      payload: validChatPayload()
    });
    await app.close();

    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe("invalid_api_key");
  });

  test("POST /v1/chat/completions with suspended developer returns 403", async () => {
    const app = buildGatewayApp();
    const response = await app.inject({
      method: "POST",
      url: "/v1/chat/completions",
      headers: { authorization: `Bearer ${account.suspendedKey}` },
      payload: validChatPayload()
    });
    await app.close();

    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("developer_suspended");
  });

  test("POST /v1/chat/completions with invalid body returns 400 and writes usage log", async () => {
    const app = buildGatewayApp();
    const response = await app.inject({
      method: "POST",
      url: "/v1/chat/completions",
      headers: { authorization: `Bearer ${account.activeKey}` },
      payload: { model: "enhe-chat-lite", messages: [] }
    });
    await app.close();

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("invalid_request");
    const log = await expectUsageLog(response.headers["x-request-id"], 400);
    expect(log.errorCode).toBe("invalid_request");
    expect(log.errorMessage ?? "").not.toContain("messages");
  });

  test("POST /v1/chat/completions with unknown model returns 404 and writes usage log", async () => {
    const app = buildGatewayApp();
    const response = await app.inject({
      method: "POST",
      url: "/v1/chat/completions",
      headers: { authorization: `Bearer ${account.activeKey}` },
      payload: validChatPayload({ model: "unknown-model" })
    });
    await app.close();

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe("model_not_found");
    const log = await expectUsageLog(response.headers["x-request-id"], 404);
    expect(log.model).toBe("unknown-model");
    expect(log.errorCode).toBe("model_not_found");
  });

  test("POST /v1/chat/completions with stream=true returns 501 and writes usage log", async () => {
    const app = buildGatewayApp();
    const response = await app.inject({
      method: "POST",
      url: "/v1/chat/completions",
      headers: { authorization: `Bearer ${account.activeKey}` },
      payload: validChatPayload({ stream: true })
    });
    await app.close();

    expect(response.statusCode).toBe(501);
    expect(response.json().error.code).toBe("unsupported_stream");
    const log = await expectUsageLog(response.headers["x-request-id"], 501);
    expect(log.isStream).toBe(true);
    expect(log.billingStatus).toBe("not_billable");
  });

  test("POST /v1/chat/completions with zero wallet returns 402 and writes usage log", async () => {
    const app = buildGatewayApp();
    const response = await app.inject({
      method: "POST",
      url: "/v1/chat/completions",
      headers: { authorization: `Bearer ${account.zeroWalletKey}` },
      payload: validChatPayload()
    });
    await app.close();

    expect(response.statusCode).toBe(402);
    expect(response.json().error.code).toBe("insufficient_credit");
    const log = await expectUsageLog(response.headers["x-request-id"], 402);
    expect(log.errorCode).toBe("insufficient_credit");
    expect(log.chargedUsd.toFixed()).toBe("0");
  });

  test("POST /v1/chat/completions with active key and funded wallet returns mock OpenAI-compatible response", async () => {
    const creditTransactionsBefore = await prisma.apiCreditTransaction.count();
    const app = buildGatewayApp();
    const response = await app.inject({
      method: "POST",
      url: "/v1/chat/completions",
      headers: { authorization: `Bearer ${account.activeKey}` },
      payload: validChatPayload({ messages: [{ role: "user", content: "secret prompt should not be logged" }] })
    });
    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.headers["x-request-id"]).toEqual(expect.any(String));
    const body = response.json();
    expect(body).toMatchObject({
      object: "chat.completion",
      model: "enhe-chat-lite",
      choices: [
        {
          index: 0,
          message: { role: "assistant" },
          finish_reason: "stop"
        }
      ],
      usage: {
        prompt_tokens: 8,
        completion_tokens: 16,
        total_tokens: 24
      }
    });
    expect(body.id).toMatch(/^chatcmpl_[a-f0-9]{24}$/);

    const log = await expectUsageLog(response.headers["x-request-id"], 200);
    expect(log.inputTokens).toBe(8);
    expect(log.outputTokens).toBe(16);
    expect(log.billingStatus).toBe("not_billable");
    expect(log.upstreamProvider).toBe("mock");
    expect(log.routeId).toBe("mock:mvp-chat-completions");
    expect(JSON.stringify(log)).not.toContain(account.activeKey);
    expect(JSON.stringify(log)).not.toContain("secret prompt should not be logged");
    expect(JSON.stringify(log)).not.toContain("Authorization");
    expect(await prisma.apiCreditTransaction.count()).toBe(creditTransactionsBefore);
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
      disabledUserKey: "",
      zeroWalletKey: ""
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

  async function createWalletForAccount(userId: string, developerProfileId: string, planBalanceUsd: string) {
    await prisma.apiWallet.create({
      data: {
        userId,
        developerProfileId,
        planBalanceUsd
      }
    });
  }

  function validChatPayload(overrides: Record<string, unknown> = {}) {
    return {
      model: "enhe-chat-lite",
      messages: [{ role: "user", content: "hello" }],
      stream: false,
      ...overrides
    };
  }

  async function expectUsageLog(requestIdHeader: unknown, statusCode: number) {
    expect(requestIdHeader).toEqual(expect.any(String));
    const requestId = String(requestIdHeader);
    const log = await prisma.apiUsageLog.findUnique({
      where: { requestId }
    });
    expect(log).not.toBeNull();
    expect(log?.statusCode).toBe(statusCode);
    expect(log?.path).toBe("/v1/chat/completions");
    return log!;
  }
});
