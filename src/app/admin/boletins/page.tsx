import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createServiceRecordFromMotaForm } from "@/app/admin/actions";
import { MotaSearchCombobox } from "./mota-search-combobox";
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

type StatusFilter = "all" | "open" | ServiceRecordStatus;
type KindFilter = "all" | ServiceRecordKind;

type PageProps = {
  searchParams: Promise<{
    mota?: string;
    status?: string;
    kind?: string;
  }>;
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

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "open", label: "Abertos" },
  { value: "draft", label: "Rascunho" },
  { value: "in_progress", label: "Em curso" },
  { value: "completed", label: "Concluídos" },
  { value: "cancelled", label: "Cancelados" },
];

const KIND_OPTIONS: { value: KindFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "maintenance", label: "Manutenção" },
  { value: "shop_service", label: "Só oficina" },
];

function parseStatus(raw: string | undefined): StatusFilter {
  const allowed = STATUS_OPTIONS.map((o) => o.value);
  return (allowed as string[]).includes(raw ?? "") ? (raw as StatusFilter) : "all";
}

function parseKind(raw: string | undefined): KindFilter {
  const allowed = KIND_OPTIONS.map((o) => o.value);
  return (allowed as string[]).includes(raw ?? "") ? (raw as KindFilter) : "all";
}

function filterHref(
  base: { status: StatusFilter; kind: KindFilter; mota?: string },
  patch: Partial<{ status: StatusFilter; kind: KindFilter }>,
): string {
  const next = { ...base, ...patch };
  const params = new URLSearchParams();
  if (next.status !== "all") params.set("status", next.status);
  if (next.kind !== "all") params.set("kind", next.kind);
  if (next.mota) params.set("mota", next.mota);
  const qs = params.toString();
  return qs ? `/admin/boletins?${qs}` : "/admin/boletins";
}

export default async function AdminBoletinsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const preselectMotaId = sp.mota;
  const status = parseStatus(sp.status);
  const kind = parseKind(sp.kind);
  const supabase = await createClient();

  // Lista filtrada (server-side). `open` = draft∪in_progress; é tratado
  // como filtro composto separado dos estados individuais.
  let recordsQuery = supabase
    .from("service_records")
    .select(
      "id, title, status, record_kind, progress_percent, opened_at, motorcycle_id, motorcycles ( brand, model, plate )",
    )
    .order("opened_at", { ascending: false });

  if (status === "open") {
    recordsQuery = recordsQuery.in("status", ["draft", "in_progress"]);
  } else if (status !== "all") {
    recordsQuery = recordsQuery.eq("status", status);
  }
  if (kind !== "all") recordsQuery = recordsQuery.eq("record_kind", kind);

  const [{ data: openRecords }, { data: records }, { data: motas }] =
    await Promise.all([
      // O bloco "Serviços em curso" mantém-se sempre — não é influenciado
      // pelos filtros da lista grande.
      supabase
        .from("service_records")
        .select(
          "id, title, status, record_kind, progress_percent, opened_at, motorcycle_id, motorcycles ( brand, model, plate )",
        )
        .in("status", ["draft", "in_progress"])
        .order("opened_at", { ascending: false }),
      recordsQuery,
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
  const filterBase = { status, kind, mota: preselectMotaId };
  const hasFilters = status !== "all" || kind !== "all";

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Boletins de intervenção"
        description="Indica se o registo é manutenção (histórico visível na garagem do dono atual) ou serviço de oficina (só visível na admin). Ao criar um boletim, a lista de tarefas em «Tarefas padrão» é copiada para esse serviço; na garagem o cliente só vê as tarefas já concluídas."
      />

      <section className={cn(adminSurface, "p-6 sm:p-8")}>
        <h2 className="font-heading text-lg font-semibold">Iniciar serviço na mota</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Cria um boletim para esta entrada. As tarefas da lista global são copiadas automaticamente;
          no editor marcas vistos e podes acrescentar linhas extra.
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
            <MotaSearchCombobox
              motas={motaList}
              defaultId={preselectMotaId ?? null}
              inputId="servico_motorcycle_id"
              required
            />
          </div>
          <label
            htmlFor="new_record_kind_shop"
            className="flex min-w-[min(100%,260px)] items-start gap-3 self-end rounded-lg border border-border/80 bg-muted/30 p-3 text-sm text-foreground"
          >
            <input
              id="new_record_kind_shop"
              name="record_kind_shop"
              type="checkbox"
              className="mt-0.5 size-4 shrink-0 rounded border-input accent-primary"
            />
            <span className="leading-tight">
              <span className="font-medium">Não mostrar ao próximo dono</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Serviço só visível à oficina.
              </span>
            </span>
          </label>
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
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="font-heading text-lg font-semibold">Todos os boletins</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ordenados do mais recente para o mais antigo.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div
              role="tablist"
              aria-label="Filtrar por estado"
              className="flex flex-wrap gap-1.5"
            >
              {STATUS_OPTIONS.map((opt) => {
                const active = status === opt.value;
                return (
                  <Link
                    key={opt.value}
                    href={filterHref(filterBase, { status: opt.value })}
                    role="tab"
                    aria-selected={active}
                    className={cn(
                      "rounded-full border px-3 py-1.5 font-heading text-[10px] font-semibold uppercase tracking-widest transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    {opt.label}
                  </Link>
                );
              })}
            </div>
            <span className="hidden h-5 w-px bg-border sm:inline-block" aria-hidden />
            <div
              role="tablist"
              aria-label="Filtrar por tipo"
              className="flex flex-wrap gap-1.5"
            >
              {KIND_OPTIONS.map((opt) => {
                const active = kind === opt.value;
                return (
                  <Link
                    key={opt.value}
                    href={filterHref(filterBase, { kind: opt.value })}
                    role="tab"
                    aria-selected={active}
                    className={cn(
                      "rounded-full border px-3 py-1.5 font-heading text-[10px] font-semibold uppercase tracking-widest transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    {opt.label}
                  </Link>
                );
              })}
            </div>
            {hasFilters ? (
              <Link
                href={filterHref(
                  { status: "all", kind: "all", mota: preselectMotaId },
                  {},
                )}
                className="font-heading text-[10px] font-medium uppercase tracking-widest text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Limpar
              </Link>
            ) : null}
          </div>
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
                    {hasFilters
                      ? "Nenhum boletim coincide com os filtros selecionados."
                      : "Sem boletins. Cria um acima para começar."}
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
