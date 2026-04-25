import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { loadMotorcycleCatalogEntries } from "@/lib/motorcycle-catalog";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { NewPresetForm } from "@/app/admin/checklists/new-preset-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  searchParams: Promise<{
    brand?: string;
    model?: string;
    year?: string;
    year_min?: string;
    year_max?: string;
    catalog_entry_id?: string;
  }>;
};

export default async function AdminNewChecklistPresetPage({ searchParams }: Props) {
  const supabase = await createClient();
  const catalogEntries = await loadMotorcycleCatalogEntries(supabase);

  const q = await searchParams;
  const yearSingle = q.year?.trim();
  const catalogEntryIdQ = q.catalog_entry_id?.trim();
  const fromCatalog = catalogEntryIdQ
    ? catalogEntries.find((c) => c.id === catalogEntryIdQ)
    : undefined;

  const defaults = {
    brand: fromCatalog?.brand ?? q.brand?.trim() ?? "",
    model: fromCatalog?.model ?? q.model?.trim() ?? "",
    year_min:
      fromCatalog != null
        ? String(fromCatalog.year)
        : yearSingle ?? q.year_min?.trim() ?? "",
    year_max:
      fromCatalog != null
        ? String(fromCatalog.year)
        : yearSingle ?? q.year_max?.trim() ?? "",
    initialCatalogEntryId: fromCatalog?.id,
  };

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow={
          <>
            <Link href="/admin/checklists" className="text-primary hover:underline">
              Checklists
            </Link>
            <span className="text-muted-foreground"> · </span>
            <span>Novo</span>
          </>
        }
        title="Novo preset"
        description="Escolhe uma variante do catálogo ou preenche marca, modelo e intervalo de anos à mão. O tipo de serviço (ex.: desmo 30 mil) identifica o preset."
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
              href="/admin/checklists/motas"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "border-white/15",
              )}
            >
              Motas
            </Link>
            <Link
              href="/admin/checklists"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-white/15")}
            >
              Voltar
            </Link>
          </div>
        }
      />
      <NewPresetForm
        key={defaults.initialCatalogEntryId ?? "new"}
        defaults={defaults}
        catalogEntries={catalogEntries}
      />
    </div>
  );
}
