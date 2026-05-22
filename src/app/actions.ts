"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { writeAdminAuditLog } from "@/lib/admin-audit";
import { prisma } from "@/lib/db";
import { createOrderNo } from "@/lib/order";
import {
  assertLoginNotLimited,
  getCurrentUser,
  hashPassword,
  recordLoginAttempt,
  requireAdmin,
  requireUser,
  signInUser,
  signOutUser,
  verifyPassword
} from "@/lib/auth";
import { assertValidCsrfToken } from "@/lib/csrf";
import { activateVipForOrder } from "@/lib/membership";
import { canUserCancelOrder, canUserRequestRefundForOrder, normalizeRefundRecordAmount } from "@/lib/order-rules";
import { validatePasswordChangeInput } from "@/lib/password";

const accountSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(6, "密码至少 6 位")
});

export async function registerAction(formData: FormData) {
  await assertValidCsrfToken(formData.get("csrfToken"));
  const input = accountSchema.parse({
    email: formData.get("email"),
    password: formData.get("password")
  });
  const exists = await prisma.user.findUnique({ where: { email: input.email } });
  if (exists) redirect("/login?message=account-exists");

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash: await hashPassword(input.password),
      nickname: input.email.split("@")[0]
    }
  });
  await signInUser(user.id);
  redirect("/user");
}

export async function loginAction(formData: FormData) {
  await assertValidCsrfToken(formData.get("csrfToken"));
  const input = accountSchema.parse({
    email: formData.get("email"),
    password: formData.get("password")
  });
  await assertLoginNotLimited(input.email);
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || user.status !== "active" || !(await verifyPassword(input.password, user.passwordHash))) {
    await recordLoginAttempt(input.email, false);
    redirect("/login?message=invalid");
  }
  await recordLoginAttempt(input.email, true);
  await signInUser(user.id);
  redirect(user.role === "admin" ? "/admin" : "/user");
}

export async function logoutAction() {
  await signOutUser();
  redirect("/");
}

export async function changePasswordAction(formData: FormData) {
  const user = await requireUser();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const validation = validatePasswordChangeInput(currentPassword, newPassword, confirmPassword);

  if (!validation.ok) {
    redirect(`/user?password=${encodeURIComponent(validation.message)}`);
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || !(await verifyPassword(currentPassword, dbUser.passwordHash))) {
    redirect(`/user?password=${encodeURIComponent("当前密码不正确")}`);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(newPassword) }
  });

  redirect("/user?password=changed");
}

export async function createOrderAction(formData: FormData) {
  const user = await requireUser();
  const planId = z.string().min(1).parse(formData.get("planId"));
  const paymentMethod = z.enum(["alipay", "wechat"]).parse(formData.get("paymentMethod") ?? "alipay");
  const plan = await prisma.vipPlan.findFirst({ where: { id: planId, status: "active" } });
  if (!plan) throw new Error("套餐不存在或已禁用");

  const order = await prisma.order.create({
    data: {
      orderNo: createOrderNo(),
      userId: user.id,
      planId: plan.id,
      orderType: "vip",
      amount: plan.price,
      paymentMethod,
      orderStatus: "pending_payment"
    }
  });
  redirect(`/orders/${order.id}/pay`);
}

export async function createSoftwareDownloadOrderAction(formData: FormData) {
  const user = await requireUser();
  const toolId = z.string().min(1).parse(formData.get("toolId"));
  const paymentMethod = z.enum(["alipay", "wechat"]).parse(formData.get("paymentMethod") ?? "alipay");
  const tool = await prisma.tool.findFirst({ where: { id: toolId, type: "software", status: "published" } });
  if (!tool) throw new Error("软件工具不存在或未发布");
  if (!tool.isDownloadPaid || Number(tool.downloadPrice) <= 0) {
    redirect(`/api/tools/${tool.id}/download`);
  }

  const existingPurchase = await prisma.toolPurchase.findUnique({
    where: { userId_toolId: { userId: user.id, toolId: tool.id } }
  });
  if (existingPurchase) redirect(`/api/tools/${tool.id}/download`);

  const order = await prisma.order.create({
    data: {
      orderNo: createOrderNo(),
      userId: user.id,
      toolId: tool.id,
      orderType: "software_download",
      amount: tool.downloadPrice,
      paymentMethod,
      orderStatus: "pending_payment"
    }
  });
  redirect(`/orders/${order.id}/pay`);
}

