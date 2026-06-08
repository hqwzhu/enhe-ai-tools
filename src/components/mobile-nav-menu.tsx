import Link from "next/link";
import { LayoutDashboard, Menu } from "lucide-react";

type MobileNavMenuProps = {
  labels: {
    menu: string;
    admin: string;
  };
  navItems: ReadonlyArray<readonly [string, string]>;
  showAdmin: boolean;
};

export function MobileNavMenu({ labels, navItems, showAdmin }: MobileNavMenuProps) {
  return (
    <details className="group relative lg:hidden">
      <summary className="inline-flex h-10 cursor-pointer list-none items-center gap-2 rounded-full border border-[rgba(210,230,255,0.16)] bg-[rgba(238,246,255,0.06)] px-3 text-sm font-semibold text-[#F6FAFF] [&::-webkit-details-marker]:hidden">
        <Menu size={17} />
        <span>{labels.menu}</span>
      </summary>
      <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-[rgba(210,230,255,0.16)] bg-[#0A1020] p-2 shadow-2xl shadow-black/40">
        {navItems.map(([label, href]) => (
          <Link key={href} href={href} className="block rounded-xl px-4 py-3 text-sm text-[#C7D2E5] hover:bg-white/8 hover:text-[#F6FAFF]">
            {label}
          </Link>
        ))}
        {showAdmin ? (
          <Link href="/admin" className="mt-1 flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-[#7DD3FC] hover:bg-[#7DD3FC]/10">
            <LayoutDashboard size={16} />
            {labels.admin}
          </Link>
        ) : null}
      </div>
    </details>
  );
}
