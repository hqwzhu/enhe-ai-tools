const supportRateLimitWindowMs = 60 * 60 * 1000;
const supportRateLimitMax = 3;
const supportAttempts = new Map<string, number[]>();

export function consumeCustomerSupportRateLimit(key: string, now = Date.now()) {
  const windowStart = now - supportRateLimitWindowMs;
  const recentAttempts = (supportAttempts.get(key) ?? []).filter((timestamp) => timestamp > windowStart);

  if (recentAttempts.length >= supportRateLimitMax) {
    supportAttempts.set(key, recentAttempts);
    return false;
  }

  recentAttempts.push(now);
  supportAttempts.set(key, recentAttempts);
  return true;
}

export function clearCustomerSupportRateLimit() {
  supportAttempts.clear();
}
