import { LayoutDashboard, Menu } from "lucide-react";
import { PrefetchLink } from "@/components/prefetch-link";

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
        className="mobile-nav-trigger cursor-target inline-flex cursor-pointer list-none items-center justify-center [&::-webkit-details-marker]:hidden"
        aria-label={labels.menu}
      >
        <Menu size={18} />
      </summary>
      <div className="mobile-nav-panel absolute right-0 top-12 z-50 w-64 overflow-hidden p-2">
        {navItems.map(({ label, href }) => (
          <PrefetchLink key={href} href={href} className="mobile-nav-link cursor-target">
            {label}
          </PrefetchLink>
        ))}
        {loginItem ? (
          <PrefetchLink href={loginItem[1]} className="mobile-nav-link cursor-target">
            {loginItem[0]}
          </PrefetchLink>
        ) : null}
        <PrefetchLink href={userCenterItem[1]} className="mobile-nav-link mobile-nav-user-center cursor-target">
          {userCenterItem[0]}
        </PrefetchLink>
        {showAdmin ? (
          <PrefetchLink href="/admin" className="mobile-nav-link mobile-nav-admin cursor-target">
            <LayoutDashboard size={16} />
            {labels.admin ?? "Admin"}
          </PrefetchLink>
        ) : null}
      </div>
    </details>
  );
}
