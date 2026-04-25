"use client";

import { useActionState, useEffect } from "react";
import { transferMotorcycle, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Motorcycle, Profile } from "@/types/database";

type Props = {
  motas: Pick<Motorcycle, "id" | "brand" | "model" | "plate" | "current_owner_id">[];
  clients: Pick<Profile, "id" | "full_name" | "phone">[];
};

export function TransferenciaForm({ motas, clients }: Props) {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(
    transferMotorcycle,
    undefined,
  );

  useEffect(() => {
    if (state?.ok) {
      const form = document.getElementById("transferencia-form") as HTMLFormElement | null;
      form?.reset();
    }
  }, [state?.ok]);

  return (
    <form id="transferencia-form" action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="motorcycle_id">Mota</Label>
        <select
          id="motorcycle_id"
          name="motorcycle_id"
          required
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <option value="">— Escolher —</option>
          {motas.map((m) => (
            <option key={m.id} value={m.id}>
              {m.brand} {m.model}
              {m.plate ? ` · ${m.plate}` : ""}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="new_owner_id">Novo dono</Label>
        <select
          id="new_owner_id"
          name="new_owner_id"
          required
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <option value="">— Escolher —</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name ?? c.id.slice(0, 8)}
              {c.phone ? ` · ${c.phone}` : ""}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="transfer_note">Nota de transferência (opcional)</Label>
        <Textarea
          id="transfer_note"
          name="transfer_note"
          rows={2}
          placeholder="Ex.: venda, documentação entregue…"
          className="border-input bg-background"
        />
      </div>
      {state?.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state?.ok ? (
        <p className="text-sm text-primary">Transferência registada.</p>
      ) : null}
      <Button type="submit" disabled={pending} variant="outline" className="border-border font-heading">
        {pending ? "A processar…" : "Registar transferência"}
      </Button>
    </form>
  );
}
