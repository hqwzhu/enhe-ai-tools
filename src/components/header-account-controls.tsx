"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";
import type { Locale } from "@/lib/dictionaries";
import { buildLocalePath } from "@/lib/seo";

type SessionUser = {
  email: string | null;
  nickname: string | null;
  role: "admin" | "user";
};

export function HeaderAccountControls({
  labels,
  locale
}: {
  labels: {
    login: string;
    userFallback: string;
  };
  locale: Locale;
}) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const loginPath = buildLocalePath("/login", locale);
  const userPath = buildLocalePath("/user", locale);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/session", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return { user: null };
        return (await response.json()) as { user: SessionUser | null };
      })
      .then((payload) => {
        if (!isMounted) return;
        setUser(payload.user);
        setLoaded(true);
      })
      .catch(() => {
        if (!isMounted) return;
        setUser(null);
        setLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!loaded || !user) {
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
