export function ToolAdminList({
  title,
  tools
}: {
  title: string;
  tools: Array<{
    id: string;
    name: string;
    slug: string;
    status: string;
    isVipRequired: boolean;
    category?: { name: string } | null;
  }>;
}) {
  return (
    <div>
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-3 text-[#8B95A7]">支持新增、编辑、删除、上下架、下载文件或在线地址字段，当前页面展示数据库中的工具状态。</p>
      <div className="mt-8 space-y-3">
        {tools.map((tool) => (
          <div key={tool.id} className="glass rounded-2xl p-5">
            <p className="font-semibold">{tool.name}</p>
            <p className="mt-2 text-sm text-[#8B95A7]">{tool.slug} · {tool.category?.name ?? "未分类"} · {tool.status} · {tool.isVipRequired ? "VIP" : "免费"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
