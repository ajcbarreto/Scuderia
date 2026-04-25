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
import type { MotorcycleCatalogEntry } from "@/types/database";
import { CatalogEntryDeleteButton } from "@/app/admin/catalogo-motos/catalog-entry-delete-button";
import { CatalogAddForm } from "@/app/admin/catalogo-motos/catalog-add-form";

export default async function AdminCatalogoMotosPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("motorcycle_catalog_entries")
    .select("*")
    .order("brand", { ascending: true })
    .order("model", { ascending: true })
    .order("year", { ascending: true });

  const rows = (data ?? []) as MotorcycleCatalogEntry[];

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Configuração"
        title="Catálogo de motas"
        description="Lista de variantes (marca, modelo, ano). Usa esta lista ao registar uma mota para um cliente ou ao criar um preset de checklist — evita erros de escrita e mantém tudo alinhado."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/motas"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "border-white/15",
              )}
            >
              Frota
            </Link>
            <Link
              href="/admin/checklists"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-white/15")}
            >
              Checklists
            </Link>
          </div>
        }
      />

      <section className={cn(adminSurface, "p-6 sm:p-8")}>
        <h2 className="font-heading text-lg font-semibold">Nova entrada</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Um registo por variante (ex.: Ducati Panigale V4 de 2022). Depois escolhe-a nos formulários de nova mota ou novo preset.
        </p>
        <div className="mt-4">
          <CatalogAddForm />
        </div>
      </section>

      <section className={cn(adminSurface, "p-0")}>
        <div className={adminTableWrap}>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead>Marca</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead className="tabular-nums">Ano</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead className="w-[100px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    Catálogo vazio. Adiciona a primeira variante acima.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.id} className="border-white/10">
                    <TableCell className="font-medium">{r.brand}</TableCell>
                    <TableCell>{r.model}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">{r.year}</TableCell>
                    <TableCell className="max-w-[240px] truncate text-sm text-muted-foreground">
                      {r.notes ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <CatalogEntryDeleteButton entryId={r.id} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
