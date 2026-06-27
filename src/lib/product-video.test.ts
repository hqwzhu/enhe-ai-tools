import { describe, expect, it } from "vitest";
import { resolveProductVideoSrc, resolveProductVideos } from "@/lib/product-video";

describe("product video helpers", () => {
  it("normalizes one product video source", () => {
    expect(resolveProductVideoSrc("uploads/tool-videos/demo.mp4")).toBe("/api/uploads/tool-videos/demo.mp4");
  });

  it("resolves only the first three valid product videos", () => {
    const videos = resolveProductVideos([
      { url: "uploads/tool-videos/intro.mp4", title: "Intro", description: "Main overview" },
      { url: "  ", title: "Empty", description: "Should be skipped" },
      { url: "https://example.com/demo-2.mp4", title: "Walkthrough", description: "" },
      { url: "/uploads/tool-videos/demo-3.mp4", title: "Deep dive", description: "Third video" },
      { url: "/uploads/tool-videos/extra.mp4", title: "Extra", description: "Should not render" }
    ]);

    expect(videos).toEqual([
      {
        src: "/api/uploads/tool-videos/intro.mp4",
        title: "Intro",
        description: "Main overview"
      },
      {
        src: "https://example.com/demo-2.mp4",
        title: "Walkthrough",
        description: null
      },
      {
        src: "/api/uploads/tool-videos/demo-3.mp4",
        title: "Deep dive",
        description: "Third video"
      }
    ]);
  });
});
