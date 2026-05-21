"use server";

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { writeAdminAuditLog } from "@/lib/admin-audit";
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
import { getAdminToolBasePath, getAdminToolEditPath } from "@/lib/admin-tool-routes";
import { manuallyAdjustVip } from "@/lib/membership";
import { isLikelyUploadableImage } from "@/lib/media";
import {
  assertAdminOrderStatusUpdateAllowed,
  canAdminDeleteOrderSafely,
  canRecordRefundForOrder,
  isAdminDeleteRiskConfirmed,
  normalizeRefundRecordAmount
} from "@/lib/order-rules";
import { saveUploadedFile } from "@/lib/storage";
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
  const admin = await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const role = z.enum(["user", "admin"]).parse(formData.get("role"));
  const status = z.enum(["active", "disabled"]).parse(formData.get("status"));
  const nickname = parseOptionalString(formData.get("nickname"));

  await prisma.user.update({
    where: { id },
    data: { role, status, nickname }
  });
  await writeAdminAuditLog({
    adminId: admin.id,
    action: "user.update",
    targetType: "user",
    targetId: id,
    summary: "Updated user profile, role, or status.",
    metadata: { role, status, nickname }
  });

  revalidatePath("/admin/users");
}

export async function resetUserPasswordAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const password = z.string().min(8).parse(formData.get("password"));

  await prisma.user.update({
    where: { id },
    data: { passwordHash: await hashPassword(password) }
  });
  await writeAdminAuditLog({
    adminId: admin.id,
    action: "user.password.reset",
    targetType: "user",
    targetId: id,
    summary: "Reset user password."
  });

  revalidatePath("/admin/users");
}

