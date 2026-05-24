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
import { getAdminUserDeleteBlockReason } from "@/lib/admin-user-rules";
import { getAdminToolBasePath, getAdminToolEditPath } from "@/lib/admin-tool-routes";
import { manuallyAdjustVip } from "@/lib/membership";
import { isLikelyUploadableImage } from "@/lib/media";
import {
  buildManualVipNotification,
  buildRefundProcessedNotification
} from "@/lib/notification-messages";
import { createUserNotification } from "@/lib/notifications";
import {
  assertAdminOrderStatusUpdateAllowed,
  canAdminDeleteOrderSafely,
  canRecordRefundForOrder,
  isAdminDeleteRiskConfirmed,
  normalizeRefundRecordAmount
} from "@/lib/order-rules";
import {
  deleteStoredCosObjectIfConfigured,
  deleteStoredLocalFileIfSafe,
  derivePublicUploadUrlFromFilePath,
  parseCosFilePath,
  saveUploadedFile
} from "@/lib/storage";
import { parseTagNames, tagSlug } from "@/lib/tool-content";
import { getUploadDiskPath } from "@/lib/upload-path";

const idSchema = z.string().min(1);
const maxCoverImageBytes = 8 * 1024 * 1024;
const deleteUserConfirmationToken = "DELETE_USER";

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
  revalidatePath(`/admin/users/${id}`);
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
  revalidatePath(`/admin/users/${id}`);
}

