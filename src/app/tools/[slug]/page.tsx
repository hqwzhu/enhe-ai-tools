import { notFound } from "next/navigation";
import { createCommentAction, createSoftwareDownloadOrderAction } from "@/app/actions";
import { Badge, ButtonLink, Container, SectionTitle } from "@/components/ui";
import { ToolCard } from "@/components/tool-card";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  const { slug } = await params;
  const tool = await prisma.tool.findUnique({
    where: { slug },
    include: {
      category: true,
      tagLinks: { include: { tag: true }, orderBy: { tag: { sortOrder: "asc" } } },
      tutorials: { where: { status: "active" }, orderBy: { sortOrder: "asc" } },
      faqs: { where: { status: "active" }, orderBy: { sortOrder: "asc" } },
      changelogs: { where: { status: "active" }, orderBy: [{ releaseDate: "desc" }, { sortOrder: "asc" }] },
      comments: { where: { status: "approved" }, include: { user: true }, orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }] }
    }
  });
  if (!tool || tool.status !== "published") notFound();

  const hasDownloadPurchase = user
    ? Boolean(await prisma.toolPurchase.findUnique({ where: { userId_toolId: { userId: user.id, toolId: tool.id } } }))
    : false;
  const related = await prisma.tool.findMany({
    where: { type: tool.type, status: "published", id: { not: tool.id } },
    include: { category: true },
    take: 3
  });

  return (
    <Container className="py-14">
      <div className="glass rounded-[2rem] p-8">
        <div className="flex flex-wrap gap-2">
          <Badge>{tool.category?.name ?? "未分类"}</Badge>
          <Badge>{tool.type === "software" ? "电脑软件" : "在线网页工具"}</Badge>
          <Badge className={tool.isVipRequired ? "text-[#FFB86B]" : "text-[#48F5D3]"}>{tool.isVipRequired ? "VIP" : "免费"}</Badge>
          {tool.tagLinks.map(({ tag }) => (
            <Badge key={tag.id} className="text-[#48F5D3]">{tag.name}</Badge>
          ))}
        </div>
        <h1 className="mt-6 text-4xl font-semibold md:text-6xl">{tool.name}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[#8B95A7]">{tool.shortDescription}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          {tool.type === "software" ? (
            tool.isDownloadPaid && !hasDownloadPurchase ? (
              <form action={createSoftwareDownloadOrderAction} className="flex flex-wrap items-center gap-3">
                <input type="hidden" name="toolId" value={tool.id} />
                <select name="paymentMethod" className="rounded-full border border-white/12 bg-[#111827] px-4 py-3 text-sm">
                  <option value="alipay">支付宝</option>
                  <option value="wechat">微信</option>
                </select>
                <button className="rounded-full bg-[#7AA7FF] px-5 py-3 text-sm font-semibold text-[#07101f]">
                  购买下载 ¥{Number(tool.downloadPrice).toFixed(2)}
                </button>
              </form>
            ) : (
              <ButtonLink href={`/api/tools/${tool.id}/download`}>下载软件</ButtonLink>
            )
          ) : (
            <ButtonLink href={`/api/tools/${tool.id}/use`}>在线使用</ButtonLink>
          )}
          <ButtonLink href="/pricing" variant="ghost">开通 VIP</ButtonLink>
        </div>
        {tool.type === "software" && tool.isDownloadPaid ? (
          <p className="mt-4 text-sm text-[#FFB86B]">该软件为单独付费下载，VIP 用户也需要购买后才能下载。</p>
        ) : null}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-10">
          <section className="glass rounded-2xl p-7">
            <SectionTitle title="工具介绍" intro={tool.content} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="版本" value={tool.version ?? "在线版本"} />
              <Info label="系统要求" value={tool.systemRequirement ?? "浏览器"} />
              <Info label="下载次数" value={String(tool.downloadCount)} />
              <Info label="使用次数" value={String(tool.usageCount)} />
            </div>
          </section>

          <section className="glass rounded-2xl p-7">
            <SectionTitle title="使用教程" intro="每个工具支持独立教程、步骤排序、图片和视频链接。" />
            <div className="space-y-4">
              {tool.tutorials.map((tutorial, index) => (
                <div key={tutorial.id} className="rounded-2xl border border-white/10 bg-white/8 p-5">
                  <p className="text-sm text-[#48F5D3]">STEP {index + 1}</p>
                  <h3 className="mt-2 text-xl font-semibold">{tutorial.title}</h3>
                  <p className="mt-3 leading-7 text-[#8B95A7]">{tutorial.content}</p>
                  {tutorial.videoUrl ? <p className="mt-3 text-sm text-[#A78BFA]">{tutorial.videoUrl}</p> : null}
                </div>
              ))}
            </div>
          </section>

          <section className="glass rounded-2xl p-7">
            <SectionTitle title="常见问题" intro="后台可为每个工具维护独立 FAQ。" />
            <div className="space-y-4">
              {tool.faqs.length ? tool.faqs.map((faq) => (
                <div key={faq.id} className="rounded-2xl border border-white/10 bg-white/8 p-5">
                  <h3 className="text-lg font-semibold">{faq.question}</h3>
                  <p className="mt-3 leading-7 text-[#8B95A7]">{faq.answer}</p>
                </div>
              )) : <p className="text-sm text-[#8B95A7]">暂无常见问题。</p>}
            </div>
          </section>

          <section className="glass rounded-2xl p-7">
            <SectionTitle title="用户评论" intro="评论提交后进入后台审核，通过后展示。" />
            {user ? (
              <form action={createCommentAction} className="mb-6">
                <input type="hidden" name="toolId" value={tool.id} />
                <input type="hidden" name="slug" value={tool.slug} />
                <textarea name="content" required className="min-h-28 w-full rounded-xl border border-white/12 bg-white/8 p-4 outline-none" placeholder="写下你的使用体验" />
                <button className="mt-3 rounded-full bg-[#7AA7FF] px-5 py-3 font-semibold text-[#07101f]">提交评论</button>
              </form>
            ) : (
              <p className="mb-6 text-sm text-[#8B95A7]">登录后可以评论。</p>
            )}
            <div className="space-y-3">
              {tool.comments.map((comment) => (
                <div key={comment.id} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                  <p className="text-sm text-[#8B95A7]">{comment.user.nickname ?? comment.user.email}</p>
                  <p className="mt-2 leading-7">{comment.content}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold">版本更新记录</h2>
            <div className="mt-4 space-y-4">
              {tool.changelogs.length ? tool.changelogs.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                  <p className="text-sm text-[#48F5D3]">{item.version}</p>
                  <h3 className="mt-2 font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#8B95A7]">{item.content}</p>
                  {item.releaseDate ? <p className="mt-2 text-xs text-[#8B95A7]">{item.releaseDate.toLocaleDateString("zh-CN")}</p> : null}
                </div>
              )) : <p className="text-sm leading-6 text-[#8B95A7]">暂无更新记录。</p>}
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-12">
        <SectionTitle title="相关推荐工具" />
        <div className="grid gap-5 md:grid-cols-3">{related.map((item) => <ToolCard key={item.id} tool={item} />)}</div>
      </section>
    </Container>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/8 p-4">
      <p className="text-xs text-[#8B95A7]">{label}</p>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  );
}
