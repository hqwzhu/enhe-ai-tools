import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import { getCurrentLocale } from "@/lib/i18n";
import { legalPages } from "@/lib/legal";
import { buildLocalePath } from "@/lib/seo";
import { getEffectiveFooterCopyright, getEffectiveSiteName, getSettingsMap } from "@/lib/settings";

export async function SiteFooter({ forceLocale }: { forceLocale?: Locale }) {
  const [locale, settings] = await Promise.all([forceLocale ? Promise.resolve(forceLocale) : getCurrentLocale(), getSettingsMap()]);
  const t = getDictionary(locale);
  const siteName = getEffectiveSiteName(settings, t.footer.siteName);
  const copyright = getEffectiveFooterCopyright(settings, t.footer.copyright);

  return (
    <footer className="border-t border-white/14 py-10 text-sm text-[var(--marketing-muted)]">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-semibold text-[var(--marketing-text)]">{siteName}</p>
            <p className="mt-2">{copyright}</p>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-3">
            <Link href={buildLocalePath("/legal/user-agreement", locale)} className="transition hover:text-[var(--marketing-accent)]">
              {t.footer.helpSupport}
            </Link>
            {legalPages.map((page) => (
              <Link
                key={page.slug}
                href={buildLocalePath(`/legal/${page.slug}`, locale)}
                className="transition hover:text-[var(--marketing-accent)]"
              >
                {t.footer.legal[page.slug as keyof typeof t.footer.legal]}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-5 text-xs text-[var(--marketing-muted)]">
          <a
            href="https://beian.mps.gov.cn/#/query/webSearch?code=35030302900035"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 transition hover:text-[var(--marketing-accent)]"
          >
            <Image src="/images/beian-icon.png" alt="备案图标" width={18} height={20} unoptimized />
            <span>闽公网安备 35030302900035号</span>
          </a>
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center transition hover:text-[var(--marketing-accent)]"
          >
            闽ICP备2025092404号-2
          </a>
        </div>
      </Container>
    </footer>
  );
}
