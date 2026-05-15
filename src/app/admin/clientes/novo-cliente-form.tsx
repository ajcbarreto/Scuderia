"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Mail } from "lucide-react";
import { createClientUser, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NovoClienteForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(
    createClientUser,
    undefined,
  );

  useEffect(() => {
    if (state?.ok) {
      const form = document.getElementById("novo-cliente-form") as HTMLFormElement | null;
      form?.reset();
      router.refresh();
    }
  }, [state?.ok, router]);

  return (
    <form id="novo-cliente-form" action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nc_full_name">Nome</Label>
        <Input
          id="nc_full_name"
          name="full_name"
          required
          autoComplete="name"
          className="border-input bg-background"
          disabled={pending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nc_email">Email (início de sessão)</Label>
        <Input
          id="nc_email"
          name="email"
          type="email"
          required
          autoComplete="off"
          className="border-input bg-background"
          disabled={pending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nc_phone">Telemóvel (opcional)</Label>
        <Input
          id="nc_phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className="border-input bg-background"
          disabled={pending}
        />
      </div>
      <p className="flex items-start gap-2 rounded-lg border border-dashed border-border bg-muted/50 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
        <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <span>
          O cliente recebe um email com convite para definir a própria palavra-passe.
          Nada de credenciais a trocar por WhatsApp.
        </span>
      </p>
      {state?.error ? (
        <p
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      {state?.ok && state.createdEmail ? (
        <p
          className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5 text-sm text-foreground"
          role="status"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <span>
            Convite enviado para <span className="font-medium">{state.createdEmail}</span>.
            {state.info ? <span className="block text-muted-foreground">{state.info}</span> : null}
          </span>
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="font-heading">
        {pending ? "A enviar convite…" : "Convidar cliente"}
      </Button>
    </form>
  );
}
