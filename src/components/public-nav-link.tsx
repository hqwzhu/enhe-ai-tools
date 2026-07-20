"use client";

import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { PrefetchLink } from "@/components/prefetch-link";
import { cn } from "@/lib/utils";

type PublicNavLinkProps = Omit<ComponentProps<typeof PrefetchLink>, "href"> & {
  href: string;
};

function isActivePublicPath(pathname: string, href: string) {
  const hrefPath = href.split(/[?#]/, 1)[0] || "/";
  if (hrefPath === "/" || hrefPath === "/en") return pathname === hrefPath;
  return pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
}

export function PublicNavLink({
  href,
  className,
  children,
  ...props
}: PublicNavLinkProps) {
  const pathname = usePathname() ?? "/";
  const isActive = isActivePublicPath(pathname, href);

  return (
    <PrefetchLink
      {...props}
      href={href}
      className={cn(className, isActive && "is-active")}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </PrefetchLink>
  );
}