export async function deleteUserAdminAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const confirmDelete = parseOptionalString(formData.get("confirmDelete"));
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, phone: true, nickname: true, role: true }
  });
  if (!user) {
    redirect(`/admin/users?error=${encodeURIComponent("用户不存在，可能已经被删除。")}`);
  }
  if (confirmDelete !== deleteUserConfirmationToken) {
    redirect(`/admin/users/${id}?error=${encodeURIComponent("请先勾选删除确认。")}`);
  }

  const remainingAdminCount = await prisma.user.count({
    where: {
      role: "admin",
      id: { not: id }
    }
  });
  const blockReason = getAdminUserDeleteBlockReason({
    currentAdminId: admin.id,
    targetUserId: id,
    targetRole: user.role,
    remainingAdminCount
  });
  if (blockReason) {
    redirect(`/admin/users/${id}?error=${encodeURIComponent(blockReason)}`);
  }

  const cleanup = await prisma.$transaction(async (tx) => {
    const orders = await tx.order.findMany({ where: { userId: id }, select: { id: true } });
    const orderIds = orders.map((order) => order.id);

    const adminAuditLogs = await tx.adminAuditLog.updateMany({ where: { adminId: id }, data: { adminId: null } });
    const reviewedProofs = await tx.paymentProof.updateMany({ where: { reviewerId: id }, data: { reviewerId: null } });
    const vipAdjustmentLogs = await tx.vipAdjustmentLog.deleteMany({
      where: { OR: [{ userId: id }, { adminId: id }] }
    });
    const refundRecords = await tx.orderRefundRecord.deleteMany({
      where: { OR: [{ adminId: id }, { requesterId: id }, { orderId: { in: orderIds } }] }
    });
    const paymentProofs = await tx.paymentProof.deleteMany({
      where: { OR: [{ userId: id }, { orderId: { in: orderIds } }] }
    });
    const toolPurchases = await tx.toolPurchase.deleteMany({
      where: { OR: [{ userId: id }, { orderId: { in: orderIds } }] }
    });
    const downloadLogs = await tx.downloadLog.deleteMany({ where: { userId: id } });
    const usageLogs = await tx.toolUsageLog.deleteMany({ where: { userId: id } });
    const comments = await tx.comment.deleteMany({ where: { userId: id } });
    const memberships = await tx.membership.deleteMany({ where: { userId: id } });
    const sessions = await tx.session.deleteMany({ where: { userId: id } });
    const deletedOrders = await tx.order.deleteMany({ where: { userId: id } });
    await tx.user.delete({ where: { id } });

    return {
      orders: deletedOrders.count,
      paymentProofs: paymentProofs.count,
      toolPurchases: toolPurchases.count,
      comments: comments.count,
      memberships: memberships.count,
      downloadLogs: downloadLogs.count,
      usageLogs: usageLogs.count,
      sessions: sessions.count,
      vipAdjustmentLogs: vipAdjustmentLogs.count,
      refundRecords: refundRecords.count,
      reviewedProofsUnlinked: reviewedProofs.count,
      adminAuditLogsUnlinked: adminAuditLogs.count
    };
  });

  await writeAdminAuditLog({
    adminId: admin.id,
    action: "user.delete",
    targetType: "user",
    targetId: id,
    summary: "Deleted user and cleaned related user-owned records.",
    metadata: {
      email: user.email,
      phone: user.phone,
      nickname: user.nickname,
      role: user.role,
      cleanup
    }
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?deleted=1");
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

export async function processRefundRecordAdminAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = idSchema.parse(formData.get("refundId"));
  const status = z.enum(["completed", "rejected"]).parse(formData.get("status"));
  const note = parseOptionalString(formData.get("note"));
  const refund = await prisma.orderRefundRecord.findUnique({ where: { id }, include: { order: true } });
  if (!refund) {
    redirect(`/admin/orders?error=${encodeURIComponent("售后/退款记录不存在。")}`);
  }
  if (refund.status !== "pending") {
    redirect(`/admin/orders?error=${encodeURIComponent("该售后/退款记录已经处理。")}`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.orderRefundRecord.update({
      where: { id },
      data: {
        status,
        adminId: admin.id,
        note: note ?? refund.note
      }
    });

    if (status === "completed") {
      await tx.order.update({ where: { id: refund.orderId }, data: { orderStatus: "refunded" } });
    }
  });
  await createUserNotification(
    refund.requesterId ?? refund.order.userId,
    buildRefundProcessedNotification({
      orderId: refund.orderId,
      orderNo: refund.order.orderNo,
      status,
      note
    })
  );

  await writeAdminAuditLog({
    adminId: admin.id,
    action: "order.refund.process",
    targetType: "order",
    targetId: refund.orderId,
    summary: "Processed user after-sales/refund request.",
    metadata: { refundId: id, status, note }
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${refund.orderId}`);
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
  await createUserNotification(
    userId,
    buildManualVipNotification({
      actionType,
      vipType: getManualVipType(durationDays),
      reason
    })
  );
  await writeAdminAuditLog({
    adminId: admin.id,
    action: "vip.adjust",
    targetType: "user",
    targetId: userId,
    summary: "Manually adjusted user VIP membership.",
    metadata: { actionType, durationDays, reason }
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
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

export async function upsertDevelopmentVersionAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = parseOptionalString(formData.get("id"));
  const data = {
    version: z.string().min(1).parse(formData.get("version")),
    name: z.string().min(1).parse(formData.get("name")),
    description: parseOptionalString(formData.get("description")),
    status: z.enum(["planned", "active", "released", "archived"]).parse(formData.get("status") ?? "active"),
    startedAt: parseDateField(formData.get("startedAt")),
    releasedAt: parseDateField(formData.get("releasedAt")),
    sortOrder: parseNumberField(formData.get("sortOrder"), 0)
  };

  const version = id
    ? await prisma.developmentVersion.update({ where: { id }, data })
    : await prisma.developmentVersion.create({ data });

  await writeAdminAuditLog({
    adminId: admin.id,
    action: id ? "development.version.update" : "development.version.create",
    targetType: "development_version",
    targetId: version.id,
    summary: id ? "Updated development version." : "Created development version.",
    metadata: { version: version.version, status: version.status }
  });

  revalidatePath("/admin/development");
}

export async function deleteDevelopmentVersionAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const version = await prisma.developmentVersion.delete({ where: { id } });
  await writeAdminAuditLog({
    adminId: admin.id,
    action: "development.version.delete",
    targetType: "development_version",
    targetId: id,
    summary: "Deleted development version and its progress items.",
    metadata: { version: version.version, name: version.name }
  });

  revalidatePath("/admin/development");
  redirect("/admin/development?deleted=version");
}

export async function upsertDevelopmentItemAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = parseOptionalString(formData.get("id"));
  const data = {
    versionId: idSchema.parse(formData.get("versionId")),
    module: z.string().min(1).parse(formData.get("module")),
    name: z.string().min(1).parse(formData.get("name")),
    status: z.enum(["completed", "partial", "not_started", "recommended"]).parse(formData.get("status") ?? "not_started"),
    priority: z.enum(["high", "medium", "low"]).parse(formData.get("priority") ?? "medium"),
    relatedFiles: parseOptionalString(formData.get("relatedFiles")),
    notes: parseOptionalString(formData.get("notes")),
    sortOrder: parseNumberField(formData.get("sortOrder"), 0)
  };

  const item = id
    ? await prisma.developmentItem.update({ where: { id }, data })
    : await prisma.developmentItem.create({ data });

  await writeAdminAuditLog({
    adminId: admin.id,
    action: id ? "development.item.update" : "development.item.create",
    targetType: "development_item",
    targetId: item.id,
    summary: id ? "Updated development progress item." : "Created development progress item.",
    metadata: { module: item.module, name: item.name, status: item.status, priority: item.priority }
  });

  revalidatePath("/admin/development");
}

export async function deleteDevelopmentItemAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const item = await prisma.developmentItem.delete({ where: { id } });
  await writeAdminAuditLog({
    adminId: admin.id,
    action: "development.item.delete",
    targetType: "development_item",
    targetId: id,
    summary: "Deleted development progress item.",
    metadata: { module: item.module, name: item.name, status: item.status }
  });

  revalidatePath("/admin/development");
  redirect("/admin/development?deleted=item");
}

export async function upsertProductReleaseAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = parseOptionalString(formData.get("id"));
  const data = {
    version: z.string().min(1).parse(formData.get("version")),
    name: z.string().min(1).parse(formData.get("name")),
    description: parseOptionalString(formData.get("description")),
    status: z.enum(["planned", "active", "released", "archived"]).parse(formData.get("status") ?? "planned"),
    developmentVersionId: parseOptionalString(formData.get("developmentVersionId")),
    releaseDate: parseDateField(formData.get("releaseDate")),
    sortOrder: parseNumberField(formData.get("sortOrder"), 0)
  };

  const release = id
    ? await prisma.productRelease.update({ where: { id }, data })
    : await prisma.productRelease.create({ data });

  await writeAdminAuditLog({
    adminId: admin.id,
    action: id ? "product_release.update" : "product_release.create",
    targetType: "product_release",
    targetId: release.id,
    summary: id ? "Updated product release." : "Created product release.",
    metadata: { version: release.version, status: release.status, developmentVersionId: release.developmentVersionId }
  });

  revalidatePath("/admin/releases");
  revalidatePath("/admin/development");
  redirect("/admin/releases?saved=1");
}

export async function deleteProductReleaseAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const release = await prisma.productRelease.delete({ where: { id } });

  await writeAdminAuditLog({
    adminId: admin.id,
    action: "product_release.delete",
    targetType: "product_release",
    targetId: id,
    summary: "Deleted product release.",
    metadata: { version: release.version, name: release.name }
  });

  revalidatePath("/admin/releases");
  revalidatePath("/admin/development");
  redirect("/admin/releases?deleted=1");
}

function parseDateField(value: FormDataEntryValue | null) {
  const text = parseOptionalString(value);
  return text ? new Date(`${text}T00:00:00`) : null;
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
    await writeAdminAuditLog({
      adminId: admin.id,
      action: "file.upload.failed",
      targetType: "file",
      targetId: null,
      summary: "File upload failed before creating file record.",
      metadata: { fileName: file.name, fileSize: file.size, error: message }
    });
    redirect(`/admin/files?error=${encodeURIComponent(message)}`);
  }
}

export async function upsertFileAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = parseOptionalString(formData.get("id"));
  const toolId = parseOptionalString(formData.get("toolId"));
  const filePath = z.string().min(1).parse(formData.get("filePath"));
  const fileUrl = parseOptionalString(formData.get("fileUrl")) ?? derivePublicUploadUrlFromFilePath(filePath);
  const data = {
    toolId,
    fileName: z.string().min(1).parse(formData.get("fileName")),
    filePath,
    fileUrl,
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

export async function deleteFileAdminAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const file = await prisma.file.findUnique({ where: { id } });
  if (!file) {
    redirect(`/admin/files?error=${encodeURIComponent("文件不存在，可能已经被删除。")}`);
  }

  const [primaryBindings, downloadLogs] = await prisma.$transaction([
    prisma.tool.updateMany({ where: { downloadFileId: id }, data: { downloadFileId: null } }),
    prisma.downloadLog.deleteMany({ where: { fileId: id } }),
    prisma.file.delete({ where: { id } })
  ]);

  let physicalDeleted = false;
  let cosDeleted = false;
  let warning: string | null = null;
  try {
    if (parseCosFilePath(file.filePath)) {
      const result = await deleteStoredCosObjectIfConfigured(file.filePath);
      cosDeleted = result.deleted;
    } else {
      physicalDeleted = await deleteStoredLocalFileIfSafe(file.filePath);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    warning = errorMessage;
    await writeAdminAuditLog({
      adminId: admin.id,
      action: parseCosFilePath(file.filePath) ? "file.delete.cos_failed" : "file.delete.local_failed",
      targetType: "file",
      targetId: id,
      summary: parseCosFilePath(file.filePath)
        ? "Deleted file record, but COS remote object deletion failed."
        : "Deleted file record, but local physical file deletion failed.",
      metadata: {
        fileName: file.fileName,
        filePath: file.filePath,
        error: errorMessage
      }
    });
  }

  await writeAdminAuditLog({
    adminId: admin.id,
    action: "file.delete",
    targetType: "file",
    targetId: id,
    summary: "Deleted file record and cleaned related bindings.",
    metadata: {
      fileName: file.fileName,
      filePath: file.filePath,
      primaryBindings: primaryBindings.count,
      downloadLogs: downloadLogs.count,
      physicalDeleted,
      cosDeleted,
      warning
    }
  });

  revalidatePath("/admin/files");
  revalidatePath("/admin/software");
  revalidatePath("/admin/online-tools");
  const warningQuery = warning ? `&warning=${encodeURIComponent(`文件记录已删除，但远程/物理文件清理失败：${warning}`)}` : "";
  redirect(`/admin/files?deleted=1${warningQuery}`);
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
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/pricing");
  revalidatePath("/software");
  revalidatePath("/online-tools");
}

export async function goToPayAction(formData: FormData) {
  const orderId = idSchema.parse(formData.get("orderId"));
  redirect(`/orders/${orderId}/pay`);
}
