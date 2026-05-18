import { prisma } from "@/lib/db";

export default async function AdminTutorialsPage() {
  const tutorials = await prisma.tutorial.findMany({ include: { tool: true }, orderBy: { sortOrder: "asc" } });
  return (
    <div>
      <h1 className="text-3xl font-semibold">教程管理</h1>
      <div className="mt-8 space-y-3">
        {tutorials.map((tutorial) => (
          <div key={tutorial.id} className="glass rounded-2xl p-5">
            <p className="font-semibold">{tutorial.title}</p>
            <p className="mt-2 text-sm text-[#8B95A7]">{tutorial.tool.name} · {tutorial.status} · 排序 {tutorial.sortOrder}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
