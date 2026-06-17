import { generatePricingPageMetadata, PricingPageShell } from "@/app/pricing/page-shell";

export const revalidate = 300;

export async function generateMetadata() {
  return generatePricingPageMetadata("en");
}

export default async function EnglishPricingPage() {
  return <PricingPageShell forceLocale="en" />;
}
