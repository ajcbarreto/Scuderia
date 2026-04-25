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
import { Progress } from "@/components/ui/progress";
import type {
  Motorcycle,
  ServiceRecordKind,
  ServiceRecordStatus,
} from "@/types/database";

type Row = {
  id: string;
  title: string | null;
  status: ServiceRecordStatus;
  record_kind: ServiceRecordKind;
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

const recordKindLabel: Record<ServiceRecordKind, string> = {
  maintenance: "Manutenção",
  shop_service: "Serviço",
};

export default async function AdminBoletinsPage({ searchParams }: PageProps) {
  const { mota: preselectMotaId } = await searchParams;
  const supabase = await createClient();

  const [{ data: openRecords }, { data: records }, { data: motas }] =
    await Promise.all([
      supabase
        .from("service_records")
        .select(
          "id, title, status, record_kind, progress_percent, opened_at, motorcycle_id, motorcycles ( brand, model, plate )",
        )
        .in("status", ["draft", "in_progress"])
        .order("opened_at", { ascending: false }),
      supabase
        .from("service_records")
        .select(
          "id, title, status, record_kind, progress_percent, opened_at, motorcycle_id, motorcycles ( brand, model, plate )",
        )
        .order("opened_at", { ascending: false }),
      supabase
        .from("motorcycles")
        .select("id, brand, model, plate")
        .order("brand", { ascending: true }),
    ]);

  const open = (openRecords ?? []) as unknown as Row[];
  const list = (records ?? []) as unknown as Row[];
  const motaList = (motas ?? []) as Pick<
    Motorcycle,
    "id" | "brand" | "model" | "plate"
  >[];

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Boletins de intervenção"
        description="Indica se o registo é manutenção (histórico visível na garagem do dono atual) ou serviço de oficina (só visível na admin — por exemplo trabalho do proprietário anterior). Regista o trabalho em tarefas; o progresso sincroniza com a garagem nos boletins de manutenção."
      />

      <section className={cn(adminSurface, "p-6 sm:p-8")}>
        <h2 className="font-heading text-lg font-semibold">Iniciar serviço na mota</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Cria um boletim para esta entrada. Depois descreves o que foi feito, marcas tarefas e
          acompanhas o progresso no editor.
        </p>
        <form
          action={createServiceRecordFromMotaForm}
          className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end"
        >
          <div className="min-w-[min(100%,280px)] flex-1 space-y-2">
            <label
              htmlFor="servico_motorcycle_id"
              className="text-sm font-medium leading-none text-foreground"
            >
              Mota
            </label>
            <select
              id="servico_motorcycle_id"
              name="motorcycle_id"
              required
              defaultValue={preselectMotaId ?? ""}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
          <div className="min-w-[min(100%,260px)] space-y-2">
            <label
              htmlFor="new_record_kind"
              className="text-sm font-medium leading-none text-foreground"
            >
              Tipo
            </label>
            <select
              id="new_record_kind"
              name="record_kind"
              defaultValue="maintenance"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="maintenance">Manutenção (garagem)</option>
              <option value="shop_service">Serviço (só oficina)</option>
            </select>
          </div>
          <Button type="submit" className="h-10 shrink-0 font-heading sm:min-w-[12rem]">
            Abrir intervenção
          </Button>
        </form>
        <p className="mt-4 text-xs text-muted-foreground">
          A mota tem de existir na frota (regista-a em Clientes e frota se for nova).
        </p>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">Serviços em curso</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Boletins em rascunho ou em curso — continua o trabalho ou fecha o estado quando
            terminares.
          </p>
        </div>

        {open.length === 0 ? (
          <div className={cn(adminSurface, "p-8 text-center")}>
            <p className="text-sm text-muted-foreground">
              Nenhum serviço aberto. Usa o formulário acima quando uma mota entrar na oficina.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {open.map((r) => {
              const raw = r.motorcycles;
              const m = Array.isArray(raw) ? raw[0] ?? null : raw;
              const pct = Math.min(100, Math.max(0, r.progress_percent));
              return (
                <div key={r.id} className={cn(adminSurface, "flex flex-col p-5 sm:p-6")}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-heading text-base font-semibold">
                        {m ? `${m.brand} ${m.model}` : "Mota"}
                        {m?.plate ? (
                          <span className="ml-2 font-normal text-muted-foreground">
                            {m.plate}
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {r.title ?? "Intervenção"} · aberto {r.opened_at?.slice(0, 10)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="border-border font-normal">
                        {recordKindLabel[r.record_kind] ?? r.record_kind}
                      </Badge>
                      <Badge variant="secondary" className="font-normal">
                        {statusLabel[r.status] ?? r.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex w-full min-w-0 items-baseline justify-between gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        Progresso do serviço
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-primary">
                        {pct}%
                      </span>
                    </div>
                    <Progress value={pct}>
                      <span className="sr-only">{pct}% concluído</span>
                    </Progress>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href={`/admin/boletins/${r.id}`}
                      className={buttonVariants({ className: "font-heading" })}
                    >
                      Controlar trabalho e tarefas
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
              <TableRow className="border-border/80 hover:bg-transparent">
                <TableHead>Mota</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Aberto</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground">
                    Sem boletins. Cria um acima para começar.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((r) => {
                  const raw = r.motorcycles;
                  const m = Array.isArray(raw) ? raw[0] ?? null : raw;
                  return (
                    <TableRow key={r.id} className="border-border/60">
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
                        <Badge variant="outline" className="border-border font-normal">
                          {recordKindLabel[r.record_kind] ?? r.record_kind}
                        </Badge>
                      </TableCell>
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
                            className: "border-border",
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
