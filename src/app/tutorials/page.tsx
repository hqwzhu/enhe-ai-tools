import Link from "next/link";
import { Container, SectionTitle } from "@/components/ui";
import { prisma } from "@/lib/db";

export default async function TutorialsPage() {
  const tutorials = await prisma.tutorial.findMany({
    where: { status: "active", tool: { status: "published" } },
    include: { tool: true },
    orderBy: { sortOrder: "asc" }
  });
  return (
    <Container className="py-14">
      <SectionTitle title="使用教程" intro="按工具独立管理的教程内容，支持图片、视频链接、步骤排序和常见错误说明扩展。" />
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
