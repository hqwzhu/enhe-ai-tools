import { randomUUID } from "node:crypto";
import type { FastifyReply } from "fastify";

export type GatewayErrorCode = "invalid_api_key" | "developer_suspended" | "internal_error";

export type GatewayRequestContext = {
  requestId: string;
};

const docsUrl = "https://www.enhe-tech.com.cn/ai-api/docs";

const messages: Record<GatewayErrorCode, string> = {
  invalid_api_key: "Invalid API key.",
  developer_suspended: "Developer account is not active.",
  internal_error: "Internal gateway error."
};

export function createGatewayRequestContext(): GatewayRequestContext {
  return { requestId: randomUUID() };
}

export function sendGatewayError(reply: FastifyReply, statusCode: number, code: GatewayErrorCode, context: GatewayRequestContext) {
  reply.header("x-request-id", context.requestId);
  return reply.code(statusCode).send({
    error: {
      code,
      message: messages[code],
      request_id: context.requestId,
      docs_url: docsUrl
    }
  });
}
