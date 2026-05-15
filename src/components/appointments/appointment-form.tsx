"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { CheckCircle2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  submitAppointmentRequest,
  type AppointmentState,
} from "@/app/agendamento/actions";

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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="font-heading" disabled={pending}>
      {pending ? "A enviar…" : "Enviar pedido"}
    </Button>
  );
}

export function AppointmentForm() {
  const [state, formAction] = useActionState<AppointmentState | undefined, FormData>(
    submitAppointmentRequest,
    undefined,
  );
  const formRef = useRef<HTMLFormElement | null>(null);
  const minDateTime = useMemo(localDateTimeNow, []);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setDismissed(false);
    }
  }, [state]);

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
      <div className="space-y-2">
        <Label htmlFor="when">Preferência de data / hora</Label>
        <Input
          id="when"
          name="preferred"
          type="datetime-local"
          min={minDateTime}
          className="border-input bg-background text-foreground"
        />
        <p className="text-xs text-muted-foreground">
          Indica uma janela preferida. Confirmamos depois por contacto.
        </p>
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
      <SubmitButton />
    </form>
  );
}
