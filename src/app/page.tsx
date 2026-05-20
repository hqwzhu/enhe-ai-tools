import Image from "next/image";
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
              自研电脑软件与在线网页工具分享共研平台
            </div>
            <h1 className="max-w-5xl text-4xl font-semibold tracking-normal text-white sm:text-5xl xl:text-6xl">
              ENHE AI Tools
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#8B95A7]">
              下载实用软件，使用在线工具，把重复工作交给自动化，把复杂流程变成一个按钮。
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/software">本地软件</ButtonLink>
              <ButtonLink href="/online-tools" variant="ghost">在线工具</ButtonLink>
            </div>
          </div>
          <div className="enhe-hero-mark relative mx-auto flex min-h-[460px] w-full max-w-[600px] items-center justify-center">
            <div className="enhe-holo-ring enhe-holo-ring-a" />
            <div className="enhe-holo-ring enhe-holo-ring-b" />
            <div className="enhe-holo-panel enhe-holo-panel-a" />
            <div className="enhe-holo-panel enhe-holo-panel-b" />
            <div className="enhe-orbit enhe-orbit-a" />
            <div className="enhe-orbit enhe-orbit-b" />
            <div className="enhe-orbit enhe-orbit-c" />
            <div className="enhe-logo-aura" />
            <div className="relative z-10 flex size-56 items-center justify-center rounded-[2rem] bg-transparent sm:size-64">
              <Image
                src="/images/enhe-logo.svg"
                alt="恩禾 ENHE AI"
                width={184}
                height={184}
                priority
                className="enhe-logo-float h-40 w-40 drop-shadow-[0_0_42px_rgba(72,245,211,0.36)] sm:h-48 sm:w-48"
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
      </Container>
    </>
  );
}
