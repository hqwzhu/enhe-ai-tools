import type { Metadata } from "next";
import Link from "next/link";
import { StructuredData } from "@/components/structured-data";
import { Container, SectionTitle } from "@/components/ui";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";
import { getPublicTutorials } from "@/lib/public-content";
import { buildBreadcrumbSchema, buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const t = getDictionary(locale);
  return buildPageMetadata({
    title: `${t.tutorials.title} - ${t.brand}`,
    description: t.tutorials.intro,
    path: "/tutorials",
    locale: locale === "en" ? "en_US" : "zh_CN"
  });
}

export default async function TutorialsPage() {
  const [tutorials, locale] = await Promise.all([
    getPublicTutorials(),
    getCurrentLocale()
  ]);
  const t = getDictionary(locale);
  const breadcrumbSchema = buildBreadcrumbSchema({
    schemaType: "BreadcrumbList",
    items: [
      { name: t.nav.home, path: "/" },
      { name: t.tutorials.title, path: "/tutorials" }
    ]
  });

  return (
    <Container className="py-14">
      <StructuredData data={breadcrumbSchema} />
      <SectionTitle as="h1" title={t.tutorials.title} intro={t.tutorials.intro} />
      <div className="grid gap-5 md:grid-cols-2">
        {tutorials.map((tutorial) => (
          <Link key={tutorial.id} href={`/tools/${tutorial.tool.slug}`} className="surface-panel p-6 transition hover:-translate-y-1 hover:border-[var(--marketing-accent)]/45">
            <p className="text-sm font-semibold text-[var(--marketing-accent)]">{tutorial.tool.name}</p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--marketing-text)]">{tutorial.title}</h2>
            <p className="mt-3 line-clamp-3 leading-7 text-[var(--marketing-muted)]">{tutorial.content}</p>
          </Link>
        ))}
      </div>
    </Container>
  );
}