export async function updateOrderAdminAction(formData: FormData) {
  const admin = await requireAdmin();
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
  await writeAdminAuditLog({
    adminId: admin.id,
    action: "order.update",
    targetType: "order",
    targetId: id,
    summary: "Updated order status, amount, or payment method.",
    metadata: { beforeStatus: order.orderStatus, orderStatus, paymentMethod, amount }
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin/payments");
  revalidatePath("/user");
}

export async function deleteOrderAdminAction(formData: FormData) {
  const admin = await requireAdmin();
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
    prisma.orderRefundRecord.deleteMany({ where: { orderId: id } }),
    prisma.order.delete({ where: { id } })
  ]);
  await writeAdminAuditLog({
    adminId: admin.id,
    action: "order.delete",
    targetType: "order",
    targetId: id,
    summary: "Deleted order after admin confirmation.",
    metadata: { orderNo: order.orderNo, orderStatus: order.orderStatus, confirmedRisk: !canAdminDeleteOrderSafely(order.orderStatus) }
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin/payments");
  revalidatePath("/user");
  redirect("/admin/orders?deleted=1");
}

export async function createRefundRecordAdminAction(formData: FormData) {
  const admin = await requireAdmin();
  const orderId = idSchema.parse(formData.get("orderId"));
  const status = z.enum(["pending", "completed", "rejected"]).parse(formData.get("status") ?? "completed");
  const reason = z.string().min(2, "必须填写售后/退款原因").parse(formData.get("reason"));
  const note = parseOptionalString(formData.get("note"));
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    redirect(`/admin/orders?error=${encodeURIComponent("订单不存在，无法记录售后/退款。")}`);
  }
  if (!canRecordRefundForOrder(order.orderStatus)) {
    redirect(`/admin/orders?error=${encodeURIComponent("当前订单状态不允许创建退款记录。")}`);
  }

  let amount: number;
  try {
    amount = normalizeRefundRecordAmount(formData.get("amount"), Number(order.amount));
  } catch (error) {
    const message = error instanceof Error ? error.message : "退款金额无效。";
    redirect(`/admin/orders?error=${encodeURIComponent(message)}`);
  }

  const refund = await prisma.$transaction(async (tx) => {
    const created = await tx.orderRefundRecord.create({
      data: {
        orderId,
        adminId: admin.id,
        amount,
        status,
        reason,
        note
      }
    });

    if (status === "completed") {
      await tx.order.update({ where: { id: orderId }, data: { orderStatus: "refunded" } });
    }

    return created;
  });

  await writeAdminAuditLog({
    adminId: admin.id,
    action: "order.refund.create",
    targetType: "order",
    targetId: orderId,
    summary: "Created order after-sales/refund record.",
    metadata: { refundId: refund.id, amount, status, reason }
  });

  revalidatePath("/admin/orders");
  revalidatePath("/user");
  redirect("/admin/orders?refund=1");
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
  await writeAdminAuditLog({
    adminId: admin.id,
    action: "vip.adjust",
    targetType: "user",
    targetId: userId,
    summary: "Manually adjusted user VIP membership.",
    metadata: { actionType, durationDays, reason }
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
  const admin = await requireAdmin();
  const id = parseOptionalString(formData.get("id"));
  const data = {
    name: z.string().min(1).parse(formData.get("name")),
    type: z.enum(["software", "online"]).parse(formData.get("type")),
    description: parseOptionalString(formData.get("description")),
    sortOrder: parseNumberField(formData.get("sortOrder"), 0),
    status: z.enum(["active", "disabled"]).parse(formData.get("status") ?? "active")
  };

  let categoryId = id;
  if (id) {
    await prisma.toolCategory.update({ where: { id }, data });
  } else {
    const created = await prisma.toolCategory.create({ data });
    categoryId = created.id;
  }
  await writeAdminAuditLog({
    adminId: admin.id,
    action: id ? "category.update" : "category.create",
    targetType: "tool_category",
    targetId: categoryId,
    summary: id ? "Updated tool category." : "Created tool category.",
    metadata: { name: data.name, type: data.type, status: data.status }
  });
  revalidatePath("/admin/categories");
  revalidatePath("/software");
  revalidatePath("/online-tools");
}

export async function deleteCategoryAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const category = await prisma.toolCategory.delete({ where: { id } });
  await writeAdminAuditLog({
    adminId: admin.id,
    action: "category.delete",
    targetType: "tool_category",
    targetId: id,
    summary: "Deleted tool category.",
    metadata: { name: category.name, type: category.type }
  });
  revalidatePath("/admin/categories");
}

export async function upsertVipPlanAction(formData: FormData) {
  const admin = await requireAdmin();
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
  let planId = id;
  if (id) {
    await prisma.vipPlan.update({ where: { id }, data });
  } else {
    const created = await prisma.vipPlan.create({ data });
    planId = created.id;
  }
  await writeAdminAuditLog({
    adminId: admin.id,
    action: id ? "vip_plan.update" : "vip_plan.create",
    targetType: "vip_plan",
    targetId: planId,
    summary: id ? "Updated VIP plan." : "Created VIP plan.",
    metadata: { name: data.name, durationDays: data.durationDays, price: data.price, status: data.status }
  });
  revalidatePath("/admin/plans");
  revalidatePath("/pricing");
}

export async function uploadFileAdminAction(formData: FormData) {
  const admin = await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect(`/admin/files?error=${encodeURIComponent("请选择要上传的文件。")}`);
  }

  try {
    const stored = await saveUploadedFile(file, {
      folder: "files",
      maxBytes: 500 * 1024 * 1024
    });
    const record = await prisma.file.create({
      data: {
        fileName: stored.fileName,
        filePath: stored.filePath,
        fileUrl: stored.fileUrl,
        fileSize: BigInt(stored.fileSize),
        mimeType: stored.mimeType
      }
    });
    await writeAdminAuditLog({
      adminId: admin.id,
      action: "file.upload",
      targetType: "file",
      targetId: record.id,
      summary: "Uploaded file and created file record.",
      metadata: { fileName: stored.fileName, storage: stored.storage, fileSize: stored.fileSize }
    });
    revalidatePath("/admin/files");
    redirect(`/admin/files?uploaded=1&fileId=${record.id}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "上传失败，请稍后重试。";
    redirect(`/admin/files?error=${encodeURIComponent(message)}`);
  }
}

export async function upsertFileAction(formData: FormData) {
  const admin = await requireAdmin();
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

  let fileId = id;
  if (id) {
    await prisma.file.update({ where: { id }, data });
  } else {
    const created = await prisma.file.create({ data });
    fileId = created.id;
  }
  await writeAdminAuditLog({
    adminId: admin.id,
    action: id ? "file.update" : "file.create",
    targetType: "file",
    targetId: fileId,
    summary: id ? "Updated file record." : "Created file record.",
    metadata: { toolId, fileName: data.fileName }
  });
  revalidatePath("/admin/files");
}

export async function upsertToolAction(formData: FormData) {
  const admin = await requireAdmin();
  const type = z.enum(["software", "online"]).parse(formData.get("type"));
  const adminPath = getAdminToolBasePath(type);
  let savedToolId = parseOptionalString(formData.get("id"));

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
      savedToolId = id;
    } else {
      const created = await prisma.tool.create({ data });
      savedToolId = created.id;
    }
    await writeAdminAuditLog({
      adminId: admin.id,
      action: id ? "tool.update" : "tool.create",
      targetType: "tool",
      targetId: savedToolId,
      summary: id ? "Updated tool." : "Created tool.",
      metadata: { type, name, slug: data.slug, status: data.status }
    });
    revalidatePath(adminPath);
    revalidatePath(type === "software" ? "/software" : "/online-tools");
    revalidatePath(`/tools/${data.slug}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存失败，请检查表单内容。";
    const returnTo = parseOptionalString(formData.get("returnTo")) ?? adminPath;
    redirect(`${returnTo}?error=${encodeURIComponent(message)}`);
  }

  redirect(`${getAdminToolEditPath(type, savedToolId ?? "new")}?saved=1`);
}

export async function upsertToolTagAction(formData: FormData) {
  const admin = await requireAdmin();
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
  let tagId = id;
  if (id) {
    await prisma.toolTag.update({ where: { id }, data });
  } else {
    const created = await prisma.toolTag.create({ data });
    tagId = created.id;
  }
  await writeAdminAuditLog({
    adminId: admin.id,
    action: id ? "tool_tag.update" : "tool_tag.create",
    targetType: "tool_tag",
    targetId: tagId,
    summary: id ? "Updated tool tag." : "Created tool tag.",
    metadata: { name, slug: data.slug, status: data.status }
  });
  revalidatePath("/admin/tags");
}

export async function updateToolTagsAction(formData: FormData) {
  const admin = await requireAdmin();
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
  await writeAdminAuditLog({
    adminId: admin.id,
    action: "tool.tags.update",
    targetType: "tool",
    targetId: toolId,
    summary: "Updated tool tag bindings.",
    metadata: { tags: tagNames }
  });
  revalidatePath("/admin/tags");
  revalidatePath("/admin/software");
  revalidatePath("/admin/online-tools");
}

export async function deleteToolAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const type = z.enum(["software", "online"]).parse(formData.get("type"));
  const adminPath = getAdminToolBasePath(type);
  const tool = await prisma.tool.delete({ where: { id } });
  await writeAdminAuditLog({
    adminId: admin.id,
    action: "tool.delete",
    targetType: "tool",
    targetId: id,
    summary: "Deleted tool.",
    metadata: { type, name: tool.name, slug: tool.slug }
  });
  revalidatePath(adminPath);
  redirect(`${adminPath}?deleted=1`);
}

export async function upsertTutorialAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = parseOptionalString(formData.get("id"));
  const toolId = idSchema.parse(formData.get("toolId"));
  const data = {
    toolId,
    title: z.string().min(1).parse(formData.get("title")),
    content: z.string().min(1).parse(formData.get("content")),
    imageUrl: parseOptionalString(formData.get("imageUrl")),
    videoUrl: parseOptionalString(formData.get("videoUrl")),
    notes: parseOptionalString(formData.get("notes")),
    commonErrors: parseOptionalString(formData.get("commonErrors")),
    sortOrder: parseNumberField(formData.get("sortOrder"), 0),
    status: z.enum(["active", "disabled"]).parse(formData.get("status") ?? "active")
  };

  let tutorialId = id;
  if (id) {
    await prisma.tutorial.update({ where: { id }, data });
  } else {
    const created = await prisma.tutorial.create({ data });
    tutorialId = created.id;
  }
  await writeAdminAuditLog({
    adminId: admin.id,
    action: id ? "tutorial.update" : "tutorial.create",
    targetType: "tutorial",
    targetId: tutorialId,
    summary: id ? "Updated tutorial." : "Created tutorial.",
    metadata: { toolId, title: data.title, status: data.status }
  });
  revalidatePath("/admin/tutorials");
  revalidatePath("/tutorials");
}

