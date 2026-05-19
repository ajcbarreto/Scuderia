"use client";

import { useState } from "react";
import { CheckSquare, Trash2, X } from "lucide-react";
import { deleteServiceTasks } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import type { ServiceTask } from "@/types/database";
import { TaskRow } from "./task-row";

type Props = {
  recordId: string;
  tasks: ServiceTask[];
};

export function TaskChecklist({ recordId, tasks }: Props) {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  const allSelected = tasks.length > 0 && selectedIds.size === tasks.length;
  const selectedCount = selectedIds.size;

  async function handleBulkDelete() {
    const ids = [...selectedIds];
    const res = await deleteServiceTasks(ids, recordId);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(
        ids.length === 1
          ? "Tarefa removida."
          : `${ids.length} tarefas removidas.`,
      );
      exitSelectMode();
    }
  }

  return (
    <div>
      {/* Cabeçalho do checklist + alternar modo de seleção */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Checklist
        </h3>
        {tasks.length > 0 ? (
          selectMode ? (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setSelectedIds(
                    allSelected
                      ? new Set()
                      : new Set(tasks.map((t) => t.id)),
                  )
                }
                className="h-8 text-xs"
              >
                {allSelected ? "Desmarcar todas" : "Selecionar todas"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={exitSelectMode}
                className="h-8 gap-1 text-xs"
              >
                <X className="size-3.5" aria-hidden />
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectMode(true)}
              className="h-8 gap-1.5 border-border text-xs"
            >
              <CheckSquare className="size-3.5" aria-hidden />
              Selecionar
            </Button>
          )
        ) : null}
      </div>

      {/* Lista de tarefas */}
      <ul className="max-h-[min(65vh,560px)] space-y-2 overflow-y-auto overscroll-contain rounded-lg border border-border/70 bg-muted/20 p-2 pr-1 [scrollbar-gutter:stable] sm:p-3">
        {tasks.length === 0 ? (
          <li className="px-2 py-6 text-center text-sm text-muted-foreground">
            Sem tarefas.
          </li>
        ) : (
          tasks.map((t) => (
            <TaskRow
              key={t.id}
              recordId={recordId}
              task={t}
              selectMode={selectMode}
              selected={selectedIds.has(t.id)}
              onToggleSelect={() => toggleSelect(t.id)}
            />
          ))
        )}
      </ul>

      {/* Barra de ação em massa */}
      {selectMode && selectedCount > 0 ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
          <span className="text-sm font-medium text-foreground">
            {selectedCount}{" "}
            {selectedCount === 1
              ? "tarefa selecionada"
              : "tarefas selecionadas"}
          </span>
          <ConfirmDialog
            title={`Remover ${selectedCount} ${selectedCount === 1 ? "tarefa" : "tarefas"}?`}
            description="As tarefas selecionadas serão removidas deste boletim. O progresso é recalculado. Esta acção não pode ser anulada."
            confirmLabel="Remover"
            tone="destructive"
            onConfirm={handleBulkDelete}
            trigger={
              <Button type="button" variant="destructive" size="sm" className="gap-1.5">
                <Trash2 className="size-4" aria-hidden />
                Remover selecionadas
              </Button>
            }
          />
        </div>
      ) : null}
    </div>
  );
}
