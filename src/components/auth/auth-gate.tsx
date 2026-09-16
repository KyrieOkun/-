"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { PublicUser } from "@/lib/auth";
import { apiFetch } from "@/lib/client";
import { useI18n } from "@/lib/i18n/provider";
import { Skeleton } from "@/components/ui/primitives";
import { AuthForm } from "./auth-form";

interface UserContextValue {
  user: PublicUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setUser: (u: PublicUser | null) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within <AuthGate>");
  return ctx;
}

/**
 * Loads the current session and either renders children (with the user
 * available through useUser) or an inline sign-in / sign-up card.
 */
export function AuthGate({
  children,
  title,
  description,
  initialUser,
  initialMode = "login",
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  /** Session resolved on the server; avoids a loading flash and a client round-trip. */
  initialUser?: PublicUser | null;
  initialMode?: "login" | "register";
}) {
  const { t } = useI18n();
  const [user, setUser] = useState<PublicUser | null>(initialUser ?? null);
  const [loading, setLoading] = useState(initialUser === undefined);

  const refresh = useCallback(async () => {
    const res = await apiFetch<{ user: PublicUser | null }>("/api/auth/me");
    setUser(res.data?.user ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (initialUser === undefined) void refresh();
  }, [refresh, initialUser]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">{title ?? t.connect.requireLogin}</h2>
          {description ? <p className="mt-2 text-sm text-slate">{description}</p> : null}
        </div>
        <AuthForm initialMode={initialMode} onSuccess={(u) => setUser(u)} />
      </div>
    );
  }

  return <UserContext.Provider value={{ user, loading, refresh, setUser }}>{children}</UserContext.Provider>;
}
