import type { Metadata } from "next";
import { KeysPage } from "@/features/enhe-api/components/console-pages";

export const metadata: Metadata = {
  title: "API 密钥 | ENHE API"
};

export default function UserApiKeysPage() {
  return <KeysPage />;
}
