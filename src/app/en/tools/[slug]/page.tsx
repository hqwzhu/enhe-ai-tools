import { generateToolDetailPageMetadata, ToolDetailPageShell } from "@/app/tools/[slug]/page-shell";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return generateToolDetailPageMetadata("en", slug);
}

export default async function EnglishToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ToolDetailPageShell slug={slug} forceLocale="en" />;
}
