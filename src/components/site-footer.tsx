import Image from "next/image";
import { PrefetchLink } from "@/components/prefetch-link";
import { Container } from "@/components/ui";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import { getCurrentLocale } from "@/lib/i18n";
import { legalPages } from "@/lib/legal";
import { buildLocalePath } from "@/lib/seo";
import { getEffectiveFooterCopyright, getEffectiveLocalizedSiteName, getSettingsMap } from "@/lib/settings";

const companyContact = {
  name: "深圳市龙岗区恩禾网络科技工作室",
  address: "深圳市龙岗区横岗街道塘坑社区宸和路51号中联展数字电商产业园C栋C305",
  englishName: "Shenzhen Longgang District Enhe Network Technology Studio",
  englishAddress: "Room C305, Building C, Zhonglianzhan Digital E-commerce Industrial Park, 51 Chenhe Road, Tangkeng Community, Henggang Street, Longgang District, Shenzhen",
  phone: "15715097597",
  phoneHref: "tel:15715097597",
  email: "ENHEAI.life@protonmail.com",
  emailHref: "mailto:ENHEAI.life@protonmail.com"
};

export async function SiteFooter({ forceLocale }: { forceLocale?: Locale }) {
  const [locale, settings] = await Promise.all([forceLocale ? Promise.resolve(forceLocale) : getCurrentLocale(), getSettingsMap()]);
  const t = getDictionary(locale);
  const siteName = getEffectiveLocalizedSiteName(settings, locale, t.footer.siteName);
  const copyright = getEffectiveFooterCopyright(settings, t.footer.copyright);
  const contactLabels =
    locale === "en"
      ? { company: "Company", address: "Address", phone: "Phone", email: "Email" }
      : { company: "公司名称", address: "地址", phone: "电话", email: "邮箱" };
  const filingCopy =
    locale === "en"
      ? {
          publicSecurityAlt: "Public security filing icon",
          publicSecurity: "Fujian Public Security Record No. 35030302900035",
          icp: "ICP Filing: Min ICP No. 2025092404-2"
        }
      : {
          publicSecurityAlt: "备案图标",
          publicSecurity: "闽公网安备 35030302900035号",
          icp: "闽ICP备2025092404号-2"
        };
  const companyName = locale === "en" ? companyContact.englishName : companyContact.name;
  const companyAddress = locale === "en" ? companyContact.englishAddress : companyContact.address;

  return (
    <footer className="border-t border-white/14 py-10 text-sm text-[var(--marketing-muted)]">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-semibold text-[var(--marketing-text)]">{siteName}</p>
            <p className="mt-2">{copyright}</p>
          </div>
          <div className="flex max-w-3xl flex-col gap-5 lg:items-end">
            <nav className="flex flex-wrap gap-x-5 gap-y-3 lg:justify-end">
              <PrefetchLink href={buildLocalePath("/legal/user-agreement", locale)} className="transition hover:text-[var(--marketing-accent)]">
                {t.footer.helpSupport}
              </PrefetchLink>
              <PrefetchLink href={buildLocalePath("/#updates", locale)} className="transition hover:text-[var(--marketing-accent)]">
                {t.nav.updates}
              </PrefetchLink>
              <PrefetchLink href={buildLocalePath("/ai-trends", locale)} className="transition hover:text-[var(--marketing-accent)]">
                {t.nav.aiTrends}
              </PrefetchLink>
              {legalPages.map((page) => (
                <PrefetchLink
                  key={page.slug}
                  href={buildLocalePath(`/legal/${page.slug}`, locale)}
                  className="transition hover:text-[var(--marketing-accent)]"
                >
                  {t.footer.legal[page.slug as keyof typeof t.footer.legal]}
                </PrefetchLink>
              ))}
            </nav>
            <address className="grid gap-1 not-italic text-xs leading-6 text-[var(--marketing-muted)] lg:text-right">
              <span>
                {contactLabels.company}: {companyName}
              </span>
              <span>
                {contactLabels.address}: {companyAddress}
              </span>
              <a href={companyContact.phoneHref} className="transition hover:text-[var(--marketing-accent)]">
                {contactLabels.phone}: {companyContact.phone}
              </a>
              <a href={companyContact.emailHref} className="transition hover:text-[var(--marketing-accent)]">
                {contactLabels.email}: {companyContact.email}
              </a>
            </address>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-5 text-xs text-[var(--marketing-muted)]">
          <a
            href="https://beian.mps.gov.cn/#/query/webSearch?code=35030302900035"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 transition hover:text-[var(--marketing-accent)]"
          >
            <Image src="/images/beian-icon.png" alt={filingCopy.publicSecurityAlt} width={18} height={20} unoptimized />
            <span>{filingCopy.publicSecurity}</span>
          </a>
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center transition hover:text-[var(--marketing-accent)]"
          >
            {filingCopy.icp}
          </a>
        </div>
      </Container>
    </footer>
  );
}
