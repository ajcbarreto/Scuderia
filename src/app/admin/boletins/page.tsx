import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createServiceRecordFromMotaForm } from "@/app/admin/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import type { Motorcycle, ServiceRecordStatus } from "@/types/database";

type Row = {
  id: string;
  title: string | null;
  status: ServiceRecordStatus;
  progress_percent: number;
  opened_at: string;
  motorcycle_id: string;
  motorcycles:
    | Pick<Motorcycle, "brand" | "model" | "plate">
    | Pick<Motorcycle, "brand" | "model" | "plate">[]
    | null;
};

type PageProps = {
  searchParams: Promise<{ mota?: string }>;
};

export default async function AdminBoletinsPage({ searchParams }: PageProps) {
  const { mota: preselectMotaId } = await searchParams;
  const supabase = await createClient();
  const { data: records } = await supabase
    .from("service_records")
    .select(
      "id, title, status, progress_percent, opened_at, motorcycle_id, motorcycles ( brand, model, plate )",
    )
    .order("opened_at", { ascending: false });

  const { data: motas } = await supabase
    .from("motorcycles")
    .select("id, brand, model, plate")
    .order("brand", { ascending: true });

  const list = (records ?? []) as unknown as Row[];
  const motaList = (motas ?? []) as Pick<
    Motorcycle,
    "id" | "brand" | "model" | "plate"
  >[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Boletins</h1>
        <p className="mt-2 text-muted-foreground">
          Intervenções por mota — cria um novo boletim ou edita um existente.
        </p>
      </div>

      <section className="rounded-xl border border-white/10 bg-[#131313] p-6">
        <h2 className="font-heading text-lg">Novo boletim</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Escolhe a mota para abrir um registo de serviço.
        </p>
        <form action={createServiceRecordFromMotaForm} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1 space-y-2">
            <label
              htmlFor="motorcycle_id"
              className="text-sm font-medium leading-none"
            >
              Mota
            </label>
            <select
              id="motorcycle_id"
              name="motorcycle_id"
              required
              defaultValue={preselectMotaId ?? ""}
              className="flex h-9 w-full rounded-md border border-white/15 bg-[#1a1a1a] px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">— Escolher —</option>
              {motaList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.brand} {m.model}
                  {m.plate ? ` · ${m.plate}` : ""}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" className="font-heading">
            Criar e editar
          </Button>
        </form>
      </section>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#131313]">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead>Mota</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead>Aberto</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  Sem boletins. Cria um acima.
                </TableCell>
              </TableRow>
            ) : (
              list.map((r) => {
                const raw = r.motorcycles;
                const m = Array.isArray(raw) ? raw[0] ?? null : raw;
                return (
                  <TableRow key={r.id} className="border-white/5">
                    <TableCell className="font-medium">
                      {m ? `${m.brand} ${m.model}` : "—"}
                      {m?.plate ? (
                        <span className="ml-2 text-muted-foreground">
                          ({m.plate})
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell>{r.title ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{r.status}</Badge>
                    </TableCell>
                    <TableCell>{r.progress_percent}%</TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.opened_at?.slice(0, 10)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/boletins/${r.id}`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                          className: "border-white/15",
                        })}
                      >
                        Editar
                      </Link>
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
