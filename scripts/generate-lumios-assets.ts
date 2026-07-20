import { mkdir, readFile, writeFile } from "node:fs/promises";
import * as path from "node:path";
import { chromium } from "playwright";

const productSlug = "lumios-personal-ai-companion";
const productDir = path.join(
  process.cwd(),
  "public",
  "images",
  "products",
  "enhe-visuals",
  productSlug,
);
const newsDir = path.join(process.cwd(), "public", "images", "ai-news");

const productCoverFile = "cover.png";
const newsCoverFile = "lumios-ai-desktop-companion-cover.png";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function getBrandIconDataUri() {
  const iconPath = path.join(
    process.cwd(),
    "public",
    "images",
    "brand",
    "enhe-icon-gradient-transparent-cropped.png",
  );
  const icon = await readFile(iconPath);
  return `data:image/png;base64,${icon.toString("base64")}`;
}

function featureIcon(kind: "memory" | "model" | "mcp" | "voice" | "desk") {
  const iconMap = {
    memory: `<span class="glyph glyph-memory"><i></i><i></i><i></i></span>`,
    model: `<span class="glyph glyph-model"><i></i><i></i><i></i></span>`,
    mcp: `<span class="glyph glyph-mcp"><i></i><i></i><i></i></span>`,
    voice: `<span class="glyph glyph-voice"><i></i><i></i><i></i></span>`,
    desk: `<span class="glyph glyph-desk"><i></i><i></i><i></i></span>`,
  };
  return iconMap[kind];
}

