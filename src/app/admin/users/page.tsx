import Link from "next/link";
import { AdminSection, inputClass, selectClass } from "@/app/admin/admin-ui";
import { buildAdminUserPageHref, buildAdminUserWhere, parseAdminUserListParams } from "@/lib/admin-list";
import { prisma } from "@/lib/db";

type AdminUsersSearchParams = Promise<Record<string, string | undefined>>;

function roleLabel(role: string) {
  return role === "admin" ? "管理员" : "普通用户";
}

function statusLabel(status: string) {
  return status === "active" ? "启用" : "禁用";
}

export default async function AdminUsersPage({ searchParams }: { searchParams: AdminUsersSearchParams }) {
  const params = await searchParams;
  const filters = parseAdminUserListParams(params);
  const where = buildAdminUserWhere(filters);
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        memberships: { orderBy: [{ isLifetime: "desc" }, { endTime: "desc" }, { createdAt: "desc" }], take: 1 },
        _count: { select: { memberships: true, orders: true, comments: true } }
      },
      orderBy: { createdAt: "desc" },
      skip: filters.skip,
      take: filters.take
    }),
    prisma.user.count({ where })
  ]);
  const pageCount = Math.max(1, Math.ceil(total / filters.pageSize));

  return (
    <AdminSection title="用户管理" intro="以清单模式管理注册用户。点击查看/编辑进入单独详情页，保留角色、状态、重置密码和 VIP 调整功能。">
      {params.deleted ? (
        <p className="mb-5 rounded-xl border border-[#48F5D3]/30 bg-[#48F5D3]/10 px-4 py-3 text-sm text-[#48F5D3]">
          用户已删除。
        </p>
      ) : null}
      {params.error ? (
        <p className="mb-5 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          操作失败：{params.error}
        </p>
      ) : null}

      <form className="glass grid gap-4 rounded-2xl p-6 md:grid-cols-[1fr_160px_160px_120px]">
        <input
          name="q"
          defaultValue={filters.q}
          placeholder="搜索邮箱、手机号或昵称"
          className={inputClass}
        />
        <select name="role" defaultValue={filters.role ?? ""} className={selectClass}>
          <option value="">全部角色</option>
          <option value="user">普通用户</option>
          <option value="admin">管理员</option>
        </select>
        <select name="status" defaultValue={filters.status ?? ""} className={selectClass}>
          <option value="">全部状态</option>
          <option value="active">启用</option>
          <option value="disabled">禁用</option>
        </select>
        <button className="rounded-full bg-[#7AA7FF] px-5 py-3 text-sm font-semibold text-[#07101f]">筛选</button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-[#8B95A7]">
        <span>共 {total} 个用户，当前第 {filters.page} / {pageCount} 页</span>
        <div className="flex gap-2">
          <Link
            href={buildAdminUserPageHref(filters, filters.page - 1)}
            aria-disabled={filters.page <= 1}
            className={`rounded-full border border-white/12 px-4 py-2 ${filters.page <= 1 ? "pointer-events-none opacity-40" : ""}`}
          >
            上一页
          </Link>
          <Link
            href={buildAdminUserPageHref(filters, filters.page + 1)}
            aria-disabled={filters.page >= pageCount}
            className={`rounded-full border border-white/12 px-4 py-2 ${filters.page >= pageCount ? "pointer-events-none opacity-40" : ""}`}
          >
            下一页
          </Link>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/12 bg-white/6">
        <div className="grid min-w-[920px] grid-cols-[1.6fr_0.8fr_0.8fr_1fr_0.6fr] gap-4 border-b border-white/10 px-5 py-3 text-xs uppercase tracking-wide text-[#8B95A7]">
          <span>用户</span>
          <span>角色</span>
          <span>状态</span>
          <span>会员 / 数据</span>
          <span className="text-right">操作</span>
        </div>
        {users.length ? (
          <div className="min-w-[920px] divide-y divide-white/10">
            {users.map((user) => {
              const latestMembership = user.memberships[0];
              return (
                <div key={user.id} className="grid grid-cols-[1.6fr_0.8fr_0.8fr_1fr_0.6fr] gap-4 px-5 py-4 text-sm transition hover:bg-white/5">
                  <div>
                    <p className="font-semibold text-[#E8EEF8]">{user.nickname || user.email || user.phone || user.id}</p>
                    <p className="mt-1 text-xs text-[#8B95A7]">{user.email ?? "未绑定邮箱"} · {user.phone ?? "未绑定手机号"}</p>
                    <p className="mt-1 text-xs text-[#8B95A7]">注册于 {user.createdAt.toLocaleDateString("zh-CN")}</p>
                  </div>
                  <div className="text-[#C5D0E2]">{roleLabel(user.role)}</div>
                  <div className="text-[#C5D0E2]">{statusLabel(user.status)}</div>
                  <div className="text-xs leading-6 text-[#8B95A7]">
                    <p>{latestMembership ? `${latestMembership.vipType} · ${latestMembership.status}` : "暂无会员"}</p>
                    <p>{user._count.memberships} 条会员记录 · {user._count.orders} 个订单 · {user._count.comments} 条评论</p>
                  </div>
                  <div className="text-right">
                    <Link href={`/admin/users/${user.id}`} className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-[#E8EEF8] transition hover:border-[#48F5D3]/50 hover:text-[#48F5D3]">
                      查看/编辑
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-5 py-10 text-center text-sm text-[#8B95A7]">暂无匹配用户。</div>
        )}
      </div>
    </AdminSection>
  );
}
