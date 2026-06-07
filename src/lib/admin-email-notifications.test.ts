import { describe, expect, it } from "vitest";
import { buildAdminOperationEmail, getAdminAlertEmailConfig } from "@/lib/admin-email-notifications";

describe("admin email notifications", () => {
  it("builds payment review email with order details and admin links", () => {
    const email = buildAdminOperationEmail({
      eventType: "payment_review_approved",
      appUrl: "https://www.enhe-tech.com.cn",
      actorLabel: "admin@enhe.ai",
      note: "凭证审核通过",
      order: {
        id: "order-1",
        orderNo: "ENHE202606080001",
        userLabel: "user@example.com",
        itemName: "特惠VIP",
        amount: "9.90",
        paymentMethod: "alipay",
        orderStatus: "activated"
      }
    });

    expect(email.subject).toBe("[ENHE AI] 付款审核通过并开通权益：ENHE202606080001");
    expect(email.text).toContain("订单号：ENHE202606080001");
    expect(email.text).toContain("用户：user@example.com");
    expect(email.text).toContain("项目：特惠VIP");
    expect(email.text).toContain("金额：¥9.90");
    expect(email.text).toContain("操作人：admin@enhe.ai");
    expect(email.text).toContain("后台订单：https://www.enhe-tech.com.cn/admin/orders/order-1");
    expect(email.text).toContain("用户订单：https://www.enhe-tech.com.cn/orders/order-1");
    expect(email.html).toContain("https://www.enhe-tech.com.cn/admin/orders/order-1");
  });

  it("uses the requested Gmail address as the default admin recipient", () => {
    const config = getAdminAlertEmailConfig({
      SMTP_HOST: "smtp.example.com",
      SMTP_PORT: "587",
      SMTP_USER: "mailer@example.com",
      SMTP_PASSWORD: "secret",
      SMTP_FROM: "ENHE AI <mailer@example.com>"
    });

    expect(config.recipients).toEqual(["huqingwei5942@gmail.com"]);
    expect(config.enabled).toBe(true);
  });
});
