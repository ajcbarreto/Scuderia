"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { setServiceTaskCompleted, deleteServiceTask } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { ServiceTask } from "@/types/database";

type Props = {
  recordId: string;
  task: ServiceTask;
};

export function TaskRow({ recordId, task }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <li className="flex items-start gap-3 rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2">
      <Checkbox
        checked={task.completed}
        disabled={pending}
        className="mt-1"
        onCheckedChange={(v) => {
          const next = v === true;
          startTransition(() => {
            void setServiceTaskCompleted(task.id, recordId, next);
          });
        }}
      />
      <span
        className={`flex-1 text-sm ${task.completed ? "text-muted-foreground line-through" : ""}`}
      >
        {task.label}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
        disabled={pending}
        onClick={() => {
          if (!confirm("Remover esta tarefa?")) return;
          startTransition(() => {
            void deleteServiceTask(task.id, recordId);
          });
        }}
        aria-label="Remover tarefa"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </li>
  );
}
