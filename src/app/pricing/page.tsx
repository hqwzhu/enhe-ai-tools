import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PackageOpen } from "lucide-react";
import { Container, SectionTitle } from "@/components/ui";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const t = getDictionary(locale);
  return buildPageMetadata({
    title: `${locale === "en" ? "Paid downloads" : "软件付费下载"} - ${t.brand}`,
    description: locale === "en" ? "Paid software can be purchased from each tool detail page." : "收费软件请在具体工具详情页购买。",
    path: "/pricing"
  });
}

export default async function PricingPage() {
  const locale = await getCurrentLocale();
  const copy = locale === "en"
    ? {
        title: "Paid downloads are now purchased per tool",
        intro: "ENHE AI now sells paid software downloads by individual tool. Open a software detail page, confirm the price, submit payment proof, and the download link will appear after review approval.",
        cardTitle: "Buy from the software page",
        cardText: "Each paid desktop app has its own price and unlocks only that app's download-link content.",
        cta: "View AI software apps"
      }
    : {
        title: "付费下载已改为按工具购买",
        intro: "ENHE AI 现在改为按具体软件付费下载。进入软件详情页确认价格，提交付款凭证，后台审核通过后即可查看该软件的下载链接内容。",
        cardTitle: "前往AI软件应用购买",
        cardText: "每个收费软件都有独立价格，购买后只解锁该软件的下载链接内容。",
        cta: "查看AI软件应用"
      };

  return (
    <Container className="py-14">
      <SectionTitle title={copy.title} intro={copy.intro} />
      <section className="surface-panel mt-8 p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <PackageOpen className="mt-1 text-[var(--marketing-accent)]" size={28} />
            <div>
              <h2 className="text-2xl font-bold text-[var(--marketing-text)]">{copy.cardTitle}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--marketing-muted)]">{copy.cardText}</p>
            </div>
          </div>
          <Link href="/software" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#050505] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#161616]">
            {copy.cta}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </Container>
  );
}
