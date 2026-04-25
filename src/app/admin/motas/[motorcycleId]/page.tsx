import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { adminSurface } from "@/components/admin/admin-styles";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type {
  Motorcycle,
  Profile,
  ServiceRecord,
  ServiceRecordKind,
  ServiceRecordStatus,
} from "@/types/database";

type Props = { params: Promise<{ motorcycleId: string }> };

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

function isOpen(s: ServiceRecordStatus) {
  return s === "draft" || s === "in_progress";
}

export default async function AdminMotaDetailPage({ params }: Props) {
  const { motorcycleId } = await params;
  const supabase = await createClient();

  const { data: mota } = await supabase
    .from("motorcycles")
    .select("*")
    .eq("id", motorcycleId)
    .maybeSingle();

  if (!mota) notFound();
  const m = mota as Motorcycle;

  const { data: owner } = await supabase
    .from("profiles")
    .select("id, full_name, phone")
    .eq("id", m.current_owner_id)
    .maybeSingle();

  const o = owner as Pick<Profile, "id" | "full_name" | "phone"> | null;

  const { data: records } = await supabase
    .from("service_records")
    .select("*")
    .eq("motorcycle_id", motorcycleId)
    .order("opened_at", { ascending: false });

  const all = (records ?? []) as ServiceRecord[];
  const abertas = all.filter((r) => isOpen(r.status));
  const historico = all.filter((r) => !isOpen(r.status));

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow={
          <>
            <Link href="/admin/motas" className="text-primary hover:underline">
              Motas
            </Link>
            <span className="text-muted-foreground"> · </span>
            <span>
              {m.brand} {m.model}
            </span>
          </>
        }
        title={`${m.brand} ${m.model}`}
        description={
          m.plate
            ? `Matrícula ${m.plate}${m.year ? ` · ${m.year}` : ""} — revisões e manutenções registadas em boletins.`
            : `Sem matrícula${m.year ? ` · ${m.year}` : ""} — revisões e manutenções registadas em boletins.`
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/servico?mota=${m.id}`}
              className={buttonVariants({ className: "font-heading" })}
            >
              Nova intervenção (Oficina)
            </Link>
            <Link
              href={`/admin/boletins?mota=${m.id}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "border-border",
              )}
            >
              Lista de boletins
            </Link>
            {o ? (
              <Link
                href="/admin/clientes"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-muted-foreground",
                )}
              >
                Ver cliente
              </Link>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className={cn(adminSurface, "border-0 lg:col-span-2")}>
          <CardHeader>
            <CardTitle className="font-heading text-base">Identificação</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Marca / modelo</p>
              <p className="font-medium">
                {m.brand} {m.model}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Matrícula</p>
              <p className="font-medium">{m.plate ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Ano</p>
              <p className="font-medium">{m.year ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Quadro (VIN)</p>
              <p className="font-mono text-xs font-medium">{m.vin ?? "—"}</p>
            </div>
            {m.notes ? (
              <div className="sm:col-span-2">
                <p className="text-muted-foreground">Notas internas</p>
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{m.notes}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className={cn(adminSurface, "border-0")}>
          <CardHeader>
            <CardTitle className="font-heading text-base">Dono atual</CardTitle>
            <CardDescription>Cliente na garagem</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{o?.full_name ?? "—"}</p>
            <p className="text-muted-foreground">{o?.phone ? `Tel. ${o.phone}` : "Sem telemóvel"}</p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">Intervenções abertas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Rascunho ou em curso — continua o trabalho no editor do boletim.
          </p>
        </div>
        {abertas.length === 0 ? (
          <p className={cn(adminSurface, "border-0 p-6 text-sm text-muted-foreground")}>
            Nenhuma intervenção aberta. Inicia uma na Oficina ou abre um boletim novo.
          </p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {abertas.map((r) => (
              <li key={r.id} className={cn(adminSurface, "border-0 p-5")}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-heading font-semibold">{r.title ?? "Intervenção"}</p>
                    <p className="text-xs text-muted-foreground">
                      Aberto em {r.opened_at?.slice(0, 10)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    <Badge variant="outline" className="border-border font-normal">
                      {recordKindLabel[r.record_kind]}
                    </Badge>
                    <Badge variant="secondary" className="font-normal">
                      {statusLabel[r.status]}
                    </Badge>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progresso</span>
                    <span className="tabular-nums text-primary">{r.progress_percent}%</span>
                  </div>
                  <Progress value={r.progress_percent}>
                    <span className="sr-only">{r.progress_percent}%</span>
                  </Progress>
                </div>
                <Link
                  href={`/admin/boletins/${r.id}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm", className: "mt-4 w-full border-border" }),
                  )}
                >
                  Abrir boletim
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">Histórico de revisões e manutenções</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Intervenções concluídas ou canceladas — arquivo da oficina para esta mota.
          </p>
        </div>
        {historico.length === 0 ? (
          <p className={cn(adminSurface, "border-0 p-6 text-sm text-muted-foreground")}>
            Ainda não há histórico fechado para esta mota.
          </p>
        ) : (
          <ul className="space-y-2">
            {historico.map((r) => (
              <li
                key={r.id}
                className={cn(
                  adminSurface,
                  "flex flex-col gap-3 border-0 p-4 sm:flex-row sm:items-center sm:justify-between",
                )}
              >
                <div>
                  <p className="font-medium">{r.title ?? "Intervenção"}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.opened_at?.slice(0, 10)}
                    {r.closed_at ? ` → ${r.closed_at.slice(0, 10)}` : null}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="border-border font-normal">
                    {recordKindLabel[r.record_kind]}
                  </Badge>
                  <Badge variant="outline" className="border-border font-normal">
                    {statusLabel[r.status]}
                  </Badge>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {r.progress_percent}%
                  </span>
                  <Link
                    href={`/admin/boletins/${r.id}`}
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                  >
                    Ver boletim
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
