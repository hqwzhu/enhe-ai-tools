"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  parseBooleanField,
  parseNumberField,
  parseOptionalString,
  parseScreenshotsField,
  slugify
} from "@/lib/admin-form";
import { requireAdmin } from "@/lib/auth";

const idSchema = z.string().min(1);

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
  const id = parseOptionalString(formData.get("id"));
  const type = z.enum(["software", "online"]).parse(formData.get("type"));
  const name = z.string().min(1).parse(formData.get("name"));
  const slugInput = parseOptionalString(formData.get("slug"));
  const data = {
    name,
    slug: slugInput ?? slugify(name),
    type,
    categoryId: parseOptionalString(formData.get("categoryId")),
    shortDescription: z.string().min(1).parse(formData.get("shortDescription")),
    content: z.string().min(1).parse(formData.get("content")),
    coverImage: parseOptionalString(formData.get("coverImage")),
    screenshots: parseScreenshotsField(formData.get("screenshots")),
    version: parseOptionalString(formData.get("version")),
    systemRequirement: parseOptionalString(formData.get("systemRequirement")),
    isVipRequired: parseBooleanField(formData.get("isVipRequired")),
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
  revalidatePath(type === "software" ? "/admin/software" : "/admin/online-tools");
  revalidatePath(type === "software" ? "/software" : "/online-tools");
  revalidatePath(`/tools/${data.slug}`);
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
