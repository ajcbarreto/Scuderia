import Link from "next/link";
import { Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { adminTableWrap } from "@/components/admin/admin-styles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Motorcycle, Profile } from "@/types/database";
import { loadMotorcycleCatalogEntries } from "@/lib/motorcycle-catalog";
import { AdminSearch } from "@/components/admin/admin-search";
import { CollapsibleAddSection } from "@/components/admin/collapsible-add-section";
import { NovaMotaForm } from "../clientes/nova-mota-form";
import { TransferenciaForm } from "../clientes/transferencia-form";

type PageProps = {
  searchParams: Promise<{ cliente?: string; q?: string }>;
};

export default async function AdminMotasPage({ searchParams }: PageProps) {
  const { cliente: preselectClienteId, q } = await searchParams;
  const supabase = await createClient();

  // Pesquisa em marca, modelo, matrícula ou VIN — `ilike` case-insensitive.
  let motasQuery = supabase
    .from("motorcycles")
    .select("*")
    .order("updated_at", { ascending: false });

  const term = q?.trim();
  if (term) {
    const safe = term.replace(/[%_]/g, "\\$&");
    motasQuery = motasQuery.or(
      `brand.ilike.%${safe}%,model.ilike.%${safe}%,plate.ilike.%${safe}%,vin.ilike.%${safe}%`,
    );
  }

  const { data: motas } = await motasQuery;

  const { data: clientProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, phone")
    .eq("role", "client")
    .order("full_name", { ascending: true });

  const catalogEntries = await loadMotorcycleCatalogEntries(supabase);

  const list = (motas ?? []) as Motorcycle[];
  const clients = (clientProfiles ?? []) as Pick<
    Profile,
    "id" | "full_name" | "phone"
  >[];

  const ownerIds = [...new Set(list.map((m) => m.current_owner_id))];
  const { data: profs } =
    ownerIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, phone")
          .in("id", ownerIds)
      : { data: [] as Pick<Profile, "id" | "full_name" | "phone">[] };

  const byId = Object.fromEntries(
    (profs ?? []).map((p) => [p.id, p] as const),
  );

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Motas"
        description="Frota completa: registo de motas, transferências de propriedade e acesso à ficha de cada uma (revisões e manutenções)."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/catalogo-motos"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "border-border",
              )}
            >
              Catálogo motas
            </Link>
            <Link
              href="/admin/clientes"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "border-border",
              )}
            >
              Clientes
            </Link>
          </div>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <CollapsibleAddSection
          triggerLabel="Nova mota"
          openTitle="Nova mota"
          openDescription="Escolhe uma variante do catálogo (marca, modelo, ano) ou preenche à mão. Primeiro período de posse para o cliente escolhido."
          defaultOpen={Boolean(preselectClienteId)}
          className="w-full"
        >
          <NovaMotaForm
            clients={clients}
            defaultOwnerId={preselectClienteId ?? undefined}
            catalogEntries={catalogEntries}
          />
        </CollapsibleAddSection>

        <CollapsibleAddSection
          triggerLabel="Transferência"
          openTitle="Transferência"
          openDescription="Encerra o período atual e regista o novo dono."
          className="w-full"
        >
          <TransferenciaForm
            motas={list.map((m) => ({
              id: m.id,
              brand: m.brand,
              model: m.model,
              plate: m.plate,
              current_owner_id: m.current_owner_id,
            }))}
            clients={clients}
          />
        </CollapsibleAddSection>
      </div>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold">Frota</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Abre a ficha da mota para ver intervenções abertas e histórico de revisões.
            </p>
          </div>
          <AdminSearch placeholder="Pesquisar marca, modelo, matrícula, VIN…" />
        </div>
        <div className={adminTableWrap}>
          <Table>
            <TableHeader>
              <TableRow className="border-border/80 hover:bg-transparent">
                <TableHead>Mota</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Dono atual</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    {term
                      ? `Nenhuma mota coincide com "${term}".`
                      : "Sem motas. Regista uma acima ou cria um cliente em Clientes."}
                  </TableCell>
                </TableRow>
              ) : (
                list.map((row) => {
                  const o = byId[row.current_owner_id];
                  return (
                    <TableRow key={row.id} className="border-border/60">
                      <TableCell className="font-medium">
                        {row.brand} {row.model}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-border">
                          {row.plate ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {o?.full_name ?? "—"}
                        {o?.phone ? (
                          <span className="ml-2 text-xs opacity-80">{o.phone}</span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-1">
                          <Link
                            href={`/admin/motas/${row.id}`}
                            className={buttonVariants({
                              variant: "default",
                              size: "icon-sm",
                              className: "font-heading",
                            })}
                            aria-label="Ver ficha da mota"
                            title="Ver ficha"
                          >
                            <Eye className="size-4" aria-hidden />
                          </Link>
                          <Link
                            href={`/admin/servico?mota=${row.id}`}
                            className={buttonVariants({
                              variant: "outline",
                              size: "sm",
                              className: "border-border",
                            })}
                          >
                            Oficina
                          </Link>
                          <Link
                            href={`/admin/boletins?mota=${row.id}`}
                            className={buttonVariants({
                              variant: "ghost",
                              size: "sm",
                            })}
                          >
                            Boletins
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
