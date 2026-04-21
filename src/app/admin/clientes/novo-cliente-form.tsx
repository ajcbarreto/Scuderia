"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
          className="border-white/15 bg-[#1a1a1a]"
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
          className="border-white/15 bg-[#1a1a1a]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nc_phone">Telemóvel (opcional)</Label>
        <Input
          id="nc_phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className="border-white/15 bg-[#1a1a1a]"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nc_password">Palavra-passe</Label>
          <Input
            id="nc_password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={6}
            className="border-white/15 bg-[#1a1a1a]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nc_password_confirm">Confirmar palavra-passe</Label>
          <Input
            id="nc_password_confirm"
            name="password_confirm"
            type="password"
            required
            autoComplete="new-password"
            minLength={6}
            className="border-white/15 bg-[#1a1a1a]"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        A conta fica ativa de imediato. Entrega o email e a palavra-passe ao cliente para aceder à
        garagem.
      </p>
      {state?.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state?.ok && state.createdEmail ? (
        <p className="text-sm text-primary">
          Conta criada para <span className="font-medium">{state.createdEmail}</span>. Podes
          associar motas a este cliente abaixo.
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="font-heading">
        {pending ? "A criar…" : "Criar conta de cliente"}
      </Button>
    </form>
  );
}
