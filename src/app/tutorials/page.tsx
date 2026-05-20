import Link from "next/link";
import { Container, SectionTitle } from "@/components/ui";
import { prisma } from "@/lib/db";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";

export default async function TutorialsPage() {
  const [tutorials, locale] = await Promise.all([
    prisma.tutorial.findMany({
      where: { status: "active", tool: { status: "published" } },
      include: { tool: true },
      orderBy: { sortOrder: "asc" }
    }),
    getCurrentLocale()
  ]);
  const t = getDictionary(locale);

  return (
    <Container className="py-14">
      <SectionTitle title={t.tutorials.title} intro={t.tutorials.intro} />
      <div className="grid gap-5 md:grid-cols-2">
        {tutorials.map((tutorial) => (
          <Link key={tutorial.id} href={`/tools/${tutorial.tool.slug}`} className="glass rounded-2xl p-6 transition hover:-translate-y-1">
            <p className="text-sm text-[#48F5D3]">{tutorial.tool.name}</p>
            <h2 className="mt-2 text-2xl font-semibold">{tutorial.title}</h2>
            <p className="mt-3 line-clamp-3 leading-7 text-[#8B95A7]">{tutorial.content}</p>
          </Link>
        ))}
      </div>
    </Container>
  );
}
