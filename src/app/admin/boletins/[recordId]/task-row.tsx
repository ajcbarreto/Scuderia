"use client";

import type { KeyboardEvent } from "react";
import { useOptimistic, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { setServiceTaskCompleted, deleteServiceTask } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import type { ServiceTask } from "@/types/database";
import { cn } from "@/lib/utils";

type Props = {
  recordId: string;
  task: ServiceTask;
  /** Quando ativo, a linha torna-se selecionável (remoção em massa). */
  selectMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
};

export function TaskRow({
  recordId,
  task,
  selectMode = false,
  selected = false,
  onToggleSelect,
}: Props) {
  const [pending, startTransition] = useTransition();

  // Optimistic UI: o checkbox flipa logo, o servidor confirma depois e
  // a revalidação devolve o estado real (que normalmente coincide).
  // Se a action falhar, React reverte para `task.completed`.
  const [optimisticCompleted, setOptimistic] = useOptimistic(
    task.completed,
    (_state, next: boolean) => next,
  );

  // Modo de seleção: linha clicável, sem toggle de conclusão nem botão
  // individual de remover — a remoção é feita em massa pela barra de ação.
  if (selectMode) {
    const handle = () => onToggleSelect?.();
    return (
      <li
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        onClick={handle}
        onKeyDown={(e: KeyboardEvent<HTMLLIElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handle();
          }
        }}
        className={cn(
          "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary/60",
          selected
            ? "border-destructive/40 bg-destructive/5"
            : "border-border/80 bg-card hover:bg-muted/50",
        )}
      >
        <Checkbox checked={selected} className="pointer-events-none" />
        <span
          className={cn(
            "flex-1 text-sm",
            task.completed && "text-muted-foreground line-through",
          )}
        >
          {task.label}
        </span>
      </li>
    );
  }

  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-lg border border-border/80 bg-card px-3 py-2 transition-opacity",
        pending && "opacity-80",
      )}
    >
      <Checkbox
        checked={optimisticCompleted}
        disabled={pending}
        className="mt-1"
        onCheckedChange={(v) => {
          const next = v === true;
          startTransition(async () => {
            setOptimistic(next);
            const res = await setServiceTaskCompleted(task.id, recordId, next);
            if (res?.error) toast.error(res.error);
          });
        }}
      />
      <span
        className={cn(
          "flex-1 text-sm transition-colors",
          optimisticCompleted ? "text-muted-foreground line-through" : "",
        )}
      >
        {task.label}
      </span>
      <ConfirmDialog
        title="Remover tarefa?"
        description={`«${task.label}» será removida deste boletim. O progresso é recalculado.`}
        confirmLabel="Remover"
        tone="destructive"
        onConfirm={async () => {
          const res = await deleteServiceTask(task.id, recordId);
          if (res?.error) {
            toast.error(res.error);
          } else {
            toast.success("Tarefa removida.");
          }
        }}
        trigger={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            disabled={pending}
            aria-label="Remover tarefa"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        }
      />
    </li>
  );
}
