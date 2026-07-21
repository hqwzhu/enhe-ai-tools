"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { ComponentProps } from "react";
import { PrefetchLink } from "@/components/prefetch-link";
import { cn } from "@/lib/utils";

type PublicNavLinkProps = Omit<ComponentProps<typeof PrefetchLink>, "href"> & {
  href: string;
};

type SearchParamsLike = Pick<URLSearchParams, "getAll">;

export function isActivePublicPath(
  pathname: string,
  href: string,
  currentSearchParams?: SearchParamsLike,
) {
  const hrefWithoutHash = href.split("#", 1)[0];
  const queryIndex = hrefWithoutHash.indexOf("?");
  const hrefPath = (queryIndex >= 0 ? hrefWithoutHash.slice(0, queryIndex) : hrefWithoutHash) || "/";
  const hrefSearchParams = new URLSearchParams(queryIndex >= 0 ? hrefWithoutHash.slice(queryIndex + 1) : "");

  if (hrefSearchParams.size > 0) {
    if (pathname !== hrefPath || !currentSearchParams) return false;

    return Array.from(hrefSearchParams).every(([key, value]) =>
      currentSearchParams.getAll(key).includes(value),
    );
  }

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
  const searchParams = useSearchParams();
  const isActive = isActivePublicPath(pathname, href, searchParams);

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
