import { prisma } from "@/lib/db";

export default async function AdminCategoriesPage() {
  const categories = await prisma.toolCategory.findMany({ orderBy: [{ type: "asc" }, { sortOrder: "asc" }] });
  return (
    <div>
      <h1 className="text-3xl font-semibold">工具分类管理</h1>
      <p className="mt-3 text-[#8B95A7]">分类按 software / online 区分，前台子分类筛选全部来自这里。</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {categories.map((category) => (
          <div key={category.id} className="glass rounded-2xl p-6">
            <p className="text-xl font-semibold">{category.name}</p>
            <p className="mt-2 text-sm text-[#8B95A7]">{category.type} · {category.status} · 排序 {category.sortOrder}</p>
            <p className="mt-3 text-sm leading-6 text-[#8B95A7]">{category.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
