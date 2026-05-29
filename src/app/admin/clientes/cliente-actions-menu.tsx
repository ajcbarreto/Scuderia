"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { deleteClientProfile, updateClientProfile, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";

type Props = {
  client: {
    id: string;
    full_name: string | null;
    phone: string | null;
  };
  /** Quantas motas o cliente tem como dono actual — usado para avisar antes do delete. */
  motaCount: number;
};

export function ClienteActionsMenu({ client, motaCount }: Props) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const boundUpdate = updateClientProfile.bind(null, client.id);
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(
    boundUpdate,
    undefined,
  );

  useEffect(() => {
    if (state?.ok) {
      toast.success("Cliente atualizado.");
      setEditOpen(false);
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error, 6000);
    }
  }, [state, router]);

  async function handleDelete() {
    const res = await deleteClientProfile(client.id);
    if (res?.error) {
      toast.error(res.error, 8000);
      return;
    }
    toast.success("Cliente apagado.");
    router.push("/admin/clientes");
    router.refresh();
  }

  const deleteDescription =
    motaCount > 0
      ? `Cliente tem ${motaCount} mota(s) como dono atual. Transfere a propriedade primeiro — o histórico de boletins fica preservado nas motas.`
      : "Remove o perfil e a conta de autenticação. Esta acção não pode ser anulada. Se o cliente tiver histórico de propriedade de motas, a remoção falha para preservar a auditoria.";

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-border"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="size-4" aria-hidden />
          Editar
        </Button>
        <ConfirmDialog
          title="Apagar este cliente?"
          description={deleteDescription}
          confirmLabel={motaCount > 0 ? "Tentar mesmo assim" : "Apagar"}
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
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar cliente</DialogTitle>
            <DialogDescription>
              Atualiza nome ou telemóvel. O email continua a ser o de início de sessão.
            </DialogDescription>
          </DialogHeader>
          <form action={action} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`cli-name-${client.id}`}>Nome</Label>
              <Input
                id={`cli-name-${client.id}`}
                name="full_name"
                required
                defaultValue={client.full_name ?? ""}
                disabled={pending}
                className="border-input bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`cli-phone-${client.id}`}>Telemóvel</Label>
              <Input
                id={`cli-phone-${client.id}`}
                name="phone"
                type="tel"
                defaultValue={client.phone ?? ""}
                disabled={pending}
                className="border-input bg-background"
              />
            </div>
            <DialogFooter>
              <DialogClose
                render={<Button variant="outline" type="button" disabled={pending} />}
              >
                Cancelar
              </DialogClose>
              <Button type="submit" disabled={pending} className="font-heading">
                {pending ? "A guardar…" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
