import Link from "next/link";
import { notFound } from "next/navigation";
import {
  adjustVipAdminAction,
  deleteUserAdminAction,
  resetUserPasswordAction,
  updateUserAdminAction
} from "@/app/admin/actions";
import { AdminSection, DangerButton, Field, inputClass, selectClass, SubmitButton } from "@/app/admin/admin-ui";
import { prisma } from "@/lib/db";

type AdminUserDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function AdminUserDetailPage({ params, searchParams }: AdminUserDetailPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      memberships: { orderBy: { createdAt: "desc" } },
      vipAdjustments: { include: { admin: true }, orderBy: { createdAt: "desc" }, take: 10 },
      _count: { select: { memberships: true, orders: true, comments: true, downloadLogs: true, toolUsageLogs: true } }
    }
  });
  if (!user) notFound();

  return (
    <AdminSection title="用户详情" intro="编辑用户基础信息、重置密码、手动调整 VIP，或在确认风险后删除用户账号。">
      {query.error ? (
        <p className="mb-5 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          操作失败：{query.error}
        </p>
      ) : null}

      <div className="mb-6">
        <Link href="/admin/users" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-[#E8EEF8] transition hover:border-[#48F5D3]/50 hover:text-[#48F5D3]">
          返回用户清单
        </Link>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold">{user.nickname || user.email || user.phone || user.id}</p>
            <p className="mt-2 text-sm text-[#8B95A7]">
              {user.email ?? "未绑定邮箱"} · {user.phone ?? "未绑定手机号"}
            </p>
          </div>
          <div className="grid gap-1 text-right text-sm text-[#8B95A7]">
            <span>{user.role === "admin" ? "管理员" : "普通用户"} · {user.status === "active" ? "启用" : "禁用"}</span>
            <span>{user._count.memberships} 条会员记录 · {user._count.orders} 个订单 · {user._count.comments} 条评论</span>
            <span>下载 {user._count.downloadLogs} 次 · 在线工具使用 {user._count.toolUsageLogs} 次</span>
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

        <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-400/10 p-4">
          <h3 className="font-semibold text-red-100">删除用户</h3>
          <p className="mt-2 text-sm leading-6 text-red-100/80">
            删除用户会清理该用户的会员、订单、支付凭证、评论、下载记录、在线工具使用记录和登录会话。当前登录管理员不能删除自己，系统也会阻止删除最后一个管理员。
          </p>
          <form action={deleteUserAdminAction} className="mt-4">
            <input type="hidden" name="id" value={user.id} />
            <label className="mb-4 flex gap-3 text-sm text-red-100">
              <input name="confirmDelete" type="checkbox" required value="DELETE_USER" className="mt-1" />
              <span>我已确认该用户可以删除，并理解相关业务记录会同步清理。</span>
            </label>
            <DangerButton>删除用户</DangerButton>
          </form>
        </div>
      </div>
    </AdminSection>
  );
}
