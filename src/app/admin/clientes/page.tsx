import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Motorcycle, Profile } from "@/types/database";

export default async function AdminClientesPage() {
  const supabase = await createClient();
  const { data: motas } = await supabase
    .from("motorcycles")
    .select("*")
    .order("updated_at", { ascending: false });

  const list = (motas ?? []) as Motorcycle[];
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
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Clientes e frota</h1>
        <p className="mt-2 text-muted-foreground">
          Lista de motas e dono atual. Transferência de mota e novos registos
          podem ser adicionados como próximo passo (forms no painel).
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#131313]">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead>Mota</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Contacto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
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
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
