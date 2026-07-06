import type { FastifyInstance } from "fastify";
import { checkSufficientCredit } from "@/features/enhe-api/server/wallet";
import { createUsageLog } from "@/features/enhe-api/server/usage-logs";
import { requireGatewayApiKey } from "./auth";
import { createGatewayRequestContext, sendGatewayError, type GatewayErrorCode, type GatewayRequestContext } from "./errors";
import { findGatewayModel } from "./models";

type ChatCompletionBody = {
  model: string;
  messages: Array<Record<string, unknown>>;
  stream: boolean;
  maxTokens?: number;
};

type AuthenticatedGatewayKey = {
  userId: string;
  developerProfileId: string;
  apiKeyId: string;
  keyPrefix: string;
};

const chatCompletionsPath = "/v1/chat/completions";
const mockPromptTokens = 8;
const mockCompletionTokens = 16;
const mockCreatedAt = 1760000000;
const estimatedMockCostUsd = "0.000001";

export function registerChatCompletionRoutes(app: FastifyInstance) {
  app.post(chatCompletionsPath, async (request, reply) => {
    const context = createGatewayRequestContext();
    const auth = await requireGatewayApiKey(request, reply, context);
    if (!auth.ok) return auth.response;

    const parsed = parseChatCompletionBody(request.body);
    if (!parsed.ok) {
      await writeChatUsageLog(context, auth.apiKey, {
        statusCode: 400,
        model: getCandidateModel(request.body),
        isStream: false,
        errorCode: "invalid_request",
        errorMessage: "Invalid request body."
      });
      return sendGatewayError(reply, 400, "invalid_request", context);
    }

    const body = parsed.body;
    if (body.stream) {
      await writeChatUsageLog(context, auth.apiKey, {
        statusCode: 501,
        model: body.model,
        isStream: true,
        errorCode: "unsupported_stream",
        errorMessage: "Streaming chat completions are not supported yet."
      });
      return sendGatewayError(reply, 501, "unsupported_stream", context);
    }

    const model = findGatewayModel(body.model);
    if (!model) {
      await writeChatUsageLog(context, auth.apiKey, {
        statusCode: 404,
        model: body.model,
        isStream: false,
        errorCode: "model_not_found",
        errorMessage: "Requested model is not available."
      });
      return sendGatewayError(reply, 404, "model_not_found", context);
    }

    const credit = await checkSufficientCredit({
      userId: auth.apiKey.userId,
      developerProfileId: auth.apiKey.developerProfileId,
      estimatedCostUsd: estimatedMockCostUsd
    });
    if (!credit.ok) {
      const statusCode = credit.reason === "developer_not_active" ? 403 : 402;
      const errorCode: GatewayErrorCode = credit.reason === "developer_not_active" ? "developer_suspended" : "insufficient_credit";
      await writeChatUsageLog(context, auth.apiKey, {
        statusCode,
        model: body.model,
        isStream: false,
        errorCode,
        errorMessage: errorCode === "developer_suspended" ? "Developer account is not active." : "API credit is insufficient."
      });
      return sendGatewayError(reply, statusCode, errorCode, context);
    }

    await writeChatUsageLog(context, auth.apiKey, {
      statusCode: 200,
      model: model.id,
      isStream: false,
      inputTokens: mockPromptTokens,
      outputTokens: mockCompletionTokens
    });

    reply.header("x-request-id", context.requestId);
    return {
      id: `chatcmpl_${context.requestId.replaceAll("-", "").slice(0, 24)}`,
      object: "chat.completion",
      created: mockCreatedAt,
      model: model.id,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: "这是 ENHE API Gateway 的 mock 响应，用于本地联调。"
          },
          finish_reason: "stop"
        }
      ],
      usage: {
        prompt_tokens: mockPromptTokens,
        completion_tokens: mockCompletionTokens,
        total_tokens: mockPromptTokens + mockCompletionTokens
      }
    };
  });
}

function parseChatCompletionBody(value: unknown):
  | { ok: true; body: ChatCompletionBody }
  | { ok: false } {
  if (!isRecord(value)) return { ok: false };

  const model = typeof value.model === "string" ? value.model.trim() : "";
  const stream = value.stream === undefined ? false : value.stream;
  const maxTokens = value.max_tokens;
  const normalizedMaxTokens = typeof maxTokens === "number" ? maxTokens : undefined;

  if (!model) return { ok: false };
  if (!Array.isArray(value.messages) || value.messages.length === 0) return { ok: false };
  if (!value.messages.every(isValidMessageShape)) return { ok: false };
  if (typeof stream !== "boolean") return { ok: false };
  if (maxTokens !== undefined && typeof maxTokens !== "number") return { ok: false };
  if (normalizedMaxTokens !== undefined && (!Number.isInteger(normalizedMaxTokens) || normalizedMaxTokens < 1 || normalizedMaxTokens > 4096)) {
    return { ok: false };
  }

  return {
    ok: true,
    body: {
      model,
      messages: value.messages,
      stream,
      maxTokens: normalizedMaxTokens
    }
  };
}

function isValidMessageShape(value: unknown) {
  return isRecord(value) && typeof value.role === "string" && value.role.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getCandidateModel(value: unknown) {
  if (!isRecord(value) || typeof value.model !== "string") return null;
  return value.model.trim().slice(0, 128) || null;
}

async function writeChatUsageLog(
  context: GatewayRequestContext,
  apiKey: AuthenticatedGatewayKey,
  input: {
    statusCode: number;
    model: string | null;
    isStream: boolean;
    inputTokens?: number;
    outputTokens?: number;
    errorCode?: GatewayErrorCode;
    errorMessage?: string;
  }
) {
  await createUsageLog({
    requestId: context.requestId,
    userId: apiKey.userId,
    developerProfileId: apiKey.developerProfileId,
    apiKeyId: apiKey.apiKeyId,
    keyPrefix: apiKey.keyPrefix,
    method: "POST",
    path: chatCompletionsPath,
    model: input.model,
    publicModelName: input.model,
    upstreamProvider: input.statusCode === 200 ? "mock" : null,
    statusCode: input.statusCode,
    inputTokens: input.inputTokens ?? 0,
    outputTokens: input.outputTokens ?? 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    costUsd: "0",
    chargedUsd: "0",
    billingStatus: "not_billable",
    isStream: input.isStream,
    errorCode: input.errorCode,
    errorMessage: input.errorMessage,
    routeId: input.statusCode === 200 ? "mock:mvp-chat-completions" : null
  });
}
