import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StructuredData } from "@/components/structured-data";
import { Container } from "@/components/ui";
import { getLegalPage, legalPages } from "@/lib/legal";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";
import { getPublicLegalPage } from "@/lib/public-content";
import { buildBreadcrumbSchema, buildPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return legalPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, getCurrentLocale()]);
  const t = getDictionary(locale);
  const page = await getPublicLegalPage(locale, slug);

  if (!page) {
    return buildPageMetadata({
      title: `${t.footer.helpSupport} - ${t.brand}`,
      description: t.listing.emptyText,
      path: `/legal/${slug}`,
      locale: locale === "en" ? "en_US" : "zh_CN"
    });
  }

  return buildPageMetadata({
    title: `${page.title} | ${t.brand}`,
    description: page.summary,
    path: `/legal/${slug}`,
    locale: locale === "en" ? "en_US" : "zh_CN"
  });
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getCurrentLocale();
  const t = getDictionary(locale);
  const page = await getPublicLegalPage(locale, slug);
  if (!page) notFound();
  const breadcrumbSchema = buildBreadcrumbSchema({
    schemaType: "BreadcrumbList",
    items: [
      { name: t.nav.home, path: "/" },
      { name: t.footer.helpSupport, path: "/legal/user-agreement" },
      { name: page.title, path: `/legal/${slug}` }
    ]
  });

  return (
    <Container className="py-14">
      <StructuredData data={breadcrumbSchema} />
      <article className="mx-auto max-w-4xl">
        <p className="mb-4 text-sm font-semibold text-[var(--marketing-accent)]">ENHE Compliance</p>
        <h1 className="text-4xl font-semibold text-white">{page.title}</h1>
        <p className="mt-5 leading-8 text-[#8B95A7]">{page.summary}</p>
        <div className="mt-10 space-y-8">
          {page.sections.map((section) => (
            <section key={section.title} className="glass rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-[#E8EEF8]">{section.title}</h2>
              <div className="mt-4 space-y-4 text-sm leading-8 text-[#A7B0C2]">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </Container>
  );
}
