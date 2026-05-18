import { Container, EmptyState, SectionTitle } from "@/components/ui";
import { ToolCard } from "@/components/tool-card";
import { prisma } from "@/lib/db";

export default async function OnlineToolsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const keyword = params.q;
  const categoryId = params.category;
  const vip = params.vip;
  const sort = params.sort;
  const [categories, tools] = await Promise.all([
    prisma.toolCategory.findMany({ where: { type: "online", status: "active" }, orderBy: { sortOrder: "asc" } }),
    prisma.tool.findMany({
      where: {
        type: "online",
        status: "published",
        ...(categoryId ? { categoryId } : {}),
        ...(vip === "vip" ? { isVipRequired: true } : vip === "free" ? { isVipRequired: false } : {}),
        ...(keyword ? { OR: [{ name: { contains: keyword, mode: "insensitive" } }, { shortDescription: { contains: keyword, mode: "insensitive" } }] } : {})
      },
      include: { category: true },
      orderBy: sort === "hot" ? { usageCount: "desc" } : { createdAt: "desc" }
    })
  ]);
  return (
    <Container className="py-14">
      <SectionTitle title="在线网页工具" intro="浏览器内使用的在线工具，使用入口会经过服务端 VIP 权限校验。" />
      <form className="glass grid gap-3 rounded-2xl p-4 md:grid-cols-[1fr_180px_160px_140px]">
        <input name="q" placeholder="搜索关键词" className="rounded-xl border border-white/12 bg-white/8 px-4 py-3 outline-none" />
        <select name="category" className="rounded-xl border border-white/12 bg-[#111827] px-4 py-3">
          <option value="">全部分类</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <select name="vip" className="rounded-xl border border-white/12 bg-[#111827] px-4 py-3">
          <option value="">全部权限</option>
          <option value="vip">VIP</option>
          <option value="free">免费</option>
        </select>
        <select name="sort" className="rounded-xl border border-white/12 bg-[#111827] px-4 py-3">
          <option value="latest">最新</option>
          <option value="hot">热门</option>
        </select>
        <button className="rounded-full bg-[#7AA7FF] px-5 py-3 font-semibold text-[#07101f] md:col-span-4">筛选</button>
      </form>
      {tools.length ? <div className="mt-8 grid gap-5 md:grid-cols-3">{tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div> : <EmptyState title="暂无工具" text="请调整筛选条件或在后台发布工具。" />}
    </Container>
  );
}
