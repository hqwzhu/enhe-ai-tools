import { describe, expect, it } from "vitest";
import { getPricingOfferItems } from "@/lib/pricing-offers";

describe("pricing offers", () => {
  it("uses product-level public pricing entries instead of category-only offers", () => {
    const zhOffers = getPricingOfferItems("zh");

    expect(zhOffers.length).toBeGreaterThanOrEqual(8);
    expect(zhOffers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "windows-ai",
          path: "/software/windows-ai",
          price: 50,
        }),
        expect.objectContaining({
          slug: "local-ai-voice-generator-for-voiceover-materials",
          path: "/software/local-ai-voice-generator-for-voiceover-materials",
          price: 30,
        }),
        expect.objectContaining({
          slug: "gmail-google",
          path: "/account-services/gmail-google",
          price: 30.8,
        }),
        expect.objectContaining({
          slug: "ai-monetization-side-hustle-course",
          path: "/skill-learning/ai-monetization-side-hustle-course",
          price: 10,
        }),
      ]),
    );
  });

  it("keeps English offer paths under the English route prefix", () => {
    expect(getPricingOfferItems("en").map((item) => item.path)).toContain(
      "/en/software/windows-ai",
    );
  });
});
