export function resolveRedirectUrl(target: string, requestUrl: string) {
  return new URL(target, requestUrl);
}

const loopbackHosts = new Set(["localhost", "127.0.0.1", "::1"]);

function isTrustedFormOrigin(origin: URL, request: URL) {
  if (origin.protocol !== request.protocol) return false;
  if (origin.host === request.host) return true;
  return loopbackHosts.has(origin.hostname) && loopbackHosts.has(request.hostname) && origin.port === request.port;
}

export function resolveFormRedirectUrl(target: string, requestUrl: string, originHeader?: string | null) {
  const request = new URL(requestUrl);
  if (originHeader) {
    try {
      const origin = new URL(originHeader);
      if (isTrustedFormOrigin(origin, request)) {
        return new URL(target, origin);
      }
    } catch {
      // Fall through to the request URL when Origin is absent or malformed.
    }
  }
  return new URL(target, request);
}
