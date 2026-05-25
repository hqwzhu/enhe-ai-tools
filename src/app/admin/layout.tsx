import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { Container } from "@/components/ui";

const adminNav = [
  ["Dashboard", "/admin"],
  ["Messages", "/admin/messages"],
  ["Development", "/admin/development"],
  ["Product releases", "/admin/releases"],
  ["Users", "/admin/users"],
  ["VIP plans", "/admin/plans"],
  ["Orders", "/admin/orders"],
  ["Payment review", "/admin/payments"],
  ["Refund review", "/admin/refunds"],
  ["Software tools", "/admin/software"],
  ["Online tools", "/admin/online-tools"],
  ["Categories", "/admin/categories"],
  ["Tags", "/admin/tags"],
  ["Tutorials", "/admin/tutorials"],
  ["FAQ", "/admin/faqs"],
  ["Tool versions", "/admin/changelogs"],
  ["Comments", "/admin/comments"],
  ["Files", "/admin/files"],
  ["Audit logs", "/admin/audit"],
  ["Site settings", "/admin/settings"]
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <Container className="grid gap-6 py-10 lg:grid-cols-[260px_1fr]">
      <aside className="glass h-fit rounded-2xl p-4">
        <h1 className="px-3 py-2 text-lg font-semibold">Admin</h1>
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
