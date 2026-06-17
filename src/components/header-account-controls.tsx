"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, UserRound } from "lucide-react";

type SessionUser = {
  email: string | null;
  nickname: string | null;
  role: "admin" | "user";
};

export function HeaderAccountControls({
  labels
}: {
  labels: {
    admin: string;
    login: string;
    userFallback: string;
  };
}) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loaded, setLoaded] = useState(false);

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
      <Link href="/login" className="site-login-link hidden sm:inline-flex">
        {labels.login}
      </Link>
    );
  }

  return (
    <>
      {user.role === "admin" ? (
        <Link href="/admin" className="site-admin-link hidden items-center gap-2 lg:inline-flex">
          <LayoutDashboard size={16} />
          {labels.admin}
        </Link>
      ) : null}
      <Link href="/user" className="site-user-chip hidden sm:inline-flex">
        <UserRound size={16} />
        <span className="truncate">{user.nickname ?? user.email ?? labels.userFallback}</span>
      </Link>
    </>
  );
}
