import Link from "next/link";
import { prisma } from "@/lib/db";
import { calculateGrowthPercent, formatDashboardAmount, rankPopularTools } from "@/lib/admin-dashboard";

export default async function AdminDashboardPage() {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const last7Days = new Date(now);
  last7Days.setDate(last7Days.getDate() - 7);
  const previous7Days = new Date(now);
  previous7Days.setDate(previous7Days.getDate() - 14);
  const vipExpiringSoon = new Date(now);
  vipExpiringSoon.setDate(vipExpiringSoon.getDate() + 7);

  const [
    users,
    recentUsers,
    previousUsers,
    tools,
    publishedTools,
    softwareTools,
    onlineTools,
    orders,
    paidAmount,
    todayPaidAmount,
    pendingProofs,
    pendingRefunds,
    activeMemberships,
    expiringMemberships,
    popularTools
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: last7Days } } }),
    prisma.user.count({ where: { createdAt: { gte: previous7Days, lt: last7Days } } }),
    prisma.tool.count(),
    prisma.tool.count({ where: { status: "published" } }),
    prisma.tool.count({ where: { type: "software" } }),
    prisma.tool.count({ where: { type: "online" } }),
    prisma.order.count(),
    prisma.order.aggregate({ where: { orderStatus: { in: ["paid", "activated"] } }, _sum: { amount: true } }),
    prisma.order.aggregate({ where: { orderStatus: { in: ["paid", "activated"] }, createdAt: { gte: todayStart } }, _sum: { amount: true } }),
    prisma.paymentProof.count({ where: { reviewStatus: "pending" } }),
    prisma.orderRefundRecord.count({ where: { status: "pending" } }),
    prisma.membership.count({ where: { status: "active" } }),
    prisma.membership.count({ where: { status: "active", isLifetime: false, endTime: { gte: now, lte: vipExpiringSoon } } }),
    prisma.tool.findMany({
      where: { status: "published" },
      select: { id: true, name: true, type: true, downloadCount: true, usageCount: true },
      orderBy: [{ downloadCount: "desc" }, { usageCount: "desc" }],
      take: 8
    })
  ]);
  const growthPercent = calculateGrowthPercent(recentUsers, previousUsers);
  const rankedTools = rankPopularTools(popularTools).slice(0, 5);

  return (
    <div>
      <h1 className="text-3xl font-semibold">数据看板</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#8B95A7]">
        汇总订单金额、待审核事项、工具数量、用户增长和热门工具，方便运营时先看风险和收入。
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Stat label="累计实收订单金额" value={formatDashboardAmount(paidAmount._sum.amount?.toString())} accent />
        <Stat label="今日实收金额" value={formatDashboardAmount(todayPaidAmount._sum.amount?.toString())} />
        <Stat label="待审核付款" value={pendingProofs} href="/admin/payments" warn={pendingProofs > 0} />
        <Stat label="待处理退款" value={pendingRefunds} href="/admin/orders?status=refunded" warn={pendingRefunds > 0} />
        <Stat label="用户总数" value={users} />
        <Stat label="7 日新增用户" value={`${recentUsers} (${growthPercent >= 0 ? "+" : ""}${growthPercent}%)`} />
        <Stat label="工具总数" value={tools} />
        <Stat label="已发布工具" value={`${publishedTools} / ${tools}`} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="glass rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">热门工具</h2>
            <span className="text-xs text-[#8B95A7]">按下载次数 + 使用次数排序</span>
          </div>
          <div className="mt-5 space-y-3">
            {rankedTools.length ? rankedTools.map((tool, index) => (
              <Link
                key={tool.id}
                href={tool.type === "software" ? `/admin/software/${tool.id}` : `/admin/online-tools/${tool.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-[#48F5D3]/40 hover:bg-[#48F5D3]/8"
              >
                <span className="text-sm font-semibold text-[#E8EEF8]">{index + 1}. {tool.name}</span>
                <span className="text-xs text-[#8B95A7]">下载 {tool.downloadCount} · 使用 {tool.usageCount} · 热度 {tool.score}</span>
              </Link>
            )) : (
              <p className="text-sm text-[#8B95A7]">暂无已发布工具数据。</p>
            )}
          </div>
        </section>

        <section className="glass rounded-2xl p-6">
          <h2 className="text-xl font-semibold">运营提醒</h2>
          <div className="mt-5 grid gap-3 text-sm">
            <QuickItem label="待审核付款" value={pendingProofs} href="/admin/messages" />
            <QuickItem label="待处理退款" value={pendingRefunds} href="/admin/messages" />
            <QuickItem label="7 日内 VIP 到期" value={expiringMemberships} href="/admin/messages" />
            <QuickItem label="活跃会员" value={activeMemberships} href="/admin/users" />
          </div>
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-[#8B95A7]">
            工具结构：电脑软件 {softwareTools} 个，在线网页工具 {onlineTools} 个。文件上传、COS 异常和售后事项可在消息中心集中查看。
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
  accent = false,
  warn = false
}: {
  label: string;
  value: number | string;
  href?: string;
  accent?: boolean;
  warn?: boolean;
}) {
  const content = (
    <>
      <p className="text-sm text-[#8B95A7]">{label}</p>
      <p className={`mt-3 text-3xl font-semibold ${warn ? "text-[#FFB86B]" : accent ? "text-[#48F5D3]" : "text-[#E8EEF8]"}`}>{value}</p>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="glass rounded-2xl p-6 transition hover:border-[#48F5D3]/40 hover:bg-[#48F5D3]/8">
        {content}
      </Link>
    );
  }

  return (
    <div className="glass rounded-2xl p-6">
      {content}
    </div>
  );
}

function QuickItem({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-[#7AA7FF]/40">
      <span className="text-[#8B95A7]">{label}</span>
      <span className="font-semibold text-[#E8EEF8]">{value}</span>
    </Link>
  );
}
