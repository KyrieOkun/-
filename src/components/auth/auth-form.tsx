"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/primitives";
import { useI18n } from "@/lib/i18n/provider";
import { apiFetch } from "@/lib/client";
import { isValidCNPhone, isValidEmail, cn } from "@/lib/utils";
import type { PublicUser } from "@/lib/auth";

export function AuthForm({ initialMode = "login", onSuccess, compact }: { initialMode?: "login" | "register"; onSuccess?: (user: PublicUser) => void; compact?: boolean }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const switchMode = (next: "login" | "register") => {
    setMode(next);
    setError(null);
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isValidCNPhone(identifier) && !isValidEmail(identifier)) {
      setError(locale === "zh" ? "请输入正确的手机号或邮箱" : "Enter a valid mobile number or email");
      return;
    }
    if (password.length < 8) return setError(t.forms.passwordTooShort);
    if (mode === "register") {
      if (!name.trim()) return setError(t.forms.invalidName);
      if (password !== confirm) return setError(t.forms.passwordMismatch);
    }
    setLoading(true);
    const res = await apiFetch<{ user: PublicUser }>(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
      method: "POST",
      json: mode === "login" ? { identifier, password } : { name, identifier, password },
    });
    setLoading(false);
    if (!res.ok || !res.data) {
      if (res.error === "USER_EXISTS") setError(t.account.exists);
      else if (res.error === "INVALID_CREDENTIALS") setError(t.account.loginFailed);
      else setError(mode === "login" ? t.account.loginFailed : t.account.registerFailed);
      return;
    }
    onSuccess?.(res.data.user);
    router.refresh();
  }

  return (
    <div className={cn("rounded-3xl bg-white hairline", compact ? "p-6" : "p-8")}>
      <div className="mb-6 flex rounded-pill bg-mist p-1 text-sm font-medium">
        <button type="button" aria-pressed={mode === "login"} onClick={() => switchMode("login")} className={cn("flex-1 rounded-pill py-2 transition-colors focus-ring", mode === "login" ? "bg-white shadow-soft" : "text-slate")}>{t.account.loginTitle}</button>
        <button type="button" aria-pressed={mode === "register"} onClick={() => switchMode("register")} className={cn("flex-1 rounded-pill py-2 transition-colors focus-ring", mode === "register" ? "bg-white shadow-soft" : "text-slate")}>{t.account.registerTitle}</button>
      </div>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {mode === "register" ? (
          <div>
            <Label htmlFor="auth-name" required>{t.forms.name}</Label>
            <Input id="auth-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>
        ) : null}
        <div>
          <Label htmlFor="auth-id" required>{t.forms.phone} / {t.forms.email}</Label>
          <Input id="auth-id" value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" inputMode="email" />
        </div>
        <div>
          <Label htmlFor="auth-pw" required hint={mode === "register" ? t.forms.passwordTooShort : undefined}>{t.forms.password}</Label>
          <Input id="auth-pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} />
        </div>
        {mode === "register" ? (
          <div>
            <Label htmlFor="auth-pw2" required>{t.forms.confirmPassword}</Label>
            <Input id="auth-pw2" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          </div>
        ) : null}
        <FieldError>{error}</FieldError>
        <Button type="submit" size="lg" fullWidth loading={loading}>
          {mode === "login" ? t.nav.login : t.nav.register}
        </Button>
        <p className="text-center text-xs leading-5 text-ash">
          {t.forms.agree} <a href="/legal/terms" className="underline">{t.forms.terms}</a> {t.common.and} <a href="/legal/privacy" className="underline">{t.forms.privacy}</a>
        </p>
      </form>
    </div>
  );
}
