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
import { DeletePresetButton } from "@/app/admin/checklists/delete-preset-button";
import {
  formatPresetYearRange,
  normalizePresetKey,
} from "@/lib/maintenance-checklist";

type PresetRow = {
  id: string;
  brand: string;
  model: string;
  service_type_name: string;
  year_min: number | null;
  year_max: number | null;
  updated_at: string;
  maintenance_checklist_preset_items: { id: string }[] | null;
};

type PageProps = {
  searchParams: Promise<{ brand?: string; model?: string }>;
};

export default async function AdminChecklistsPage({ searchParams }: PageProps) {
  const { brand: qBrand, model: qModel } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("maintenance_checklist_presets")
    .select(
      "id, brand, model, service_type_name, year_min, year_max, updated_at, maintenance_checklist_preset_items ( id )",
    )
    .order("brand", { ascending: true })
    .order("model", { ascending: true })
    .order("service_type_name", { ascending: true });

  const rows = (data ?? []) as PresetRow[];
  const filtered = rows.filter((r) => {
    if (qBrand?.trim() && normalizePresetKey(r.brand) !== normalizePresetKey(qBrand)) {
      return false;
    }
    if (qModel?.trim() && normalizePresetKey(r.model) !== normalizePresetKey(qModel)) {
      return false;
    }
    return true;
  });

  const filterActive = Boolean(qBrand?.trim() || qModel?.trim());

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Configuração"
        title="Checklists por modelo"
        description="Define, por marca, modelo, ano (intervalo) e tipo de serviço, a lista de trabalhos sugeridos. Na edição do boletim, só aparecem presets compatíveis com a mota."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/catalogo-motos"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "border-border font-heading",
              )}
            >
              Catálogo
            </Link>
            <Link
              href="/admin/checklists/motas"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "border-border font-heading",
              )}
            >
              Motas & presets
            </Link>
            <Link href="/admin/checklists/new" className={cn(buttonVariants(), "font-heading")}>
              Novo preset
            </Link>
          </div>
        }
      />

      {filterActive ? (
        <p className="text-sm text-muted-foreground">
          Filtro:{" "}
          <span className="text-foreground">
            {[qBrand?.trim(), qModel?.trim()].filter(Boolean).join(" · ")}
          </span>
          .{" "}
          <Link href="/admin/checklists" className="text-primary hover:underline">
            Limpar filtro
          </Link>
        </p>
      ) : null}

      <section className={cn(adminSurface, "p-0")}>
        <div className={adminTableWrap}>
          <Table>
            <TableHeader>
              <TableRow className="border-border/80 hover:bg-transparent">
                <TableHead>Marca</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Anos (modelo)</TableHead>
                <TableHead>Tipo de serviço</TableHead>
                <TableHead className="text-right">Linhas</TableHead>
                <TableHead className="w-[200px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow className="border-border/80 hover:bg-transparent">
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    {rows.length === 0
                      ? "Ainda não há presets. Cria o primeiro para desmo, revisões ou outros programas."
                      : "Nenhum preset corresponde ao filtro. Ajusta marca/modelo ou limpa o filtro."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => {
                  const n = r.maintenance_checklist_preset_items?.length ?? 0;
                  return (
                    <TableRow key={r.id} className="border-border/80">
                      <TableCell className="font-medium">{r.brand}</TableCell>
                      <TableCell>{r.model}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatPresetYearRange(
                          r.year_min ?? null,
                          r.year_max ?? null,
                        )}
                      </TableCell>
                      <TableCell>{r.service_type_name}</TableCell>
                      <TableCell className="text-right tabular-nums">{n}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`/admin/checklists/${r.id}`}
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "sm" }),
                              "text-primary",
                            )}
                          >
                            Editar
                          </Link>
                          <DeletePresetButton presetId={r.id} />
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
