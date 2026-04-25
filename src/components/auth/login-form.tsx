"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { resolvePostLoginPath } from "@/lib/post-login-redirect";
import type { UserRole } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/garagem";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        return;
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Sessão inválida após o login.");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      const dest = resolvePostLoginPath(profile?.role as UserRole | undefined, next);
      router.push(dest);
      router.refresh();
    } catch {
      setError("Não foi possível iniciar sessão.");
    } finally {
      setLoading(false);
    }
  }

  const fieldClass =
    "h-12 border-0 bg-muted pl-11 text-[15px] shadow-inner shadow-black/20 ring-1 ring-white/[0.06] transition-shadow placeholder:text-muted-foreground/50 focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-primary/35";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
            className={cn(
              fieldClass,
              "rounded-xl",
            )}
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
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(fieldClass, "rounded-xl")}
          />
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
    </form>
  );
}
