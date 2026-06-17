"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { resolvePostLoginPath } from "@/lib/post-login-redirect";
import { recordLogin } from "@/lib/analytics/actions";
import type { UserRole } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/garagem";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "expired") {
      setError(
        "Este link expirou ou já foi utilizado. Contacta a oficina para receberes um novo convite.",
      );
    } else if (err === "auth") {
      setError(
        "Não foi possível concluir o acesso. Tenta entrar com email e palavra-passe ou pede um novo convite.",
      );
    }
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signError) {
        setError(signError.message);
        setPassword("");
        setLoading(false);
        return;
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Sessão inválida após o login.");
        setPassword("");
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      await recordLogin().catch(() => {});
      const dest = resolvePostLoginPath(profile?.role as UserRole | undefined, next);
      router.push(dest);
      router.refresh();
      return;
    } catch {
      setError("Não foi possível iniciar sessão.");
      setPassword("");
    }
    setLoading(false);
  }

  const fieldClass =
    "h-12 border-0 bg-muted pl-11 text-[15px] shadow-inner shadow-black/20 ring-1 ring-white/[0.06] transition-shadow placeholder:text-muted-foreground/50 focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <fieldset disabled={loading} className="space-y-6 disabled:opacity-90">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Email
          </Label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground/70"
              aria-hidden
            />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder="nome@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(fieldClass, "rounded-xl")}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Palavra-passe
          </Label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground/70"
              aria-hidden
            />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(fieldClass, "rounded-xl pr-11")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? "Esconder palavra-passe" : "Mostrar palavra-passe"}
              aria-pressed={showPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 transition-colors hover:text-foreground focus-visible:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="size-[18px]" aria-hidden />
              ) : (
                <Eye className="size-[18px]" aria-hidden />
              )}
            </button>
          </div>
        </div>
        {error ? (
          <p
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-xl font-heading text-base font-semibold shadow-lg shadow-primary/20 transition-[transform,box-shadow] hover:shadow-xl hover:shadow-primary/28 active:scale-[0.99]"
          disabled={loading}
        >
          {loading ? "A entrar…" : "Entrar"}
        </Button>
      </fieldset>
    </form>
  );
}
