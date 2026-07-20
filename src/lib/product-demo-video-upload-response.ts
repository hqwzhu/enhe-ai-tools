type ProductDemoVideoUploadResponse =
  | {
      ok: true;
      videoUrl: string;
      message?: string;
    }
  | {
      ok: false;
      message: string;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function parseProductDemoVideoUploadResponse(
  responseText: string,
  status: number,
): ProductDemoVideoUploadResponse {
  const fallbackMessage = `视频上传失败：服务器返回 ${status}`;
  let payload: unknown = {};

  try {
    payload = responseText ? JSON.parse(responseText) : {};
  } catch {
    payload = {};
  }

  if (!isRecord(payload)) {
    return { ok: false, message: fallbackMessage };
  }

  const videoUrl = getString(payload.videoUrl);
  const message = getString(payload.message);

  if (status >= 200 && status < 300 && videoUrl) {
    return {
      ok: true,
      videoUrl,
      ...(message ? { message } : {}),
    };
  }

  return {
    ok: false,
    message: message ? `视频上传失败：${message}` : fallbackMessage,
  };
}
