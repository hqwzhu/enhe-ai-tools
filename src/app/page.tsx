import { ArrowRight, BadgeCheck, Cpu, Layers3, Sparkles } from "lucide-react";
import { ButtonLink, Container, SectionTitle } from "@/components/ui";
import { ToolCard } from "@/components/tool-card";
import { prisma } from "@/lib/db";

export default async function HomePage() {
  const [software, onlineTools] = await Promise.all([
    prisma.tool.findMany({ where: { type: "software", status: "published" }, include: { category: true }, orderBy: { sortOrder: "asc" }, take: 3 }),
    prisma.tool.findMany({ where: { type: "online", status: "published" }, include: { category: true }, orderBy: { sortOrder: "asc" }, take: 3 })
  ]);

  return (
    <>
      <section className="relative overflow-hidden py-18 md:py-24">
        <Container className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-[#48F5D3]/30 bg-[#48F5D3]/10 px-4 py-2 text-sm text-[#48F5D3]">
              自研电脑软件与在线网页工具会员平台
            </div>
            <h1 className="max-w-5xl text-4xl font-semibold tracking-normal text-white sm:text-5xl xl:text-6xl">
              恩禾 ENHE AI工具站
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#8B95A7]">
              下载实用软件，使用在线工具，把重复工作交给自动化，把复杂流程变成一个按钮。
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/software">浏览电脑软件</ButtonLink>
              <ButtonLink href="/online-tools" variant="ghost">使用在线工具</ButtonLink>
            </div>
          </div>
          <div className="glass relative min-h-[430px] overflow-hidden rounded-[2rem] p-8">
            <div className="absolute right-8 top-8 text-[#48F5D3]"><Sparkles size={28} /></div>
            <div className="mt-16 space-y-4">
              {["自动化软件分发", "在线工具权限控制", "VIP 会员开通", "软件下载付费"].map((item, index) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/8 p-5" style={{ marginLeft: `${index * 18}px` }}>
                  <p className="text-sm text-[#8B95A7]">ENHE Workflow 0{index + 1}</p>
                  <p className="mt-2 text-xl font-semibold">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <Container className="space-y-20 pb-24">
        <section>
          <SectionTitle eyebrow="Featured Software" title="精选电脑软件工具" intro="面向高频桌面任务的软件工具，VIP 权限和付费下载可独立控制。" />
          <div className="grid gap-5 md:grid-cols-3">{software.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div>
        </section>
        <section>
          <SectionTitle eyebrow="Online Tools" title="精选在线网页工具" intro="无需安装，浏览器打开即可处理文本、文件和流程类任务。" />
          <div className="grid gap-5 md:grid-cols-3">{onlineTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div>
        </section>
        <section className="grid gap-5 md:grid-cols-3">
          {[
            ["VIP 会员权益", "使用会员在线工具，查看自己的订单、下载和使用记录。", BadgeCheck],
            ["使用流程", "注册账号，选择套餐或软件，上传付款截图，后台审核后自动开通。", ArrowRight],
            ["用户反馈", "评论区先审后显，后台可审核、驳回或删除，保持内容质量。", Layers3]
          ].map(([title, text, Icon]) => (
            <div key={title as string} className="glass rounded-2xl p-7">
              <Icon className="mb-6 text-[#7AA7FF]" />
              <h3 className="text-xl font-semibold">{title as string}</h3>
              <p className="mt-3 leading-7 text-[#8B95A7]">{text as string}</p>
            </div>
          ))}
        </section>
        <footer className="border-t border-white/10 py-10 text-sm text-[#8B95A7]">
          <Cpu className="mb-4 text-[#48F5D3]" />
          © 2026 恩禾 ENHE AI工具站. 为腾讯云 Docker + Nginx 部署预留。
        </footer>
      </Container>
    </>
  );
}
