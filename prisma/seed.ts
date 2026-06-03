import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const superAdminPasswordHash = "$2b$12$6jnlkUOUu8t5PBAOwHQNQOZ5ofJoHdgG6jv4NtEQjnE9Ik2NwC2L6";

async function main() {
  const adminPassword = await bcrypt.hash("EnheAdmin123!", 12);
  const userPassword = await bcrypt.hash("EnheUser123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@enhe.ai" },
    update: {},
    create: {
      email: "admin@enhe.ai",
      passwordHash: adminPassword,
      nickname: "恩禾管理员",
      role: "admin"
    }
  });

  await prisma.user.upsert({
    where: { email: "Sadmin" },
    update: {
      passwordHash: superAdminPasswordHash,
      nickname: "Sadmin",
      role: "admin",
      status: "active"
    },
    create: {
      email: "Sadmin",
      passwordHash: superAdminPasswordHash,
      nickname: "Sadmin",
      role: "admin",
      status: "active"
    }
  });

  await prisma.user.upsert({
    where: { email: "user@enhe.ai" },
    update: {},
    create: {
      email: "user@enhe.ai",
      passwordHash: userPassword,
      nickname: "演示用户"
    }
  });

  const plans = [
    ["7天VIP", 7, "19.00", "29.00", false, 10],
    ["1个月VIP", 30, "49.00", "69.00", false, 20],
    ["6个月VIP", 180, "199.00", "299.00", true, 30],
    ["12个月VIP", 365, "299.00", "499.00", false, 40],
    ["永久VIP", 0, "699.00", "999.00", false, 50]
  ] as const;

  for (const [name, durationDays, price, originalPrice, isRecommended, sortOrder] of plans) {
    await prisma.vipPlan.upsert({
      where: { id: name },
      update: {},
      create: {
        id: name,
        name,
        durationDays,
        price,
        originalPrice,
        isRecommended,
        sortOrder,
        description: "开通后可下载会员本地应用并使用云端工具。"
      }
    });
  }

  const softwareCategoryData = {
    name: "自动化软件",
    type: "software" as const,
    description: "批量处理、桌面自动化、效率增强工具。",
    sortOrder: 10
  };
  const existingSoftwareCategory = await prisma.toolCategory.findFirst({
    where: { name: softwareCategoryData.name, type: softwareCategoryData.type }
  });
  const softwareCategory = existingSoftwareCategory
    ? await prisma.toolCategory.update({ where: { id: existingSoftwareCategory.id }, data: softwareCategoryData })
    : await prisma.toolCategory.create({ data: softwareCategoryData });

  const onlineCategoryData = {
    name: "在线处理",
    type: "online" as const,
    description: "浏览器内即可使用的轻量网页工具。",
    sortOrder: 10
  };
  const existingOnlineCategory = await prisma.toolCategory.findFirst({
    where: { name: onlineCategoryData.name, type: onlineCategoryData.type }
  });
  const onlineCategory = existingOnlineCategory
    ? await prisma.toolCategory.update({ where: { id: existingOnlineCategory.id }, data: onlineCategoryData })
    : await prisma.toolCategory.create({ data: onlineCategoryData });

  const softwareToolData = {
    name: "ENHE 批量文件重命名助手",
    slug: "enhe-batch-renamer",
    type: "software" as const,
    categoryId: softwareCategory.id,
    shortDescription: "一键批量重命名文件，支持规则模板与预览。",
    content: "面向资料整理、素材归档、项目交付场景的 Windows 桌面工具。",
    coverImage: "/images/tool-software.svg",
    screenshots: ["/images/tool-software.svg"],
    version: "1.0.0",
    systemRequirement: "Windows 10/11",
    isVipRequired: true,
    isDownloadPaid: true,
    downloadPrice: "29.00",
    status: "published" as const,
    sortOrder: 10
  };
  await prisma.tool.upsert({
    where: { slug: softwareToolData.slug },
    update: softwareToolData,
    create: {
      ...softwareToolData,
      tutorials: {
        create: {
          title: "三步完成批量重命名",
          content: "选择目录，配置命名规则，预览无误后执行。",
          sortOrder: 10
        }
      }
    }
  });

  const onlineToolData = {
    name: "ENHE 文案清洗在线工具",
    slug: "enhe-copy-cleaner",
    type: "online" as const,
    categoryId: onlineCategory.id,
    shortDescription: "清理多余空格、换行和特殊符号，适合内容整理。",
    content: "把杂乱文本整理为适合发布、归档或二次处理的标准格式。",
    coverImage: "/images/tool-online.svg",
    screenshots: ["/images/tool-online.svg"],
    onlineUrl: "https://example.com/tools/copy-cleaner",
    isVipRequired: true,
    status: "published" as const,
    sortOrder: 20
  };
  await prisma.tool.upsert({
    where: { slug: onlineToolData.slug },
    update: onlineToolData,
    create: {
      ...onlineToolData,
      tutorials: {
        create: {
          title: "快速清洗文本",
          content: "粘贴文本，选择清洗规则，点击处理并复制结果。",
          sortOrder: 10
        }
      }
    }
  });

  const defaults = [
    ["site_name", "恩禾 ENHE AI", "网站名称"],
    ["site_logo", "/images/enhe-logo.svg", "Logo 图片地址"],
    ["home_hero_title", "ENHE AI Tools", "首页主标题"],
    ["home_hero_subtitle", "驾驭 AI 智能，重塑你的人生", "首页副标题"],
    ["home_hero_intro", "用本地应用和云端工具放大你的行动力，把重复工作交给 AI 自动化，把时间留给成长、创造和更好的自己。", "首页介绍文案"],
    ["home_hero_subtitle_en", "Master AI intelligence and reshape your life", "首页英文副标题"],
    ["home_hero_intro_en", "Use desktop apps and web tools to amplify your execution, hand repetitive work to AI automation, and reclaim time for growth and creation.", "首页英文介绍文案"],
    ["footer_copyright", "© 2026 ENHE AI Tools HQW.", "页脚版权"],
    ["alipay_qr", "/images/payment/alipay-qr.jpg", "支付宝个人收款码"],
    ["wechat_qr", "/images/payment/wechat-qr.jpg", "微信个人收款码"],
    ["user_agreement", "注册即表示你同意遵守平台使用规则。", "用户协议"],
    ["privacy_policy", "我们仅收集提供服务所需的必要信息。", "隐私政策"],
    ["refund_policy", "虚拟会员服务开通后原则上不支持退款，特殊情况请联系管理员。", "退款规则"]
  ] as const;

  for (const [key, value, description] of defaults) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description }
    });
  }

  const v1 = await prisma.developmentVersion.upsert({
    where: { version: "V1.0" },
    update: {
      name: "商业闭环版",
      description: "围绕注册登录、VIP、订单支付、工具权限、文件上传、后台审核和部署配置的第一版可运营能力。",
      status: "active",
      sortOrder: 100
    },
    create: {
      version: "V1.0",
      name: "商业闭环版",
      description: "围绕注册登录、VIP、订单支付、工具权限、文件上传、后台审核和部署配置的第一版可运营能力。",
      status: "active",
      sortOrder: 100,
      startedAt: new Date("2026-05-18T00:00:00")
    }
  });

  const progressItems = [
    ["基础页面", "首页与工具入口", "completed", "medium", "src/app/page.tsx, src/app/software/page.tsx, src/app/online-tools/page.tsx", "首页、本地应用、云端工具入口已具备。", 10],
    ["用户与权限", "注册登录与用户中心", "completed", "high", "src/app/(auth), src/app/user/page.tsx, src/lib/auth.ts", "已支持注册、登录、退出、用户中心和会话安全。", 20],
    ["用户与权限", "管理员后台权限", "completed", "high", "src/app/admin/layout.tsx, src/lib/auth.ts", "普通用户不能进入后台，管理员可访问后台菜单。", 30],
    ["工具系统", "工具分类后台自定义", "completed", "high", "src/app/admin/categories/page.tsx", "本地应用与云端工具分类由后台维护。", 40],
    ["工具系统", "本地应用管理", "completed", "high", "src/app/admin/software/page.tsx, src/app/admin/software/[id]/page.tsx", "已支持清单、详情编辑、封面上传、下载文件绑定和上架检查。", 50],
    ["工具系统", "云端工具管理", "completed", "high", "src/app/admin/online-tools/page.tsx, src/app/admin/online-tools/[id]/page.tsx", "已支持在线地址、权限和上架管理。", 60],
    ["工具系统", "工具详情页与教程", "completed", "high", "src/app/tools/[slug]/page.tsx, src/app/admin/tutorials/page.tsx", "详情页已展示教程、截图、评论和相关推荐；教程支持注意事项与常见错误。", 70],
    ["VIP 与订单", "会员套餐管理", "completed", "high", "src/app/admin/plans/page.tsx, src/app/pricing/page.tsx", "后台可维护套餐，前台可创建会员订单。", 80],
    ["VIP 与订单", "订单创建与取消", "completed", "high", "src/app/actions.ts, src/app/user/page.tsx", "用户可创建订单，并可取消允许取消状态的订单。", 90],
    ["VIP 与订单", "个人收款码支付页", "completed", "high", "src/app/orders/[id]/pay/page.tsx, public/images/payment", "支付页已展示支付宝和微信收款码，并提示备注订单号。", 100],
    ["VIP 与订单", "付款截图上传与预览", "completed", "high", "src/app/api/uploads/payment-proof/route.ts, src/app/orders/[id]/page.tsx", "上传后进入订单详情并展示付款凭证预览。", 110],
    ["VIP 与订单", "后台支付审核自动开通权益", "completed", "high", "src/app/actions.ts, src/lib/membership.ts", "审核通过统一调用 membership 服务，VIP 与软件购买权益分流处理。", 120],
    ["权限控制", "VIP 软件下载权限", "completed", "high", "src/app/api/tools/[id]/download/route.ts, src/lib/access.ts", "下载权限在服务端校验。", 130],
    ["权限控制", "在线工具使用权限", "completed", "high", "src/app/api/tools/[id]/use/route.ts, src/lib/access.ts", "在线工具入口在服务端校验权限并记录使用日志。", 140],
    ["内容互动", "用户评论与后台审核", "completed", "medium", "src/app/tools/[slug]/page.tsx, src/app/admin/comments/page.tsx", "评论需后台审核，支持置顶和删除。", 150],
    ["文件与存储", "文件上传与 COS 闭环", "completed", "high", "src/lib/storage.ts, src/app/admin/files/page.tsx", "已支持本地上传、COS 环境变量自动切换、配置体检、远程对象删除和失败提示。", 160],
    ["售后与通知", "退款/售后记录", "completed", "medium", "src/app/orders/[id]/page.tsx, src/app/admin/orders/page.tsx", "用户可申请售后/退款，后台可处理并记录。", 170],
    ["售后与通知", "站内通知", "completed", "medium", "src/app/user/page.tsx, src/lib/notifications.ts", "支付审核、退款处理、VIP 调整已通知用户。", 180],
    ["部署运维", "Docker 与腾讯云部署配置", "completed", "high", "Dockerfile, deploy.sh, deploy/enhe-ai-tools", "已拆分独立部署文件，避免影响旧项目端口。", 190],
    ["安全与质量", "关键流程测试", "partial", "medium", "src/lib/*.test.ts, tests/e2e/commercial-flow.spec.ts", "核心单元测试和商业闭环 E2E 已存在；后续可补更多管理端浏览器回归。", 200],
    ["运营后台", "管理员消息中心", "completed", "medium", "src/app/admin/messages/page.tsx", "已集中展示待审核付款、退款申请、上传异常和 VIP 到期提醒。", 210],
    ["运营后台", "产品发布版本管理", "completed", "medium", "src/app/admin/releases/page.tsx", "已打通开发版本、产品版本、工具版本三层记录。", 220]
  ] as const;

  await prisma.developmentItem.deleteMany({
    where: {
      versionId: v1.id,
      name: { in: ["文件上传与 COS 预留", "后台消息中心与更细审计筛选"] }
    }
  });

  for (const [module, name, status, priority, relatedFiles, notes, sortOrder] of progressItems) {
    await prisma.developmentItem.upsert({
      where: { versionId_name: { versionId: v1.id, name } },
      update: { module, status, priority, relatedFiles, notes, sortOrder },
      create: {
        versionId: v1.id,
        module,
        name,
        status,
        priority,
        relatedFiles,
        notes,
        sortOrder
      }
    });
  }

  await prisma.productRelease.upsert({
    where: { version: "V1.0" },
    update: {
      name: "商业闭环版",
      description: "面向注册登录、VIP 会员、订单支付、人工审核、权限控制、文件上传和后台运营的第一版产品记录。",
      status: "active",
      developmentVersionId: v1.id,
      sortOrder: 100
    },
    create: {
      version: "V1.0",
      name: "商业闭环版",
      description: "面向注册登录、VIP 会员、订单支付、人工审核、权限控制、文件上传和后台运营的第一版产品记录。",
      status: "active",
      developmentVersionId: v1.id,
      sortOrder: 100
    }
  });

  console.log(`Seed completed. Admin accounts: ${admin.email}, Sadmin`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
