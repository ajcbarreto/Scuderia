"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { formatPresetYearRange } from "@/lib/maintenance-checklist";
import {
  addChecklistPresetItem,
  deleteChecklistPresetItem,
  updateChecklistPreset,
} from "@/app/admin/checklists/actions";
import type { ActionState } from "@/app/admin/actions";
import type {
  MaintenanceChecklistPreset,
  MaintenanceChecklistPresetItem,
  MotorcycleCatalogEntry,
} from "@/types/database";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { adminSurface } from "@/components/admin/admin-styles";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatMotorcycleCatalogLabel } from "@/lib/motorcycle-catalog";

type Props = {
  preset: MaintenanceChecklistPreset;
  items: MaintenanceChecklistPresetItem[];
  catalogEntries: MotorcycleCatalogEntry[];
};

export function PresetEditor({ preset, items, catalogEntries }: Props) {
  const presetId = preset.id;

  const [catalogId, setCatalogId] = useState(preset.catalog_entry_id ?? "");
  const [brand, setBrand] = useState(preset.brand);
  const [model, setModel] = useState(preset.model);
  const [yearMin, setYearMin] = useState(
    preset.year_min != null ? String(preset.year_min) : "",
  );
  const [yearMax, setYearMax] = useState(
    preset.year_max != null ? String(preset.year_max) : "",
  );

  const boundUpdate = updateChecklistPreset.bind(null, presetId);
  const [metaState, metaAction, metaPending] = useActionState<
    ActionState | undefined,
    FormData
  >(boundUpdate, undefined);

  const [itemState, itemAction, itemPending] = useActionState<
    ActionState | undefined,
    FormData
  >(addChecklistPresetItem, undefined);

  useEffect(() => {
    if (itemState?.ok) {
      const el = document.getElementById("add-preset-item-form") as HTMLFormElement | null;
      el?.reset();
    }
  }, [itemState?.ok]);

  const fromCatalog = Boolean(catalogId);

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
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow={
          <>
            <Link href="/admin/checklists" className="text-primary hover:underline">
              Checklists
            </Link>
            <span className="text-muted-foreground"> · </span>
            <span>
              {preset.brand} {preset.model}
            </span>
          </>
        }
        title={preset.service_type_name}
        description={`${preset.brand} ${preset.model} · ${formatPresetYearRange(preset.year_min, preset.year_max)} — linhas sugeridas ao aplicar o preset a um boletim compatível.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/catalogo-motos"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "border-white/15",
              )}
            >
              Catálogo
            </Link>
            <Link
              href="/admin/checklists"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "border-white/15",
              )}
            >
              Lista
            </Link>
          </div>
        }
      />

      <section className={cn(adminSurface, "p-6 sm:p-8")}>
        <h2 className="font-heading text-lg font-semibold">Identificação do preset</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A combinação marca + modelo + tipo de serviço + intervalo de anos tem de ser única. Podes
          ligar a uma entrada do catálogo ou preencher à mão.
        </p>
        <form action={metaAction} className="mt-4 space-y-4">
          <input type="hidden" name="catalog_entry_id" value={catalogId} />

          <div className="space-y-2">
            <Label htmlFor="preset_catalog_edit">Modelo do catálogo</Label>
            <select
              id="preset_catalog_edit"
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
              <option value="">— Manual (sem ligação ao catálogo) —</option>
              {catalogEntries.map((e) => (
                <option key={e.id} value={e.id}>
                  {formatMotorcycleCatalogLabel(e)}
                </option>
              ))}
            </select>
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
              className="border-white/15 bg-[#1a1a1a] read-only:opacity-80"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="service_type_name">Tipo de serviço</Label>
            <Input
              id="service_type_name"
              name="service_type_name"
              required
              defaultValue={preset.service_type_name}
              className="border-white/15 bg-[#1a1a1a]"
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
                placeholder="Qualquer"
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
                placeholder="Qualquer"
                className="border-white/15 bg-[#1a1a1a]"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Vazio nos dois = todos os anos (só faz sentido sem catálogo ou após limpar os anos).
          </p>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={preset.notes ?? ""}
              className="border-white/15 bg-[#1a1a1a]"
            />
          </div>
          {metaState?.error ? (
            <p className="text-sm text-destructive">{metaState.error}</p>
          ) : null}
          {metaState?.ok ? (
            <p className="text-sm text-primary">Guardado.</p>
          ) : null}
          <Button type="submit" disabled={metaPending} className="font-heading">
            {metaPending ? "A guardar…" : "Guardar dados"}
          </Button>
        </form>
      </section>

      <section className={cn(adminSurface, "p-6 sm:p-8")}>
        <h2 className="font-heading text-lg font-semibold">Serviços incluídos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ordem de execução sugerida na oficina. Ao aplicar o preset a um boletim, estas
          linhas passam a tarefas editáveis nesse serviço.
        </p>
        <ul className="mt-4 space-y-2">
          {items.length === 0 ? (
            <li className="text-sm text-muted-foreground">Ainda sem linhas.</li>
          ) : (
            items.map((it) => (
              <li
                key={it.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm"
              >
                <span>{it.label}</span>
                <form action={deleteChecklistPresetItem}>
                  <input type="hidden" name="item_id" value={it.id} />
                  <input type="hidden" name="preset_id" value={presetId} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    aria-label="Remover linha"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </form>
              </li>
            ))
          )}
        </ul>
        <form
          id="add-preset-item-form"
          action={itemAction}
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <input type="hidden" name="preset_id" value={presetId} />
          <div className="flex-1 space-y-2">
            <Label htmlFor="label">Nova linha de serviço</Label>
            <Input
              id="label"
              name="label"
              placeholder="Ex.: Substituir filtro de óleo"
              className="border-white/15 bg-[#1a1a1a]"
            />
          </div>
          <Button type="submit" disabled={itemPending} variant="outline" className="border-white/15">
            {itemPending ? "…" : "Adicionar"}
          </Button>
        </form>
        {itemState?.error ? (
          <p className="mt-2 text-sm text-destructive">{itemState.error}</p>
        ) : null}
      </section>
    </div>
  );
}
