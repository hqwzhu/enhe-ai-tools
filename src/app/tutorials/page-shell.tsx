import type { Metadata } from "next";
import Link from "next/link";
import { StructuredData } from "@/components/structured-data";
import { Container, SectionTitle } from "@/components/ui";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import { getPublicTutorials } from "@/lib/public-content";
import { publicPageCacheSeconds } from "@/lib/public-routes";
import { buildBreadcrumbSchema, buildLocalePath, buildPageMetadata } from "@/lib/seo";

export const tutorialsPageRevalidate = publicPageCacheSeconds;

export async function generateTutorialsPageMetadata(forceLocale: Locale): Promise<Metadata> {
  const t = getDictionary(forceLocale);
  return buildPageMetadata({
    title: `${t.tutorials.title} - ${t.brand}`,
    description: t.tutorials.intro,
    path: "/tutorials",
    locale: forceLocale === "en" ? "en_US" : "zh_CN",
    localeKey: forceLocale
  });
}

export async function TutorialsPageShell({ forceLocale }: { forceLocale: Locale }) {
  const tutorials = await getPublicTutorials();
  const t = getDictionary(forceLocale);
  const breadcrumbSchema = buildBreadcrumbSchema({
    schemaType: "BreadcrumbList",
    items: [
      { name: t.nav.home, path: forceLocale === "en" ? "/en" : "/" },
      { name: t.tutorials.title, path: forceLocale === "en" ? "/en/tutorials" : "/tutorials" }
    ]
  });

  return (
    <Container className="py-14">
      <StructuredData data={breadcrumbSchema} />
      <SectionTitle as="h1" title={t.tutorials.title} intro={t.tutorials.intro} />
      <div className="grid gap-5 md:grid-cols-2">
        {tutorials.map((tutorial) => (
          <Link key={tutorial.id} href={buildLocalePath(`/tools/${tutorial.tool.slug}`, forceLocale)} className="surface-panel p-6 transition hover:-translate-y-1 hover:border-[var(--marketing-accent)]/45">
            <p className="text-sm font-semibold text-[var(--marketing-accent)]">{tutorial.tool.name}</p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--marketing-text)]">{tutorial.title}</h2>
            <p className="mt-3 line-clamp-3 leading-7 text-[var(--marketing-muted)]">{tutorial.content}</p>
          </Link>
        ))}
      </div>
    </Container>
  );
}
