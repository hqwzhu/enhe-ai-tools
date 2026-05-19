import Image from "next/image";
import { ArrowRight, BadgeCheck, Cpu, Layers3 } from "lucide-react";
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
          <div className="enhe-hero-mark relative mx-auto flex min-h-[430px] w-full max-w-[560px] items-center justify-center overflow-hidden">
            <div className="enhe-orbit enhe-orbit-a" />
            <div className="enhe-orbit enhe-orbit-b" />
            <div className="enhe-orbit enhe-orbit-c" />
            <div className="enhe-logo-aura" />
            <div className="relative z-10 flex size-56 items-center justify-center rounded-[2rem] border border-white/14 bg-white/7 shadow-[0_0_90px_rgba(72,245,211,0.20)] backdrop-blur-xl sm:size-64">
              <Image
                src="/images/enhe-logo.svg"
                alt="恩禾 ENHE"
                width={184}
                height={184}
                priority
                className="enhe-logo-float h-40 w-40 drop-shadow-[0_0_34px_rgba(72,245,211,0.28)] sm:h-48 sm:w-48"
              />
            </div>
            <span className="enhe-signal enhe-signal-1" />
            <span className="enhe-signal enhe-signal-2" />
            <span className="enhe-signal enhe-signal-3" />
          </div>
        </Container>
      </section>

      <Container className="space-y-20 pb-24">
        <div className="grid gap-10 lg:grid-cols-2">
          <section>
            <SectionTitle eyebrow="Featured Software" title="精选电脑软件工具" intro="面向高频桌面任务的软件工具，VIP 权限和付费下载可独立控制。" />
            <div className="grid gap-5">{software.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div>
          </section>
          <section>
            <SectionTitle eyebrow="Online Tools" title="精选在线网页工具" intro="无需安装，浏览器打开即可处理文本、文件和流程类任务。" />
            <div className="grid gap-5">{onlineTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div>
          </section>
        </div>
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
