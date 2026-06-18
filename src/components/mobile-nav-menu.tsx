import Link from "next/link";
import { LayoutDashboard, Menu } from "lucide-react";

type MobileNavMenuProps = {
  labels: {
    menu: string;
    admin?: string;
  };
  navItems: ReadonlyArray<{ label: string; href: string }>;
  showAdmin: boolean;
  loginItem?: readonly [string, string];
  userCenterItem?: readonly [string, string];
};

export function MobileNavMenu({
  labels,
  navItems,
  showAdmin,
  loginItem,
  userCenterItem = ["User Center", "/user"]
}: MobileNavMenuProps) {
  return (
    <details className="mobile-nav group relative lg:hidden">
      <summary
        className="mobile-nav-trigger inline-flex cursor-pointer list-none items-center justify-center [&::-webkit-details-marker]:hidden"
        aria-label={labels.menu}
      >
        <Menu size={18} />
      </summary>
      <div className="mobile-nav-panel absolute right-0 top-12 z-50 w-64 overflow-hidden p-2">
        {navItems.map(({ label, href }) => (
          <Link key={href} href={href} className="mobile-nav-link">
            {label}
          </Link>
        ))}
        {loginItem ? (
          <Link href={loginItem[1]} className="mobile-nav-link">
            {loginItem[0]}
          </Link>
        ) : null}
        <Link href={userCenterItem[1]} className="mobile-nav-link mobile-nav-user-center">
          {userCenterItem[0]}
        </Link>
        {showAdmin ? (
          <Link href="/admin" className="mobile-nav-link mobile-nav-admin">
            <LayoutDashboard size={16} />
            {labels.admin ?? "Admin"}
          </Link>
        ) : null}
      </div>
    </details>
  );
}
