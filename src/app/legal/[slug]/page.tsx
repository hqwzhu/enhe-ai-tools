import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { getLegalPage, legalPages } from "@/lib/legal";

export function generateStaticParams() {
  return legalPages.map((page) => ({ slug: page.slug }));
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getLegalPage(slug);
  if (!page) notFound();

  return (
    <Container className="py-14">
      <article className="mx-auto max-w-4xl">
        <p className="mb-4 text-sm font-semibold text-[#48F5D3]">ENHE Compliance</p>
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
