"use client";

import { useActionState, useEffect } from "react";
import type { ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMotorcycleCatalogEntry } from "@/app/admin/catalogo-motos/actions";

export function CatalogAddForm() {
  const [state, action, pending] = useActionState<
    ActionState | undefined,
    FormData
  >(createMotorcycleCatalogEntry, undefined);

  useEffect(() => {
    if (state?.ok) {
      const el = document.getElementById("catalog-add-form") as HTMLFormElement | null;
      el?.reset();
    }
  }, [state?.ok]);

  return (
    <form id="catalog-add-form" action={action} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-2">
        <Label htmlFor="cat-brand">Marca</Label>
        <Input
          id="cat-brand"
          name="brand"
          required
          placeholder="Ducati"
          className="h-9 border-input bg-background text-foreground shadow-xs placeholder:text-muted-foreground"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cat-model">Modelo</Label>
        <Input
          id="cat-model"
          name="model"
          required
          placeholder="Panigale V4"
          className="h-9 border-input bg-background text-foreground shadow-xs placeholder:text-muted-foreground"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cat-year">Ano</Label>
        <Input
          id="cat-year"
          name="year"
          type="number"
          required
          min={1900}
          max={2100}
          placeholder="2022"
          className="h-9 border-input bg-background text-foreground shadow-xs tabular-nums placeholder:text-muted-foreground"
        />
      </div>
      <div className="space-y-2 sm:col-span-2 lg:col-span-1">
        <Label htmlFor="cat-notes">Notas (opcional)</Label>
        <Input
          id="cat-notes"
          name="notes"
          placeholder="Variante, mercado…"
          className="h-9 border-input bg-background text-foreground shadow-xs placeholder:text-muted-foreground"
        />
      </div>
      <div className="flex flex-col justify-end sm:col-span-2 lg:col-span-4">
        {state?.error ? (
          <p className="mb-2 text-sm text-destructive">{state.error}</p>
        ) : null}
        {state?.ok ? (
          <p className="mb-2 text-sm text-primary">Entrada adicionada.</p>
        ) : null}
        <Button type="submit" disabled={pending} className="w-fit font-heading">
          {pending ? "A guardar…" : "Adicionar ao catálogo"}
        </Button>
      </div>
    </form>
  );
}
