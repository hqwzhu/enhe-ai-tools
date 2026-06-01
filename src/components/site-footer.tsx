import Link from "next/link";
import Image from "next/image";
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
    <footer className="border-t border-[rgba(210,230,255,0.14)] py-10 text-sm text-[#8F9DB2]">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-semibold text-[#F6FAFF]">{siteName}</p>
            <p className="mt-2">{copyright}</p>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-3">
            {legalPages.map((page) => (
              <Link key={page.slug} href={`/legal/${page.slug}`} className="transition hover:text-[#7DD3FC]">
                {t.footer.legal[page.slug as keyof typeof t.footer.legal]}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[rgba(210,230,255,0.1)] pt-5 text-xs text-[#7FA5E8]">
          <a
            href="https://beian.mps.gov.cn/#/query/webSearch?code=35030302900035"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 transition hover:text-[#AFCBFF]"
          >
            <Image src="/images/beian-icon.png" alt="备案编号图标" width={20} height={20} unoptimized />
            <span>闽公网安备35030302900035号</span>
          </a>
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center transition hover:text-[#AFCBFF]"
          >
            闽ICP备2025092404号-2
          </a>
        </div>
      </Container>
    </footer>
  );
}
