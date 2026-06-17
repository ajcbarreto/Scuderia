"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { recordAccountActivated } from "@/lib/analytics/actions";
import { Button } from "@/components/ui/button";

function inviteErrorMessage(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("expired") || lower.includes("invalid")) {
    return "Este convite expirou ou já foi usado. Pede à oficina um novo convite por email.";
  }
  return message;
}

export function InviteActivateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") ?? "invite";

  const [error, setError] = useState<string | null>(
    tokenHash ? null : "Link de convite inválido. Pede à oficina um novo convite.",
  );
  const [loading, setLoading] = useState(false);

  async function activate() {
    if (!tokenHash) return;
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as "invite" | "signup" | "recovery" | "email",
      });

      if (verifyError) {
        setError(inviteErrorMessage(verifyError.message));
        setLoading(false);
        return;
      }

      await recordAccountActivated().catch(() => {});
      router.replace("/onboarding/set-password");
      router.refresh();
    } catch {
      setError("Não foi possível activar a conta. Tenta outra vez ou pede um novo convite.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Clica no botão abaixo para activar a tua conta e definir a palavra-passe.
        Este passo evita que filtros de spam consumam o convite antes de chegares
        aqui.
      </p>
      {error ? (
        <p
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <Button
        type="button"
        size="lg"
        className="h-12 w-full rounded-xl font-heading text-base font-semibold"
        disabled={!tokenHash || loading}
        onClick={() => void activate()}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            A activar…
          </>
        ) : (
          "Activar a minha conta"
        )}
      </Button>
    </div>
  );
}