function baseStyles() {
  return `
    :root {
      --ink: #06142d;
      --muted: #536178;
      --soft: #eef3fb;
      --line: rgba(139, 160, 190, .38);
      --navy: #061225;
      --navy-2: #081a34;
      --glass: rgba(211, 224, 246, .12);
      --glass-line: rgba(223, 235, 255, .34);
      --blue: #3f84ff;
      --cyan: #76d9ff;
      --ice: #dceaff;
      --white: #f8fbff;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; width: 1600px; height: 900px; }
    body {
      font-family: "Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", Arial, sans-serif;
      color: var(--ink);
      background: #e8eef7;
    }
    .poster {
      position: relative;
      width: 1600px;
      height: 900px;
      overflow: hidden;
      background:
        radial-gradient(circle at 28% 28%, rgba(255,255,255,.92), transparent 24%),
        radial-gradient(circle at 69% 58%, rgba(74,132,255,.28), transparent 22%),
        linear-gradient(103deg, #f8fbff 0%, #d7e0ec 39%, #172946 61%, #030d1e 100%);
      isolation: isolate;
    }
    .poster::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        linear-gradient(90deg, rgba(255,255,255,.36) 0 1px, transparent 1px 120px),
        linear-gradient(0deg, rgba(255,255,255,.22) 0 1px, transparent 1px 120px);
      mask-image: linear-gradient(100deg, black 0%, transparent 53%);
      opacity: .38;
      pointer-events: none;
    }
    .poster::after {
      content: "";
      position: absolute;
      inset: auto -80px -160px 650px;
      height: 360px;
      background: radial-gradient(ellipse at center, rgba(28, 76, 138, .62), transparent 68%);
      filter: blur(18px);
      pointer-events: none;
    }
    .brand {
      position: absolute;
      left: 76px;
      top: 72px;
      display: flex;
      align-items: center;
      gap: 18px;
      font-weight: 850;
      color: #071831;
      letter-spacing: 0;
      z-index: 3;
    }
    .brand img {
      width: 86px;
      height: 58px;
      object-fit: contain;
      filter: drop-shadow(0 12px 20px rgba(24,55,96,.16));
    }
    .brand strong { font-size: 36px; line-height: 1; }
    .brand span { font-size: 30px; color: #182642; font-weight: 650; }
    .copy {
      position: absolute;
      left: 76px;
      top: 238px;
      width: 760px;
      z-index: 4;
    }
    .kicker {
      width: 50px;
      height: 4px;
      border-radius: 999px;
      background: linear-gradient(90deg, var(--blue), var(--cyan));
      margin-bottom: 28px;
    }
    h1 {
      margin: 0;
      max-width: 740px;
      color: #061632;
      font-size: 76px;
      font-weight: 950;
      line-height: 1.08;
      letter-spacing: 0;
    }
    .intro {
      margin-top: 28px;
      color: #14223b;
      font-size: 30px;
      font-weight: 780;
      line-height: 1.45;
      letter-spacing: .02em;
    }
    .intro-en {
      margin-top: 8px;
      color: #536178;
      font-size: 20px;
      font-weight: 520;
      line-height: 1.45;
    }
    .feature-row {
      position: absolute;
      left: 76px;
      bottom: 104px;
      width: 620px;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
      z-index: 5;
    }
    .feature-pill {
      position: relative;
      min-height: 142px;
      display: grid;
      justify-items: center;
      align-content: start;
      text-align: center;
      padding-top: 4px;
    }
    .feature-pill:not(:last-child)::after {
      content: "";
      position: absolute;
      top: 34px;
      right: -9px;
      width: 1px;
      height: 74px;
      background: rgba(116, 133, 158, .34);
    }
    .icon-tile {
      width: 78px;
      height: 78px;
      border-radius: 18px;
      display: grid;
      place-items: center;
      background:
        linear-gradient(145deg, rgba(255,255,255,.74), rgba(145,170,210,.26)),
        radial-gradient(circle at 35% 25%, rgba(255,255,255,.92), transparent 28%);
      border: 1px solid rgba(255,255,255,.88);
      box-shadow:
        inset 0 0 20px rgba(255,255,255,.44),
        0 18px 34px rgba(64, 94, 142, .18);
    }
    .feature-pill b {
      display: block;
      margin-top: 14px;
      color: #061632;
      font-size: 18px;
      font-weight: 900;
      line-height: 1.1;
    }
    .feature-pill small {
      display: block;
      margin-top: 6px;
      color: #344258;
      font-size: 13px;
      font-weight: 680;
      line-height: 1.15;
    }
    .cards {
      position: absolute;
      right: 74px;
      top: 136px;
      width: 690px;
      height: 670px;
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      grid-template-rows: 330px 284px;
      gap: 22px;
      z-index: 4;
      transform: perspective(1600px) rotateY(-6deg) rotateX(2deg);
      transform-origin: center;
    }
    .glass-card {
      position: relative;
      overflow: hidden;
      border-radius: 26px;
      background:
        radial-gradient(circle at 50% 70%, rgba(44, 116, 255, .25), transparent 32%),
        linear-gradient(150deg, rgba(255,255,255,.2), rgba(78,105,145,.12) 39%, rgba(4,13,29,.48) 100%);
      border: 1px solid var(--glass-line);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,.42),
        inset 0 -28px 52px rgba(4, 16, 36, .3),
        0 24px 60px rgba(0, 9, 24, .34);
      backdrop-filter: blur(16px);
    }
    .glass-card.large { grid-column: span 3; }
    .glass-card.small { grid-column: span 2; }
    .glass-card::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(135deg, rgba(255,255,255,.26), transparent 32%, rgba(92,157,255,.18));
      pointer-events: none;
    }
    .card-title {
      position: absolute;
      top: 38px;
      left: 0;
      right: 0;
      text-align: center;
      color: var(--white);
      font-size: 28px;
      font-weight: 930;
      line-height: 1.12;
      text-shadow: 0 10px 28px rgba(0, 14, 32, .4);
    }
    .glass-card.small .card-title { top: 34px; font-size: 24px; }
    .card-title span {
      display: block;
      margin-top: 7px;
      color: rgba(233, 241, 255, .8);
      font-size: 16px;
      font-weight: 500;
    }
    .holo {
      position: absolute;
      left: 50%;
      bottom: 42px;
      width: 178px;
      height: 68px;
      transform: translateX(-50%);
      border-radius: 50%;
      background:
        radial-gradient(ellipse at center, rgba(118,217,255,.52), transparent 56%),
        repeating-radial-gradient(ellipse at center, rgba(82,150,255,.7) 0 2px, transparent 2px 16px);
      filter: drop-shadow(0 0 18px rgba(70, 137, 255, .7));
      opacity: .9;
    }
    .object {
      position: absolute;
      left: 50%;
      top: 116px;
      width: 132px;
      height: 132px;
      transform: translateX(-50%);
      display: grid;
      place-items: center;
      filter: drop-shadow(0 24px 28px rgba(0, 20, 52, .48));
    }
    .glass-card.small .object {
      top: 116px;
      width: 108px;
      height: 108px;
    }
    .orb {
      border-radius: 30px;
      background:
        radial-gradient(circle at 30% 24%, rgba(255,255,255,.96), transparent 22%),
        linear-gradient(145deg, #f5f9ff 0%, #acc7fb 54%, #3a78ff 100%);
      box-shadow:
        inset 0 0 24px rgba(255,255,255,.58),
        0 0 36px rgba(95, 164, 255, .62);
    }
    .glyph { position: relative; display: block; width: 44px; height: 44px; }
    .glyph i { position: absolute; display: block; border-radius: 999px; background: #eaf3ff; box-shadow: 0 0 18px rgba(130,200,255,.8); }
    .icon-tile .glyph i { background: #7da7ef; box-shadow: 0 0 14px rgba(80,130,220,.38); }
    .glyph-memory i:nth-child(1) { width: 36px; height: 36px; left: 4px; top: 4px; border: 4px solid currentColor; background: transparent; color: #dceaff; }
    .icon-tile .glyph-memory i:nth-child(1) { color: #638bd7; }
    .glyph-memory i:nth-child(2) { width: 8px; height: 8px; left: 18px; top: 18px; }
    .glyph-memory i:nth-child(3) { width: 4px; height: 28px; left: 20px; top: 8px; border-radius: 4px; transform: rotate(42deg); }
    .glyph-model i { width: 13px; height: 13px; }
    .glyph-model i:nth-child(1) { left: 4px; top: 8px; }
    .glyph-model i:nth-child(2) { right: 4px; top: 8px; }
    .glyph-model i:nth-child(3) { left: 15px; bottom: 6px; width: 14px; height: 14px; }
    .glyph-model::before, .glyph-model::after { content: ""; position: absolute; height: 3px; background: #eaf3ff; border-radius: 4px; transform-origin: left; }
    .glyph-model::before { left: 16px; top: 16px; width: 16px; transform: rotate(22deg); }
    .glyph-model::after { left: 11px; top: 18px; width: 18px; transform: rotate(116deg); }
    .icon-tile .glyph-model::before, .icon-tile .glyph-model::after { background: #638bd7; }
    .glyph-mcp i:nth-child(1) { width: 36px; height: 8px; left: 4px; top: 10px; border-radius: 8px; }
    .glyph-mcp i:nth-child(2) { width: 36px; height: 8px; left: 4px; top: 26px; border-radius: 8px; }
    .glyph-mcp i:nth-child(3) { width: 8px; height: 36px; left: 18px; top: 4px; border-radius: 8px; }
    .glyph-voice i:nth-child(1) { width: 14px; height: 28px; left: 15px; top: 3px; border-radius: 10px; }
    .glyph-voice i:nth-child(2) { width: 30px; height: 30px; left: 7px; top: 8px; border: 4px solid #eaf3ff; background: transparent; border-top-color: transparent; }
    .icon-tile .glyph-voice i:nth-child(2) { border-color: #638bd7; border-top-color: transparent; }
    .glyph-voice i:nth-child(3) { width: 22px; height: 4px; left: 11px; bottom: 2px; }
    .glyph-desk i:nth-child(1) { width: 36px; height: 24px; left: 4px; top: 6px; border-radius: 5px; background: transparent; border: 4px solid #eaf3ff; }
    .icon-tile .glyph-desk i:nth-child(1) { border-color: #638bd7; }
    .glyph-desk i:nth-child(2) { width: 8px; height: 11px; left: 18px; bottom: 6px; border-radius: 3px; }
    .glyph-desk i:nth-child(3) { width: 28px; height: 4px; left: 8px; bottom: 2px; border-radius: 4px; }
    .object .glyph { width: 64px; height: 64px; color: #fff; }
    .object .glyph i { transform: scale(1.32); transform-origin: center; }
    .object .glyph-model::before, .object .glyph-model::after { background: #eaf3ff; }
    .object .glyph-voice i:nth-child(2), .object .glyph-desk i:nth-child(1), .object .glyph-memory i:nth-child(1) { border-color: #eaf3ff; }
    .object .glyph-voice i:nth-child(2) { border-top-color: transparent; }
    .floor {
      position: absolute;
      left: 760px;
      right: 0;
      bottom: 0;
      height: 210px;
      background: linear-gradient(180deg, transparent, rgba(0,0,0,.22));
      z-index: 2;
    }
    .floor::before {
      content: "";
      position: absolute;
      left: 70px;
      right: 55px;
      bottom: 74px;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(155,190,255,.5), transparent);
      box-shadow: 0 30px 70px rgba(76,140,255,.42);
    }
    .news .copy { top: 228px; width: 850px; }
    .news h1 { font-size: 64px; max-width: 820px; line-height: 1.08; }
    .news .intro { max-width: 760px; }
    .news .intro-en { max-width: 700px; }
    .news .cards { top: 156px; right: 82px; width: 610px; height: 610px; grid-template-rows: repeat(3, 1fr); grid-template-columns: 1fr; transform: perspective(1400px) rotateY(-8deg) rotateX(2deg); }
    .trend-card {
      position: relative;
      padding: 32px 34px 28px 150px;
      border-radius: 30px;
      background:
        linear-gradient(135deg, rgba(255,255,255,.21), rgba(77,108,153,.08)),
        radial-gradient(circle at 18% 50%, rgba(92,157,255,.32), transparent 28%);
      border: 1px solid var(--glass-line);
      box-shadow: 0 24px 56px rgba(0,9,24,.32), inset 0 1px 0 rgba(255,255,255,.34);
      color: var(--white);
      overflow: hidden;
    }
    .trend-card .icon-tile {
      position: absolute;
      left: 36px;
      top: 50%;
      transform: translateY(-50%);
      width: 86px;
      height: 86px;
      background: linear-gradient(145deg, rgba(255,255,255,.28), rgba(99,151,255,.16));
      border-color: rgba(226,238,255,.34);
    }
    .trend-card b { display: block; font-size: 28px; line-height: 1.18; }
    .trend-card span { display: block; margin-top: 9px; color: rgba(232,240,255,.78); font-size: 17px; line-height: 1.35; }
    .source-line {
      position: absolute;
      left: 76px;
      bottom: 70px;
      color: rgba(13,28,55,.72);
      font-size: 16px;
      font-weight: 650;
      z-index: 5;
    }
  `;
}

