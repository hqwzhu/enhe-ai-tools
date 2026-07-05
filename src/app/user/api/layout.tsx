import { ApiConsoleLayout } from "@/features/enhe-api/components/console-layout";
import { getOrCreateApiDeveloperProfile } from "@/features/enhe-api/server/developer-profile";
import { requireUser } from "@/lib/auth";
import { getCurrentLocale } from "@/lib/i18n";

export default async function UserApiLayout({ children }: { children: React.ReactNode }) {
  const locale = await getCurrentLocale();
  const user = await requireUser(locale);
  const developerProfile = await getOrCreateApiDeveloperProfile(user);

  return (
    <ApiConsoleLayout developerStatus={developerProfile.status} restrictedReason={developerProfile.suspendedReason}>
      {children}
    </ApiConsoleLayout>
  );
}
