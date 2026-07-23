import { cn } from "@/lib/utils";
import { buildToolContentBlocks } from "@/lib/tool-content";
import { linkifyDownloadLinkContent } from "@/lib/tool-download-link";

function RichTextInline({ text }: { text: string }) {
  const segments = linkifyDownloadLinkContent(text);

  return (
    <>
      {segments.map((segment, index) =>
        segment.type === "link" ? (
          <a
            key={`${segment.href}-${index}`}
            href={segment.href}
            target="_blank"
            rel="nofollow noopener noreferrer"
      className="break-all text-[var(--marketing-accent)] underline decoration-[rgba(65,197,219,0.5)] underline-offset-4 transition-colors hover:text-[#8feaff]"
          >
            {segment.text}
          </a>
        ) : (
          <span key={`${segment.text}-${index}`}>{segment.text}</span>
        ),
      )}
    </>
  );
}

function splitListLead(item: string) {
  if (/https?:\/\//i.test(item)) return null;

  const match = item.match(/^([^:：]{2,24})([:：])\s*(.+)$/);
  if (!match) return null;

  const lead = match[1]?.trim();
  const separator = match[2] ?? ":";
  const rest = match[3]?.trim();
  if (!lead || !rest) return null;

  return { lead, separator, rest };
}

function RichListItem({ item }: { item: string }) {
  const splitItem = splitListLead(item);
  if (!splitItem) return <RichTextInline text={item} />;

  return (
    <span>
      <strong className="font-semibold text-[#F6FAFF]">
        {splitItem.lead}
        {splitItem.separator}
      </strong>{" "}
      <span>
        <RichTextInline text={splitItem.rest} />
      </span>
    </span>
  );
}

export function ToolRichContent({
  content,
  className,
  tone = "primary"
}: {
  content: string;
  className?: string;
  tone?: "primary" | "muted";
}) {
  const blocks = buildToolContentBlocks(content);
  if (!blocks.length) return null;

  const textClass = tone === "primary" ? "text-[#C5D0E2]" : "text-[#8F9DB2]";

  return (
    <div className={cn("space-y-5 text-base leading-8", textClass, className)}>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h3 key={`${block.type}-${index}`} className="text-lg font-semibold leading-7 text-[#F6FAFF]">
              {block.text}
            </h3>
          );
        }

        if (block.type === "unordered-list") {
          return (
            <ul key={`${block.type}-${index}`} className="space-y-2 border-l border-white/10 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`} className="relative pl-4">
                  <span className="absolute left-0 top-[0.82em] h-1.5 w-1.5 rounded-full bg-[var(--marketing-accent)]" />
                  <RichListItem item={item} />
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "ordered-list") {
          const startNumber = block.start ?? 1;

          return (
            <ol key={`${block.type}-${index}`} className="space-y-3 border-l border-white/10 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`} className="grid grid-cols-[1.75rem_1fr] gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/12 bg-white/8 text-xs font-semibold text-[var(--marketing-accent)]">
                    {startNumber + itemIndex}
                  </span>
                  <span>
                    <RichTextInline text={item} />
                  </span>
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={`${block.type}-${index}`}>
            <RichTextInline text={block.text} />
          </p>
        );
      })}
    </div>
  );
}
