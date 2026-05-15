"use client";

import { useActionState, useState } from "react";
import { CalendarClock, Check, MessageSquare, RotateCcw, X } from "lucide-react";
import {
  completeAppointment,
  confirmAppointment,
  rejectAppointment,
  revertToPending,
  type AgendamentoActionState,
} from "@/app/admin/agendamentos/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AppointmentRequest, AppointmentStatus } from "@/types/database";

type ClientLite = {
  id: string;
  full_name: string | null;
  phone: string | null;
};

type MotaLite = {
  id: string;
  brand: string;
  model: string;
  plate: string | null;
};

type Props = {
  request: AppointmentRequest;
  client: ClientLite | null;
  motorcycle: MotaLite | null;
};

const statusVisual: Record<
  AppointmentStatus,
  { label: string; chip: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pendente",
    chip: "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200",
    icon: <CalendarClock className="size-3.5" aria-hidden />,
  },
  confirmed: {
    label: "Confirmado",
    chip: "border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200",
    icon: <Check className="size-3.5" aria-hidden />,
  },
  rejected: {
    label: "Rejeitado",
    chip: "border-destructive/40 bg-destructive/10 text-destructive",
    icon: <X className="size-3.5" aria-hidden />,
  },
  completed: {
    label: "Concluído",
    chip: "border-border bg-muted text-muted-foreground",
    icon: <Check className="size-3.5" aria-hidden />,
  },
};

