import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const { consumeRateLimitMock, getConfigMock, sendMailMock } = vi.hoisted(() => ({
  consumeRateLimitMock: vi.fn(() => true),
  getConfigMock: vi.fn(),
  sendMailMock: vi.fn()
}));

vi.mock("@/lib/admin-email-notifications", () => ({
  getAdminAlertEmailConfig: (...args: unknown[]) => getConfigMock(...args),
  sendCustomerSupportAdminEmail: (...args: unknown[]) => sendMailMock(...args)
}));

vi.mock("@/lib/customer-support-rate-limit", () => ({
  consumeCustomerSupportRateLimit: (...args: unknown[]) => consumeRateLimitMock(...args)
}));

beforeEach(() => {
  vi.clearAllMocks();
  consumeRateLimitMock.mockReturnValue(true);
  getConfigMock.mockReturnValue({
    enabled: true,
    recipients: ["admin@example.com"],
    host: "smtp.example.com",
    port: 587,
    secure: false,
    from: "ENHE AI <admin@example.com>"
  });
  sendMailMock.mockResolvedValue(undefined);
});

function createSupportRequest(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("https://www.enhe-tech.com.cn/api/support", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://www.enhe-tech.com.cn",
      "x-forwarded-for": "203.0.113.10",
      ...headers
    },
    body: JSON.stringify(body)
  });
}

async function readJson(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

describe("POST /api/support", () => {
  it("returns 415 for a non-JSON request", async () => {
    const response = await POST(
      new NextRequest("https://www.enhe-tech.com.cn/api/support", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: "message"
      })
    );

    expect(response.status).toBe(415);
    expect(await readJson(response)).toEqual({ ok: false, code: "UNSUPPORTED_MEDIA_TYPE" });
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it("returns 400 for an empty message and does not send mail", async () => {
    const response = await POST(createSupportRequest({ message: "", locale: "zh" }));

    expect(response.status).toBe(400);
    expect(await readJson(response)).toEqual({ ok: false, code: "INVALID_REQUEST" });
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it("returns 400 for a non-empty honeypot field", async () => {
    const response = await POST(
      createSupportRequest({ message: "问题", locale: "zh", website: "bot" })
    );

    expect(response.status).toBe(400);
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid email", async () => {
    const response = await POST(
      createSupportRequest({ message: "问题", email: "bad-email", locale: "zh" })
    );

    expect(response.status).toBe(400);
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it("rejects an explicit foreign Origin", async () => {
    const response = await POST(
      createSupportRequest(
        { message: "问题", locale: "zh" },
        { Origin: "https://attacker.example" }
      )
    );

    expect(response.status).toBe(403);
    expect(await readJson(response)).toEqual({ ok: false, code: "CROSS_SITE_REQUEST" });
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it("returns 429 when the visitor exceeds the rate limit", async () => {
    consumeRateLimitMock.mockReturnValueOnce(false);
    const response = await POST(createSupportRequest({ message: "问题", locale: "zh" }));

    expect(response.status).toBe(429);
    expect(await readJson(response)).toEqual({ ok: false, code: "RATE_LIMITED" });
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it("returns 503 when SMTP configuration is unavailable", async () => {
    getConfigMock.mockReturnValueOnce({
      enabled: false,
      recipients: [],
      secure: false,
      skipReason: "missing SMTP config"
    });
    const response = await POST(createSupportRequest({ message: "问题", locale: "zh" }));

    expect(response.status).toBe(503);
    expect(await readJson(response)).toEqual({ ok: false, code: "EMAIL_UNAVAILABLE" });
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it("sends a valid message without exposing admin recipients", async () => {
    const response = await POST(
      createSupportRequest({
        message: "请问如何购买？",
        email: "visitor@example.com",
        locale: "zh",
        pagePath: "/pricing"
      })
    );

    expect(response.status).toBe(200);
    const payload = await readJson(response);
    expect(payload).toEqual({ ok: true });
    expect(JSON.stringify(payload)).not.toContain("admin@example.com");
    expect(sendMailMock).toHaveBeenCalledWith({
      message: "请问如何购买？",
      email: "visitor@example.com",
      locale: "zh",
      pagePath: "/pricing"
    });
    expect(consumeRateLimitMock).toHaveBeenCalledWith("203.0.113.10");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("returns 503 when the mail transporter throws", async () => {
    sendMailMock.mockRejectedValueOnce(new Error("SMTP unavailable"));
    const response = await POST(createSupportRequest({ message: "问题", locale: "zh" }));

    expect(response.status).toBe(503);
    expect(await readJson(response)).toEqual({ ok: false, code: "EMAIL_UNAVAILABLE" });
  });
});
