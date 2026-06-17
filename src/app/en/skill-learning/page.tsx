import { generateSkillLearningPageMetadata, SkillLearningPageShell } from "@/app/skill-learning/page-shell";

export const revalidate = 300;

export async function generateMetadata() {
  return generateSkillLearningPageMetadata("en");
}

export default async function EnglishSkillLearningPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return <SkillLearningPageShell searchParams={searchParams} forceLocale="en" />;
}
