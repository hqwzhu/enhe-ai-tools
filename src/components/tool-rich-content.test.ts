import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ToolRichContent } from "@/components/tool-rich-content";

function extractOrderedMarkers(html: string) {
  return Array.from(
    html.matchAll(/<span class="flex h-7 w-7[^"]*">(\d+)<\/span>/g),
    (match) => match[1]
  );
}

describe("ToolRichContent", () => {
  it("emphasizes colon-led product feature labels inside lists", () => {
    vi.stubGlobal("React", React);

    const html = renderToStaticMarkup(
      React.createElement(ToolRichContent, {
        content: ["Features:", "Work companion: turn rough ideas into next actions."].join("\n")
      })
    );

    expect(html).toContain("<strong");
    expect(html).toContain("Work companion:");
    expect(html).toContain("turn rough ideas into next actions.");
  });

  it("keeps ordered markers increasing when descriptions split numbered items", () => {
    vi.stubGlobal("React", React);

    const content = [
      "Features:",
      "1. Text to speech TTS",
      "Generate natural audio for courses, videos, and voiceovers.",
      "",
      "2. Voice cloning",
      "Create a consistent voice style from authorized samples.",
      "",
      "3. Voice design",
      "Describe a target voice and generate a matching style."
    ].join("\n");

    const html = renderToStaticMarkup(React.createElement(ToolRichContent, { content }));

    expect(extractOrderedMarkers(html)).toEqual(["1", "2", "3"]);
  });

  it("renders bare Feishu tutorial URLs as links without changing query strings", () => {
    vi.stubGlobal("React", React);

    const url = "https://qcnerk9meslu.feishu.cn/wiki/CEqtwGF9BiOQXNkzEmVcWecGnWe?from=from_copylink";
    const html = renderToStaticMarkup(
      React.createElement(ToolRichContent, {
        content: `教程链接：${url}`
      })
    );

    expect(html).toContain(`href="${url}"`);
    expect(html).toContain(`>${url}</a>`);
  });
});
