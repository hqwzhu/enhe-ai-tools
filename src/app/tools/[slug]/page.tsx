import Image from "next/image";
import { notFound } from "next/navigation";
import { createCommentAction, createSoftwareDownloadOrderAction } from "@/app/actions";
import { Badge, ButtonLink, Container, SectionTitle } from "@/components/ui";
import { ToolCard } from "@/components/tool-card";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";
import { normalizeImageSrc } from "@/lib/media";
import { userHasVip } from "@/lib/membership";
import { reviewCompletionNotice, reviewCompletionNoticeEn } from "@/lib/review-copy";
import { canOpenProtectedDownloadEntry, canShowDownloadLinkArea, getDownloadLinkContent } from "@/lib/tool-download-link";

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [user, locale] = await Promise.all([getCurrentUser(), getCurrentLocale()]);
  const t = getDictionary(locale);
  const td = t.toolDetail;
  const reviewNotice = locale === "en" ? reviewCompletionNoticeEn : reviewCompletionNotice;
  const { slug } = await params;
  const tool = await prisma.tool.findUnique({
    where: { slug },
    include: {
      category: true,
      downloadFile: true,
      tagLinks: { include: { tag: true }, orderBy: { tag: { sortOrder: "asc" } } },
      tutorials: { where: { status: "active" }, orderBy: { sortOrder: "asc" } },
      changelogs: { where: { status: "active" }, orderBy: [{ releaseDate: "desc" }, { sortOrder: "asc" }] },
      comments: { where: { status: "approved" }, include: { user: true }, orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }] }
    }
  });
  if (!tool || tool.status !== "published") notFound();

  const coverImage = normalizeImageSrc(tool.coverImage);
  const [hasDownloadPurchase, hasVip] = user
    ? await Promise.all([
        prisma.toolPurchase.findUnique({ where: { userId_toolId: { userId: user.id, toolId: tool.id } } }).then(Boolean),
        userHasVip(user.id)
      ])
    : [false, false];
  const downloadLinkContent = getDownloadLinkContent(tool.downloadFile);
  const hasDownloadLink = Boolean(tool.downloadFileId && tool.downloadFile && downloadLinkContent);
  const showDownloadLinkArea = hasDownloadLink && canShowDownloadLinkArea({ isDownloadLinkVipOnly: tool.isDownloadLinkVipOnly, hasVip });
  const canOpenDownloadEntry = canOpenProtectedDownloadEntry(downloadLinkContent);
  const protectedDownloadHref = `/api/tools/${tool.id}/download`;
  const related = await prisma.tool.findMany({
    where: { type: tool.type, status: "published", id: { not: tool.id } },
    include: { category: true },
    take: 3
  });

  return (
    <Container className="py-14">
      <section className="glass overflow-hidden rounded-[2rem] p-4 md:p-6 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-stretch">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-[rgba(210,230,255,0.16)] bg-[#07101E]">
            <div className="relative aspect-[16/10] min-h-[260px] lg:min-h-[430px]">
              {coverImage ? (
                <Image src={coverImage} alt={tool.name} fill className="object-cover" sizes="(min-width: 1024px) 620px, 100vw" unoptimized />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(125,211,252,0.2),transparent_32%),radial-gradient(circle_at_72%_70%,rgba(142,167,255,0.18),transparent_36%),repeating-linear-gradient(135deg,rgba(238,246,255,0.08)_0_2px,transparent_2px_18px),linear-gradient(135deg,rgba(255,255,255,0.08),transparent)]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#030611]/82 via-[#030611]/12 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7DD3FC]">{td.coverLabel}</p>
                <p className="mt-2 line-clamp-2 text-2xl font-semibold text-[#F6FAFF]">{tool.name}</p>
                {tool.englishName ? <p className="mt-1 line-clamp-1 text-sm font-medium text-[#7DD3FC]">{tool.englishName}</p> : null}
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-col justify-between gap-6">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge>{tool.category?.name ?? td.uncategorized}</Badge>
                <Badge>{tool.type === "software" ? td.software : td.online}</Badge>
                <Badge className={tool.isVipRequired ? "text-[#FFB86B]" : "text-[#5EF1C7]"}>{tool.isVipRequired ? td.vip : td.free}</Badge>
                {tool.tagLinks.map(({ tag }) => (
                  <Badge key={tag.id} className="text-[#7DD3FC]">
                    {tag.name}
                  </Badge>
                ))}
              </div>

              <h1 className="mt-5 text-4xl font-semibold leading-tight text-[#F6FAFF] md:text-5xl">{tool.name}</h1>
              {tool.englishName ? <p className="mt-3 text-lg font-medium tracking-wide text-[#7DD3FC] md:text-xl">{tool.englishName}</p> : null}
              <p className="mt-5 max-w-3xl text-base leading-8 text-[#8F9DB2] md:text-lg">{tool.shortDescription}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Info label={td.version} value={tool.version ?? td.onlineVersion} />
                <Info label={td.systemRequirement} value={tool.systemRequirement ?? td.browser} />
                <Info label={td.downloadCount} value={String(tool.downloadCount)} />
                <Info label={td.usageCount} value={String(tool.usageCount)} />
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                {tool.type === "software" ? (
                  tool.isDownloadPaid && !hasDownloadPurchase ? (
                    <form action={createSoftwareDownloadOrderAction} className="flex flex-wrap items-center gap-3">
                      <input type="hidden" name="toolId" value={tool.id} />
                      <select name="paymentMethod" className="rounded-full border border-white/12 bg-[#07101E] px-4 py-3 text-sm text-[#F6FAFF]">
                        <option value="alipay">{td.alipay}</option>
                        <option value="wechat">{td.wechat}</option>
                      </select>
                      <button className="rounded-full bg-[#7DD3FC] px-5 py-3 text-sm font-semibold text-[#030611] transition hover:shadow-[0_0_26px_rgba(125,211,252,0.18)]">
                        {td.buyDownload.replace("{price}", Number(tool.downloadPrice).toFixed(2))}
                      </button>
                    </form>
                  ) : (
                    <ButtonLink href={`/api/tools/${tool.id}/download`}>{td.downloadSoftware}</ButtonLink>
                  )
                ) : (
                  <ButtonLink href={`/api/tools/${tool.id}/use`}>{td.useOnline}</ButtonLink>
                )}
                <ButtonLink href="/pricing" variant="ghost">
                  {td.openVip}
                </ButtonLink>
              </div>

              {tool.type === "software" && tool.isDownloadPaid ? (
                <p className="mt-4 text-sm leading-6 text-[#FFB86B]">{td.paidDownloadNote}</p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-[rgba(210,230,255,0.14)] bg-[rgba(238,246,255,0.06)] p-5">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-[#F6FAFF]">{td.changelogTitle}</h2>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#8F9DB2]">
                  {td.changelogCount.replace("{count}", String(tool.changelogs.length))}
                </span>
              </div>
              <div className="mt-4 grid gap-3">
                {tool.changelogs.length ? (
                  tool.changelogs.slice(0, 3).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-[#7DD3FC]">{item.version}</p>
                        {item.releaseDate ? <p className="text-xs text-[#8F9DB2]">{item.releaseDate.toLocaleDateString(locale === "en" ? "en-US" : "zh-CN")}</p> : null}
                      </div>
                      <h3 className="mt-2 font-semibold text-[#F6FAFF]">{item.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#8F9DB2]">{item.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl border border-white/10 bg-white/8 p-4 text-sm leading-6 text-[#8F9DB2]">{td.noChangelogs}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-10 space-y-10">
        <section className="glass rounded-2xl p-7">
          <SectionTitle title={td.introTitle} intro={td.productImagesIntro} />
          <div className={`mt-6 grid gap-8 ${tool.screenshots.length ? "lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" : ""}`}>
            <div className="rounded-2xl border border-white/10 bg-white/8 p-5">
              <p className="whitespace-pre-line text-base leading-8 text-[#C5D0E2]">{tool.content}</p>
            </div>
            {tool.screenshots.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {tool.screenshots.map((screenshot, index) => {
                  const imageSrc = normalizeImageSrc(screenshot);
                  return (
                    <div key={`${screenshot}-${index}`} className="overflow-hidden rounded-2xl border border-white/10 bg-[#07101E]">
                      <div className="relative aspect-[4/3]">
                        {imageSrc ? (
                          <Image src={imageSrc} alt={`${tool.name} ${td.productImageAlt} ${index + 1}`} fill className="object-cover" sizes="(min-width: 1024px) 360px, 50vw" unoptimized />
                        ) : (
                          <div className="absolute inset-0 bg-white/6" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>

        <section className="glass rounded-2xl p-7">
          <SectionTitle title={td.tutorialsTitle} intro={td.tutorialsIntro} />
          <div className="space-y-4">
            {tool.tutorials.map((tutorial, index) => (
              <div key={tutorial.id} className="rounded-2xl border border-white/10 bg-white/8 p-5">
                <p className="text-sm text-[#7DD3FC]">{td.step.replace("{index}", String(index + 1))}</p>
                <h3 className="mt-2 text-xl font-semibold">{tutorial.title}</h3>
                <p className="mt-3 leading-7 text-[#8F9DB2]">{tutorial.content}</p>
                {tutorial.notes ? (
                  <div className="mt-4 rounded-xl border border-[#5EF1C7]/20 bg-[#5EF1C7]/8 p-4">
                    <p className="text-sm font-semibold text-[#5EF1C7]">{td.notes}</p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#8F9DB2]">{tutorial.notes}</p>
                  </div>
                ) : null}
                {tutorial.commonErrors ? (
                  <div className="mt-4 rounded-xl border border-[#FFB86B]/20 bg-[#FFB86B]/8 p-4">
                    <p className="text-sm font-semibold text-[#FFB86B]">{td.commonErrors}</p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#8F9DB2]">{tutorial.commonErrors}</p>
                  </div>
                ) : null}
                {tutorial.videoUrl ? <p className="mt-3 text-sm text-[#C4B5FD]">{tutorial.videoUrl}</p> : null}
              </div>
            ))}
          </div>
        </section>

        <section className="glass rounded-2xl p-7">
          <SectionTitle title={td.commentsTitle} intro={td.commentsIntro.replace("{notice}", reviewNotice)} />
          {user ? (
            <form action={createCommentAction} className="mb-6">
              <input type="hidden" name="toolId" value={tool.id} />
              <input type="hidden" name="slug" value={tool.slug} />
              <textarea name="content" required className="min-h-28 w-full rounded-xl border border-white/12 bg-white/8 p-4 outline-none" placeholder={td.commentPlaceholder} />
              <p className="mt-2 text-xs leading-5 text-[#8F9DB2]">{reviewNotice}</p>
              <button className="mt-3 rounded-full bg-[#7DD3FC] px-5 py-3 font-semibold text-[#030611]">{td.submitComment}</button>
            </form>
          ) : (
            <p className="mb-6 text-sm text-[#8F9DB2]">{td.loginToComment}</p>
          )}
          <div className="space-y-3">
            {tool.comments.map((comment) => (
              <div key={comment.id} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                <p className="text-sm text-[#8F9DB2]">
                  {comment.user.nickname ?? comment.user.email} {comment.isPinned ? <span className="text-[#FFB86B]">· {td.pinned}</span> : null}
                </p>
                <p className="mt-2 leading-7">{comment.content}</p>
              </div>
            ))}
          </div>
        </section>

        {hasDownloadLink ? (
          <section className="glass rounded-2xl p-7">
            <SectionTitle title={td.downloadLinksTitle} intro={showDownloadLinkArea ? td.downloadLinksIntro : td.downloadLinksVipOnlyIntro} />
            {showDownloadLinkArea ? (
              <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/8 p-5">
                <div className="min-w-0">
                  <p className="text-sm text-[#8F9DB2]">{td.protectedDownloadLink}</p>
                  <p className="mt-2 whitespace-pre-wrap break-words text-base font-semibold leading-7 text-[#F6FAFF]">{downloadLinkContent}</p>
                  <p className="mt-2 text-sm text-[#8F9DB2]">{tool.downloadFile?.fileName ?? td.noDownloadFileName}</p>
                </div>
                {canOpenDownloadEntry ? (
                  <div>
                    <ButtonLink href={protectedDownloadHref}>{td.downloadNow}</ButtonLink>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-6 rounded-2xl border border-white/10 bg-white/8 p-5 text-sm leading-7 text-[#8F9DB2]">{td.downloadLinksHidden}</p>
            )}
          </section>
        ) : null}
      </div>

      <section className="mt-12">
        <SectionTitle title={td.relatedTitle} />
        <div className="grid gap-5 md:grid-cols-3">{related.map((item) => <ToolCard key={item.id} tool={item} locale={locale} />)}</div>
      </section>
    </Container>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/8 p-4">
      <p className="text-xs text-[#8F9DB2]">{label}</p>
      <p className="mt-2 font-semibold text-[#F6FAFF]">{value}</p>
    </div>
  );
}
