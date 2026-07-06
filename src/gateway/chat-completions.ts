import type { FastifyInstance } from "fastify";
import { checkSufficientCredit } from "@/features/enhe-api/server/wallet";
import { createUsageLog } from "@/features/enhe-api/server/usage-logs";
import { requireGatewayApiKey } from "./auth";
import { createGatewayRequestContext, sendGatewayError, type GatewayErrorCode, type GatewayRequestContext } from "./errors";
import { findGatewayModel } from "./models";
import { callOpenAICompatibleChatCompletion, type OpenAICompatibleForwardBody, type OpenAICompatibleUpstreamResult } from "./upstream-openai";

type ChatCompletionBody = {
  model: string;
  messages: Array<Record<string, unknown>>;
  stream: boolean;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  stop?: string | string[];
};

type AuthenticatedGatewayKey = {
  userId: string;
  developerProfileId: string;
  apiKeyId: string;
  keyPrefix: string;
};

const chatCompletionsPath = "/v1/chat/completions";
const estimatedOpenAICompatibleCostUsd = "0.000001";

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
      estimatedCostUsd: estimatedOpenAICompatibleCostUsd
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

    const upstream = await callOpenAICompatibleChatCompletion({
      publicModelId: model.id,
      body: buildOpenAICompatibleForwardBody(body)
    });

    if (!upstream.ok) {
      const failure = mapUpstreamFailure(upstream);
      await writeChatUsageLog(context, auth.apiKey, {
        statusCode: failure.statusCode,
        model: model.id,
        isStream: false,
        inputTokens: 0,
        outputTokens: 0,
        latencyMs: upstream.latencyMs,
        upstreamProvider: "openai-compatible",
        upstreamModel: upstream.upstreamModel,
        routeId: `openai-compatible:${model.id}`,
        errorCode: failure.errorCode,
        errorMessage: failure.errorMessage
      });
      return sendGatewayError(reply, failure.statusCode, failure.errorCode, context);
    }

    await writeChatUsageLog(context, auth.apiKey, {
      statusCode: 200,
      model: model.id,
      isStream: false,
      inputTokens: upstream.inputTokens,
      outputTokens: upstream.outputTokens,
      latencyMs: upstream.latencyMs,
      upstreamProvider: "openai-compatible",
      upstreamModel: upstream.upstreamModel,
      routeId: `openai-compatible:${model.id}`
    });

    reply.header("x-request-id", context.requestId);
    return upstream.body;
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
  const optionalNumbers = parseOptionalNumberFields(value);
  const stop = parseStop(value.stop);

  if (!model) return { ok: false };
  if (!Array.isArray(value.messages) || value.messages.length === 0) return { ok: false };
  if (!value.messages.every(isValidMessageShape)) return { ok: false };
  if (typeof stream !== "boolean") return { ok: false };
  if (maxTokens !== undefined && typeof maxTokens !== "number") return { ok: false };
  if (!optionalNumbers.ok || !stop.ok) return { ok: false };
  if (normalizedMaxTokens !== undefined && (!Number.isInteger(normalizedMaxTokens) || normalizedMaxTokens < 1 || normalizedMaxTokens > 4096)) {
    return { ok: false };
  }

  return {
    ok: true,
    body: {
      model,
      messages: value.messages,
      stream,
      maxTokens: normalizedMaxTokens,
      temperature: optionalNumbers.values.temperature,
      topP: optionalNumbers.values.topP,
      presencePenalty: optionalNumbers.values.presencePenalty,
      frequencyPenalty: optionalNumbers.values.frequencyPenalty,
      stop: stop.value
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

function parseOptionalNumberFields(value: Record<string, unknown>):
  | {
      ok: true;
      values: Pick<ChatCompletionBody, "temperature" | "topP" | "presencePenalty" | "frequencyPenalty">;
    }
  | { ok: false } {
  const temperature = parseOptionalFiniteNumber(value.temperature);
  const topP = parseOptionalFiniteNumber(value.top_p);
  const presencePenalty = parseOptionalFiniteNumber(value.presence_penalty);
  const frequencyPenalty = parseOptionalFiniteNumber(value.frequency_penalty);

  if (!temperature.ok || !topP.ok || !presencePenalty.ok || !frequencyPenalty.ok) {
    return { ok: false };
  }

  return {
    ok: true,
    values: {
      temperature: temperature.value,
      topP: topP.value,
      presencePenalty: presencePenalty.value,
      frequencyPenalty: frequencyPenalty.value
    }
  };
}

function parseOptionalFiniteNumber(value: unknown):
  | { ok: true; value?: number }
  | { ok: false } {
  if (value === undefined) return { ok: true };
  if (typeof value !== "number" || !Number.isFinite(value)) return { ok: false };
  return { ok: true, value };
}

function parseStop(value: unknown):
  | { ok: true; value?: string | string[] }
  | { ok: false } {
  if (value === undefined) return { ok: true };
  if (typeof value === "string") return { ok: true, value };
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return { ok: true, value };
  }
  return { ok: false };
}

function buildOpenAICompatibleForwardBody(body: ChatCompletionBody): Omit<OpenAICompatibleForwardBody, "model"> {
  const forwardBody: Omit<OpenAICompatibleForwardBody, "model"> = {
    messages: body.messages,
    stream: false
  };

  if (body.maxTokens !== undefined) forwardBody.max_tokens = body.maxTokens;
  if (body.temperature !== undefined) forwardBody.temperature = body.temperature;
  if (body.topP !== undefined) forwardBody.top_p = body.topP;
  if (body.presencePenalty !== undefined) forwardBody.presence_penalty = body.presencePenalty;
  if (body.frequencyPenalty !== undefined) forwardBody.frequency_penalty = body.frequencyPenalty;
  if (body.stop !== undefined) forwardBody.stop = body.stop;

  return forwardBody;
}

function mapUpstreamFailure(upstream: Extract<OpenAICompatibleUpstreamResult, { ok: false }>): {
  statusCode: number;
  errorCode: GatewayErrorCode;
  errorMessage: string;
} {
  if (upstream.reason === "not_configured") {
    return {
      statusCode: 500,
      errorCode: "internal_error",
      errorMessage: "Upstream provider is not configured."
    };
  }

  if (upstream.reason === "timeout") {
    return {
      statusCode: 502,
      errorCode: "upstream_error",
      errorMessage: "Upstream request timed out."
    };
  }

  if (upstream.reason === "invalid_response") {
    return {
      statusCode: 502,
      errorCode: "upstream_error",
      errorMessage: "Upstream response was invalid."
    };
  }

  return {
    statusCode: 502,
    errorCode: "upstream_error",
    errorMessage: "Upstream request failed."
  };
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
    latencyMs?: number | null;
    upstreamProvider?: string | null;
    upstreamModel?: string | null;
    routeId?: string | null;
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
    upstreamProvider: input.upstreamProvider ?? null,
    upstreamModel: input.upstreamModel ?? null,
    statusCode: input.statusCode,
    inputTokens: input.inputTokens ?? 0,
    outputTokens: input.outputTokens ?? 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    costUsd: "0",
    chargedUsd: "0",
    billingStatus: "not_billable",
    latencyMs: input.latencyMs,
    isStream: input.isStream,
    errorCode: input.errorCode,
    errorMessage: input.errorMessage,
    routeId: input.routeId ?? null
  });
}
