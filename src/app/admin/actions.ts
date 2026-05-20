"use server";

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  parseBooleanField,
  parseNumberField,
  parseOptionalString,
  parseScreenshotsField,
  buildPublicUploadUrl,
  slugify
} from "@/lib/admin-form";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { getOrderTimestampPatch } from "@/lib/admin-order";
import { manuallyAdjustVip } from "@/lib/membership";
import { isLikelyUploadableImage } from "@/lib/media";
import { assertAdminOrderStatusUpdateAllowed, canAdminDeleteOrderSafely, isAdminDeleteRiskConfirmed } from "@/lib/order-rules";
import { parseTagNames, tagSlug } from "@/lib/tool-content";
import { getUploadDiskPath } from "@/lib/upload-path";

const idSchema = z.string().min(1);
const maxCoverImageBytes = 8 * 1024 * 1024;

async function saveAdminImageUpload(file: FormDataEntryValue | null, prefix: string) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!isLikelyUploadableImage(file)) throw new Error("请上传图片格式的封面图。");
  if (file.size > maxCoverImageBytes) throw new Error("封面图不能超过 8MB。");

  const publicUrl = buildPublicUploadUrl(`${prefix}-${file.name}`);
  const uploadDir = process.env.UPLOAD_DIR ?? join(process.cwd(), "public", "uploads");
  const diskPath = getUploadDiskPath(publicUrl, process.cwd(), process.env.UPLOAD_DIR);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(diskPath, Buffer.from(await file.arrayBuffer()));
  return publicUrl;
}

export async function updateUserAdminAction(formData: FormData) {
  await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const role = z.enum(["user", "admin"]).parse(formData.get("role"));
  const status = z.enum(["active", "disabled"]).parse(formData.get("status"));
  const nickname = parseOptionalString(formData.get("nickname"));

  await prisma.user.update({
    where: { id },
    data: { role, status, nickname }
  });

  revalidatePath("/admin/users");
}

export async function resetUserPasswordAction(formData: FormData) {
  await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const password = z.string().min(8).parse(formData.get("password"));

  await prisma.user.update({
    where: { id },
    data: { passwordHash: await hashPassword(password) }
  });

  revalidatePath("/admin/users");
}

export async function updateOrderAdminAction(formData: FormData) {
  await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const orderStatus = z
    .enum(["pending_payment", "pending_review", "paid", "activated", "rejected", "cancelled", "refunded"])
    .parse(formData.get("orderStatus"));
  const paymentMethodValue = parseOptionalString(formData.get("paymentMethod"));
  const paymentMethod = paymentMethodValue ? z.enum(["alipay", "wechat"]).parse(paymentMethodValue) : null;
  const amount = parseNumberField(formData.get("amount"), 0);
  const order = await prisma.order.findUnique({ where: { id } });
  assertAdminOrderStatusUpdateAllowed(orderStatus);
  if (!order) throw new Error("订单不存在");

  await prisma.order.update({
    where: { id },
    data: {
      amount,
      paymentMethod,
      orderStatus,
      ...getOrderTimestampPatch(orderStatus, order.paidAt, order.activatedAt)
    }
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin/payments");
  revalidatePath("/user");
}

export async function deleteOrderAdminAction(formData: FormData) {
  await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const confirmRisk = parseOptionalString(formData.get("confirmRisk"));
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    redirect(`/admin/orders?error=${encodeURIComponent("订单不存在，可能已经被删除。")}`);
  }
  if (!canAdminDeleteOrderSafely(order.orderStatus) && !isAdminDeleteRiskConfirmed(confirmRisk)) {
    redirect(`/admin/orders?error=${encodeURIComponent("该订单已支付或已开通权益，请先勾选风险确认后再删除。")}`);
  }

  await prisma.$transaction([
    prisma.paymentProof.deleteMany({ where: { orderId: id } }),
    prisma.toolPurchase.deleteMany({ where: { orderId: id } }),
    prisma.order.delete({ where: { id } })
  ]);

  revalidatePath("/admin/orders");
  revalidatePath("/admin/payments");
  revalidatePath("/user");
  redirect("/admin/orders?deleted=1");
}

export async function adjustVipAdminAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = idSchema.parse(formData.get("userId"));
  const actionType = z.enum(["grant", "cancel"]).parse(formData.get("actionType"));
  const durationDays = parseNumberField(formData.get("durationDays"), 7);
  const reason = z.string().min(2, "必须填写操作原因").parse(formData.get("reason"));

  await manuallyAdjustVip({
    userId,
    adminId: admin.id,
    actionType,
    vipType: getManualVipType(durationDays),
    durationDays,
    reason
  });

  revalidatePath("/admin/users");
  revalidatePath("/user");
}

function getManualVipType(durationDays: number) {
  if (durationDays <= 0) return "永久VIP";
  if (durationDays === 7) return "7天VIP";
  if (durationDays === 30) return "1个月VIP";
  if (durationDays === 180) return "6个月VIP";
  if (durationDays === 365) return "12个月VIP";
  return `${durationDays}天VIP`;
}

