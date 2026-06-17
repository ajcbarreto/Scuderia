import {
  Activity,
  BarChart3,
  CalendarCheck,
  Download,
  Eye,
  FileText,
  LogIn,
  Mail,
  UserCheck,
  Users,
  UserX,
  Wrench,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { adminSurface, adminSurfaceLow } from "@/components/admin/admin-styles";
import { cn } from "@/lib/utils";

// Dentro de /admin (o layout garante sessão admin); o RLS de activity_events
// restringe a leitura a administradores.
export const dynamic = "force-dynamic";

type MonthPoint = { month: string; count: number };

type Overview = {
  visitors: {
    visits_30d: number;
    pageviews_30d: number;
    contacts_30d: number;
    visits_by_month: MonthPoint[];
    top_refs_30d: { ref: string; count: number }[];
  };
  clients: {
    logins_30d: number;
    active_clients_30d: number;
    total_clients: number;
    clients_never_logged_in: number;
    boletins_viewed_30d: number;
    pdf_downloads_30d: number;
    appointments_requested_30d: number;
    logins_by_month: MonthPoint[];
  };
  workshop: {
    events_30d: number;
    boletins_opened_30d: number;
    boletins_completed_30d: number;
  };
  total_events: number;
};

function monthLabel(ym: string) {
  const d = new Date(`${ym}-01T00:00:00Z`);
  return d.toLocaleDateString("pt-PT", { month: "short", timeZone: "UTC" });
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Activity;
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className={cn(adminSurface, "p-5")}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4 text-primary" aria-hidden />
        <span className="font-heading text-[10px] font-semibold uppercase tracking-widest">
          {label}
        </span>
      </div>
      <p className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground">
        {value.toLocaleString("pt-PT")}
      </p>
      {hint ? (
        <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function MonthBars({ data }: { data: MonthPoint[] }) {
  if (!data || data.length === 0) {
    return <p className="mt-6 text-sm text-muted-foreground">Sem dados ainda.</p>;
  }
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="mt-6 flex h-40 items-end gap-1.5">
      {data.map((d) => (
        <div
          key={d.month}
          className="flex flex-1 flex-col items-center gap-1.5"
          title={`${d.month}: ${d.count}`}
        >
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t bg-primary/80"
              style={{
                height: `${Math.round((d.count / max) * 100)}%`,
                minHeight: d.count > 0 ? 4 : 0,
              }}
            />
          </div>
          <span className="font-heading text-[9px] uppercase tracking-wide text-muted-foreground">
            {monthLabel(d.month)}
          </span>
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ title, badge }: { title: string; badge: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
        {title}
      </h2>
      <span className="rounded bg-muted px-2 py-0.5 font-heading text-[10px] font-semibold uppercase tracking-widest text-primary">
        {badge}
      </span>
    </div>
  );
}

export default async function EstatisticasPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("activity_overview");
  const ov = (data as Overview | null) ?? null;

  if (error || !ov) {
    return (
      <div className={cn(adminSurface, "p-6")}>
        <h1 className="font-heading text-xl font-bold tracking-tight text-foreground">
          Estatísticas
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Não foi possível carregar os dados. Confirma que as migrations{" "}
          <code className="rounded bg-muted px-1">activity_events</code> e{" "}
          <code className="rounded bg-muted px-1">activity_overview</code> foram
          aplicadas no Supabase.
        </p>
        {error ? (
          <p className="mt-2 text-xs text-destructive">{error.message}</p>
        ) : null}
      </div>
    );
  }

  const { visitors, clients, workshop } = ov;

  return (
    <div className="space-y-10">
      <header>
        <p className="flex items-center gap-2 font-heading text-[10px] font-semibold uppercase tracking-[0.35em] text-primary">
          <BarChart3 className="size-4" aria-hidden />
          Uso da plataforma
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground">
          Estatísticas
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Foco em quem chega ao site e nos clientes — não na tua própria
          atividade. Os dados acumulam a partir do momento em que a recolha foi
          ativada.
        </p>
      </header>

      {ov.total_events === 0 ? (
        <div className={cn(adminSurfaceLow, "p-5 text-sm text-muted-foreground")}>
          Ainda não há eventos registados. Assim que houver visitas e
          interações, os números aparecem aqui.
        </div>
      ) : null}

      {/* ---- Visitantes (sem conta) -------------------------------------- */}
      <section className="space-y-4">
        <SectionTitle title="Visitantes" badge="Sem conta · potenciais clientes" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard icon={Users} label="Visitas (30 dias)" value={visitors.visits_30d} />
          <StatCard icon={Eye} label="Páginas vistas (30d)" value={visitors.pageviews_30d} />
          <StatCard
            icon={Mail}
            label="Contactos recebidos (30d)"
            value={visitors.contacts_30d}
            hint="Leads via formulário"
          />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className={cn(adminSurface, "p-6")}>
            <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-foreground">
              Visitas por mês
            </h3>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Sessões distintas · últimos 12 meses
            </p>
            <MonthBars data={visitors.visits_by_month} />
          </div>
          <div className={cn(adminSurface, "p-6")}>
            <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-foreground">
              Origem do tráfego
            </h3>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              De onde vêm · últimos 30 dias
            </p>
            {visitors.top_refs_30d.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">
                Sem origem registada (acesso direto, ou ainda sem dados).
              </p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {visitors.top_refs_30d.map((r) => (
                  <li
                    key={r.ref}
                    className="flex items-center justify-between border-b border-border/60 pb-2 text-sm last:border-0"
                  >
                    <span className="truncate text-foreground">{r.ref}</span>
                    <span className="font-heading font-bold text-foreground">
                      {r.count.toLocaleString("pt-PT")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* ---- Clientes (com conta) ---------------------------------------- */}
      <section className="space-y-4">
        <SectionTitle title="Clientes" badge="Com conta" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard icon={LogIn} label="Logins (30 dias)" value={clients.logins_30d} />
          <StatCard
            icon={Activity}
            label="Clientes ativos (30d)"
            value={clients.active_clients_30d}
          />
          <StatCard
            icon={UserX}
            label="Clientes sem login"
            value={clients.clients_never_logged_in}
            hint={`de ${clients.total_clients.toLocaleString("pt-PT")} clientes`}
          />
          <StatCard
            icon={FileText}
            label="Boletins vistos (30d)"
            value={clients.boletins_viewed_30d}
          />
          <StatCard
            icon={Download}
            label="PDFs descarregados (30d)"
            value={clients.pdf_downloads_30d}
          />
          <StatCard
            icon={CalendarCheck}
            label="Agendamentos pedidos (30d)"
            value={clients.appointments_requested_30d}
          />
        </div>
        <div className={cn(adminSurface, "p-6")}>
          <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-foreground">
            Logins por mês
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Últimos 12 meses</p>
          <MonthBars data={clients.logins_by_month} />
        </div>
      </section>

      {/* ---- Oficina (referência discreta) ------------------------------- */}
      <section className="space-y-3 border-t border-border/60 pt-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Wrench className="size-4" aria-hidden />
          <h2 className="font-heading text-[11px] font-semibold uppercase tracking-widest">
            A tua atividade na oficina · referência
          </h2>
        </div>
        <div className={cn(adminSurfaceLow, "flex flex-wrap gap-x-10 gap-y-3 p-5")}>
          <div>
            <p className="font-heading text-2xl font-bold text-foreground">
              {workshop.events_30d.toLocaleString("pt-PT")}
            </p>
            <p className="text-[11px] text-muted-foreground">Ações (30 dias)</p>
          </div>
          <div>
            <p className="font-heading text-2xl font-bold text-foreground">
              {workshop.boletins_opened_30d.toLocaleString("pt-PT")}
            </p>
            <p className="text-[11px] text-muted-foreground">Boletins abertos (30d)</p>
          </div>
          <div>
            <p className="font-heading text-2xl font-bold text-foreground">
              {workshop.boletins_completed_30d.toLocaleString("pt-PT")}
            </p>
            <p className="text-[11px] text-muted-foreground">Boletins concluídos (30d)</p>
          </div>
        </div>
      </section>
    </div>
  );
}
