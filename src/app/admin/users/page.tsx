import type { Prisma } from "@prisma/client";
import { adjustVipAdminAction, resetUserPasswordAction, updateUserAdminAction } from "@/app/admin/actions";
import { AdminSection, Field, inputClass, selectClass, SubmitButton } from "@/app/admin/admin-ui";
import { prisma } from "@/lib/db";

type AdminUsersSearchParams = Promise<Record<string, string | undefined>>;

export default async function AdminUsersPage({ searchParams }: { searchParams: AdminUsersSearchParams }) {
  const params = await searchParams;
  const keyword = params.q?.trim();
  const role = params.role;
  const status = params.status;

  const where: Prisma.UserWhereInput = {
    ...(role === "admin" || role === "user" ? { role } : {}),
    ...(status === "active" || status === "disabled" ? { status } : {}),
    ...(keyword
      ? {
          OR: [
            { email: { contains: keyword, mode: "insensitive" } },
            { phone: { contains: keyword, mode: "insensitive" } },
            { nickname: { contains: keyword, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const users = await prisma.user.findMany({
    where,
    include: {
      memberships: { orderBy: { createdAt: "desc" } },
      orders: true,
      vipAdjustments: { include: { admin: true }, orderBy: { createdAt: "desc" }, take: 3 }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <AdminSection title="用户管理" intro="管理注册用户、管理员角色、账号状态，并支持后台重置临时密码。">
      <form className="glass grid gap-4 rounded-2xl p-6 md:grid-cols-[1fr_160px_160px_120px]">
        <input
          name="q"
          defaultValue={keyword ?? ""}
          placeholder="搜索邮箱、手机号或昵称"
          className={inputClass}
        />
        <select name="role" defaultValue={role ?? ""} className={selectClass}>
          <option value="">全部角色</option>
          <option value="user">普通用户</option>
          <option value="admin">管理员</option>
        </select>
        <select name="status" defaultValue={status ?? ""} className={selectClass}>
          <option value="">全部状态</option>
          <option value="active">启用</option>
          <option value="disabled">禁用</option>
        </select>
        <button className="rounded-full bg-[#7AA7FF] px-5 py-3 text-sm font-semibold text-[#07101f]">筛选</button>
      </form>

      <div className="mt-8 grid gap-4">
        {users.map((user) => (
          <div key={user.id} className="glass rounded-2xl p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">{user.nickname || user.email || user.phone || user.id}</p>
                <p className="mt-2 text-sm text-[#8B95A7]">
                  {user.email ?? "未绑定邮箱"} · {user.phone ?? "未绑定手机号"}
                </p>
              </div>
              <div className="grid gap-1 text-right text-sm text-[#8B95A7]">
                <span>{user.role === "admin" ? "管理员" : "普通用户"} · {user.status === "active" ? "启用" : "禁用"}</span>
                <span>{user.memberships.length} 条会员记录 · {user.orders.length} 个订单</span>
                <span>注册于 {user.createdAt.toLocaleDateString("zh-CN")}</span>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
              <form action={updateUserAdminAction} className="grid gap-4 md:grid-cols-3">
                <input type="hidden" name="id" value={user.id} />
                <Field label="昵称">
                  <input name="nickname" defaultValue={user.nickname ?? ""} className={inputClass} />
                </Field>
                <Field label="角色">
                  <select name="role" defaultValue={user.role} className={selectClass}>
                    <option value="user">普通用户</option>
                    <option value="admin">管理员</option>
                  </select>
                </Field>
                <Field label="状态">
                  <select name="status" defaultValue={user.status} className={selectClass}>
                    <option value="active">启用</option>
                    <option value="disabled">禁用</option>
                  </select>
                </Field>
                <div className="md:col-span-3">
                  <SubmitButton>保存用户</SubmitButton>
                </div>
              </form>

              <form action={resetUserPasswordAction} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <input type="hidden" name="id" value={user.id} />
                <Field label="重置密码">
                  <input
                    name="password"
                    type="password"
                    minLength={8}
                    required
                    placeholder="至少 8 位临时密码"
                    className={inputClass}
                  />
                </Field>
                <div className="mt-4">
                  <SubmitButton>重置密码</SubmitButton>
                </div>
              </form>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
              <form action={adjustVipAdminAction} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <input type="hidden" name="userId" value={user.id} />
                <h3 className="mb-4 font-semibold">手动调整 VIP</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="操作类型">
                    <select name="actionType" className={selectClass}>
                      <option value="grant">开通 / 延长</option>
                      <option value="cancel">取消 VIP</option>
                    </select>
                  </Field>
                  <Field label="VIP 时长">
                    <select name="durationDays" defaultValue={30} className={selectClass}>
                      <option value={7}>7天VIP</option>
                      <option value={30}>1个月VIP</option>
                      <option value={180}>6个月VIP</option>
                      <option value={365}>12个月VIP</option>
                      <option value={0}>永久VIP</option>
                    </select>
                  </Field>
                </div>
                <Field label="操作原因">
                  <input name="reason" required minLength={2} placeholder="例如：线下补单 / 售后补偿 / 违规取消" className={inputClass} />
                </Field>
                <div className="mt-4">
                  <SubmitButton>保存 VIP 调整</SubmitButton>
                </div>
              </form>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="mb-4 font-semibold">VIP 调整记录</h3>
                <div className="space-y-3 text-sm text-[#8B95A7]">
                  {user.vipAdjustments.length ? user.vipAdjustments.map((log) => (
                    <p key={log.id}>
                      {log.actionType} · {log.reason} · {log.admin.email ?? log.admin.id} · {log.createdAt.toLocaleString("zh-CN")}
                    </p>
                  )) : <p>暂无手动调整记录。</p>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminSection>
  );
}
