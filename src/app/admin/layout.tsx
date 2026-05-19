import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { Container } from "@/components/ui";

const adminNav = [
  ["数据看板", "/admin"],
  ["用户管理", "/admin/users"],
  ["会员套餐管理", "/admin/plans"],
  ["订单管理", "/admin/orders"],
  ["支付审核", "/admin/payments"],
  ["电脑软件工具管理", "/admin/software"],
  ["在线网页工具管理", "/admin/online-tools"],
  ["工具分类管理", "/admin/categories"],
  ["标签管理", "/admin/tags"],
  ["教程管理", "/admin/tutorials"],
  ["FAQ 管理", "/admin/faqs"],
  ["版本更新管理", "/admin/changelogs"],
  ["评论管理", "/admin/comments"],
  ["文件管理", "/admin/files"],
  ["网站设置", "/admin/settings"]
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <Container className="grid gap-6 py-10 lg:grid-cols-[260px_1fr]">
      <aside className="glass h-fit rounded-2xl p-4">
        <h1 className="px-3 py-2 text-lg font-semibold">后台管理</h1>
        <nav className="mt-3 grid gap-1">
          {adminNav.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-xl px-3 py-2 text-sm text-[#8B95A7] hover:bg-white/8 hover:text-white">
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </Container>
  );
}
