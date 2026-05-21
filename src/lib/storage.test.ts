import { describe, expect, it } from "vitest";
import { createStorageObjectKey, isCosStorageConfigured } from "@/lib/storage";

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
});
