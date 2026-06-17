import { generateSoftwarePageMetadata, SoftwarePageShell } from "@/app/software/page-shell";

export const revalidate = 300;

export async function generateMetadata() {
  return generateSoftwarePageMetadata("en");
}

export default async function EnglishSoftwarePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return <SoftwarePageShell searchParams={searchParams} forceLocale="en" />;
}