function renderBrand(iconDataUri: string) {
  return `
    <div class="brand">
      <img src="${iconDataUri}" alt="" />
      <strong>ENHE</strong>
      <span>恩禾 | AI工具站</span>
    </div>
  `;
}

function renderFeaturePill(
  icon: "memory" | "model" | "mcp" | "voice" | "desk",
  title: string,
  subtitle: string,
) {
  return `
    <div class="feature-pill">
      <div class="icon-tile">${featureIcon(icon)}</div>
      <b>${escapeHtml(title)}</b>
      <small>${escapeHtml(subtitle)}</small>
    </div>
  `;
}

function renderGlassCard(
  size: "large" | "small",
  icon: "memory" | "model" | "mcp" | "voice" | "desk",
  title: string,
  subtitle: string,
) {
  return `
    <article class="glass-card ${size}">
      <div class="card-title">${escapeHtml(title)}<span>${escapeHtml(subtitle)}</span></div>
      <div class="object orb">${featureIcon(icon)}</div>
      <div class="holo"></div>
    </article>
  `;
}

function renderProductCover(iconDataUri: string) {
  return `<!doctype html>
  <html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <style>${baseStyles()}</style>
  </head>
  <body>
    <main class="poster">
      ${renderBrand(iconDataUri)}
      <section class="copy">
        <div class="kicker"></div>
        <h1>LumiOS<br />个人AI操作伴侣</h1>
        <p class="intro">把记忆、模型、工具与桌面工作台放进同一个入口</p>
        <p class="intro-en">A personal AI companion for memory, models, tools, and desktop workflows.</p>
      </section>
      <section class="feature-row">
        ${renderFeaturePill("memory", "个人记忆", "Personal Memory")}
        ${renderFeaturePill("model", "多模型接入", "Multi-Model")}
        ${renderFeaturePill("mcp", "MCP工具生态", "MCP Tools")}
        ${renderFeaturePill("voice", "语音交互", "Voice")}
        ${renderFeaturePill("desk", "桌面工作台", "Workbench")}
      </section>
      <section class="cards" aria-hidden="true">
        ${renderGlassCard("large", "memory", "个人记忆", "Personal Memory")}
        ${renderGlassCard("large", "model", "多模型接入", "Multi-Model Access")}
        ${renderGlassCard("small", "mcp", "MCP工具生态", "MCP Tool Ecosystem")}
        ${renderGlassCard("small", "voice", "语音交互", "Voice Interaction")}
        ${renderGlassCard("small", "desk", "桌面工作台", "Desktop Workbench")}
      </section>
      <div class="floor"></div>
    </main>
  </body>
  </html>`;
}

