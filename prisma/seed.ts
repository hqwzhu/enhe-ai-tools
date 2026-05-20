import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
        description: "开通后可下载会员软件并使用在线网页工具。"
      }
    });
  }

  const softwareCategory = await prisma.toolCategory.create({
    data: {
      name: "自动化软件",
      type: "software",
      description: "批量处理、桌面自动化、效率增强工具。",
      sortOrder: 10
    }
  });

  const onlineCategory = await prisma.toolCategory.create({
    data: {
      name: "在线处理",
      type: "online",
      description: "浏览器内即可使用的轻量网页工具。",
      sortOrder: 10
    }
  });

  await prisma.tool.create({
    data: {
      name: "ENHE 批量文件重命名助手",
      slug: "enhe-batch-renamer",
      type: "software",
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
      status: "published",
      sortOrder: 10,
      tutorials: {
        create: {
          title: "三步完成批量重命名",
          content: "选择目录，配置命名规则，预览无误后执行。",
          sortOrder: 10
        }
      }
    }
  });

  await prisma.tool.create({
    data: {
      name: "ENHE 文案清洗在线工具",
      slug: "enhe-copy-cleaner",
      type: "online",
      categoryId: onlineCategory.id,
      shortDescription: "清理多余空格、换行和特殊符号，适合内容整理。",
      content: "把杂乱文本整理为适合发布、归档或二次处理的标准格式。",
      coverImage: "/images/tool-online.svg",
      screenshots: ["/images/tool-online.svg"],
      onlineUrl: "https://example.com/tools/copy-cleaner",
      isVipRequired: true,
      status: "published",
      sortOrder: 20,
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
    ["site_name", "恩禾 ENHE AI工具站", "网站名称"],
    ["site_logo", "ENHE", "Logo 文本或图片地址"],
    ["home_hero_title", "恩禾 ENHE AI工具站", "首页主标题"],
    ["home_hero_subtitle", "自研电脑软件与在线网页工具会员平台", "首页副标题"],
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

  console.log(`Seed completed. Admin: ${admin.email} / EnheAdmin123!`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
