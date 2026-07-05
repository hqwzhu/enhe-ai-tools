import type { Metadata } from "next";
import { UsagePage } from "@/features/enhe-api/components/console-pages";

export const metadata: Metadata = {
  title: "API 用量 | ENHE API"
};

export default function UserApiUsagePage() {
  return <UsagePage />;
}
