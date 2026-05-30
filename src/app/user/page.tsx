import Link from "next/link";
import {
  cancelOrderAction,
  changePasswordAction,
  logoutAction,
  markAllNotificationsReadAction,
  markNotificationReadAction
} from "@/app/actions";
import { Container, SectionTitle } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCurrentLocale, getDictionary, type Locale } from "@/lib/i18n";
import { getActiveMembership } from "@/lib/membership";
import { getNotificationDisplay } from "@/lib/notification-display";
import { canUserCancelOrder } from "@/lib/order-rules";
import { reviewCompletionNotice, reviewCompletionNoticeEn } from "@/lib/review-copy";
import { buildUserToolEntitlements, type UserEntitlementTool } from "@/lib/user-entitlements";
import { formatCurrency } from "@/lib/utils";

type UserCenterSearchParams = Promise<Record<string, string | undefined>>;

export default async function UserCenterPage({ searchParams }: { searchParams: UserCenterSearchParams }) {
  const params = await searchParams;
  const locale = await getCurrentLocale();
  const t = getDictionary(locale);
  const passwordMessage = getPasswordMessage(params.password, locale);
  const orderMessage = params.order === "cancelled" ? (locale === "en" ? "Order cancelled." : "订单已取消。") : null;
  const user = await requireUser();
  const [membership, notifications, orders, downloads, usages, comments, purchases, publishedTools] = await Promise.all([
    getActiveMembership(user.id),
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
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
    }),
    prisma.toolPurchase.findMany({
      where: { userId: user.id },
      select: { toolId: true }
    }),
    prisma.tool.findMany({
      where: {
        status: "published",
        OR: [{ type: "software" }, { type: "online" }]
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
    })
  ]);
  const entitlementSummary = buildUserToolEntitlements({
    hasVip: Boolean(membership),
    purchasedToolIds: purchases.map((purchase) => purchase.toolId),
    tools: publishedTools
  });
  const unreadNotificationCount = notifications.filter((notification) => !notification.readAt).length;

  return (
    <Container className="py-14">
      <div className="mb-8 flex items-center justify-between gap-4">
        <SectionTitle title={t.userCenter.title} intro={t.userCenter.intro} />
        <form action={logoutAction}>
          <button className="rounded-full border border-white/12 px-5 py-3 text-sm">{t.userCenter.logout}</button>
        </form>
      </div>
      {orderMessage ? (
        <p className="mb-6 rounded-xl border border-[#48F5D3]/30 bg-[#48F5D3]/10 px-4 py-3 text-sm text-[#48F5D3]">
          {orderMessage}
        </p>
      ) : null}

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

          <Panel title={t.notifications.title.replace("{count}", String(unreadNotificationCount))}>
            {notifications.length ? (
              <div className="space-y-3">
                <form action={markAllNotificationsReadAction}>
                  <button className="rounded-full border border-white/12 px-3 py-1 text-xs transition hover:border-[#48F5D3]/60 hover:text-[#48F5D3]">
                    {t.notifications.markAllRead}
                  </button>
                </form>
                {notifications.map((notification) => {
                  const display = getNotificationDisplay(notification, locale);

                  return (
                    <div
                      key={notification.id}
                      className={`rounded-xl border p-3 text-sm ${
                        notification.readAt
                          ? "border-white/10 bg-white/5 text-[#8B95A7]"
                          : "border-[#48F5D3]/30 bg-[#48F5D3]/10 text-[#E8EEF8]"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{display.title}</p>
                          <p className="mt-1 leading-6 text-[#8B95A7]">{display.content}</p>
                          <p className="mt-2 text-xs text-[#8B95A7]">{formatDateTime(notification.createdAt, locale)}</p>
                        </div>
                        {!notification.readAt ? (
                          <form action={markNotificationReadAction}>
                            <input type="hidden" name="id" value={notification.id} />
                            <button className="rounded-full border border-white/12 px-2 py-1 text-xs">
                              {t.notifications.markRead}
                            </button>
                          </form>
                        ) : null}
                      </div>
                      {notification.linkUrl ? (
                        <Link href={notification.linkUrl} className="mt-3 inline-flex text-xs text-[#48F5D3]">
                          {t.notifications.viewDetails}
                        </Link>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyText>{t.notifications.empty}</EmptyText>
            )}
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
                    {order.orderStatus === "pending_review" || order.paymentProof?.reviewStatus === "pending" ? (
                      <p className="mt-2 text-xs leading-5 text-[#8B95A7]">{getReviewNotice(locale)}</p>
                    ) : null}
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
                            {t.userCenter.cancelOrder}
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

          <Panel title={t.userCenter.availableSoftware}>
            <ToolAccessList
              tools={entitlementSummary.downloadableSoftware}
              emptyText={t.userCenter.noAvailableSoftware}
              locale={locale}
              action="download"
            />
          </Panel>

          <Panel title={t.userCenter.purchasedSoftware}>
            <ToolAccessList
              tools={entitlementSummary.purchasedSoftware}
              emptyText={t.userCenter.noPurchasedSoftware}
              locale={locale}
              action="details"
            />
          </Panel>

          <Panel title={t.userCenter.availableOnlineTools}>
            <ToolAccessList
              tools={entitlementSummary.availableOnlineTools}
              emptyText={t.userCenter.noAvailableOnlineTools}
              locale={locale}
              action="use"
            />
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
                  {comment.status === "pending" ? <span> · {getReviewNotice(locale)}</span> : null}
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

function ToolAccessList({
  tools,
  emptyText,
  locale,
  action
}: {
  tools: UserEntitlementTool[];
  emptyText: string;
  locale: Locale;
  action: "download" | "use" | "details";
}) {
  const t = getDictionary(locale);
  if (!tools.length) return <EmptyText>{emptyText}</EmptyText>;

  return (
    <div className="divide-y divide-white/10">
      {tools.map((tool) => (
        <div key={tool.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div>
            <Link href={`/tools/${tool.slug}`} className="font-semibold text-[#E8EEF8] transition hover:text-[#48F5D3]">
              {tool.name}
            </Link>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#8B95A7]">
              <span className="rounded-full border border-white/10 px-2 py-1">
                {tool.isVipRequired ? t.userCenter.vipAccess : t.userCenter.freeAccess}
              </span>
              {tool.isDownloadPaid ? (
                <span className="rounded-full border border-[#FFB86B]/30 px-2 py-1 text-[#FFB86B]">
                  {t.userCenter.paidDownloadAccess}
                </span>
              ) : null}
            </div>
          </div>
          <ToolAccessAction tool={tool} action={action} locale={locale} />
        </div>
      ))}
    </div>
  );
}

function ToolAccessAction({
  tool,
  action,
  locale
}: {
  tool: UserEntitlementTool;
  action: "download" | "use" | "details";
  locale: Locale;
}) {
  const t = getDictionary(locale);
  const className = "rounded-full border border-white/12 px-4 py-2 text-xs font-semibold transition hover:border-[#48F5D3]/60 hover:text-[#48F5D3]";

  if (action === "download") {
    return <a href={`/api/tools/${tool.id}/download`} className={className}>{t.userCenter.downloadNow}</a>;
  }

  if (action === "use") {
    return <a href={`/api/tools/${tool.id}/use`} className={className}>{t.userCenter.useNow}</a>;
  }

  return <Link href={`/tools/${tool.slug}`} className={className}>{t.userCenter.viewTool}</Link>;
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

function getReviewNotice(locale: Locale) {
  return locale === "en" ? reviewCompletionNoticeEn : reviewCompletionNotice;
}
