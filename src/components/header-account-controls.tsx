"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import type { Locale } from "@/lib/dictionaries";
import { buildLocalePath } from "@/lib/seo";
import { type HeaderSessionUser, useHeaderSessionUser } from "@/components/header-session";

export function HeaderAccountControls({
  labels,
  locale,
  initialUser
}: {
  labels: {
    login: string;
    userFallback: string;
  };
  locale: Locale;
  initialUser: HeaderSessionUser | null;
}) {
  const { user, loaded } = useHeaderSessionUser(initialUser);
  const loginPath = buildLocalePath("/login", locale);
  const userPath = buildLocalePath("/user", locale);

  if (!loaded) {
    return <span className="hidden sm:inline-flex min-h-8 min-w-20" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <Link href={loginPath} className="site-login-link hidden sm:inline-flex">
        {labels.login}
      </Link>
    );
  }

  return (
    <>
      <Link href={userPath} className="site-user-chip hidden sm:inline-flex">
        <UserRound size={16} />
        <span className="truncate">{user.nickname ?? user.email ?? labels.userFallback}</span>
      </Link>
    </>
  );
}
