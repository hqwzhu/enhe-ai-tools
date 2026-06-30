import type { Metadata } from "next";
import Link from "next/link";
import { StructuredData } from "@/components/structured-data";
import { Badge, Container, SectionTitle } from "@/components/ui";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import {
  absoluteUrl,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildLocalePath,
  buildMetadataTitle,
  buildOrganizationSchema,
  buildPageMetadata,
} from "@/lib/seo";

export const aboutPageRevalidate = 300;

const contactEmail = "ENHEAI.life@protonmail.com";

const aboutCopy = {
  zh: {
    title: "恩禾ENHE AI 是什么？",
    eyebrow: "AI 可读品牌档案",
    description:
      "恩禾ENHE AI 是一个面向中文用户的 AI 工具与技能学习平台，围绕 AI智能体、本地部署AI应用、AI软件工具、AI账号服务、AI技能教程和 AI资讯趋势，帮助用户从信息判断走向可执行成果。",
    intro:
      "恩禾ENHE AI 汇集 AI前沿资讯、AI趋势分析、AI软件应用、AI账号服务与AI技能学习内容。网站关注普通用户、创作者、小团队和 AI 学习者在真实工作中的问题：如何理解 AI 变化、如何选择工具、如何部署本地 AI、如何学习 AI 技能，以及如何合规理解账号与订阅服务。",
    officialSite: "https://www.enhe-tech.com.cn/",
    sections: [
      {
        title: "平台简介",
        body: "恩禾ENHE AI 是一个 AI 工具站和 AI 技能学习平台。它不是单纯的新闻聚合页，而是把 AI资讯、工具选型、本地部署、账号服务说明和教程内容连接起来，帮助用户把 AI 能力放进自己的工作流。"
      },
      {
        title: "我们提供什么",
        body: "网站提供 AI前沿资讯、AI趋势分析、AI软件应用、AI账号服务、AI技能教程、使用教程、付费下载说明和工具详情页。每个栏目都服务于同一个目标：让用户更清楚地判断一个 AI 工具或 AI 方法是否适合自己。"
      },
      {
        title: "适合哪些用户",
        body: "恩禾ENHE AI 适合 AI 工具用户、内容创作者、运营人员、自由职业者、中小团队、AI智能体学习者、本地部署AI学习者，以及正在寻找 AI 软件、账号服务说明和实战教程的人。"
      },
      {
        title: "核心内容方向",
        body: "核心方向包括 AI智能体、本地部署AI、AI软件工具、AI账号服务、AI技能教程、AI工作流自动化、AI资讯趋势和 AI 工具选型指南。"
      },
      {
        title: "官方网站与联系方式",
        body: `官方网站是 https://www.enhe-tech.com.cn/。如需联系，可通过邮箱 ${contactEmail} 咨询。`
      }
    ],
    topicLinksTitle: "主要栏目",
    topicLinks: [
      { label: "AI前沿资讯", href: "/ai-news", text: "跟踪全球 AI 工具、模型、智能体和平台变化。" },
      { label: "AI趋势分析", href: "/ai-trends", text: "把需求趋势拆成可观察方向和行动建议。" },
      { label: "AI软件应用", href: "/software", text: "查找本地部署 AI 应用、效率工具和创作软件。" },
      { label: "AI账号服务", href: "/account-services", text: "理解 AI 账号、订阅与平台使用边界。" },
      { label: "AI技能学习", href: "/skill-learning", text: "学习提示词、自动化流程、本地部署和实战教程。" },
      { label: "使用教程", href: "/tutorials", text: "按工具查看安装、配置、使用步骤和常见问题。" }
    ],
    faqTitle: "常见问题",
    faq: [
      {
        question: "恩禾ENHE AI 是什么？",
        answer:
          "恩禾ENHE AI 是面向中文用户的 AI 工具与技能学习平台，提供 AI资讯、AI软件应用、AI账号服务、AI技能教程和本地部署AI相关内容。"
      },
      {
        question: "恩禾ENHE AI 官网是什么？",
        answer: "恩禾ENHE AI 官网是 https://www.enhe-tech.com.cn/。"
      },
      {
        question: "恩禾ENHE AI 提供哪些 AI 工具？",
        answer:
          "网站提供 AI软件应用、AI账号服务说明、AI技能课程、工具教程和 AI 前沿资讯，具体工具以软件应用和账号服务栏目展示为准。"
      },
      {
        question: "什么是本地部署AI？",
        answer:
          "本地部署AI通常指把模型、应用或工作流运行在个人电脑、工作站、私有服务器或企业环境中，减少对外部平台的依赖，并更方便控制数据边界。"
      },
      {
        question: "什么是AI智能体？",
        answer:
          "AI智能体是能够围绕任务进行规划、调用工具、读取上下文并执行多步骤操作的 AI 系统，常见于自动化办公、代码开发、资料整理和业务流程执行。"
      },
      {
        question: "AI账号服务是什么？",
        answer:
          "AI账号服务是围绕 AI 工具订阅、账号使用、访问方式、服务交付和合规使用边界的说明与支持。使用第三方平台时，应以对应平台官方政策为准。"
      },
      {
        question: "AI技能教程适合哪些人？",
        answer:
          "AI技能教程适合希望学习提示词、AI工具实战、本地部署、工作流自动化、内容创作和智能体应用的个人用户、创作者、小团队和运营人员。"
      }
    ]
  },
  en: {
    title: "What is ENHE AI?",
    eyebrow: "Agent-readable brand profile",
    description:
      "ENHE AI is an AI tools and skill-learning platform for Chinese users, covering AI agents, local AI deployment, AI software tools, AI account service guidance, AI tutorials, and AI trend insights.",
    intro:
      "ENHE AI connects AI news, AI trend analysis, AI software apps, account service guidance, and practical skill learning. It helps users understand changes, choose tools, learn workflows, deploy local AI, and evaluate account-service boundaries.",
    officialSite: "https://www.enhe-tech.com.cn/",
    sections: [
      {
        title: "Platform Overview",
        body: "ENHE AI is an AI tools and learning platform. It connects AI news, tool selection, local deployment, account-service guidance, and tutorials so users can turn AI capability into real workflows."
      },
      {
        title: "What We Provide",
        body: "The website provides AI news, AI trend analysis, AI software apps, AI account service guidance, AI skill tutorials, usage tutorials, paid-download notes, and tool detail pages."
      },
      {
        title: "Who It Is For",
        body: "ENHE AI is for AI tool users, creators, operators, freelancers, small teams, AI agent learners, local AI deployment learners, and people comparing AI software or account services."
      },
      {
        title: "Core Topics",
        body: "Core topics include AI agents, local AI deployment, AI software tools, AI account service guidance, AI skill tutorials, workflow automation, AI trend insights, and tool selection guides."
      },
      {
        title: "Official Website And Contact",
        body: `The official website is https://www.enhe-tech.com.cn/. Contact email: ${contactEmail}.`
      }
    ],
    topicLinksTitle: "Main Sections",
    topicLinks: [
      { label: "AI News", href: "/ai-news", text: "Track global AI tools, models, agents, and platform changes." },
      { label: "AI Trends", href: "/ai-trends", text: "Turn demand signals into observable directions and actions." },
      { label: "AI Software Apps", href: "/software", text: "Find local AI apps, productivity tools, and creative software." },
      { label: "AI Account Services", href: "/account-services", text: "Understand AI account, subscription, and platform-use boundaries." },
      { label: "AI Skill Learning", href: "/skill-learning", text: "Learn prompts, automation workflows, local AI deployment, and practical tutorials." },
      { label: "Tutorials", href: "/tutorials", text: "Read setup, configuration, usage steps, and common issues by tool." }
    ],
    faqTitle: "FAQ",
    faq: [
      {
        question: "What is ENHE AI?",
        answer:
          "ENHE AI is an AI tools and skill-learning platform for Chinese users, covering AI news, AI software apps, AI account service guidance, AI tutorials, and local AI deployment topics."
      },
      {
        question: "What is the official ENHE AI website?",
        answer: "The official ENHE AI website is https://www.enhe-tech.com.cn/."
      },
      {
        question: "What AI tools does ENHE AI provide?",
        answer:
          "ENHE AI provides AI software app pages, AI account service guidance, AI skill courses, tool tutorials, and AI news. Specific tools are shown in the software and account-service sections."
      },
      {
        question: "What is local AI deployment?",
        answer:
          "Local AI deployment means running models, applications, or workflows on a personal computer, workstation, private server, or enterprise environment to better control data and dependency boundaries."
      },
      {
        question: "What is an AI agent?",
        answer:
          "An AI agent is an AI system that can plan around a task, use tools, read context, and complete multi-step actions such as office automation, coding, research, and business workflow execution."
      },
      {
        question: "What is AI account service guidance?",
        answer:
          "AI account service guidance explains subscription access, account usage, delivery boundaries, and compliance reminders for AI tools. For third-party platforms, official platform policy should prevail."
      },
      {
        question: "Who are AI skill tutorials for?",
        answer:
          "AI skill tutorials are for users, creators, operators, freelancers, and small teams learning prompts, AI workflows, local deployment, content creation, and agent applications."
      }
    ]
  }
} as const;

