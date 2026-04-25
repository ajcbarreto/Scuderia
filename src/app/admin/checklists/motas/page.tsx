import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { adminSurface, adminTableWrap } from "@/components/admin/admin-styles";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Motorcycle, Profile } from "@/types/database";
import {
  countPresetsApplicableToMoto,
  loadAllChecklistPresetSummaries,
} from "@/lib/maintenance-checklist";

export default async function AdminChecklistsMotasPage() {
  const supabase = await createClient();

  const [{ data: motas }, summaries] = await Promise.all([
    supabase
      .from("motorcycles")
      .select("id, brand, model, year, plate, current_owner_id, catalog_entry_id")
      .order("brand", { ascending: true })
      .order("model", { ascending: true })
      .order("year", { ascending: true, nullsFirst: false }),
    loadAllChecklistPresetSummaries(supabase),
  ]);

  const list = (motas ?? []) as Pick<
    Motorcycle,
    "id" | "brand" | "model" | "year" | "plate" | "current_owner_id" | "catalog_entry_id"
  >[];

  const ownerIds = [...new Set(list.map((m) => m.current_owner_id))];
  const { data: profiles } = ownerIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", ownerIds)
    : { data: [] as Pick<Profile, "id" | "full_name">[] };

  const nameById = new Map(
    (profiles ?? []).map((p) => [p.id, p.full_name ?? "—"] as const),
  );

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow={
          <>
            <Link href="/admin/checklists" className="text-primary hover:underline">
              Checklists
            </Link>
            <span className="text-muted-foreground"> · </span>
            <span>Motas</span>
          </>
        }
        title="Motas & presets"
        description="Lista de toda a frota para cruzar com os presets de checklist: vê quantos programas se aplicam a cada mota (marca, modelo e ano) e abre atalhos para criar ou rever presets."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/catalogo-motos"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "border-border",
              )}
            >
              Catálogo
            </Link>
            <Link
              href="/admin/motas"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "border-border",
              )}
            >
              Frota (admin)
            </Link>
            <Link href="/admin/checklists" className={cn(buttonVariants({ size: "sm" }), "font-heading")}>
              Lista de presets
            </Link>
          </div>
        }
      />

      <section className={cn(adminSurface, "p-0")}>
        <div className={adminTableWrap}>
          <Table>
            <TableHeader>
              <TableRow className="border-border/80 hover:bg-transparent">
                <TableHead>Marca</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Presets</TableHead>
                <TableHead className="w-[280px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow className="border-border/80 hover:bg-transparent">
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    Ainda não há motas na base de dados.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((m) => {
                  const n = countPresetsApplicableToMoto(
                    summaries,
                    m.brand,
                    m.model,
                    m.year ?? null,
                  );
                  const qsNew = new URLSearchParams();
                  if (m.catalog_entry_id) {
                    qsNew.set("catalog_entry_id", m.catalog_entry_id);
                  } else {
                    qsNew.set("brand", m.brand);
                    qsNew.set("model", m.model);
                    if (m.year != null) qsNew.set("year", String(m.year));
                  }
                  const qsList = new URLSearchParams();
                  qsList.set("brand", m.brand);
                  qsList.set("model", m.model);
                  return (
                    <TableRow key={m.id} className="border-border/80">
                      <TableCell className="font-medium">{m.brand}</TableCell>
                      <TableCell>{m.model}</TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">
                        {m.year ?? "—"}
                      </TableCell>
                      <TableCell>{m.plate ?? "—"}</TableCell>
                      <TableCell className="max-w-[160px] truncate text-sm text-muted-foreground">
                        {nameById.get(m.current_owner_id) ?? "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{n}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-1">
                          <Link
                            href={`/admin/checklists/new?${qsNew.toString()}`}
                            className={cn(
                              buttonVariants({ variant: "secondary", size: "sm" }),
                              "font-heading text-[10px] uppercase tracking-wide",
                            )}
                          >
                            Novo preset
                          </Link>
                          <Link
                            href={`/admin/checklists?${qsList.toString()}`}
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "sm" }),
                              "text-primary",
                            )}
                          >
                            Ver presets
                          </Link>
                          <Link
                            href={`/admin/motas/${m.id}`}
                            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                          >
                            Ficha
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
