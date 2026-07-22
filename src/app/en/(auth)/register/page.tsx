import { RegisterPageShell } from "@/app/(auth)/register/page-shell";

export const dynamic = "force-dynamic";

export default function EnglishRegisterPage() {
  return <RegisterPageShell forceLocale="en" />;
}
