"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createOrderNo } from "@/lib/order";
import { getCurrentUser, hashPassword, requireAdmin, requireUser, signInUser, signOutUser, verifyPassword } from "@/lib/auth";
import { activateVipForOrder } from "@/lib/membership";

const accountSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(6, "密码至少 6 位")
});

export async function registerAction(formData: FormData) {
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
  const input = accountSchema.parse({
    email: formData.get("email"),
    password: formData.get("password")
  });
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || user.status !== "active" || !(await verifyPassword(input.password, user.passwordHash))) {
    redirect("/login?message=invalid");
  }
  await signInUser(user.id);
  redirect(user.role === "admin" ? "/admin" : "/user");
}

export async function logoutAction() {
  await signOutUser();
  redirect("/");
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
  revalidatePath("/admin/payments");
}

export async function updateCommentStatusAction(formData: FormData) {
  await requireAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  const status = z.enum(["approved", "rejected", "deleted"]).parse(formData.get("status"));
  await prisma.comment.update({ where: { id }, data: { status } });
  revalidatePath("/admin/comments");
}

export async function getSessionSnapshot() {
  const user = await getCurrentUser();
  return user;
}
