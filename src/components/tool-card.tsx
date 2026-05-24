import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Crown, Download, MousePointer2 } from "lucide-react";
import { Badge } from "@/components/ui";
import { getDictionary, type Locale } from "@/lib/i18n";
import { normalizeImageSrc } from "@/lib/media";

type ToolCardProps = {
  locale?: Locale;
  tool: {
    name: string;
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

  return (
    <Link href={`/tools/${tool.slug}`} className="glass group block overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:border-[#7AA7FF]/45">
      <div className="relative aspect-[16/9] overflow-hidden border-b border-white/10 bg-[#0B1220]">
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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(72,245,211,0.22),transparent_34%),radial-gradient(circle_at_72%_72%,rgba(122,167,255,0.18),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080B12]/88 via-transparent to-transparent" />
      </div>

      <div className="p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge>{tool.category?.name ?? t.toolCard.uncategorized}</Badge>
              {tool.isVipRequired ? (
                <Badge className="border-[#FFB86B]/30 text-[#FFB86B]">
                  <Crown size={13} className="mr-1 inline" />
                  VIP
                </Badge>
              ) : (
                <Badge>{t.toolCard.free}</Badge>
              )}
              {tool.type === "software" && tool.isDownloadPaid ? (
                <Badge className="border-[#FFB86B]/30 text-[#FFB86B]">{t.toolCard.paidDownload} ¥{Number(tool.downloadPrice ?? 0).toFixed(2)}</Badge>
              ) : null}
            </div>
            <h3 className="text-xl font-semibold text-white">{tool.name}</h3>
          </div>
          <ArrowUpRight className="text-[#8B95A7] transition group-hover:text-[#48F5D3]" />
        </div>
        <p className="min-h-14 text-sm leading-6 text-[#8B95A7]">{tool.shortDescription}</p>
        <div className="mt-6 flex items-center gap-4 text-xs text-[#8B95A7]">
          <span className="inline-flex items-center gap-1">
            <Download size={14} />
            {tool.downloadCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <MousePointer2 size={14} />
            {tool.usageCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
