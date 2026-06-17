import { generateTutorialsPageMetadata, TutorialsPageShell } from "@/app/tutorials/page-shell";

export const revalidate = 300;

export async function generateMetadata() {
  return generateTutorialsPageMetadata("en");
}

export default async function EnglishTutorialsPage() {
  return <TutorialsPageShell forceLocale="en" />;
}
