export function resolveRedirectUrl(target: string, requestUrl: string) {
  return new URL(target, requestUrl);
}
