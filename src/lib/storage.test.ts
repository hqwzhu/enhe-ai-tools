import { describe, expect, it } from "vitest";
import {
  createStorageObjectKey,
  getAllowedUploadExtensions,
  getCosSignedUrlExpiresSeconds,
  getSecureFileDownloadUrl,
  isCosStorageConfigured,
  isUploadExtensionAllowed,
  parseCosFilePath
} from "@/lib/storage";

describe("storage helpers", () => {
  it("detects whether Tencent COS is configured", () => {
    expect(
      isCosStorageConfigured({
        TENCENT_COS_SECRET_ID: "sid",
        TENCENT_COS_SECRET_KEY: "skey",
        TENCENT_COS_BUCKET: "bucket-123",
        TENCENT_COS_REGION: "ap-guangzhou"
      })
    ).toBe(true);

    expect(
      isCosStorageConfigured({
        TENCENT_COS_SECRET_ID: "sid",
        TENCENT_COS_SECRET_KEY: "",
        TENCENT_COS_BUCKET: "bucket-123",
        TENCENT_COS_REGION: "ap-guangzhou"
      })
    ).toBe(false);
  });

  it("creates stable safe object keys with folders", () => {
    expect(createStorageObjectKey("payment-proofs", "付款截图 Final.PNG", () => "fixed")).toBe(
      "payment-proofs/fixed-final.png"
    );
    expect(createStorageObjectKey("", "工具安装包.exe", () => "fixed")).toBe("fixed-file.exe");
  });

  it("parses COS file paths for private object downloads", () => {
    expect(parseCosFilePath("cos://enhe-bucket-123/software/app.zip")).toEqual({
      bucket: "enhe-bucket-123",
      key: "software/app.zip"
    });
    expect(parseCosFilePath("/uploads/app.zip")).toBeNull();
  });

  it("parses upload extension whitelists and blocks unsafe extensions", () => {
    expect(getAllowedUploadExtensions({ UPLOAD_ALLOWED_EXTENSIONS: ".zip, jpg, .PNG" })).toEqual([".zip", ".jpg", ".png"]);
    expect(isUploadExtensionAllowed("installer.EXE", [".exe"])).toBe(true);
    expect(isUploadExtensionAllowed("shell.php", [".zip", ".png"])).toBe(false);
  });

  it("uses local or public URLs unless a COS private file is configured", async () => {
    await expect(
      getSecureFileDownloadUrl(
        { filePath: "C:/uploads/app.zip", fileUrl: "/uploads/app.zip" },
        "http://localhost:3000/api/tools/tool-id/download",
        {}
      )
    ).resolves.toEqual(new URL("http://localhost:3000/uploads/app.zip"));

    await expect(
      getSecureFileDownloadUrl(
        { filePath: "cos://enhe-bucket-123/software/app.zip", fileUrl: "https://public.example/app.zip" },
        "http://localhost:3000/api/tools/tool-id/download",
        {}
      )
    ).resolves.toEqual(new URL("https://public.example/app.zip"));
  });

  it("requires a public URL when COS signing is not available", async () => {
    await expect(
      getSecureFileDownloadUrl(
        { filePath: "cos://enhe-bucket-123/software/app.zip", fileUrl: null },
        "http://localhost:3000/api/tools/tool-id/download",
        {}
      )
    ).rejects.toThrow("Download file URL is missing.");
  });

  it("parses signed URL expiry with a safe default", () => {
    expect(getCosSignedUrlExpiresSeconds({ TENCENT_COS_SIGNED_URL_EXPIRES_SECONDS: "900" })).toBe(900);
    expect(getCosSignedUrlExpiresSeconds({ TENCENT_COS_SIGNED_URL_EXPIRES_SECONDS: "-1" })).toBe(600);
    expect(getCosSignedUrlExpiresSeconds({})).toBe(600);
  });
});
