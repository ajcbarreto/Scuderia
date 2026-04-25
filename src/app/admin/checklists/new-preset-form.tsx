"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { createChecklistPreset } from "@/app/admin/checklists/actions";
import type { ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminSurface } from "@/components/admin/admin-styles";
import { cn } from "@/lib/utils";
import type { MotorcycleCatalogEntry } from "@/types/database";
import { formatMotorcycleCatalogLabel } from "@/lib/motorcycle-catalog";

export type NewPresetFormDefaults = {
  brand: string;
  model: string;
  year_min: string;
  year_max: string;
  /** Pré-seleciona catálogo (UUID). */
  initialCatalogEntryId?: string;
};

type Props = {
  defaults?: NewPresetFormDefaults;
  catalogEntries: MotorcycleCatalogEntry[];
};

export function NewPresetForm({ defaults, catalogEntries }: Props) {
  const d = defaults ?? {
    brand: "",
    model: "",
    year_min: "",
    year_max: "",
    initialCatalogEntryId: undefined,
  };

  const [catalogId, setCatalogId] = useState(d.initialCatalogEntryId ?? "");
  const [brand, setBrand] = useState(d.brand);
  const [model, setModel] = useState(d.model);
  const [yearMin, setYearMin] = useState(d.year_min);
  const [yearMax, setYearMax] = useState(d.year_max);

  useEffect(() => {
    const id = d.initialCatalogEntryId;
    if (!id) return;
    const e = catalogEntries.find((x) => x.id === id);
    if (e) {
      setCatalogId(id);
      setBrand(e.brand);
      setModel(e.model);
      setYearMin(String(e.year));
      setYearMax(String(e.year));
    }
  }, [d.initialCatalogEntryId, catalogEntries]);

  const fromCatalog = Boolean(catalogId);

  const [state, action, pending] = useActionState<
    ActionState | undefined,
    FormData
  >(createChecklistPreset, undefined);

  function onCatalogChange(id: string) {
    setCatalogId(id);
    if (!id) return;
    const e = catalogEntries.find((x) => x.id === id);
    if (e) {
      setBrand(e.brand);
      setModel(e.model);
      setYearMin(String(e.year));
      setYearMax(String(e.year));
    }
  }

  return (
    <form action={action} className={cn(adminSurface, "space-y-4 p-6 sm:p-8")}>
      <input type="hidden" name="catalog_entry_id" value={catalogId} />

      <div className="space-y-2">
        <Label htmlFor="preset_catalog">Modelo do catálogo</Label>
        <select
          id="preset_catalog"
          value={catalogId}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) {
              setCatalogId("");
              return;
            }
            onCatalogChange(v);
          }}
          className="flex h-9 w-full rounded-md border border-white/15 bg-[#1a1a1a] px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <option value="">— Preencher manualmente marca / modelo / anos —</option>
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
              Adiciona variantes
            </Link>{" "}
            para seleção rápida.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Ao escolher do catálogo, marca e modelo ficam fixos ao registo do catálogo; os anos são
            preenchidos com o ano da variante (podes alargar o intervalo para o preset).
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand">Marca</Label>
        <Input
          id="brand"
          name="brand"
          required
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          readOnly={fromCatalog}
          placeholder="Ex.: Ducati"
          className="border-white/15 bg-[#1a1a1a] read-only:opacity-80"
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
          placeholder="Ex.: Panigale V4"
          className="border-white/15 bg-[#1a1a1a] read-only:opacity-80"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="year_min">Ano mínimo (opcional)</Label>
          <Input
            id="year_min"
            name="year_min"
            type="number"
            min={1900}
            max={2100}
            inputMode="numeric"
            value={yearMin}
            onChange={(e) => setYearMin(e.target.value)}
            placeholder="Ex.: 2018"
            className="border-white/15 bg-[#1a1a1a]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year_max">Ano máximo (opcional)</Label>
          <Input
            id="year_max"
            name="year_max"
            type="number"
            min={1900}
            max={2100}
            inputMode="numeric"
            value={yearMax}
            onChange={(e) => setYearMax(e.target.value)}
            placeholder="Ex.: 2020"
            className="border-white/15 bg-[#1a1a1a]"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Sem catálogo: deixa os dois anos vazios para o preset valer para{" "}
        <strong className="text-foreground">todos</strong> os anos desse modelo. Com catálogo, marca e
        modelo ficam fixos; os anos começam iguais ao ano da variante e podes alargar o intervalo para o
        preset.
      </p>
      <div className="space-y-2">
        <Label htmlFor="service_type_name">Tipo de serviço</Label>
        <Input
          id="service_type_name"
          name="service_type_name"
          required
          placeholder="Ex.: Desmo 30.000 km"
          className="border-white/15 bg-[#1a1a1a]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Observações internas sobre este programa…"
          className="border-white/15 bg-[#1a1a1a]"
        />
      </div>
      {state?.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" disabled={pending} className="font-heading">
        {pending ? "A criar…" : "Criar e editar linhas"}
      </Button>
    </form>
  );
}
