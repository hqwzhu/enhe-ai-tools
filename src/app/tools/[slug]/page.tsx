import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createCommentAction, createSoftwareDownloadOrderAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Badge, ButtonLink, Container, SectionTitle } from "@/components/ui";
import { ToolCard } from "@/components/tool-card";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";
import { normalizeImageSrc } from "@/lib/media";
import { buildPageMetadata } from "@/lib/seo";
import {
  canOpenProtectedDownloadEntry,
  canShowDownloadLinkArea,
  getDownloadLinkContent,
  resolveSoftwareDownloadCtaHref
} from "@/lib/tool-download-link";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, getCurrentLocale()]);
  const t = getDictionary(locale);
  const tool = await prisma.tool.findUnique({
    where: { slug },
    select: { name: true, englishName: true, shortDescription: true, coverImage: true, status: true }
  });
  const canonical = `/tools/${slug}`;
  if (!tool || tool.status !== "published") {
    return buildPageMetadata({
      title: `${t.toolDetail.introTitle} - ${t.brand}`,
      description: t.listing.emptyText,
      path: canonical
    });
  }

  return buildPageMetadata({
    title: `${tool.name}${tool.englishName ? ` ${tool.englishName}` : ""} - ${t.brand}`,
    description: tool.shortDescription,
    path: canonical,
    image: normalizeImageSrc(tool.coverImage)
  });
}

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [user, locale] = await Promise.all([getCurrentUser(), getCurrentLocale()]);
  const t = getDictionary(locale);
  const td = t.toolDetail;
  const { slug } = await params;
  const tool = await prisma.tool.findUnique({
    where: { slug },
    include: {
      category: true,
      downloadFile: true,
      tagLinks: { include: { tag: true }, orderBy: { tag: { sortOrder: "asc" } } },
      tutorials: { where: { status: "active" }, orderBy: { sortOrder: "asc" } },
      faqs: { where: { status: "active" }, orderBy: { sortOrder: "asc" } },
      changelogs: { where: { status: "active" }, orderBy: [{ releaseDate: "desc" }, { sortOrder: "asc" }] },
      comments: { where: { status: "approved" }, include: { user: true }, orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }] }
    }
  });
  if (!tool || tool.status !== "published") notFound();

  const coverImage = normalizeImageSrc(tool.coverImage);
  const hasDownloadPurchase = user
    ? await prisma.toolPurchase.findUnique({ where: { userId_toolId: { userId: user.id, toolId: tool.id } } }).then(Boolean)
    : false;
  const downloadLinkContent = getDownloadLinkContent(tool.downloadFile);
  const hasDownloadLink = Boolean(tool.downloadFileId && tool.downloadFile && downloadLinkContent);
  const showDownloadLinkArea = canShowDownloadLinkArea({
    hasDownloadLink,
    isDownloadPaid: tool.isDownloadPaid,
    hasDownloadPurchase
  });
  const canOpenDownloadEntry = canOpenProtectedDownloadEntry(downloadLinkContent);
  const protectedDownloadHref = `/api/tools/${tool.id}/download`;
  const softwareDownloadCtaHref = resolveSoftwareDownloadCtaHref({
    hasDownloadLink,
    showDownloadLinkArea,
    isDownloadPaid: tool.isDownloadPaid,
    hasDownloadPurchase,
    protectedDownloadHref
  });
  const related = await prisma.tool.findMany({
    where: { type: tool.type, status: "published", id: { not: tool.id } },
    include: { category: true },
    take: 3
  });
  const tutorialVideos = tool.tutorials.filter((tutorial) => tutorial.videoUrl);
  const supportEmail = td.supportEmailValue;

  return (
    <Container className="py-14">
      <section className="glass overflow-hidden rounded-[2rem] p-4 md:p-6 lg:p-8">
        <div className="tool-detail-hero-stack flex flex-col gap-8">
          <div className="tool-detail-cover-frame relative overflow-hidden rounded-[1.75rem] border border-[rgba(210,230,255,0.16)] bg-[#07101E]">
            <div className="relative aspect-[16/9]">
              {coverImage ? (
                <Image src={coverImage} alt={tool.name} fill className="object-contain" sizes="(min-width: 1024px) 1120px, 100vw" unoptimized />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(125,211,252,0.2),transparent_32%),radial-gradient(circle_at_72%_70%,rgba(142,167,255,0.18),transparent_36%),repeating-linear-gradient(135deg,rgba(238,246,255,0.08)_0_2px,transparent_2px_18px),linear-gradient(135deg,rgba(255,255,255,0.08),transparent)]" />
              )}
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-7">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge>{tool.category?.name ?? td.uncategorized}</Badge>
                <Badge>{tool.type === "software" ? td.software : td.online}</Badge>
                <Badge className={tool.type === "software" && tool.isDownloadPaid ? "text-[#FFB86B]" : "text-[#5EF1C7]"}>
                  {tool.type === "software" && tool.isDownloadPaid ? (locale === "en" ? "Paid software" : "收费软件") : td.free}
                </Badge>
                {tool.tagLinks.map(({ tag }) => (
                  <Badge key={tag.id} className="text-[#7DD3FC]">
                    {tag.name}
                  </Badge>
                ))}
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#7DD3FC]">{td.coverLabel}</p>
              <h1 className="mt-5 text-4xl font-semibold leading-tight text-[#F6FAFF] md:text-5xl">{tool.name}</h1>
              {tool.englishName ? <p className="mt-3 text-lg font-medium tracking-wide text-[#7DD3FC] md:text-xl">{tool.englishName}</p> : null}
              <p className="mt-5 max-w-3xl text-base leading-8 text-[#8F9DB2] md:text-lg">{tool.shortDescription}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Info label={td.version} value={tool.version ?? td.onlineVersion} />
                <Info label={td.systemRequirement} value={tool.systemRequirement ?? td.browser} />
                <Info label={td.downloadCount} value={String(tool.downloadCount)} />
                <Info label={td.usageCount} value={String(tool.usageCount)} />
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                {tool.type === "software" ? (
                  tool.isDownloadPaid && !hasDownloadPurchase ? (
                    <form id="download-purchase" action={createSoftwareDownloadOrderAction} className="flex flex-wrap items-center gap-3">
                      <input type="hidden" name="toolId" value={tool.id} />
                      <select name="paymentMethod" className="rounded-full border border-white/12 bg-[#07101E] px-4 py-3 text-sm text-[#F6FAFF]">
                        <option value="alipay">{td.alipay}</option>
                        <option value="wechat">{td.wechat}</option>
                      </select>
                      <FormSubmitButton pendingLabel="创建订单中...">
                        {td.buyDownload.replace("{price}", Number(tool.downloadPrice).toFixed(2))}
                      </FormSubmitButton>
                    </form>
                  ) : (
                    <ButtonLink href={softwareDownloadCtaHref}>{td.downloadSoftware}</ButtonLink>
                  )
                ) : (
                  <ButtonLink href={`/api/tools/${tool.id}/use`}>{td.useOnline}</ButtonLink>
                )}
              </div>

              {tool.type === "software" && tool.isDownloadPaid ? (
                <p className="mt-4 text-sm leading-6 text-[#FFB86B]">
                  {locale === "en"
                    ? "This software is a paid download. Payment review unlocks this tool's download-link content."
                    : "该软件为收费软件，付款审核通过后可查看该工具的下载链接内容。"}
                </p>
              ) : null}
            </div>

            <div id="tool-changelog" className="scroll-mt-24 rounded-2xl border border-[rgba(210,230,255,0.14)] bg-[rgba(238,246,255,0.06)] p-5">
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
          <SectionTitle title={td.trustTitle} intro={td.trustIntro} />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <TrustItem label={td.demoVideo}>
              {tutorialVideos.length ? (
                <div className="space-y-2">
                  {tutorialVideos.slice(0, 2).map((tutorial) => (
                    <a key={tutorial.id} href={tutorial.videoUrl ?? "#"} target="_blank" rel="noreferrer" className="block break-all text-sm leading-6 text-[#7DD3FC] hover:text-[#BFE9FF]">
                      {tutorial.title}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-[#8F9DB2]">{td.demoVideoFallback}</p>
              )}
            </TrustItem>
            <TrustItem label={td.systemRequirement}>
              <p className="text-sm leading-6 text-[#C5D0E2]">{tool.systemRequirement ?? td.browser}</p>
              <p className="mt-2 text-xs text-[#8F9DB2]">{td.version}：{tool.version ?? td.onlineVersion}</p>
            </TrustItem>
            <TrustItem label={td.updateLog}>
              <p className="text-sm leading-6 text-[#C5D0E2]">{td.changelogCount.replace("{count}", String(tool.changelogs.length))}</p>
              <Link href="#tool-changelog" className="mt-2 inline-flex text-sm font-semibold text-[#7DD3FC] hover:text-[#BFE9FF]">
                {td.changelogTitle}
              </Link>
            </TrustItem>
            <TrustItem label={td.supportEmail}>
              <a href={`mailto:${supportEmail}`} className="break-all text-sm font-semibold text-[#7DD3FC] hover:text-[#BFE9FF]">
                {supportEmail}
              </a>
              <Link href="/legal/membership-refund" className="mt-2 block text-sm leading-6 text-[#FFB86B] hover:text-[#FFD29B]">
                {td.refundRulesIntro}
              </Link>
            </TrustItem>
          </div>
        </section>

        <section className="glass rounded-2xl p-7">
          <SectionTitle title={td.introTitle} intro={td.productImagesIntro} />
          <div className="mt-6 space-y-7">
            {tool.screenshots.length ? (
              <div className="tool-detail-product-gallery grid gap-5">
                {tool.screenshots.map((screenshot, index) => {
                  const imageSrc = normalizeImageSrc(screenshot);
                  return (
                    <div key={`${screenshot}-${index}`} className="tool-detail-product-image-frame overflow-hidden rounded-2xl border border-white/10 bg-[#07101E] p-3">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#030A14]">
                        {imageSrc ? (
                          <Image src={imageSrc} alt={`${tool.name} ${td.productImageAlt} ${index + 1}`} fill className="object-contain" sizes="(min-width: 1024px) 1040px, 100vw" unoptimized />
                        ) : (
                          <div className="absolute inset-0 bg-white/6" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
            <div className="tool-detail-copy-card rounded-2xl border border-white/10 bg-white/8 p-5">
              <p className="whitespace-pre-line text-base leading-8 text-[#C5D0E2]">{tool.content}</p>
            </div>
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
          <SectionTitle title={td.faqTitle} />
          <div className="mt-5 grid gap-3">
            {tool.faqs.length ? (
              tool.faqs.map((faq) => (
                <details key={faq.id} className="rounded-2xl border border-white/10 bg-white/8 p-5">
                  <summary className="cursor-pointer list-none font-semibold text-[#F6FAFF] [&::-webkit-details-marker]:hidden">
                    {faq.question}
                  </summary>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#8F9DB2]">{faq.answer}</p>
                </details>
              ))
            ) : (
              <p className="rounded-2xl border border-white/10 bg-white/8 p-5 text-sm leading-6 text-[#8F9DB2]">{td.noFaqs}</p>
            )}
          </div>
        </section>

        <section className="glass rounded-2xl p-7">
          <SectionTitle title={td.commentsTitle} />
          {user ? (
            <form action={createCommentAction} className="mb-6">
              <input type="hidden" name="toolId" value={tool.id} />
              <input type="hidden" name="slug" value={tool.slug} />
              <textarea name="content" required className="min-h-28 w-full rounded-xl border border-white/12 bg-white/8 p-4 outline-none" placeholder={td.commentPlaceholder} />
              <FormSubmitButton className="mt-3 text-base" pendingLabel="提交中...">{td.submitComment}</FormSubmitButton>
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

        {showDownloadLinkArea ? (
          <section id="download-links" className="glass scroll-mt-24 rounded-2xl p-7">
            <SectionTitle title={td.downloadLinksTitle} intro={td.downloadLinksIntro} />
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

function TrustItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 p-5">
      <p className="text-sm font-semibold text-[#F6FAFF]">{label}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}
