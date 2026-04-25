"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { createMotorcycle, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { MotorcycleCatalogEntry, Profile } from "@/types/database";
import { formatMotorcycleCatalogLabel } from "@/lib/motorcycle-catalog";

type Props = {
  clients: Pick<Profile, "id" | "full_name" | "phone">[];
  /** Pré-seleciona o dono (ex.: ?cliente= da página Motas). */
  defaultOwnerId?: string;
  catalogEntries: MotorcycleCatalogEntry[];
};

export function NovaMotaForm({ clients, defaultOwnerId, catalogEntries }: Props) {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(
    createMotorcycle,
    undefined,
  );

  const [catalogId, setCatalogId] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");

  useEffect(() => {
    if (state?.ok) {
      const form = document.getElementById("nova-mota-form") as HTMLFormElement | null;
      form?.reset();
      setCatalogId("");
      setBrand("");
      setModel("");
      setYear("");
    }
  }, [state?.ok]);

  function applyCatalogSelection(id: string) {
    setCatalogId(id);
    if (!id) return;
    const e = catalogEntries.find((x) => x.id === id);
    if (e) {
      setBrand(e.brand);
      setModel(e.model);
      setYear(String(e.year));
    }
  }

  const fromCatalog = Boolean(catalogId);

  return (
    <form id="nova-mota-form" action={action} className="space-y-4">
      <input type="hidden" name="catalog_entry_id" value={catalogId} />

      <div className="space-y-2">
        <Label htmlFor="catalog_pick">Modelo do catálogo</Label>
        <select
          id="catalog_pick"
          value={catalogId}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) {
              setCatalogId("");
              return;
            }
            applyCatalogSelection(v);
          }}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <option value="">— Escrever manualmente marca / modelo / ano —</option>
          {catalogEntries.map((e) => (
            <option key={e.id} value={e.id}>
              {formatMotorcycleCatalogLabel(e)}
            </option>
          ))}
        </select>
        {catalogEntries.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Catálogo vazio.{" "}
            <Link href="/admin/catalogo-motos" className="text-primary hover:underline">
              Adiciona variantes ao catálogo
            </Link>{" "}
            para poderes selecionar aqui.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Ao escolher uma linha, marca, modelo e ano vêm do catálogo (podes ainda editar matrícula e
            notas).
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="brand">Marca</Label>
          <Input
            id="brand"
            name="brand"
            required
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            readOnly={fromCatalog}
            autoComplete="off"
            className="border-input bg-background read-only:opacity-80"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Modelo</Label>
          <Input
            id="model"
            name="model"
            required
            value={model}
            onChange={(e) => setModel(e.target.value)}
            readOnly={fromCatalog}
            autoComplete="off"
            className="border-input bg-background read-only:opacity-80"
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
            value={year}
            onChange={(e) => setYear(e.target.value)}
            readOnly={fromCatalog}
            placeholder="ex. 2022"
            className="border-input bg-background read-only:opacity-80"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="owner_id">Cliente (dono)</Label>
          <select
            id="owner_id"
            name="owner_id"
            required
            defaultValue={defaultOwnerId ?? ""}
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
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="plate">Matrícula</Label>
          <Input
            id="plate"
            name="plate"
            autoComplete="off"
            className="border-input bg-background"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vin">Quadro (VIN)</Label>
          <Input
            id="vin"
            name="vin"
            autoComplete="off"
            className="border-input bg-background"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notas internas</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          className="border-input bg-background"
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
