import { LoginPageShell } from "@/app/(auth)/login/page-shell";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; payment?: string }>;
}) {
  return <LoginPageShell searchParams={searchParams} />;
}
