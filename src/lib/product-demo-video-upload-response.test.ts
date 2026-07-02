import { describe, expect, it } from "vitest";
import { parseProductDemoVideoUploadResponse } from "@/lib/product-demo-video-upload-response";

describe("parseProductDemoVideoUploadResponse", () => {
  it("keeps malformed upload responses from throwing client-side exceptions", () => {
    expect(() => parseProductDemoVideoUploadResponse("null", 500)).not.toThrow();
    expect(parseProductDemoVideoUploadResponse("null", 500)).toEqual({
      ok: false,
      message: "视频上传失败：服务器返回 500",
    });

    expect(parseProductDemoVideoUploadResponse("<html>413</html>", 413)).toEqual({
      ok: false,
      message: "视频上传失败：服务器返回 413",
    });
  });

  it("returns the uploaded video URL from a valid upload response", () => {
    expect(parseProductDemoVideoUploadResponse('{"videoUrl":"/uploads/demo.mp4","message":"ok"}', 200)).toEqual({
      ok: true,
      videoUrl: "/uploads/demo.mp4",
      message: "ok",
    });
  });
});
