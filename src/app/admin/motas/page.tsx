import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { adminCardClass, adminTableWrap } from "@/components/admin/admin-styles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { NovaMotaForm } from "../clientes/nova-mota-form";
import { TransferenciaForm } from "../clientes/transferencia-form";

type PageProps = {
  searchParams: Promise<{ cliente?: string }>;
};

export default async function AdminMotasPage({ searchParams }: PageProps) {
  const { cliente: preselectClienteId } = await searchParams;
  const supabase = await createClient();

  const { data: motas } = await supabase
    .from("motorcycles")
    .select("*")
    .order("updated_at", { ascending: false });

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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className={cn(adminCardClass)}>
          <CardHeader>
            <CardTitle className="font-heading">Nova mota</CardTitle>
            <CardDescription>
              Escolhe uma variante do catálogo (marca, modelo, ano) ou preenche à mão. Primeiro período
              de posse para o cliente escolhido.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NovaMotaForm
              clients={clients}
              defaultOwnerId={preselectClienteId ?? undefined}
              catalogEntries={catalogEntries}
            />
          </CardContent>
        </Card>

        <Card className={cn(adminCardClass)}>
          <CardHeader>
            <CardTitle className="font-heading">Transferência</CardTitle>
            <CardDescription>
              Encerra o período atual e regista o novo dono.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="font-heading text-lg font-semibold">Frota</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Abre a ficha da mota para ver intervenções abertas e histórico de revisões.
          </p>
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
                    Sem motas. Regista uma acima ou cria um cliente em Clientes.
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
                              size: "sm",
                              className: "font-heading",
                            })}
                          >
                            Ficha
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
