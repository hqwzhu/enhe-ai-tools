import { generateProductDemoDetailMetadata, ProductDemoDetailPageShell } from "@/app/product-demos/[slug]/page-shell";
import { PublicSiteChrome } from "@/components/public-site-chrome";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return generateProductDemoDetailMetadata("zh", slug);
}

export default async function ProductDemoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <PublicSiteChrome forceLocale="zh">
      <ProductDemoDetailPageShell slug={slug} forceLocale="zh" />
    </PublicSiteChrome>
  );
}
