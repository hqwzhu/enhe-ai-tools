import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Crown, Download, MousePointer2, UserRound } from "lucide-react";
import { Badge } from "@/components/ui";
import { getDictionary, type Locale } from "@/lib/i18n";
import { normalizeImageSrc } from "@/lib/media";

type ToolCardProps = {
  locale?: Locale;
  tool: {
    name: string;
    englishName?: string | null;
    slug: string;
    type: "software" | "online";
    shortDescription: string;
    coverImage?: string | null;
    isVipRequired: boolean;
    downloadCount: number;
    usageCount: number;
    isDownloadPaid?: boolean;
    downloadPrice?: unknown;
    category?: { name: string } | null;
  };
};

export function ToolCard({ tool, locale = "zh" }: ToolCardProps) {
  const t = getDictionary(locale);
  const coverImage = normalizeImageSrc(tool.coverImage);
  const summary = buildValueSentence(tool.shortDescription, locale);
  const highlights = buildCardHighlights(tool, locale);
  const audience = tool.category?.name ?? t.toolCard.defaultAudience;

  return (
    <Link href={`/tools/${tool.slug}`} className="evidence-card group block overflow-hidden transition hover:-translate-y-1 hover:border-[#7DD3FC]/45">
      <div className="relative aspect-[16/9] overflow-hidden border-b border-[rgba(210,230,255,0.16)] bg-[#07101E]">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={tool.name}
            fill
            className="object-cover opacity-90 transition duration-500 group-hover:scale-[1.04] group-hover:opacity-100"
            sizes="(min-width: 1024px) 420px, 100vw"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(125,211,252,0.18),transparent_34%),radial-gradient(circle_at_72%_72%,rgba(142,167,255,0.18),transparent_36%),repeating-linear-gradient(135deg,rgba(238,246,255,0.08)_0_2px,transparent_2px_18px),linear-gradient(135deg,rgba(255,255,255,0.08),transparent)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030611]/88 via-transparent to-transparent" />
      </div>

      <div className="p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge>{tool.category?.name ?? t.toolCard.uncategorized}</Badge>
              {tool.isVipRequired ? (
                <Badge className="border-[#FFB86B]/35 text-[#FFB86B]">
                  <Crown size={13} className="mr-1 inline" />
                  VIP
                </Badge>
              ) : (
                <Badge>{t.toolCard.free}</Badge>
              )}
              {tool.type === "software" && tool.isDownloadPaid ? (
                <Badge className="border-[#FFB86B]/35 text-[#FFB86B]">{t.toolCard.paidDownload} ¥{Number(tool.downloadPrice ?? 0).toFixed(2)}</Badge>
              ) : null}
            </div>
            <h3 className="text-xl font-semibold text-[#F6FAFF]">{tool.name}</h3>
            {tool.englishName ? <p className="mt-1 text-sm font-medium text-[#7DD3FC]">{tool.englishName}</p> : null}
          </div>
          <ArrowUpRight className="text-[#8F9DB2] transition group-hover:text-[#7DD3FC]" />
        </div>
        <p className="min-h-14 text-sm leading-6 text-[#C5D0E2]">
          <span className="font-semibold text-[#7DD3FC]">{t.toolCard.valuePrefix}：</span>
          {summary}
        </p>
        <div className="mt-5 grid gap-2">
          {highlights.map((item) => (
            <span key={item} className="inline-flex items-center gap-2 text-sm text-[#8F9DB2]">
              <Check size={14} className="shrink-0 text-[#5EF1C7]" />
              {item}
            </span>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-xs text-[#8F9DB2]">
          <UserRound size={14} className="shrink-0 text-[#7DD3FC]" />
          <span>{t.toolCard.audienceLabel}：{audience}</span>
        </div>
        <div className="mt-6 flex items-center justify-between gap-4 text-xs text-[#8F9DB2]">
          <span className="inline-flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Download size={14} />
              {tool.downloadCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <MousePointer2 size={14} />
              {tool.usageCount}
            </span>
          </span>
          <span className="font-semibold text-[#7DD3FC]">{t.toolCard.viewDetails}</span>
        </div>
      </div>
    </Link>
  );
}

function buildValueSentence(description: string, locale: Locale) {
  const sentence = description.split(/[。.!！？?]/).find(Boolean)?.trim() ?? description.trim();
  const maxLength = locale === "zh" ? 44 : 86;
  return sentence.length > maxLength ? `${sentence.slice(0, maxLength - 1)}…` : sentence;
}

function buildCardHighlights(tool: ToolCardProps["tool"], locale: Locale) {
  const t = getDictionary(locale);
  const access = tool.isVipRequired ? t.toolCard.capabilityVip : t.toolCard.capabilityFree;
  const runtime = tool.type === "software" ? t.toolCard.capabilitySoftware : t.toolCard.capabilityOnline;
  const commerce = tool.type === "software" && tool.isDownloadPaid ? t.toolCard.capabilityPaidDownload : t.toolCard.capabilityAccess;
  return [runtime, access, commerce];
}