export async function upsertCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = parseOptionalString(formData.get("id"));
  const data = {
    name: z.string().min(1).parse(formData.get("name")),
    type: z.enum(["software", "online"]).parse(formData.get("type")),
    description: parseOptionalString(formData.get("description")),
    sortOrder: parseNumberField(formData.get("sortOrder"), 0),
    status: z.enum(["active", "disabled"]).parse(formData.get("status") ?? "active")
  };

  if (id) {
    await prisma.toolCategory.update({ where: { id }, data });
  } else {
    await prisma.toolCategory.create({ data });
  }
  revalidatePath("/admin/categories");
  revalidatePath("/software");
  revalidatePath("/online-tools");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  await prisma.toolCategory.delete({ where: { id } });
  revalidatePath("/admin/categories");
}

export async function upsertVipPlanAction(formData: FormData) {
  await requireAdmin();
  const id = parseOptionalString(formData.get("id"));
  const data = {
    name: z.string().min(1).parse(formData.get("name")),
    durationDays: parseNumberField(formData.get("durationDays"), 0),
    price: parseNumberField(formData.get("price"), 0),
    originalPrice: parseOptionalString(formData.get("originalPrice")) ? parseNumberField(formData.get("originalPrice"), 0) : null,
    description: parseOptionalString(formData.get("description")),
    isRecommended: parseBooleanField(formData.get("isRecommended")),
    status: z.enum(["active", "disabled"]).parse(formData.get("status") ?? "active"),
    sortOrder: parseNumberField(formData.get("sortOrder"), 0)
  };

  if (data.isRecommended) {
    await prisma.vipPlan.updateMany({ data: { isRecommended: false } });
  }
  if (id) {
    await prisma.vipPlan.update({ where: { id }, data });
  } else {
    await prisma.vipPlan.create({ data });
  }
  revalidatePath("/admin/plans");
  revalidatePath("/pricing");
}

export async function upsertFileAction(formData: FormData) {
  await requireAdmin();
  const id = parseOptionalString(formData.get("id"));
  const toolId = parseOptionalString(formData.get("toolId"));
  const data = {
    toolId,
    fileName: z.string().min(1).parse(formData.get("fileName")),
    filePath: z.string().min(1).parse(formData.get("filePath")),
    fileUrl: parseOptionalString(formData.get("fileUrl")),
    fileSize: parseOptionalString(formData.get("fileSize")) ? BigInt(parseNumberField(formData.get("fileSize"), 0)) : null,
    version: parseOptionalString(formData.get("version")),
    mimeType: parseOptionalString(formData.get("mimeType"))
  };

  if (id) {
    await prisma.file.update({ where: { id }, data });
  } else {
    await prisma.file.create({ data });
  }
  revalidatePath("/admin/files");
}

