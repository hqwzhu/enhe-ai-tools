import { z } from "zod";

export type CustomerSupportLocale = "zh" | "en";

export type CustomerSupportFaq = {
  id: string;
  question: string;
  answer: string;
  links?: Array<{ label: string; href: string }>;
};

const customerSupportFaqs: Record<CustomerSupportLocale, CustomerSupportFaq[]> = {
  zh: [
    {
      id: "about-enhe",
      question: "ENHE AI 是什么？",
      answer:
        "ENHE AI 汇集 AI 软件应用、账号服务、技能学习、教程和前沿资讯，帮助普通用户把 AI 用到真实工作与创作任务中。",
      links: [{ label: "了解 ENHE AI", href: "/about" }]
    },
    {
      id: "choose-product",
      question: "如何找到适合我的产品？",
      answer:
        "可以先按提升工作效率、生成图片/视频/音频、改变未来的 AI 三个方向选择，再进入产品详情查看功能、价格和教程。",
      links: [
        { label: "按需求选择产品", href: "/product-paths/work-efficiency" },
        { label: "浏览全部软件", href: "/software" }
      ]
    },
    {
      id: "pricing-purchase",
      question: "产品价格和购买方式是什么？",
      answer:
        "不同产品、课程和账号服务有各自价格与交付说明。购买前请以对应详情页的当前价格、权益范围和操作流程为准。",
      links: [{ label: "查看价格与购买说明", href: "/pricing" }]
    },
    {
      id: "free-vs-paid",
      question: "免费产品和收费产品有什么区别？",
      answer:
        "标记为免费的产品可按页面说明直接使用或查看；收费产品会在详情页明确显示价格、交付内容和购买步骤。",
      links: [{ label: "浏览产品", href: "/software" }]
    },
    {
      id: "tutorial-access",
      question: "购买后如何查看教程或课程内容？",
      answer:
        "请登录购买时使用的账号，再从对应产品详情页、教程页面或用户中心进入内容。具体开放范围以产品详情说明为准。",
      links: [{ label: "查看使用教程", href: "/tutorials" }]
    },
    {
      id: "account-service",
      question: "AI 账号订购和升级服务是什么？",
      answer:
        "账号订购和升级服务提供相关平台的购买说明、交付边界与使用提示。下单前请先查看对应详情和第三方平台规则。",
      links: [{ label: "查看账号服务", href: "/account-services" }]
    },
    {
      id: "leave-message",
      question: "没有找到答案，提交留言",
      answer: "请填写问题内容；联系邮箱为可选项，填写后我们可以通过邮件回复你。"
    }
  ],
  en: [
    {
      id: "about-enhe",
      question: "What is ENHE AI?",
      answer:
        "ENHE AI brings together AI software, account services, skill learning, tutorials, and news to help people use AI in real work and creative tasks.",
      links: [{ label: "About ENHE AI", href: "/en/about" }]
    },
    {
      id: "choose-product",
      question: "How do I find the right product?",
      answer:
        "Start with productivity, image/video/audio creation, or future AI opportunities, then open the product detail page to review features, pricing, and tutorials.",
      links: [
        { label: "Choose by need", href: "/en/product-paths/work-efficiency" },
        { label: "Browse all software", href: "/en/software" }
      ]
    },
    {
      id: "pricing-purchase",
      question: "What are the prices and purchase methods?",
      answer:
        "Each product, course, and account service has its own price and delivery notes. Check the current price, access scope, and purchase steps on its detail page.",
      links: [{ label: "View pricing and purchase notes", href: "/en/pricing" }]
    },
    {
      id: "free-vs-paid",
      question: "What is the difference between free and paid products?",
      answer:
        "Products marked free can be used or viewed according to their page instructions. Paid products clearly show their price, delivery scope, and purchase steps.",
      links: [{ label: "Browse products", href: "/en/software" }]
    },
    {
      id: "tutorial-access",
      question: "How do I access tutorials or course content after purchase?",
      answer:
        "Sign in with the account used for purchase, then open the matching product detail page, tutorial page, or user center. Access follows the product description.",
      links: [{ label: "View tutorials", href: "/en/tutorials" }]
    },
    {
      id: "account-service",
      question: "What are AI account subscription and upgrade services?",
      answer:
        "These services provide purchase guidance, delivery boundaries, and usage notes for supported platforms. Review the detail page and third-party platform rules before ordering.",
      links: [{ label: "View account services", href: "/en/account-services" }]
    },
    {
      id: "leave-message",
      question: "I could not find an answer. Leave a message",
      answer: "Describe your question below. A contact email is optional and lets us reply by email."
    }
  ]
};

const optionalEmailSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : value),
  z.union([z.literal(""), z.string().email().max(254)]).optional()
);

export const supportMessageSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  email: optionalEmailSchema,
  locale: z.enum(["zh", "en"]),
  pagePath: z.string().trim().max(300).optional(),
  website: z.string().max(100).optional()
});

export function getCustomerSupportFaqs(locale: CustomerSupportLocale) {
  return customerSupportFaqs[locale];
}

export function normalizeSupportMessageInput(input: unknown) {
  const parsed = supportMessageSchema.parse(input);

  return {
    message: parsed.message,
    email: parsed.email || undefined,
    locale: parsed.locale,
    pagePath: normalizeSupportPagePath(parsed.pagePath),
    website: parsed.website ?? ""
  };
}

function normalizeSupportPagePath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\r\n]/.test(value)) {
    return "/";
  }

  return value;
}