function renderTrendCard(
  icon: "memory" | "model" | "mcp" | "voice" | "desk",
  title: string,
  subtitle: string,
) {
  return `
    <article class="trend-card">
      <div class="icon-tile">${featureIcon(icon)}</div>
      <b>${escapeHtml(title)}</b>
      <span>${escapeHtml(subtitle)}</span>
    </article>
  `;
}

function renderNewsCover(iconDataUri: string) {
  return `<!doctype html>
  <html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <style>${baseStyles()}</style>
  </head>
  <body>
    <main class="poster news">
      ${renderBrand(iconDataUri)}
      <section class="copy">
        <div class="kicker"></div>
        <h1>AI助手进入桌面执行时代</h1>
        <p class="intro">AI agent、MCP工具生态、个人记忆与本地工作台，正在把助手从回答问题推向持续执行。</p>
        <p class="intro-en">AI agents, MCP tools, personal memory, and local workbenches are reshaping desktop AI.</p>
      </section>
      <section class="cards" aria-hidden="true">
        ${renderTrendCard("model", "Agent从回答走向执行", "AI begins to continue real tasks")}
        ${renderTrendCard("mcp", "MCP把工具接进工作流", "Open tool connections for AI apps")}
        ${renderTrendCard("memory", "记忆与工作台成为入口", "Context stays closer to the desktop")}
      </section>
      <p class="source-line">ENHE AI Trend Insights | LumiOS Personal AI Companion</p>
      <div class="floor"></div>
    </main>
  </body>
  </html>`;
}

async function screenshotHtml(html: string, outputPath: string) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1600, height: 900 },
      deviceScaleFactor: 1,
    });
    await page.setContent(html, { waitUntil: "load" });
    await page.locator("body").screenshot({ path: outputPath });
    await page.close();
  } finally {
    await browser.close();
  }
}

async function main() {
  await mkdir(productDir, { recursive: true });
  await mkdir(newsDir, { recursive: true });

  const iconDataUri = await getBrandIconDataUri();

  await screenshotHtml(
    renderProductCover(iconDataUri),
    path.join(productDir, productCoverFile),
  );
  await screenshotHtml(
    renderNewsCover(iconDataUri),
    path.join(newsDir, newsCoverFile),
  );

  const manifest = {
    productSlug,
    style:
      "clean premium futuristic minimal, silver-to-deep-navy, glass capability modules",
    coverImage: `/images/products/enhe-visuals/${productSlug}/${productCoverFile}`,
    articleCover: `/images/ai-news/${newsCoverFile}`,
    altText:
      "ENHE AI LumiOS personal AI companion cover showing memory, multi-model access, MCP tools, voice interaction, and desktop workbench.",
  };

  await writeFile(
    path.join(productDir, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
