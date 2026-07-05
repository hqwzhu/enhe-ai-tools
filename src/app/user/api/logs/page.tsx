import type { Metadata } from "next";
import { LogsPage } from "@/features/enhe-api/components/console-pages";

export const metadata: Metadata = {
  title: "请求日志 | ENHE API"
};

export default function UserApiLogsPage() {
  return <LogsPage />;
}
