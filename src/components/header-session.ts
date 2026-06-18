"use client";

import { useEffect, useState } from "react";

export type HeaderSessionUser = {
  email: string | null;
  nickname: string | null;
  role: "admin" | "user";
};

let cachedUser: HeaderSessionUser | null | undefined;
let inflightSessionRequest: Promise<HeaderSessionUser | null> | null = null;

async function fetchHeaderSessionUser() {
  const response = await fetch("/api/session", { cache: "no-store" });
  if (!response.ok) return null;
  const payload = (await response.json()) as { user: HeaderSessionUser | null };
  return payload.user;
}

function refreshHeaderSessionUser() {
  if (!inflightSessionRequest) {
    inflightSessionRequest = fetchHeaderSessionUser()
      .catch(() => null)
      .then((user) => {
        cachedUser = user;
        return user;
      })
      .finally(() => {
        inflightSessionRequest = null;
      });
  }

  return inflightSessionRequest;
}

export function useHeaderSessionUser(initialUser: HeaderSessionUser | null) {
  const [user, setUser] = useState<HeaderSessionUser | null>(() => cachedUser ?? initialUser ?? null);
  const [loaded, setLoaded] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const optimisticUser = initialUser ?? null;
    cachedUser = optimisticUser;
    setUser(optimisticUser);
    setLoaded(true);

    refreshHeaderSessionUser().then((nextUser) => {
      if (!isMounted) return;
      setUser(nextUser);
      setLoaded(true);
    });

    return () => {
      isMounted = false;
    };
  }, [initialUser]);

  return { user, loaded };
}