export async function upsertToolFaqAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = parseOptionalString(formData.get("id"));
  const data = {
    toolId: idSchema.parse(formData.get("toolId")),
    question: z.string().min(1).parse(formData.get("question")),
    answer: z.string().min(1).parse(formData.get("answer")),
    sortOrder: parseNumberField(formData.get("sortOrder"), 0),
    status: z.enum(["active", "disabled"]).parse(formData.get("status") ?? "active")
  };
  let faqId = id;
  if (id) {
    await prisma.toolFaq.update({ where: { id }, data });
  } else {
    const created = await prisma.toolFaq.create({ data });
    faqId = created.id;
  }
  await writeAdminAuditLog({
    adminId: admin.id,
    action: id ? "tool_faq.update" : "tool_faq.create",
    targetType: "tool_faq",
    targetId: faqId,
    summary: id ? "Updated tool FAQ." : "Created tool FAQ.",
    metadata: { toolId: data.toolId, question: data.question, status: data.status }
  });
  revalidatePath("/admin/faqs");
}

export async function upsertToolChangelogAction(formData: FormData) {
  const admin = await requireAdmin();
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
  let changelogId = id;
  if (id) {
    await prisma.toolChangelog.update({ where: { id }, data });
  } else {
    const created = await prisma.toolChangelog.create({ data });
    changelogId = created.id;
  }
  await writeAdminAuditLog({
    adminId: admin.id,
    action: id ? "tool_changelog.update" : "tool_changelog.create",
    targetType: "tool_changelog",
    targetId: changelogId,
    summary: id ? "Updated tool changelog." : "Created tool changelog.",
    metadata: { toolId: data.toolId, version: data.version, title: data.title, status: data.status }
  });
  revalidatePath("/admin/changelogs");
}

export async function updateSiteSettingAction(formData: FormData) {
  const admin = await requireAdmin();
  const key = z.string().min(1).parse(formData.get("key"));
  const value = z.string().parse(formData.get("value") ?? "");
  const description = parseOptionalString(formData.get("description"));
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value, description },
    create: { key, value, description }
  });
  await writeAdminAuditLog({
    adminId: admin.id,
    action: "site.setting.update",
    targetType: "site_setting",
    targetId: key,
    summary: "Updated site setting.",
    metadata: { key }
  });
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

export async function goToPayAction(formData: FormData) {
  const orderId = idSchema.parse(formData.get("orderId"));
  redirect(`/orders/${orderId}/pay`);
}
