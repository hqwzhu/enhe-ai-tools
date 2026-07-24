import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("customer support widget source", () => {
  it("uses Chat for the English launcher and panel", () => {
    const source = readFileSync(
      new URL("../components/customer-support-widget.tsx", import.meta.url),
      "utf8",
    );

    expect(source).toContain('launcherLabel: "Chat"');
    expect(source).toContain('title: "Chat"');
    expect(source).toContain('closeLabel: "Close chat"');
    expect(source).not.toContain('launcherLabel: "Customer support"');
  });
});
