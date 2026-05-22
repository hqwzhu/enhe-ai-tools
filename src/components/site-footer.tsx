import Link from "next/link";
import { legalPages } from "@/lib/legal";
import { Container } from "@/components/ui";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";
import { getEffectiveFooterCopyright, getEffectiveSiteName, getSettingsMap } from "@/lib/settings";

export async function SiteFooter() {
  const [locale, settings] = await Promise.all([getCurrentLocale(), getSettingsMap()]);
  const t = getDictionary(locale);
  const siteName = getEffectiveSiteName(settings, t.footer.siteName);
  const copyright = getEffectiveFooterCopyright(settings, t.footer.copyright);

  return (
    <footer className="border-t border-white/10 py-10 text-sm text-[#8B95A7]">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-semibold text-[#E8EEF8]">{siteName}</p>
            <p className="mt-2">{copyright}</p>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-3">
            {legalPages.map((page) => (
              <Link key={page.slug} href={`/legal/${page.slug}`} className="transition hover:text-[#48F5D3]">
                {t.footer.legal[page.slug as keyof typeof t.footer.legal]}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
