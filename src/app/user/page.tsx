import Link from "next/link";
import { cancelOrderAction, changePasswordAction, logoutAction } from "@/app/actions";
import { Container, SectionTitle } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCurrentLocale, getDictionary, type Locale } from "@/lib/i18n";
import { getActiveMembership } from "@/lib/membership";
import { canUserCancelOrder } from "@/lib/order-rules";
import { formatCurrency } from "@/lib/utils";

type UserCenterSearchParams = Promise<Record<string, string | undefined>>;

export default async function UserCenterPage({ searchParams }: { searchParams: UserCenterSearchParams }) {
  const params = await searchParams;
  const locale = await getCurrentLocale();
  const t = getDictionary(locale);
  const passwordMessage = getPasswordMessage(params.password, locale);
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
        <SectionTitle title={t.userCenter.title} intro={t.userCenter.intro} />
        <form action={logoutAction}>
          <button className="rounded-full border border-white/12 px-5 py-3 text-sm">{t.userCenter.logout}</button>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <Panel title={t.userCenter.membership}>
            {membership ? (
              <p className="leading-7 text-[#8B95A7]">
                {membership.vipType} ·{" "}
                {membership.isLifetime
                  ? t.userCenter.lifetime
                  : t.userCenter.expiresAt.replace("{date}", formatDate(membership.endTime, locale))}
              </p>
            ) : (
              <p className="leading-7 text-[#8B95A7]">{t.userCenter.noMembership}</p>
            )}
            <Link href="/pricing" className="mt-5 inline-flex rounded-full bg-[#7AA7FF] px-4 py-2 text-sm font-semibold text-[#07101f]">
              {t.userCenter.viewPlans}
            </Link>
          </Panel>

          <Panel title={t.userCenter.accountSettings}>
            <p className="text-[#E8EEF8]">{user.email ?? user.phone}</p>
            <p className="mt-2 text-sm text-[#8B95A7]">
              {t.userCenter.role.replace("{role}", user.role === "admin" ? t.userCenter.admin : t.userCenter.user)}
            </p>
            {passwordMessage ? (
              <p className={`mt-4 rounded-xl border px-4 py-3 text-sm ${passwordMessage.type === "success" ? "border-[#48F5D3]/30 bg-[#48F5D3]/10 text-[#48F5D3]" : "border-red-400/30 bg-red-400/10 text-red-100"}`}>
                {passwordMessage.text}
              </p>
            ) : null}
            <form action={changePasswordAction} className="mt-5 grid gap-3">
              <input name="currentPassword" type="password" required placeholder={t.userCenter.currentPassword} className="rounded-xl border border-white/12 bg-white/8 px-4 py-3 text-sm outline-none focus:border-[#7AA7FF]" />
              <input name="newPassword" type="password" minLength={8} required placeholder={t.userCenter.newPassword} className="rounded-xl border border-white/12 bg-white/8 px-4 py-3 text-sm outline-none focus:border-[#7AA7FF]" />
              <input name="confirmPassword" type="password" minLength={8} required placeholder={t.userCenter.confirmPassword} className="rounded-xl border border-white/12 bg-white/8 px-4 py-3 text-sm outline-none focus:border-[#7AA7FF]" />
              <button className="rounded-full bg-[#7AA7FF] px-5 py-3 text-sm font-semibold text-[#07101f]">{t.userCenter.changePassword}</button>
            </form>
          </Panel>
        </aside>

        <div className="space-y-6">
          <Panel title={t.userCenter.orders}>
            <div className="space-y-3">
              {orders.length ? (
                orders.map((order) => (
                  <div key={order.id} className="rounded-xl border border-white/10 bg-white/8 p-4">
                    <div className="flex flex-wrap justify-between gap-3">
                      <span>{order.orderNo}</span>
                      <span className="text-[#FFB86B]">{formatCurrency(order.amount.toString())}</span>
                    </div>
                    <p className="mt-2 text-sm text-[#8B95A7]">
                      {order.plan ? formatPlanName(order.plan.name, order.plan.durationDays, locale) : order.tool?.name ?? t.userCenter.orderItem} ·{" "}
                      {formatStatus(order.orderStatus, locale)} · {t.userCenter.proof}{" "}
                      {formatStatus(order.paymentProof?.reviewStatus ?? "not_submitted", locale)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href={`/orders/${order.id}`} className="rounded-full border border-white/12 px-3 py-1 text-xs">
                        {t.userCenter.details}
                      </Link>
                      {["pending_payment", "rejected"].includes(order.orderStatus) ? (
                        <Link href={`/orders/${order.id}/pay`} className="rounded-full bg-[#7AA7FF] px-3 py-1 text-xs font-semibold text-[#07101f]">
                          {t.userCenter.payNow}
                        </Link>
                      ) : null}
                      {canUserCancelOrder(order.orderStatus) ? (
                        <form action={cancelOrderAction}>
                          <input type="hidden" name="orderId" value={order.id} />
                          <button className="rounded-full border border-white/12 px-3 py-1 text-xs">
                            取消订单
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyText>{t.userCenter.noOrders}</EmptyText>
              )}
            </div>
          </Panel>

          <Panel title={t.userCenter.downloads}>
            {downloads.length ? (
              downloads.map((log) => (
                <p key={log.id} className="border-b border-white/10 py-3 text-sm text-[#8B95A7]">
                  {log.tool.name} · {formatDateTime(log.createdAt, locale)}
                </p>
              ))
            ) : (
              <EmptyText>{t.userCenter.noDownloads}</EmptyText>
            )}
          </Panel>

          <Panel title={t.userCenter.usages}>
            {usages.length ? (
              usages.map((log) => (
                <p key={log.id} className="border-b border-white/10 py-3 text-sm text-[#8B95A7]">
                  {log.tool.name} · {formatDateTime(log.createdAt, locale)}
                </p>
              ))
            ) : (
              <EmptyText>{t.userCenter.noUsages}</EmptyText>
            )}
          </Panel>

          <Panel title={t.userCenter.comments}>
            {comments.length ? (
              comments.map((comment) => (
                <p key={comment.id} className="border-b border-white/10 py-3 text-sm text-[#8B95A7]">
                  {comment.tool.name} · {formatStatus(comment.status, locale)} · {comment.content}
                </p>
              ))
            ) : (
              <EmptyText>{t.userCenter.noComments}</EmptyText>
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

function getPasswordMessage(value: string | undefined, locale: Locale) {
  if (!value) return null;
  const t = getDictionary(locale);
  if (value === "changed") return { type: "success" as const, text: t.userCenter.passwordChanged };
  return { type: "error" as const, text: locale === "en" ? "Password update failed. Please check your input." : value };
}

function formatStatus(status: string | null | undefined, locale: Locale) {
  if (!status) status = "not_submitted";
  const t = getDictionary(locale);
  return t.userCenter.status[status as keyof typeof t.userCenter.status] ?? status;
}

function formatDate(value: Date | null | undefined, locale: Locale) {
  if (!value) return "-";
  return value.toLocaleDateString(locale === "en" ? "en-US" : "zh-CN");
}

function formatDateTime(value: Date, locale: Locale) {
  return value.toLocaleString(locale === "en" ? "en-US" : "zh-CN");
}

function formatPlanName(name: string, durationDays: number, locale: Locale) {
  if (locale === "zh") return name;
  if (!durationDays || durationDays >= 36500) return "Lifetime VIP";
  if (durationDays % 30 === 0) return `${durationDays / 30}-Month VIP`;
  return `${durationDays}-Day VIP`;
}
