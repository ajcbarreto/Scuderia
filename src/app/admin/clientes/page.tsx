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
import { NovaMotaForm } from "./nova-mota-form";
import { NovoClienteForm } from "./novo-cliente-form";
import { TransferenciaForm } from "./transferencia-form";

export default async function AdminClientesPage() {
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
        title="Clientes e frota"
        description="Cria contas de acesso, regista motas, gere transferências e consulta a frota num só sítio."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className={cn(adminCardClass)}>
          <CardHeader>
            <CardTitle className="font-heading">Novo cliente</CardTitle>
            <CardDescription>
              Cria o utilizador e depois entrega email e palavra-passe ao cliente para ver as motas
              na garagem.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NovoClienteForm />
          </CardContent>
        </Card>

        <Card className={cn(adminCardClass)}>
          <CardHeader>
            <CardTitle className="font-heading">Nova mota</CardTitle>
            <CardDescription>
              Cria a mota e o primeiro período de posse para o cliente escolhido.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NovaMotaForm clients={clients} />
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
            Todas as motas e atalho para os boletins de cada uma.
          </p>
        </div>
        <div className={adminTableWrap}>
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead>Mota</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead className="text-right">Boletins</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  Sem motas na base de dados.
                </TableCell>
              </TableRow>
            ) : (
              list.map((row) => {
                const o = byId[row.current_owner_id];
                return (
                  <TableRow key={row.id} className="border-white/5">
                    <TableCell className="font-medium">
                      {row.brand} {row.model}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-white/15">
                        {row.plate ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>{o?.full_name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {o?.phone ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/boletins?mota=${row.id}`}
                        className={buttonVariants({
                          variant: "ghost",
                          size: "sm",
                        })}
                      >
                        Ver boletins
                      </Link>
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