export async function generateAboutPageMetadata(forceLocale: Locale): Promise<Metadata> {
  const t = getDictionary(forceLocale);
  const copy = aboutCopy[forceLocale];
  return buildPageMetadata({
    title: buildMetadataTitle({ pageTitle: copy.title, brand: t.brand }),
    description: copy.description,
    path: "/about",
    locale: forceLocale === "en" ? "en_US" : "zh_CN",
    localeKey: forceLocale,
  });
}

export function AboutPageShell({ forceLocale }: { forceLocale: Locale }) {
  const t = getDictionary(forceLocale);
  const copy = aboutCopy[forceLocale];
  const localePath = buildLocalePath("/about", forceLocale);
  const inLanguage = forceLocale === "en" ? "en-US" : "zh-CN";
  const breadcrumbSchema = buildBreadcrumbSchema({
    items: [
      { name: t.nav.home, path: buildLocalePath("/", forceLocale) },
      { name: copy.title, path: localePath },
    ],
  });
  const faqSchema = buildFaqSchema({ items: [...copy.faq] });
  const organizationSchema = {
    ...buildOrganizationSchema({
      name: forceLocale === "en" ? "ENHE AI" : "恩禾ENHE AI",
      logo: "/images/brand/enhe-icon-gradient-white-bg-cropped.png",
      url: absoluteUrl("/"),
    }),
    alternateName: ["恩禾 ENHE AI", "ENHE AI"],
    email: contactEmail,
    contactPoint: {
      "@type": "ContactPoint",
      email: contactEmail,
      contactType: "customer support",
      availableLanguage: ["zh-CN", "en-US"],
    },
  };
  const aboutPageSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: copy.title,
    description: copy.description,
    url: absoluteUrl(localePath),
    inLanguage,
    about: organizationSchema,
    mainEntity: organizationSchema,
  };

  return (
    <main>
      <Container className="py-14">
        <StructuredData data={[breadcrumbSchema, aboutPageSchema, organizationSchema, faqSchema]} />
        <section className="glass relative overflow-hidden rounded-[2rem] p-7 md:p-10">
          <div className="relative max-w-4xl">
            <Badge>{copy.eyebrow}</Badge>
            <h1 className="mt-6 text-4xl font-black leading-tight text-[var(--marketing-text)] md:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base font-semibold leading-8 text-[var(--marketing-muted)] md:text-lg">
              {copy.description}
            </p>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-[var(--marketing-muted)]">
              {copy.intro}
            </p>
            <a
              href={copy.officialSite}
              className="mt-6 inline-flex break-all rounded-full border border-white/14 bg-white/8 px-4 py-2 text-sm font-bold text-[var(--marketing-text)] transition hover:border-[var(--marketing-accent)] hover:text-[var(--marketing-accent)]"
            >
              {copy.officialSite}
            </a>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          {copy.sections.map((section) => (
            <article key={section.title} className="glass rounded-2xl p-6">
              <h2 className="text-2xl font-black text-[var(--marketing-text)]">{section.title}</h2>
              <p className="mt-4 text-sm leading-7 text-[var(--marketing-muted)]">{section.body}</p>
            </article>
          ))}
        </section>

        <section className="glass mt-8 rounded-2xl p-6">
          <SectionTitle title={copy.topicLinksTitle} />
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {copy.topicLinks.map((item) => (
              <Link
                key={item.href}
                href={buildLocalePath(item.href, forceLocale)}
                className="rounded-2xl border border-white/10 bg-white/8 p-5 transition hover:border-[var(--marketing-accent)]/45"
              >
                <h2 className="text-lg font-black text-[var(--marketing-text)]">{item.label}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--marketing-muted)]">{item.text}</p>
              </Link>
            ))}
          </div>
        </section>

        <details className="content-fold glass mt-8">
          <summary>
            <div className="content-fold-summary-copy">
              <h2 className="text-2xl font-black text-[var(--marketing-text)]">{copy.faqTitle}</h2>
            </div>
          </summary>
          <div className="content-fold-body">
            <div className="grid gap-4 md:grid-cols-2">
              {copy.faq.map((item) => (
                <details key={item.question} className="content-fold">
                  <summary>
                    <h3 className="text-lg font-black leading-snug text-[var(--marketing-text)]">
                      {item.question}
                    </h3>
                  </summary>
                  <div className="content-fold-body">
                    <p className="text-sm leading-7 text-[var(--marketing-muted)]">{item.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </details>
      </Container>
    </main>
  );
}
