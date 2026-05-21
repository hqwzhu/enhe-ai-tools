import { updateCommentPinAction, updateCommentStatusAction } from "@/app/actions";
import { prisma } from "@/lib/db";

export default async function AdminCommentsPage() {
  const comments = await prisma.comment.findMany({ include: { user: true, tool: true }, orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="text-3xl font-semibold">评论管理</h1>
      <div className="mt-8 space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="glass rounded-2xl p-6">
            <p className="text-sm text-[#8B95A7]">
              {comment.tool.name} · {comment.user.email} · {comment.status} {comment.isPinned ? "· 已置顶" : ""}
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
      </div>
    </div>
  );
}
