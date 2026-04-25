"use client";

import { deleteChecklistPreset } from "@/app/admin/checklists/actions";
import { Button } from "@/components/ui/button";

export function DeletePresetButton({ presetId }: { presetId: string }) {
  return (
    <form
      action={deleteChecklistPreset}
      onSubmit={(e) => {
        if (
          !confirm(
            "Apagar este preset e todas as linhas de serviço? Boletins antigos mantêm as tarefas já criadas.",
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="preset_id" value={presetId} />
      <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive">
        Apagar
      </Button>
    </form>
  );
}
