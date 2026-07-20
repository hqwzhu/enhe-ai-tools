import { afterEach, describe, expect, it } from "vitest";
import {
  clearCustomerSupportRateLimit,
  consumeCustomerSupportRateLimit
} from "@/lib/customer-support-rate-limit";

afterEach(() => clearCustomerSupportRateLimit());

describe("customer support rate limit", () => {
  it("allows three submissions and rejects the fourth within one hour", () => {
    expect(consumeCustomerSupportRateLimit("ip-1", 1_000)).toBe(true);
    expect(consumeCustomerSupportRateLimit("ip-1", 2_000)).toBe(true);
    expect(consumeCustomerSupportRateLimit("ip-1", 3_000)).toBe(true);
    expect(consumeCustomerSupportRateLimit("ip-1", 4_000)).toBe(false);
  });

  it("allows a submission after the oldest attempt leaves the one-hour window", () => {
    consumeCustomerSupportRateLimit("ip-1", 1_000);
    consumeCustomerSupportRateLimit("ip-1", 2_000);
    consumeCustomerSupportRateLimit("ip-1", 3_000);

    expect(consumeCustomerSupportRateLimit("ip-1", 3_601_001)).toBe(true);
  });

  it("tracks different keys separately", () => {
    consumeCustomerSupportRateLimit("ip-1", 1_000);
    consumeCustomerSupportRateLimit("ip-1", 2_000);
    consumeCustomerSupportRateLimit("ip-1", 3_000);

    expect(consumeCustomerSupportRateLimit("ip-2", 4_000)).toBe(true);
  });
});
