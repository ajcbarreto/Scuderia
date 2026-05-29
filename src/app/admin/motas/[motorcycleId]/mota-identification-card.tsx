"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X } from "lucide-react";
import { deleteMotorcycle, updateMotorcycle, type ActionState } from "@/app/admin/actions";
import { adminSurface } from "@/components/admin/admin-styles";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { Motorcycle } from "@/types/database";

type Props = {
  mota: Motorcycle;
};

export function MotaIdentificationCard({ mota }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const boundUpdate = updateMotorcycle.bind(null, mota.id);
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(
    boundUpdate,
    undefined,
  );

  useEffect(() => {
    if (state?.ok) {
      toast.success("Mota atualizada.");
      setEditing(false);
    } else if (state?.error) {
      toast.error(state.error, 6000);
    }
  }, [state]);

  async function handleDelete() {
    const res = await deleteMotorcycle(mota.id);
    if (res?.error) {
      toast.error(res.error, 6000);
      return;
    }
    toast.success("Mota apagada.");
    router.push("/admin/motas");
    router.refresh();
  }

  return (
    <Card className={cn(adminSurface, "border-0 lg:col-span-2")}>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="font-heading text-base">Identificação</CardTitle>
        <div className="flex items-center gap-2">
          {editing ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditing(false)}
            >
              <X className="size-4" aria-hidden />
              Cancelar
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-border"
                onClick={() => setEditing(true)}
              >
                <Pencil className="size-4" aria-hidden />
                Editar
              </Button>
              <ConfirmDialog
                title="Apagar esta mota?"
                description="Remove a mota e todo o histórico associado (boletins, tarefas, anexos e períodos de posse). Esta acção não pode ser anulada."
                confirmLabel="Apagar"
                tone="destructive"
                onConfirm={handleDelete}
                trigger={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden />
                    Apagar
                  </Button>
                }
              />
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <form action={action} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="m-brand">Marca</Label>
              <Input
                id="m-brand"
                name="brand"
                required
                defaultValue={mota.brand}
                className="border-input bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-model">Modelo</Label>
              <Input
                id="m-model"
                name="model"
                required
                defaultValue={mota.model}
                className="border-input bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-year">Ano</Label>
              <Input
                id="m-year"
                name="year"
                type="number"
                min={1900}
                max={2100}
                defaultValue={mota.year ?? ""}
                className="border-input bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-plate">Matrícula</Label>
              <Input
                id="m-plate"
                name="plate"
                defaultValue={mota.plate ?? ""}
                className="border-input bg-background"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="m-vin">Quadro (VIN)</Label>
              <Input
                id="m-vin"
                name="vin"
                defaultValue={mota.vin ?? ""}
                className="border-input bg-background font-mono"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="m-notes">Notas internas</Label>
              <Textarea
                id="m-notes"
                name="notes"
                rows={3}
                defaultValue={mota.notes ?? ""}
                className="border-input bg-background"
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={pending} className="font-heading">
                {pending ? "A guardar…" : "Guardar alterações"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Marca / modelo</p>
              <p className="font-medium">
                {mota.brand} {mota.model}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Matrícula</p>
              <p className="font-medium">{mota.plate ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Ano</p>
              <p className="font-medium">{mota.year ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Quadro (VIN)</p>
              <p className="font-mono text-xs font-medium">{mota.vin ?? "—"}</p>
            </div>
            {mota.notes ? (
              <div className="sm:col-span-2">
                <p className="text-muted-foreground">Notas internas</p>
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{mota.notes}</p>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
