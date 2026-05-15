"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const MIN_PASSWORD_LEN = 8;

type Props = {
  userEmail: string | null;
};

export function SetPasswordForm({ userEmail }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LEN) {
      setError(`A palavra-passe precisa de pelo menos ${MIN_PASSWORD_LEN} caracteres.`);
      return;
    }
    if (password !== confirm) {
      setError("As palavras-passe não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updError } = await supabase.auth.updateUser({ password });
      if (updError) {
        setError(updError.message);
        return;
      }
      router.replace("/garagem");
      router.refresh();
    } catch {
      setError("Não foi possível guardar a palavra-passe.");
    } finally {
      setLoading(false);
    }
  }

  const fieldClass =
    "h-12 border-0 bg-muted pl-11 pr-11 text-[15px] shadow-inner shadow-black/20 ring-1 ring-white/[0.06] transition-shadow placeholder:text-muted-foreground/50 focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <fieldset disabled={loading} className="space-y-6 disabled:opacity-90">
        {userEmail ? (
          <p className="text-xs text-muted-foreground">
            Conta: <span className="font-medium text-foreground">{userEmail}</span>
          </p>
        ) : null}
        <div className="space-y-2">
          <Label
            htmlFor="new-password"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Nova palavra-passe
          </Label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground/70"
              aria-hidden
            />
            <Input
              id="new-password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LEN}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(fieldClass, "rounded-xl")}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              tabIndex={-1}
              aria-label={show ? "Esconder palavra-passe" : "Mostrar palavra-passe"}
              aria-pressed={show}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 transition-colors hover:text-foreground focus-visible:text-foreground"
            >
              {show ? <EyeOff className="size-[18px]" aria-hidden /> : <Eye className="size-[18px]" aria-hidden />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="confirm-password"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Confirmar palavra-passe
          </Label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground/70"
              aria-hidden
            />
            <Input
              id="confirm-password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LEN}
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
          {loading ? "A guardar…" : "Guardar e entrar"}
        </Button>
      </fieldset>
    </form>
  );
}
