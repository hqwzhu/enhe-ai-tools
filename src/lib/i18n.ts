import { cookies } from "next/headers";
import { dictionaries, getDictionary, normalizeLocale, supportedLocales, type Locale } from "@/lib/dictionaries";

export { dictionaries, getDictionary, normalizeLocale, supportedLocales };
export type { Locale };

export const localeCookieName = "enhe_locale";

export async function getCurrentLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(localeCookieName)?.value);
}
