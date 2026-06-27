"use client";

import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getBackNavigationParentHref, shouldShowBackNavigation } from "@/lib/back-navigation";
import { cn } from "@/lib/utils";

type BackNavigationBarProps = {
  locale: "zh" | "en";
};

const currentPathStorageKey = "enhe:last-current-path";

function getSameOriginReferrerPath() {
  if (typeof document === "undefined" || !document.referrer) return false;

  try {
    const referrer = new URL(document.referrer);
    if (referrer.origin !== window.location.origin) return null;
    return `${referrer.pathname}${referrer.search}${referrer.hash}`;
  } catch {
    return null;
  }
}

export function BackNavigationBar({ locale }: BackNavigationBarProps) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const parentHref = getBackNavigationParentHref(pathname);
  const visible = shouldShowBackNavigation(pathname);
  const [previousInternalPath, setPreviousInternalPath] = useState<string | null>(null);

  useEffect(() => {
    const referrerPath = getSameOriginReferrerPath();
    const storedPath = window.sessionStorage.getItem(currentPathStorageKey);
    const nextPreviousPath = referrerPath && referrerPath !== pathname ? referrerPath : storedPath && storedPath !== pathname ? storedPath : null;

    setPreviousInternalPath(nextPreviousPath);
    window.sessionStorage.setItem(currentPathStorageKey, pathname);
  }, [pathname]);

  if (!visible) return null;

  const label = locale === "en" ? "Back" : "返回上一页";

  return (
    <nav className="site-back-nav" aria-label={locale === "en" ? "Page back navigation" : "页面返回导航"}>
      <button
        type="button"
        className={cn("site-back-nav-button cursor-target")}
        onClick={() => {
          if (previousInternalPath) {
            router.push(previousInternalPath);
            return;
          }
          router.push(parentHref);
        }}
      >
        <ArrowLeft size={16} strokeWidth={1.8} aria-hidden="true" />
        <span>{label}</span>
      </button>
    </nav>
  );
}
