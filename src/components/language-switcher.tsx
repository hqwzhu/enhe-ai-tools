"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/dictionaries";
import { buildLocalePath, stripLocalePrefix } from "@/lib/seo";

export function LanguageSwitcher({
  locale,
  labels
}: {
  locale: Locale;
  labels: { label: string; zh: string; en: string };
}) {
  const pathname = usePathname() ?? "/";
  const normalizedPath = stripLocalePrefix(pathname);

  return (
    <div className="site-language-switcher hidden items-center sm:flex" aria-label={labels.label}>
      {(["zh", "en"] as const).map((item) => (
        <Link
          key={item}
          href={buildLocalePath(normalizedPath, item)}
          className={locale === item ? "is-active" : ""}
          onClick={() => {
            document.cookie = `enhe_locale=${item}; path=/; max-age=31536000; samesite=lax`;
          }}
        >
          {labels[item]}
        </Link>
      ))}
    </div>
  );
}
