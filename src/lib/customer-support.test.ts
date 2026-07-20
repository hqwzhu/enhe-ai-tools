import { describe, expect, it } from "vitest";
import {
  getCustomerSupportFaqs,
  normalizeSupportMessageInput,
  supportMessageSchema
} from "@/lib/customer-support";

describe("customer support content", () => {
  it("returns seven Chinese FAQs and seven English FAQs", () => {
    expect(getCustomerSupportFaqs("zh")).toHaveLength(7);
    expect(getCustomerSupportFaqs("en")).toHaveLength(7);
    expect(getCustomerSupportFaqs("zh")[0]).toMatchObject({
      id: "about-enhe",
      question: "ENHE AI 是什么？"
    });
    expect(getCustomerSupportFaqs("en")[0]).toMatchObject({
      id: "about-enhe",
      question: "What is ENHE AI?"
    });
  });

  it("provides locale-aware internal links", () => {
    expect(getCustomerSupportFaqs("zh")[1].links).toContainEqual({
      label: "按需求选择产品",
      href: "/product-paths/work-efficiency"
    });
    expect(getCustomerSupportFaqs("en")[1].links).toContainEqual({
      label: "Choose by need",
      href: "/en/product-paths/work-efficiency"
    });
  });

  it("requires a message and allows an empty optional email", () => {
    expect(
      supportMessageSchema.safeParse({
        message: "  请问如何购买？  ",
        email: "",
        locale: "zh"
      }).success
    ).toBe(true);
    expect(supportMessageSchema.safeParse({ message: "", email: "", locale: "zh" }).success).toBe(false);
    expect(supportMessageSchema.safeParse({ message: "问题", email: "bad-email", locale: "zh" }).success).toBe(false);
  });

  it("rejects oversized messages and invalid locales", () => {
    expect(supportMessageSchema.safeParse({ message: "a".repeat(2001), locale: "zh" }).success).toBe(false);
    expect(supportMessageSchema.safeParse({ message: "Question", locale: "fr" }).success).toBe(false);
  });

  it("normalizes whitespace, optional email, and the page path", () => {
    expect(
      normalizeSupportMessageInput({
        message: "  问题  ",
        email: "",
        locale: "zh",
        pagePath: "https://attacker.example/path"
      })
    ).toEqual({
      message: "问题",
      email: undefined,
      locale: "zh",
      pagePath: "/",
      website: ""
    });
  });
});
