import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createServiceRecordFromMotaForm } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { adminSurface, adminTableWrap } from "@/components/admin/admin-styles";
import { cn } from "@/lib/utils";
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

const statusLabel: Record<ServiceRecordStatus, string> = {
  draft: "Rascunho",
  in_progress: "Em curso",
  completed: "Concluído",
  cancelled: "Cancelado",
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
    <div className="space-y-10">
      <AdminPageHeader
        title="Boletins de intervenção"
        description="Abre um novo registo por mota ou continua a editar intervenções em curso."
      />

      <section className={cn(adminSurface, "p-6 sm:p-8")}>
        <h2 className="font-heading text-lg font-semibold">Novo boletim</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Escolhe a mota para criar um boletim e ir direto para o editor.
        </p>
        <form
          action={createServiceRecordFromMotaForm}
          className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end"
        >
          <div className="min-w-[min(100%,240px)] flex-1 space-y-2">
            <label
              htmlFor="motorcycle_id"
              className="text-sm font-medium leading-none text-foreground"
            >
              Mota
            </label>
            <select
              id="motorcycle_id"
              name="motorcycle_id"
              required
              defaultValue={preselectMotaId ?? ""}
              className="flex h-10 w-full rounded-lg border border-white/15 bg-[#1a1a1a] px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">— Escolher mota —</option>
              {motaList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.brand} {m.model}
                  {m.plate ? ` · ${m.plate}` : ""}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" className="h-10 shrink-0 font-heading sm:min-w-[10rem]">
            Criar e editar
          </Button>
        </form>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-heading text-lg font-semibold">Todos os boletins</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ordenados do mais recente para o mais antigo.
          </p>
        </div>
        <div className={adminTableWrap}>
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
                    Sem boletins. Cria um acima para começar.
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
                        <Badge
                          variant="secondary"
                          className="font-normal"
                        >
                          {statusLabel[r.status] ?? r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="tabular-nums">{r.progress_percent}%</TableCell>
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
      </section>
    </div>
  );
}
