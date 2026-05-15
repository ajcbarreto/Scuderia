import Link from "next/link";
import { CalendarCheck2, CalendarClock, MessageSquare } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AppointmentRequest } from "@/types/database";

type Props = {
  pending: AppointmentRequest[];
  confirmed: AppointmentRequest[];
};

function formatLong(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShort(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-PT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Aparece no topo da garagem quando o cliente tem pedidos de marcação por
 * confirmar ou confirmados pela oficina. Fecha o ciclo de comunicação que
 * antes parava no formulário sem feedback.
 */
export function AppointmentsBanner({ pending, confirmed }: Props) {
  if (pending.length === 0 && confirmed.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.25em] text-primary">
        Agendamentos
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {confirmed.map((appt) => (
          <li
            key={appt.id}
            className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                <CalendarCheck2 className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 space-y-1">
                <p className="font-heading text-[10px] font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
                  Confirmado pela oficina
                </p>
                <p className="font-heading text-lg font-bold leading-tight text-foreground">
                  {formatLong(appt.confirmed_start)}
                </p>
                {appt.admin_note ? (
                  <p className="mt-2 flex items-start gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-sm leading-relaxed text-muted-foreground">
                    <MessageSquare className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden />
                    <span className="whitespace-pre-wrap">{appt.admin_note}</span>
                  </p>
                ) : null}
              </div>
            </div>
          </li>
        ))}
        {pending.map((appt) => (
          <li
            key={appt.id}
            className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
                <CalendarClock className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 space-y-1">
                <p className="font-heading text-[10px] font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-300">
                  A aguardar resposta
                </p>
                <p className="font-medium text-foreground">
                  Pedido para{" "}
                  <span className="font-heading">{formatShort(appt.preferred_start)}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  A oficina entra em contacto para confirmar a data.
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex">
        <Link
          href="/agendamento"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "border-border font-heading text-[10px] uppercase tracking-widest",
          )}
        >
          Pedir novo agendamento
        </Link>
      </div>
    </section>
  );
}
