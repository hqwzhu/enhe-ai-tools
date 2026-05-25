import type { Locale } from "@/lib/i18n";

export function getAdminDictionary(locale: Locale) {
  return adminDictionaries[locale];
}

export const adminDictionaries = {
  zh: {
    layout: {
      title: "后台管理"
    },
    nav: {
      dashboard: "数据看板",
      messages: "消息中心",
      development: "开发进度",
      releases: "产品版本",
      users: "用户管理",
      plans: "会员套餐",
      orders: "订单管理",
      payments: "支付审核",
      refunds: "售后/退款",
      software: "电脑软件工具",
      onlineTools: "在线网页工具",
      categories: "工具分类",
      tags: "标签管理",
      tutorials: "教程管理",
      faqs: "FAQ 管理",
      changelogs: "工具版本",
      comments: "评论管理",
      files: "文件管理",
      audit: "操作审计",
      settings: "网站设置"
    },
    dashboard: {
      title: "数据看板",
      intro: "集中查看收入、待审核事项、工具库存、用户增长、热门工具、退款率和订单转化率。",
      stats: {
        paidRevenue: "实收金额",
        todayRevenue: "今日收入",
        paymentReviews: "待审核付款",
        refundReviews: "待处理退款",
        users: "用户数",
        newUsers7d: "7 天新增用户",
        orderConversion: "订单转化率",
        refundRate: "退款率",
        tools: "工具数",
        publishedTools: "已发布工具",
        activeVips: "有效 VIP",
        vipExpiring7d: "7 天内到期 VIP"
      },
      trendTitle: "7 天收入趋势",
      trendNote: "仅统计已支付和已开通订单",
      remindersTitle: "运营提醒",
      toolMix: "工具结构：{software} 个电脑软件工具，{online} 个在线网页工具。文件上传、COS 异常和售后事项可在文件管理、消息中心和售后/退款中集中处理。",
      popularTools: "热门工具",
      popularToolsNote: "按下载次数和在线使用次数综合排序",
      popularToolStats: "下载 {downloads} / 使用 {usage} / 热度 {score}",
      noPublishedTools: "暂无已发布工具数据。"
    }
  },
  en: {
    layout: {
      title: "Admin"
    },
    nav: {
      dashboard: "Dashboard",
      messages: "Messages",
      development: "Development",
      releases: "Product releases",
      users: "Users",
      plans: "VIP plans",
      orders: "Orders",
      payments: "Payment review",
      refunds: "Refund review",
      software: "Software tools",
      onlineTools: "Online tools",
      categories: "Categories",
      tags: "Tags",
      tutorials: "Tutorials",
      faqs: "FAQ",
      changelogs: "Tool versions",
      comments: "Comments",
      files: "Files",
      audit: "Audit logs",
      settings: "Site settings"
    },
    dashboard: {
      title: "Admin dashboard",
      intro: "Track revenue, pending reviews, tool inventory, user growth, popular tools, refund rate, and order conversion in one place.",
      stats: {
        paidRevenue: "Paid revenue",
        todayRevenue: "Today revenue",
        paymentReviews: "Payment reviews",
        refundReviews: "Refund reviews",
        users: "Users",
        newUsers7d: "7-day new users",
        orderConversion: "Order conversion",
        refundRate: "Refund rate",
        tools: "Tools",
        publishedTools: "Published tools",
        activeVips: "Active VIPs",
        vipExpiring7d: "VIP expiring in 7 days"
      },
      trendTitle: "7-day revenue trend",
      trendNote: "Paid and activated orders only",
      remindersTitle: "Operations reminders",
      toolMix: "Tool mix: {software} software tools and {online} online tools. File uploads, COS issues, and after-sales tasks are handled from Files, Messages, and Refund review.",
      popularTools: "Popular tools",
      popularToolsNote: "Ranked by downloads plus online usage",
      popularToolStats: "Downloads {downloads} / Usage {usage} / Score {score}",
      noPublishedTools: "No published tool data yet."
    }
  }
} as const;
