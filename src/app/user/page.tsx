import Link from "next/link";
import { changePasswordAction, logoutAction } from "@/app/actions";
import { Container, SectionTitle } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getActiveMembership } from "@/lib/membership";
import { getStatusLabel, orderStatusLabels, proofStatusLabels } from "@/lib/status-labels";
import { formatCurrency } from "@/lib/utils";

type UserCenterSearchParams = Promise<Record<string, string | undefined>>;

export default async function UserCenterPage({ searchParams }: { searchParams: UserCenterSearchParams }) {
  const params = await searchParams;
  const passwordMessage = getPasswordMessage(params.password);
  const user = await requireUser();
  const [membership, orders, downloads, usages, comments] = await Promise.all([
    getActiveMembership(user.id),
    prisma.order.findMany({
      where: { userId: user.id },
      include: { plan: true, tool: true, paymentProof: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.downloadLog.findMany({
      where: { userId: user.id },
      include: { tool: true },
      orderBy: { createdAt: "desc" },
      take: 10
    }),
    prisma.toolUsageLog.findMany({
      where: { userId: user.id },
      include: { tool: true },
      orderBy: { createdAt: "desc" },
      take: 10
    }),
    prisma.comment.findMany({
      where: { userId: user.id },
      include: { tool: true },
      orderBy: { createdAt: "desc" },
      take: 10
    })
  ]);

  return (
    <Container className="py-14">
      <div className="mb-8 flex items-center justify-between gap-4">
        <SectionTitle
          title="用户中心"
          intro="查看会员、订单、下载记录、在线工具使用记录、评论与账号安全设置。"
        />
        <form action={logoutAction}>
          <button className="rounded-full border border-white/12 px-5 py-3 text-sm">退出登录</button>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <Panel title="我的会员">
            {membership ? (
              <p className="leading-7 text-[#8B95A7]">
                {membership.vipType} ·{" "}
                {membership.isLifetime ? "永久有效" : `到期 ${membership.endTime?.toLocaleDateString("zh-CN")}`}
              </p>
            ) : (
              <p className="leading-7 text-[#8B95A7]">
                当前还不是 VIP，可在会员价格页创建订单，付款后等待后台审核开通。
              </p>
            )}
            <Link href="/pricing" className="mt-5 inline-flex rounded-full bg-[#7AA7FF] px-4 py-2 text-sm font-semibold text-[#07101f]">
              查看会员套餐
            </Link>
          </Panel>

          <Panel title="账号设置">
            <p className="text-[#E8EEF8]">{user.email ?? user.phone}</p>
            <p className="mt-2 text-sm text-[#8B95A7]">角色：{user.role === "admin" ? "管理员" : "普通用户"}</p>
            {passwordMessage ? (
              <p className={`mt-4 rounded-xl border px-4 py-3 text-sm ${passwordMessage.type === "success" ? "border-[#48F5D3]/30 bg-[#48F5D3]/10 text-[#48F5D3]" : "border-red-400/30 bg-red-400/10 text-red-100"}`}>
                {passwordMessage.text}
              </p>
            ) : null}
            <form action={changePasswordAction} className="mt-5 grid gap-3">
              <input
                name="currentPassword"
                type="password"
                required
                placeholder="当前密码"
                className="rounded-xl border border-white/12 bg-white/8 px-4 py-3 text-sm outline-none focus:border-[#7AA7FF]"
              />
              <input
                name="newPassword"
                type="password"
                minLength={8}
                required
                placeholder="新密码，至少 8 位"
                className="rounded-xl border border-white/12 bg-white/8 px-4 py-3 text-sm outline-none focus:border-[#7AA7FF]"
              />
              <input
                name="confirmPassword"
                type="password"
                minLength={8}
                required
                placeholder="再次输入新密码"
                className="rounded-xl border border-white/12 bg-white/8 px-4 py-3 text-sm outline-none focus:border-[#7AA7FF]"
              />
              <button className="rounded-full bg-[#7AA7FF] px-5 py-3 text-sm font-semibold text-[#07101f]">修改密码</button>
            </form>
          </Panel>
        </aside>

        <div className="space-y-6">
          <Panel title="我的订单">
            <div className="space-y-3">
              {orders.length ? (
                orders.map((order) => (
                  <div key={order.id} className="rounded-xl border border-white/10 bg-white/8 p-4">
                    <div className="flex flex-wrap justify-between gap-3">
                      <span>{order.orderNo}</span>
                      <span className="text-[#FFB86B]">{formatCurrency(order.amount.toString())}</span>
                    </div>
                    <p className="mt-2 text-sm text-[#8B95A7]">
                      {order.plan?.name ?? order.tool?.name ?? "订单项目"} ·{" "}
                      {getStatusLabel(orderStatusLabels, order.orderStatus)} · 凭证{" "}
                      {getStatusLabel(proofStatusLabels, order.paymentProof?.reviewStatus)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href={`/orders/${order.id}`} className="rounded-full border border-white/12 px-3 py-1 text-xs">
                        查看详情
                      </Link>
                      {["pending_payment", "rejected"].includes(order.orderStatus) ? (
                        <Link href={`/orders/${order.id}/pay`} className="rounded-full bg-[#7AA7FF] px-3 py-1 text-xs font-semibold text-[#07101f]">
                          去付款
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyText>还没有订单记录。</EmptyText>
              )}
            </div>
          </Panel>

          <Panel title="我的下载">
            {downloads.length ? (
              downloads.map((log) => (
                <p key={log.id} className="border-b border-white/10 py-3 text-sm text-[#8B95A7]">
                  {log.tool.name} · {log.createdAt.toLocaleString("zh-CN")}
                </p>
              ))
            ) : (
              <EmptyText>还没有软件下载记录。</EmptyText>
            )}
          </Panel>

          <Panel title="我的在线工具使用">
            {usages.length ? (
              usages.map((log) => (
                <p key={log.id} className="border-b border-white/10 py-3 text-sm text-[#8B95A7]">
                  {log.tool.name} · {log.createdAt.toLocaleString("zh-CN")}
                </p>
              ))
            ) : (
              <EmptyText>还没有在线工具使用记录。</EmptyText>
            )}
          </Panel>

          <Panel title="我的评论">
            {comments.length ? (
              comments.map((comment) => (
                <p key={comment.id} className="border-b border-white/10 py-3 text-sm text-[#8B95A7]">
                  {comment.tool.name} · {comment.status} · {comment.content}
                </p>
              ))
            ) : (
              <EmptyText>还没有评论记录。</EmptyText>
            )}
          </Panel>
        </div>
      </div>
    </Container>
  );
}

function Panel({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <section className="glass rounded-2xl p-6">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function EmptyText({ children }: React.PropsWithChildren) {
  return <p className="text-sm text-[#8B95A7]">{children}</p>;
}

function getPasswordMessage(value?: string) {
  if (!value) return null;
  if (value === "changed") return { type: "success" as const, text: "密码已更新，下次登录请使用新密码。" };
  return { type: "error" as const, text: value };
}
