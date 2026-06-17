import { generateHomePageMetadata, HomePageShell } from "@/app/page-shell";

export const revalidate = 300;

export async function generateMetadata() {
  return generateHomePageMetadata("en");
}

export default async function EnglishHomePage() {
  return <HomePageShell forceLocale="en" />;
}
