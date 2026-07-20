import {
  generateProductPathMetadata,
  generateProductPathStaticParams,
  ProductPathPageShell,
} from "@/app/product-paths/[slug]/page-shell";
import { PublicSiteChrome } from "@/components/public-site-chrome";

export const revalidate = 300;

export function generateStaticParams() {
  return generateProductPathStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return generateProductPathMetadata(slug, "zh");
}

export default async function ProductPathPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <PublicSiteChrome forceLocale="zh">
      <ProductPathPageShell slug={slug} forceLocale="zh" />
    </PublicSiteChrome>
  );
}
