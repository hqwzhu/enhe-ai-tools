import { describe, expect, it } from "vitest";
import { getUploadDiskPath, getUploadPublicUrl } from "@/lib/upload-path";

function unixPath(value: string) {
  return value.replace(/\\/g, "/").replace(/^[A-Z]:/i, "");
}

describe("upload path helpers", () => {
  it("uses public uploads by default", () => {
    expect(unixPath(getUploadDiskPath("/uploads/demo.png", "/app"))).toBe("/app/public/uploads/demo.png");
  });

  it("uses UPLOAD_DIR when provided", () => {
    expect(unixPath(getUploadDiskPath("/uploads/demo.png", "/app", "/data/uploads"))).toBe("/data/uploads/demo.png");
  });

  it("preserves safe upload subdirectories for product media", () => {
    expect(unixPath(getUploadDiskPath("/uploads/tool-videos/demo.mp4", "/app"))).toBe(
      "/app/public/uploads/tool-videos/demo.mp4"
    );
    expect(unixPath(getUploadDiskPath("/uploads/tool-videos/demo.mp4", "/app", "/data/uploads"))).toBe(
      "/data/uploads/tool-videos/demo.mp4"
    );
  });

  it("normalizes public upload urls", () => {
    expect(getUploadPublicUrl("demo.png")).toBe("/uploads/demo.png");
    expect(getUploadPublicUrl("/uploads/demo.png")).toBe("/uploads/demo.png");
  });
});