export async function upsertToolAction(formData: FormData) {
  await requireAdmin();
  const type = z.enum(["software", "online"]).parse(formData.get("type"));
  const adminPath = type === "software" ? "/admin/software" : "/admin/online-tools";

  try {
    const id = parseOptionalString(formData.get("id"));
    const name = z.string().min(1).parse(formData.get("name"));
    const slugInput = parseOptionalString(formData.get("slug"));
    const uploadedCoverImage = await saveAdminImageUpload(formData.get("coverImageFile"), `tool-cover-${slugInput ?? slugify(name)}`);
    const data = {
      name,
      slug: slugInput ?? slugify(name),
      type,
      categoryId: parseOptionalString(formData.get("categoryId")),
      shortDescription: z.string().min(1).parse(formData.get("shortDescription")),
      content: z.string().min(1).parse(formData.get("content")),
      coverImage: uploadedCoverImage ?? parseOptionalString(formData.get("coverImage")),
      screenshots: parseScreenshotsField(formData.get("screenshots")),
      version: parseOptionalString(formData.get("version")),
      systemRequirement: parseOptionalString(formData.get("systemRequirement")),
      isVipRequired: parseBooleanField(formData.get("isVipRequired")),
      isDownloadPaid: parseBooleanField(formData.get("isDownloadPaid")),
      downloadPrice: parseNumberField(formData.get("downloadPrice"), 0),
      onlineUrl: parseOptionalString(formData.get("onlineUrl")),
      downloadFileId: parseOptionalString(formData.get("downloadFileId")),
      status: z.enum(["draft", "published", "offline"]).parse(formData.get("status") ?? "draft"),
      sortOrder: parseNumberField(formData.get("sortOrder"), 0)
    };

    if (id) {
      await prisma.tool.update({ where: { id }, data });
    } else {
      await prisma.tool.create({ data });
    }
    revalidatePath(adminPath);
    revalidatePath(type === "software" ? "/software" : "/online-tools");
    revalidatePath(`/tools/${data.slug}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存失败，请检查表单内容。";
    redirect(`${adminPath}?error=${encodeURIComponent(message)}`);
  }

  redirect(`${adminPath}?saved=1`);
}

export async function upsertToolTagAction(formData: FormData) {
  await requireAdmin();
  const id = parseOptionalString(formData.get("id"));
  const name = z.string().min(1).parse(formData.get("name"));
  const data = {
    name,
    slug: parseOptionalString(formData.get("slug")) ?? tagSlug(name),
    color: parseOptionalString(formData.get("color")),
    description: parseOptionalString(formData.get("description")),
    status: z.enum(["active", "disabled"]).parse(formData.get("status") ?? "active"),
    sortOrder: parseNumberField(formData.get("sortOrder"), 0)
  };
  if (id) {
    await prisma.toolTag.update({ where: { id }, data });
  } else {
    await prisma.toolTag.create({ data });
  }
  revalidatePath("/admin/tags");
}

export async function updateToolTagsAction(formData: FormData) {
  await requireAdmin();
  const toolId = idSchema.parse(formData.get("toolId"));
  const tagNames = parseTagNames(String(formData.get("tags") ?? ""));
  const tags = await Promise.all(
    tagNames.map((name) =>
      prisma.toolTag.upsert({
        where: { name },
        update: {},
        create: { name, slug: tagSlug(name) }
      })
    )
  );

  await prisma.$transaction([
    prisma.toolTagLink.deleteMany({ where: { toolId } }),
    ...tags.map((tag) => prisma.toolTagLink.create({ data: { toolId, tagId: tag.id } }))
  ]);
  revalidatePath("/admin/tags");
  revalidatePath("/admin/software");
  revalidatePath("/admin/online-tools");
}

export async function deleteToolAction(formData: FormData) {
  await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const type = z.enum(["software", "online"]).parse(formData.get("type"));
  await prisma.tool.delete({ where: { id } });
  revalidatePath(type === "software" ? "/admin/software" : "/admin/online-tools");
}

export async function upsertTutorialAction(formData: FormData) {
  await requireAdmin();
  const id = parseOptionalString(formData.get("id"));
  const toolId = idSchema.parse(formData.get("toolId"));
  const data = {
    toolId,
    title: z.string().min(1).parse(formData.get("title")),
    content: z.string().min(1).parse(formData.get("content")),
    imageUrl: parseOptionalString(formData.get("imageUrl")),
    videoUrl: parseOptionalString(formData.get("videoUrl")),
    sortOrder: parseNumberField(formData.get("sortOrder"), 0),
    status: z.enum(["active", "disabled"]).parse(formData.get("status") ?? "active")
  };

  if (id) {
    await prisma.tutorial.update({ where: { id }, data });
  } else {
    await prisma.tutorial.create({ data });
  }
  revalidatePath("/admin/tutorials");
  revalidatePath("/tutorials");
}

export async function upsertToolFaqAction(formData: FormData) {
  await requireAdmin();
  const id = parseOptionalString(formData.get("id"));
  const data = {
    toolId: idSchema.parse(formData.get("toolId")),
    question: z.string().min(1).parse(formData.get("question")),
    answer: z.string().min(1).parse(formData.get("answer")),
    sortOrder: parseNumberField(formData.get("sortOrder"), 0),
    status: z.enum(["active", "disabled"]).parse(formData.get("status") ?? "active")
  };
  if (id) {
    await prisma.toolFaq.update({ where: { id }, data });
  } else {
    await prisma.toolFaq.create({ data });
  }
  revalidatePath("/admin/faqs");
}

export async function upsertToolChangelogAction(formData: FormData) {
  await requireAdmin();
  const id = parseOptionalString(formData.get("id"));
  const releaseDate = parseOptionalString(formData.get("releaseDate"));
  const data = {
    toolId: idSchema.parse(formData.get("toolId")),
    version: z.string().min(1).parse(formData.get("version")),
    title: z.string().min(1).parse(formData.get("title")),
    content: z.string().min(1).parse(formData.get("content")),
    releaseDate: releaseDate ? new Date(releaseDate) : null,
    sortOrder: parseNumberField(formData.get("sortOrder"), 0),
    status: z.enum(["active", "disabled"]).parse(formData.get("status") ?? "active")
  };
  if (id) {
    await prisma.toolChangelog.update({ where: { id }, data });
  } else {
    await prisma.toolChangelog.create({ data });
  }
  revalidatePath("/admin/changelogs");
}

export async function updateSiteSettingAction(formData: FormData) {
  await requireAdmin();
  const key = z.string().min(1).parse(formData.get("key"));
  const value = z.string().parse(formData.get("value") ?? "");
  const description = parseOptionalString(formData.get("description"));
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value, description },
    create: { key, value, description }
  });
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

export async function goToPayAction(formData: FormData) {
  const orderId = idSchema.parse(formData.get("orderId"));
  redirect(`/orders/${orderId}/pay`);
}
