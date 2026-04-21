"use client";

import { useActionState, useEffect } from "react";
import { createMotorcycle, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Profile } from "@/types/database";

type Props = {
  clients: Pick<Profile, "id" | "full_name" | "phone">[];
};

export function NovaMotaForm({ clients }: Props) {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(
    createMotorcycle,
    undefined,
  );

  useEffect(() => {
    if (state?.ok) {
      const form = document.getElementById("nova-mota-form") as HTMLFormElement | null;
      form?.reset();
    }
  }, [state?.ok]);

  return (
    <form id="nova-mota-form" action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="brand">Marca</Label>
          <Input
            id="brand"
            name="brand"
            required
            autoComplete="off"
            className="border-white/15 bg-[#1a1a1a]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Modelo</Label>
          <Input
            id="model"
            name="model"
            required
            autoComplete="off"
            className="border-white/15 bg-[#1a1a1a]"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="year">Ano</Label>
          <Input
            id="year"
            name="year"
            type="number"
            min={1900}
            max={2100}
            placeholder="ex. 2022"
            className="border-white/15 bg-[#1a1a1a]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="owner_id">Cliente (dono)</Label>
          <select
            id="owner_id"
            name="owner_id"
            required
            className="flex h-9 w-full rounded-md border border-white/15 bg-[#1a1a1a] px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="plate">Matrícula</Label>
          <Input
            id="plate"
            name="plate"
            autoComplete="off"
            className="border-white/15 bg-[#1a1a1a]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vin">Quadro (VIN)</Label>
          <Input
            id="vin"
            name="vin"
            autoComplete="off"
            className="border-white/15 bg-[#1a1a1a]"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notas internas</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          className="border-white/15 bg-[#1a1a1a]"
        />
      </div>
      {state?.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state?.ok ? (
        <p className="text-sm text-primary">Mota criada com período de posse inicial.</p>
      ) : null}
      <Button type="submit" disabled={pending} className="font-heading">
        {pending ? "A guardar…" : "Registar mota"}
      </Button>
    </form>
  );
}
