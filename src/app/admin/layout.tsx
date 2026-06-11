import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { Container } from "@/components/ui";
import { getAdminDictionary } from "@/lib/admin-i18n";
import { getCurrentLocale } from "@/lib/i18n";

const adminNav = [
  ["dashboard", "/admin"],
  ["messages", "/admin/messages"],
  ["development", "/admin/development"],
  ["releases", "/admin/releases"],
  ["users", "/admin/users"],
  ["orders", "/admin/orders"],
  ["payments", "/admin/payments"],
  ["paymentCodes", "/admin/payment-codes"],
  ["refunds", "/admin/refunds"],
  ["software", "/admin/software"],
  ["onlineTools", "/admin/online-tools"],
  ["categories", "/admin/categories"],
  ["tags", "/admin/tags"],
  ["tutorials", "/admin/tutorials"],
  ["faqs", "/admin/faqs"],
  ["changelogs", "/admin/changelogs"],
  ["comments", "/admin/comments"],
  ["files", "/admin/files"],
  ["licenseGenerator", "/admin/license-generator"],
  ["audit", "/admin/audit"],
  ["settings", "/admin/settings"]
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [, locale] = await Promise.all([requireAdmin(), getCurrentLocale()]);
  const t = getAdminDictionary(locale);

  return (
    <Container className="grid gap-6 py-10 lg:grid-cols-[260px_1fr]">
      <aside className="dossier-card h-fit p-4">
        <h1 className="px-3 py-2 text-lg font-semibold text-[#F6FAFF]">{t.layout.title}</h1>
        <nav className="mt-3 grid gap-1">
          {adminNav.map(([key, href]) => (
            <Link key={href} href={href} className="rounded-xl px-3 py-2 text-sm text-[#8F9DB2] hover:bg-[rgba(125,211,252,0.12)] hover:text-[#F6FAFF]">
              {t.nav[key]}
            </Link>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </Container>
  );
}
