import { cookies } from "next/headers";

export const localeCookieName = "enhe_locale";
export const supportedLocales = ["zh", "en"] as const;
export type Locale = (typeof supportedLocales)[number];

export function normalizeLocale(value: unknown): Locale {
  return value === "en" || value === "zh" ? value : "zh";
}

export async function getCurrentLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(localeCookieName)?.value);
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export const dictionaries = {
  zh: {
    brand: "恩禾 ENHE AI",
    nav: {
      home: "首页",
      software: "电脑软件工具",
      onlineTools: "在线网页工具",
      pricing: "会员价格",
      tutorials: "使用教程",
      user: "用户中心",
      admin: "后台管理",
      login: "登录",
      register: "注册",
      userFallback: "用户"
    },
    language: {
      label: "语言",
      zh: "中文",
      en: "EN"
    },
    home: {
      eyebrow: "自研电脑软件与在线网页工具分享共研平台",
      title: "ENHE AI Tools",
      intro: "下载实用软件，使用在线工具，把重复工作交给自动化，把复杂流程变成一个按钮。",
      softwareButton: "本地软件",
      onlineButton: "在线工具",
      featuredSoftwareEyebrow: "Featured Software",
      featuredSoftwareTitle: "精选电脑软件工具",
      featuredSoftwareIntro: "面向高频桌面任务的软件工具，VIP 权限和付费下载可独立控制。",
      onlineToolsEyebrow: "Online Tools",
      onlineToolsTitle: "精选在线网页工具",
      onlineToolsIntro: "无需安装，浏览器打开即可处理文本、文件和流程类任务。"
    },
    toolCard: {
      uncategorized: "未分类",
      free: "免费",
      paidDownload: "下载"
    },
    listing: {
      softwareTitle: "电脑软件工具",
      softwareIntro: "下载桌面端效率软件，子分类由后台自定义维护。",
      onlineTitle: "在线网页工具",
      onlineIntro: "浏览器内使用的在线工具，使用入口会经过服务端 VIP 权限校验。",
      searchPlaceholder: "搜索关键词",
      allCategories: "全部分类",
      allAccess: "全部权限",
      latest: "最新",
      hot: "热门",
      filter: "筛选",
      emptyTitle: "暂无工具",
      emptyText: "请调整筛选条件或在后台发布工具。"
    },
    pricing: {
      title: "会员价格",
      intro: "会员用于访问 VIP 工具；电脑软件若标记为付费下载，VIP 用户也需要单独购买下载权限。",
      recommended: "推荐",
      alipay: "支付宝",
      wechat: "微信",
      createOrder: "创建订单"
    },
    tutorials: {
      title: "使用教程",
      intro: "按工具独立管理的教程内容，支持图片、视频链接、步骤排序和常见错误说明扩展。"
    },
    auth: {
      loginTitle: "登录",
      loginIntro: "登录后可创建订单、评论工具并查看会员状态。",
      registerTitle: "注册",
      registerIntro: "免费注册后可浏览工具、提交评论和上传付款截图。",
      email: "邮箱",
      password: "密码",
      loginButton: "登录",
      createAccount: "创建账号",
      noAccount: "还没有账号？",
      hasAccount: "已有账号？",
      registerNow: "立即注册",
      goLogin: "去登录"
    },
    footer: {
      siteName: "恩禾 ENHE AI工具站",
      copyright: "© 2026 ENHE AI Tools HQW.",
      legal: {
        "user-agreement": "用户协议",
        "privacy-policy": "隐私政策",
        disclaimer: "免责声明",
        "membership-refund": "会员服务与退款规则",
        "copyright-complaint": "版权投诉指引",
        "minor-protection": "未成年人保护规则"
      }
    }
  },
  en: {
    brand: "ENHE AI",
    nav: {
      home: "Home",
      software: "Local Software",
      onlineTools: "Online Tools",
      pricing: "Pricing",
      tutorials: "Tutorials",
      user: "Account",
      admin: "Admin",
      login: "Log in",
      register: "Sign up",
      userFallback: "User"
    },
    language: {
      label: "Language",
      zh: "中文",
      en: "EN"
    },
    home: {
      eyebrow: "A co-creation platform for desktop software and online tools",
      title: "ENHE AI Tools",
      intro: "Download practical software, use browser-based tools, and turn repetitive work into automated one-click workflows.",
      softwareButton: "Local Software",
      onlineButton: "Online Tools",
      featuredSoftwareEyebrow: "Featured Software",
      featuredSoftwareTitle: "Desktop Software Tools",
      featuredSoftwareIntro: "Tools for frequent desktop workflows, with independent VIP access and paid-download controls.",
      onlineToolsEyebrow: "Online Tools",
      onlineToolsTitle: "Browser-Based Tools",
      onlineToolsIntro: "No installation required. Open your browser to process text, files, and workflow tasks."
    },
    toolCard: {
      uncategorized: "Uncategorized",
      free: "Free",
      paidDownload: "Download"
    },
    listing: {
      softwareTitle: "Local Software Tools",
      softwareIntro: "Download desktop productivity tools. Subcategories are managed from the admin panel.",
      onlineTitle: "Online Web Tools",
      onlineIntro: "Browser-based tools with server-side VIP permission checks for each launch.",
      searchPlaceholder: "Search keywords",
      allCategories: "All categories",
      allAccess: "All access",
      latest: "Latest",
      hot: "Popular",
      filter: "Filter",
      emptyTitle: "No tools yet",
      emptyText: "Adjust the filters or publish tools from the admin panel."
    },
    pricing: {
      title: "Membership Pricing",
      intro: "Membership unlocks VIP tools. Paid desktop downloads still require a separate purchase even for VIP users.",
      recommended: "Recommended",
      alipay: "Alipay",
      wechat: "WeChat",
      createOrder: "Create order"
    },
    tutorials: {
      title: "Tutorials",
      intro: "Tutorials are managed per tool, with support for images, video links, ordered steps, and common-error notes."
    },
    auth: {
      loginTitle: "Log in",
      loginIntro: "Log in to create orders, comment on tools, and view your membership status.",
      registerTitle: "Sign up",
      registerIntro: "Create a free account to browse tools, submit comments, and upload payment screenshots.",
      email: "Email",
      password: "Password",
      loginButton: "Log in",
      createAccount: "Create account",
      noAccount: "No account yet?",
      hasAccount: "Already have an account?",
      registerNow: "Sign up now",
      goLogin: "Log in"
    },
    footer: {
      siteName: "ENHE AI Tools",
      copyright: "© 2026 ENHE AI Tools HQW.",
      legal: {
        "user-agreement": "User Agreement",
        "privacy-policy": "Privacy Policy",
        disclaimer: "Disclaimer",
        "membership-refund": "Membership & Refund Rules",
        "copyright-complaint": "Copyright Complaints",
        "minor-protection": "Minor Protection Rules"
      }
    }
  }
} as const;