export async function submitPaymentProofAction(formData: FormData) {
  const user = await requireUser();
  const orderId = z.string().min(1).parse(formData.get("orderId"));
  const paymentMethod = z.enum(["alipay", "wechat"]).parse(formData.get("paymentMethod"));
  const proofImage = z.string().min(1, "请填写付款截图地址").parse(formData.get("proofImage"));
  const paymentRemark = z.string().optional().parse(formData.get("paymentRemark") ?? undefined);

  const order = await prisma.order.findFirst({ where: { id: orderId, userId: user.id } });
  if (!order) throw new Error("订单不存在");

  await prisma.paymentProof.upsert({
    where: { orderId },
    update: { paymentMethod, paymentRemark, proofImage, reviewStatus: "pending" },
    create: { orderId, userId: user.id, paymentMethod, paymentRemark, proofImage, reviewStatus: "pending" }
  });
  await prisma.order.update({ where: { id: orderId }, data: { orderStatus: "pending_review", paymentMethod } });
  redirect("/user?tab=orders");
}

export async function cancelOrderAction(formData: FormData) {
  const user = await requireUser();
  const orderId = z.string().min(1).parse(formData.get("orderId"));
  const order = await prisma.order.findFirst({ where: { id: orderId, userId: user.id } });
  if (!order) throw new Error("订单不存在。");
  if (!canUserCancelOrder(order.orderStatus)) {
    throw new Error("当前订单状态不允许取消。");
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { orderStatus: "cancelled" }
  });

  revalidatePath("/user");
  redirect("/user?order=cancelled");
}

export async function createRefundRequestAction(formData: FormData) {
  const user = await requireUser();
  const orderId = z.string().min(1).parse(formData.get("orderId"));
  const reason = z.string().min(2, "请填写售后/退款原因").max(500).parse(formData.get("reason"));
  const note = z.string().max(1000).optional().parse(String(formData.get("note") ?? "") || undefined);
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: { refundRecords: { where: { status: "pending" }, select: { id: true }, take: 1 } }
  });
  if (!order) throw new Error("订单不存在。");
  if (!canUserRequestRefundForOrder(order.orderStatus, order.refundRecords.length > 0)) {
    throw new Error("当前订单状态不允许申请售后/退款，或已有待处理申请。");
  }

  const amount = normalizeRefundRecordAmount(order.amount.toString(), Number(order.amount));
  await prisma.orderRefundRecord.create({
    data: {
      orderId: order.id,
      requesterId: user.id,
      amount,
      status: "pending",
      reason,
      note
    }
  });

  revalidatePath(`/orders/${order.id}`);
  revalidatePath("/user");
  redirect(`/orders/${order.id}?refund=requested`);
}

export async function createCommentAction(formData: FormData) {
  const user = await requireUser();
  const toolId = z.string().min(1).parse(formData.get("toolId"));
  const content = z.string().min(2).max(1000).parse(formData.get("content"));
  await prisma.comment.create({ data: { userId: user.id, toolId, content, status: "pending" } });
  revalidatePath(`/tools/${formData.get("slug")}`);
}

export async function reviewPaymentProofAction(formData: FormData) {
  const admin = await requireAdmin();
  const orderId = z.string().min(1).parse(formData.get("orderId"));
  const decision = z.enum(["approved", "rejected"]).parse(formData.get("decision"));
  const reviewNote = z.string().optional().parse(formData.get("reviewNote") ?? undefined);

  if (decision === "approved") {
    await activateVipForOrder(orderId, admin.id, reviewNote);
  } else {
    await prisma.$transaction([
      prisma.paymentProof.update({ where: { orderId }, data: { reviewStatus: "rejected", reviewerId: admin.id, reviewedAt: new Date(), reviewNote } }),
      prisma.order.update({ where: { id: orderId }, data: { orderStatus: "rejected" } })
    ]);
  }
  await writeAdminAuditLog({
    adminId: admin.id,
    action: "payment.review",
    targetType: "order",
    targetId: orderId,
    summary: "Reviewed payment proof.",
    metadata: { decision, reviewNote }
  });
  revalidatePath("/admin/payments");
}

export async function updateCommentStatusAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  const status = z.enum(["approved", "rejected", "deleted"]).parse(formData.get("status"));
  await prisma.comment.update({ where: { id }, data: { status } });
  await writeAdminAuditLog({
    adminId: admin.id,
    action: "comment.status.update",
    targetType: "comment",
    targetId: id,
    summary: "Updated comment review status.",
    metadata: { status }
  });
  revalidatePath("/admin/comments");
}

export async function updateCommentPinAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  const isPinned = String(formData.get("isPinned")) === "true";
  const comment = await prisma.comment.update({ where: { id }, data: { isPinned }, include: { tool: true } });
  await writeAdminAuditLog({
    adminId: admin.id,
    action: "comment.pin.update",
    targetType: "comment",
    targetId: id,
    summary: "Updated comment pin state.",
    metadata: { isPinned, toolId: comment.toolId }
  });
  revalidatePath("/admin/comments");
  revalidatePath(`/tools/${comment.tool.slug}`);
}

export async function getSessionSnapshot() {
  const user = await getCurrentUser();
  return user;
}
