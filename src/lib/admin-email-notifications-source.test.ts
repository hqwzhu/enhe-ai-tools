import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("admin email notification wiring", () => {
  it("documents SMTP configuration in the environment example", () => {
    const source = readFileSync(join(process.cwd(), ".env.example"), "utf8");

    expect(source).toContain("ADMIN_ALERT_EMAILS");
    expect(source).toContain("SMTP_HOST");
    expect(source).toContain("SMTP_PORT");
    expect(source).toContain("SMTP_USER");
    expect(source).toContain("SMTP_PASSWORD");
    expect(source).toContain("SMTP_FROM");
  });

  it("emails admin for user-facing review events", () => {
    const source = readFileSync(join(process.cwd(), "src/app/actions.ts"), "utf8");

    expect(source).toContain("sendPaymentProofSubmittedAdminEmail");
    expect(source).toContain("sendPaymentReviewAdminEmail");
    expect(source).toContain("sendRefundRequestAdminEmail");
  });

  it("emails admin for backend refund events without manual VIP wiring", () => {
    const source = readFileSync(join(process.cwd(), "src/app/admin/actions.ts"), "utf8");

    expect(source).toContain("sendRefundProcessedAdminEmail");
    expect(source).not.toContain("sendManualVipAdjustmentAdminEmail");
  });
});
