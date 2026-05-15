import Link from "next/link";
import { CalendarRange } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { adminSurface } from "@/components/admin/admin-styles";
import { cn } from "@/lib/utils";
import type {
  AppointmentRequest,
  AppointmentStatus,
  Motorcycle,
  Profile,
} from "@/types/database";
import { AgendamentoCard } from "./agendamento-card";

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

const STATUS_TABS: Array<{ value: AppointmentStatus | "all"; label: string }> = [
  { value: "pending", label: "Pendentes" },
  { value: "confirmed", label: "Confirmados" },
  { value: "completed", label: "Concluídos" },
  { value: "rejected", label: "Rejeitados" },
  { value: "all", label: "Todos" },
];

function parseStatus(raw: string | undefined): AppointmentStatus | "all" {
  const allowed = STATUS_TABS.map((t) => t.value);
  return (allowed as string[]).includes(raw ?? "")
    ? (raw as AppointmentStatus | "all")
    : "pending";
}

export default async function AdminAgendamentosPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const status = parseStatus(sp.status);
  const supabase = await createClient();

  // Para "pending" e "confirmed" mostramos os mais antigos primeiro (têm de
  // ser atacados); para "completed" e "rejected" e "all" mostramos os mais
  // recentes primeiro.
  const ascending = status === "pending" || status === "confirmed";

  let query = supabase
    .from("appointment_requests")
    .select("*")
    .order("created_at", { ascending });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data: requests, error } = await query;
  const list = (requests ?? []) as AppointmentRequest[];

  // Buscar clientes e motas referenciados em batch (em paralelo).
  const clientIds = [...new Set(list.map((r) => r.client_id))];
  const motaIds = [...new Set(list.map((r) => r.motorcycle_id).filter((id): id is string => !!id))];

  const [{ data: clientsData }, { data: motasData }, { count: pendingCount }] =
    await Promise.all([
      clientIds.length > 0
        ? supabase
            .from("profiles")
            .select("id, full_name, phone")
            .in("id", clientIds)
        : Promise.resolve({ data: [] as Pick<Profile, "id" | "full_name" | "phone">[] }),
      motaIds.length > 0
        ? supabase
            .from("motorcycles")
            .select("id, brand, model, plate")
            .in("id", motaIds)
        : Promise.resolve({
            data: [] as Pick<Motorcycle, "id" | "brand" | "model" | "plate">[],
          }),
      supabase
        .from("appointment_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

  const clientsById = new Map(
    (clientsData ?? []).map((c) => [c.id, c as Pick<Profile, "id" | "full_name" | "phone">]),
  );
  const motasById = new Map(
    (motasData ?? []).map((m) => [m.id, m as Pick<Motorcycle, "id" | "brand" | "model" | "plate">]),
  );

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Agendamentos"
        description="Pedidos de marcação enviados pelos clientes. Confirma a data com o cliente ou rejeita com uma nota."
      />

      <div
        role="tablist"
        aria-label="Filtrar agendamentos por estado"
        className="flex flex-wrap gap-1.5"
      >
        {STATUS_TABS.map((tab) => {
          const active = status === tab.value;
          const showBadge = tab.value === "pending" && (pendingCount ?? 0) > 0;
          return (
            <Link
              key={tab.value}
              href={
                tab.value === "pending"
                  ? "/admin/agendamentos"
                  : `/admin/agendamentos?status=${tab.value}`
              }
              role="tab"
              aria-selected={active}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 font-heading text-[10px] font-semibold uppercase tracking-widest transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {tab.label}
              {showBadge ? (
                <span
                  className={cn(
                    "inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] tabular-nums",
                    active
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-amber-500/15 text-amber-900 dark:text-amber-200",
                  )}
                >
                  {pendingCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>

      {error ? (
        <p className="text-sm text-destructive">
          Não foi possível carregar os agendamentos: {error.message}
        </p>
      ) : null}

      {list.length === 0 ? (
        <div className={cn(adminSurface, "flex flex-col items-center gap-3 p-10 text-center")}>
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CalendarRange className="size-6" aria-hidden />
          </span>
          <p className="text-sm text-muted-foreground">
            {status === "pending"
              ? "Sem pedidos pendentes. Os novos pedidos aparecem aqui."
              : "Nenhum agendamento neste estado."}
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {list.map((req) => (
            <li key={req.id}>
              <AgendamentoCard
                request={req}
                client={clientsById.get(req.client_id) ?? null}
                motorcycle={req.motorcycle_id ? motasById.get(req.motorcycle_id) ?? null : null}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
