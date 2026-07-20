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
  return generateProductPathMetadata(slug, "en");
}

export default async function EnglishProductPathPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <PublicSiteChrome forceLocale="en">
      <ProductPathPageShell slug={slug} forceLocale="en" />
    </PublicSiteChrome>
  );
}