function formatPt(when: string | null): string {
  if (!when) return "—";
  return new Date(when).toLocaleString("pt-PT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toLocalInput(iso: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function AgendamentoCard({ request, client, motorcycle }: Props) {
  const [open, setOpen] = useState<"confirm" | "reject" | null>(null);

  const [confirmState, confirmAction, confirmPending] = useActionState<
    AgendamentoActionState | undefined,
    FormData
  >(confirmAppointment, undefined);
  const [rejectState, rejectAction, rejectPending] = useActionState<
    AgendamentoActionState | undefined,
    FormData
  >(rejectAppointment, undefined);
  const [completeState, completeAction, completePending] = useActionState<
    AgendamentoActionState | undefined,
    FormData
  >(completeAppointment, undefined);
  const [revertState, revertAction, revertPending] = useActionState<
    AgendamentoActionState | undefined,
    FormData
  >(revertToPending, undefined);

  const visual = statusVisual[request.status];

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-heading text-sm font-bold uppercase tracking-tight text-foreground">
            {client?.full_name ?? "Cliente sem nome"}
          </p>
          {client?.phone ? (
            <p className="text-xs text-muted-foreground">{client.phone}</p>
          ) : null}
          {motorcycle ? (
            <p className="text-xs text-muted-foreground">
              {motorcycle.brand} {motorcycle.model}
              {motorcycle.plate ? ` · ${motorcycle.plate}` : ""}
            </p>
          ) : null}
        </div>
        <Badge
          variant="outline"
          className={cn(
            "flex items-center gap-1 font-heading text-[10px] font-semibold uppercase tracking-widest",
            visual.chip,
          )}
        >
          {visual.icon}
          {visual.label}
        </Badge>
      </header>

      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-heading text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Preferida pelo cliente
          </dt>
          <dd className="mt-0.5 font-medium text-foreground">
            {formatPt(request.preferred_start)}
          </dd>
        </div>
        {request.confirmed_start ? (
          <div>
            <dt className="font-heading text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Aceite pela oficina
            </dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {formatPt(request.confirmed_start)}
            </dd>
          </div>
        ) : null}
        <div className="sm:col-span-2">
          <dt className="font-heading text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Pedido em
          </dt>
          <dd className="mt-0.5 text-xs text-muted-foreground">
            {formatPt(request.created_at)}
          </dd>
        </div>
      </dl>

      {request.message ? (
        <p className="flex items-start gap-2 rounded-lg border border-border/80 bg-muted/40 px-3 py-2.5 text-sm leading-relaxed text-foreground">
          <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="whitespace-pre-wrap">{request.message}</span>
        </p>
      ) : null}

      {request.admin_note ? (
        <p className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-foreground">
          <span className="font-heading text-[9px] font-semibold uppercase tracking-widest text-primary">
            Nota da oficina
          </span>
          <br />
          <span className="whitespace-pre-wrap">{request.admin_note}</span>
        </p>
      ) : null}

      {/* Forms de acção */}
      {open === "confirm" ? (
        <form action={confirmAction} className="space-y-3 rounded-lg bg-muted/40 p-3">
          <input type="hidden" name="id" value={request.id} />
          <div className="space-y-1.5">
            <Label htmlFor={`confirmed_start_${request.id}`} className="text-xs">
              Data confirmada
            </Label>
            <Input
              id={`confirmed_start_${request.id}`}
              type="datetime-local"
              name="confirmed_start"
              defaultValue={toLocalInput(request.preferred_start)}
              required
              className="h-9 border-input bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`note_confirm_${request.id}`} className="text-xs">
              Nota para o cliente (opcional)
            </Label>
            <Textarea
              id={`note_confirm_${request.id}`}
              name="admin_note"
              rows={2}
              maxLength={500}
              placeholder="Ex.: Traz a chave de reserva."
              className="border-input bg-background"
            />
          </div>
          {confirmState?.error ? (
            <p className="text-xs text-destructive" role="alert">
              {confirmState.error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" disabled={confirmPending}>
              {confirmPending ? "A guardar…" : "Confirmar agendamento"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(null)}
              disabled={confirmPending}
            >
              Cancelar
            </Button>
          </div>
        </form>
      ) : open === "reject" ? (
        <form action={rejectAction} className="space-y-3 rounded-lg bg-muted/40 p-3">
          <input type="hidden" name="id" value={request.id} />
          <div className="space-y-1.5">
            <Label htmlFor={`note_reject_${request.id}`} className="text-xs">
              Motivo (visível ao cliente)
            </Label>
            <Textarea
              id={`note_reject_${request.id}`}
              name="admin_note"
              rows={2}
              maxLength={500}
              placeholder="Ex.: Já temos data marcada para essa semana."
              className="border-input bg-background"
            />
          </div>
          {rejectState?.error ? (
            <p className="text-xs text-destructive" role="alert">
              {rejectState.error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" variant="destructive" disabled={rejectPending}>
              {rejectPending ? "A guardar…" : "Confirmar rejeição"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(null)}
              disabled={rejectPending}
            >
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <footer className="flex flex-wrap items-center gap-2">
          {request.status === "pending" ? (
            <>
              <Button size="sm" onClick={() => setOpen("confirm")}>
                <Check className="size-4" /> Confirmar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-border"
                onClick={() => setOpen("reject")}
              >
                <X className="size-4" /> Rejeitar
              </Button>
            </>
          ) : null}
          {request.status === "confirmed" ? (
            <>
              <form action={completeAction}>
                <input type="hidden" name="id" value={request.id} />
                <Button size="sm" type="submit" disabled={completePending}>
                  <Check className="size-4" />
                  {completePending ? "…" : "Marcar como concluído"}
                </Button>
              </form>
              <form action={revertAction}>
                <input type="hidden" name="id" value={request.id} />
                <Button
                  size="sm"
                  type="submit"
                  variant="ghost"
                  disabled={revertPending}
                  title="Voltar a pendente"
                >
                  <RotateCcw className="size-4" />
                  Reverter
                </Button>
              </form>
            </>
          ) : null}
          {(request.status === "rejected" || request.status === "completed") ? (
            <form action={revertAction}>
              <input type="hidden" name="id" value={request.id} />
              <Button
                size="sm"
                type="submit"
                variant="ghost"
                disabled={revertPending}
              >
                <RotateCcw className="size-4" />
                Voltar a pendente
              </Button>
            </form>
          ) : null}
          {completeState?.error ? (
            <p className="text-xs text-destructive">{completeState.error}</p>
          ) : null}
          {revertState?.error ? (
            <p className="text-xs text-destructive">{revertState.error}</p>
          ) : null}
        </footer>
      )}
    </article>
  );
}
