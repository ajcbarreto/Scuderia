"use client";

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
};

export function TaskRow({ recordId, task }: Props) {
  const [pending, startTransition] = useTransition();

  // Optimistic UI: o checkbox flipa logo, o servidor confirma depois e
  // a revalidação devolve o estado real (que normalmente coincide).
  // Se a action falhar, React reverte para `task.completed`.
  const [optimisticCompleted, setOptimistic] = useOptimistic(
    task.completed,
    (_state, next: boolean) => next,
  );

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
