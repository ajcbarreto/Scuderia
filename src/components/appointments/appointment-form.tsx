"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { CalendarX, CheckCircle2, Info } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  submitAppointmentRequest,
  type AppointmentState,
} from "@/app/agendamento/actions";
import {
  getClosedReason,
  WEEKDAY_LABELS,
  type WorkshopSchedule,
} from "@/lib/garagem/workshop-schedule";
import { cn } from "@/lib/utils";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

/** `YYYY-MM-DDTHH:mm` para `<input type="datetime-local" min={...}>`. */
function localDateTimeNow() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function formatPtDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-PT", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${iso}T12:00:00`));
}

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="font-heading"
      disabled={pending || disabled}
    >
      {pending ? "A enviar…" : "Enviar pedido"}
    </Button>
  );
}

type Props = {
  schedule: WorkshopSchedule;
};

export function AppointmentForm({ schedule }: Props) {
  const [state, formAction] = useActionState<AppointmentState | undefined, FormData>(
    submitAppointmentRequest,
    undefined,
  );
  const formRef = useRef<HTMLFormElement | null>(null);
  const minDateTime = useMemo(localDateTimeNow, []);
  const [dismissed, setDismissed] = useState(false);
  const [pickedDateTime, setPickedDateTime] = useState("");

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setPickedDateTime("");
      setDismissed(false);
    }
  }, [state]);

  // Razão pela qual a data escolhida está fechada (null se está aberta).
  const closedReason = pickedDateTime
    ? getClosedReason(pickedDateTime, schedule)
    : null;

  // Próximas 5 datas específicas fechadas, em formato amigável.
  const upcomingClosedDates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    return schedule.closedDates
      .filter((d) => d.date >= todayIso)
      .slice(0, 5);
  }, [schedule.closedDates]);

  const closedWeekdayLabels = schedule.closedWeekdays
    .slice()
    .sort()
    .map((d) => WEEKDAY_LABELS[d]);

  if (state?.ok && !dismissed) {
    return (
      <div className="space-y-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-4 text-sm text-foreground">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div className="space-y-1.5">
            <p>Pedido registado.</p>
            <p className="text-muted-foreground">
              Vais ver o estado do pedido em destaque na garagem assim que a oficina o confirmar.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/garagem"
            className={buttonVariants({ size: "sm", className: "font-heading" })}
          >
            Ver estado na garagem
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
          >
            Fazer novo pedido
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      {/* Aviso sobre dias fechados */}
      {closedWeekdayLabels.length > 0 || upcomingClosedDates.length > 0 ? (
        <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
          <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <div className="space-y-1.5 text-muted-foreground">
            {closedWeekdayLabels.length > 0 ? (
              <p>
                <span className="font-medium text-foreground">Fechado:</span>{" "}
                {closedWeekdayLabels.join(", ")}
              </p>
            ) : null}
            {upcomingClosedDates.length > 0 ? (
              <p>
                <span className="font-medium text-foreground">Próximas datas fechadas:</span>{" "}
                {upcomingClosedDates
                  .map((d) =>
                    d.note?.trim()
                      ? `${formatPtDate(d.date)} (${d.note.trim()})`
                      : formatPtDate(d.date),
                  )
                  .join(", ")}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="when">Preferência de data / hora</Label>
        <Input
          id="when"
          name="preferred"
          type="datetime-local"
          min={minDateTime}
          value={pickedDateTime}
          onChange={(e) => setPickedDateTime(e.target.value)}
          aria-invalid={Boolean(closedReason)}
          className={cn(
            "border-input bg-background text-foreground",
            closedReason && "border-destructive focus-visible:border-destructive",
          )}
        />
        {closedReason ? (
          <p className="flex items-start gap-1.5 text-xs font-medium text-destructive">
            <CalendarX className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            {closedReason} Escolhe outra data.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Indica uma janela preferida. Confirmamos depois por contacto.
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="msg">Notas</Label>
        <Textarea
          id="msg"
          name="message"
          rows={4}
          maxLength={2000}
          placeholder="Ex.: revisão dos 20.000 km, ruído na travagem…"
          className="border-input bg-background text-foreground"
        />
      </div>
      {state?.error ? (
        <p
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      <SubmitButton disabled={Boolean(closedReason)} />
    </form>
  );
}
