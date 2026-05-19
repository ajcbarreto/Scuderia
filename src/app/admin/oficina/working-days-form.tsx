"use client";

import { useActionState, useEffect } from "react";
import { updateClosedWeekdays } from "./actions";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { WEEKDAY_LABELS } from "@/lib/garagem/workshop-schedule";
import type { ActionState } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

type Props = {
  closedWeekdays: number[];
};

const ORDERED_WEEKDAYS = [1, 2, 3, 4, 5, 6, 0] as const;

export function WorkingDaysForm({ closedWeekdays }: Props) {
  const [state, formAction, pending] = useActionState<
    ActionState | undefined,
    FormData
  >(updateClosedWeekdays, undefined);

  useEffect(() => {
    if (state?.ok) toast.success("Dias atualizados.");
    else if (state?.error) toast.error(state.error, 6000);
  }, [state]);

  const closedSet = new Set(closedWeekdays);

  return (
    <form action={formAction} className="mt-4 space-y-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {ORDERED_WEEKDAYS.map((d) => {
          const isClosed = closedSet.has(d);
          return (
            <label
              key={d}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                isClosed
                  ? "border-destructive/40 bg-destructive/5 text-foreground"
                  : "border-border bg-card hover:bg-muted/40",
              )}
            >
              <input
                type="checkbox"
                name={`weekday_${d}`}
                defaultChecked={isClosed}
                className="size-4 accent-destructive"
              />
              <span className="flex-1 font-medium">{WEEKDAY_LABELS[d]}</span>
              {isClosed ? (
                <span className="text-xs font-semibold uppercase tracking-wide text-destructive">
                  Fechado
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Aberto</span>
              )}
            </label>
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="font-heading">
          {pending ? "A guardar…" : "Guardar dias"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Os clientes não vão conseguir agendar nos dias marcados.
        </p>
      </div>
    </form>
  );
}
