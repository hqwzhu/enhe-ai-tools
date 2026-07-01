import { generateProductDemoListingMetadata, ProductDemoListingPageShell } from "@/app/product-demos/page-shell";
import { PublicSiteChrome } from "@/components/public-site-chrome";

export const revalidate = 300;

export async function generateMetadata() {
  return generateProductDemoListingMetadata("en");
}

export default async function EnglishProductDemosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <PublicSiteChrome forceLocale="en">
      <ProductDemoListingPageShell forceLocale="en" searchParams={searchParams} />
    </PublicSiteChrome>
  );
}
