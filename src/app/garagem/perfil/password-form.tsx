"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { recordPasswordChanged } from "@/lib/analytics/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const MIN_PASSWORD_LEN = 8;

export function PasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < MIN_PASSWORD_LEN) {
      toast.error(
        `A palavra-passe precisa de pelo menos ${MIN_PASSWORD_LEN} caracteres.`,
        6000,
      );
      return;
    }
    if (password !== confirm) {
      toast.error("As palavras-passe não coincidem.", 6000);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message, 6000);
        return;
      }
      await recordPasswordChanged().catch(() => {});
      toast.success("Palavra-passe atualizada.");
      setPassword("");
      setConfirm("");
    } catch {
      toast.error("Não foi possível atualizar a palavra-passe.", 6000);
    } finally {
      setLoading(false);
    }
  }

  const fieldClass =
    "border-input bg-background pl-10 pr-10 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <fieldset disabled={loading} className="space-y-5 disabled:opacity-90">
        <div className="space-y-2">
          <Label htmlFor="new_password">Nova palavra-passe</Label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70"
              aria-hidden
            />
            <Input
              id="new_password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LEN}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(fieldClass)}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              tabIndex={-1}
              aria-label={show ? "Esconder palavra-passe" : "Mostrar palavra-passe"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm_password">Confirmar palavra-passe</Label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70"
              aria-hidden
            />
            <Input
              id="confirm_password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LEN}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={cn(fieldClass)}
            />
          </div>
        </div>
        <Button type="submit" disabled={loading} className="font-heading">
          {loading ? "A guardar…" : "Atualizar palavra-passe"}
        </Button>
      </fieldset>
    </form>
  );
}
