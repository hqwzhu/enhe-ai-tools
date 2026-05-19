import Link from "next/link";
import { ArrowUpRight, Crown, Download, MousePointer2 } from "lucide-react";
import { Badge } from "@/components/ui";

type ToolCardProps = {
  tool: {
    name: string;
    slug: string;
    type: "software" | "online";
    shortDescription: string;
    isVipRequired: boolean;
    downloadCount: number;
    usageCount: number;
    isDownloadPaid?: boolean;
    downloadPrice?: unknown;
    category?: { name: string } | null;
  };
};

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link href={`/tools/${tool.slug}`} className="glass group block rounded-2xl p-5 transition hover:-translate-y-1 hover:border-[#7AA7FF]/45">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge>{tool.category?.name ?? "未分类"}</Badge>
            {tool.isVipRequired ? (
              <Badge className="border-[#FFB86B]/30 text-[#FFB86B]">
                <Crown size={13} className="mr-1 inline" />
                VIP
              </Badge>
            ) : (
              <Badge>免费</Badge>
            )}
            {tool.type === "software" && tool.isDownloadPaid ? (
              <Badge className="border-[#FFB86B]/30 text-[#FFB86B]">下载 ¥{Number(tool.downloadPrice ?? 0).toFixed(2)}</Badge>
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
    </Link>
  );
}
