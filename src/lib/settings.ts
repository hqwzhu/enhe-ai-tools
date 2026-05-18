import { prisma } from "@/lib/db";

export async function getSettingsMap() {
  const settings = await prisma.siteSetting.findMany();
  return Object.fromEntries(settings.map((setting) => [setting.key, setting.value]));
}
