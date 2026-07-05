import type { Metadata } from "next";
import { ProfilePage } from "@/features/enhe-api/components/console-pages";

export const metadata: Metadata = {
  title: "开发者资料 | ENHE API"
};

export default function UserApiProfilePage() {
  return <ProfilePage />;
}
