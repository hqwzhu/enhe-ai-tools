import Link from "next/link";
import { updateCommentPinAction, updateCommentStatusAction } from "@/app/actions";
import { inputClass, selectClass } from "@/app/admin/admin-ui";
import { buildAdminCommentPageHref, buildAdminCommentWhere, parseAdminCommentListParams } from "@/lib/admin-list";
import { prisma } from "@/lib/db";

type AdminCommentsPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function AdminCommentsPage({ searchParams }: AdminCommentsPageProps) {
  const params = await searchParams;
  const filters = parseAdminCommentListParams(params);
  const where = buildAdminCommentWhere(filters);
  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      include: { user: true, tool: true },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      skip: filters.skip,
      take: filters.take
    }),
    prisma.comment.count({ where })
  ]);
  const pageCount = Math.max(1, Math.ceil(total / filters.pageSize));

  return (
    <div>
      <h1 className="text-3xl font-semibold">评论管理</h1>

      <form className="glass mt-6 grid gap-3 rounded-2xl p-5 md:grid-cols-[1fr_180px_160px_auto]" action="/admin/comments">
        <input name="q" defaultValue={filters.q} placeholder="搜索评论、工具、用户" className={inputClass} />
        <select name="status" defaultValue={filters.status ?? ""} className={selectClass}>
          <option value="">全部状态</option>
          <option value="pending">待审核</option>
          <option value="approved">审核通过</option>
          <option value="rejected">已驳回</option>
          <option value="deleted">已删除</option>
        </select>
        <select name="pinned" defaultValue={filters.pinned === undefined ? "" : String(filters.pinned)} className={selectClass}>
          <option value="">全部置顶</option>
          <option value="true">已置顶</option>
          <option value="false">未置顶</option>
        </select>
        <button className="rounded-full border border-white/12 px-5 py-3 text-sm font-semibold text-[#E8EEF8]">筛选</button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-[#8B95A7]">
        <span>共 {total} 条评论，当前第 {filters.page} / {pageCount} 页</span>
        <div className="flex gap-2">
          <Link
            href={buildAdminCommentPageHref(filters, filters.page - 1)}
            aria-disabled={filters.page <= 1}
            className={`rounded-full border border-white/12 px-4 py-2 ${filters.page <= 1 ? "pointer-events-none opacity-40" : ""}`}
          >
            上一页
          </Link>
          <Link
            href={buildAdminCommentPageHref(filters, filters.page + 1)}
            aria-disabled={filters.page >= pageCount}
            className={`rounded-full border border-white/12 px-4 py-2 ${filters.page >= pageCount ? "pointer-events-none opacity-40" : ""}`}
          >
            下一页
          </Link>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="glass rounded-2xl p-6">
            <p className="text-sm text-[#8B95A7]">
              {comment.tool.name} · {comment.user.email ?? comment.user.phone ?? comment.user.id} · {comment.status}
              {comment.isPinned ? " · 已置顶" : ""}
            </p>
            <p className="mt-3 leading-7">{comment.content}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <form action={updateCommentStatusAction} className="flex flex-wrap gap-3">
                <input type="hidden" name="id" value={comment.id} />
                <button name="status" value="approved" className="rounded-full bg-[#48F5D3] px-5 py-2 text-sm font-semibold text-[#05110e]">审核通过</button>
                <button name="status" value="rejected" className="rounded-full border border-white/12 px-5 py-2 text-sm">驳回</button>
                <button name="status" value="deleted" className="rounded-full border border-white/12 px-5 py-2 text-sm">删除</button>
              </form>
              <form action={updateCommentPinAction}>
                <input type="hidden" name="id" value={comment.id} />
                <button
                  name="isPinned"
                  value={comment.isPinned ? "false" : "true"}
                  className="rounded-full border border-[#FFB86B]/40 px-5 py-2 text-sm text-[#FFB86B]"
                >
                  {comment.isPinned ? "取消置顶" : "置顶"}
                </button>
              </form>
            </div>
          </div>
        ))}
        {comments.length === 0 ? <div className="glass rounded-2xl p-8 text-center text-sm text-[#8B95A7]">暂无匹配评论。</div> : null}
      </div>
    </div>
  );
}
