import { generateProductDemoListingMetadata, ProductDemoListingPageShell } from "@/app/product-demos/page-shell";
import { PublicSiteChrome } from "@/components/public-site-chrome";

export const revalidate = 300;

export async function generateMetadata() {
  return generateProductDemoListingMetadata("zh");
}

export default async function ProductDemosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <PublicSiteChrome forceLocale="zh">
      <ProductDemoListingPageShell forceLocale="zh" searchParams={searchParams} />
    </PublicSiteChrome>
  );
}
