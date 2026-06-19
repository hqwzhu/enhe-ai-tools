import { redirectLegacyToolDetailPage } from "@/app/tools/[slug]/page-shell";

export const revalidate = 300;

export default async function LegacyEnglishToolDetailRedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await redirectLegacyToolDetailPage(slug, "en");
}
