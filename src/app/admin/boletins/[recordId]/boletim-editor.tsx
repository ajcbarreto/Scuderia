"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  addServiceTaskFromForm,
  deleteServiceAttachmentForm,
  updateServiceRecord,
  uploadServiceAttachment,
  type ActionState,
} from "@/app/admin/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Motorcycle, Profile, ServiceAttachment, ServiceRecord, ServiceTask } from "@/types/database";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { adminSurface } from "@/components/admin/admin-styles";
import { cn } from "@/lib/utils";
import { TaskRow } from "./task-row";

type Props = {
  record: ServiceRecord;
  mota: Pick<Motorcycle, "id" | "brand" | "model" | "plate">;
  tasks: ServiceTask[];
  attachments: ServiceAttachment[];
  clients: Pick<Profile, "id" | "full_name" | "phone">[];
};

export function BoletimEditor({
  record,
  mota,
  tasks,
  attachments,
  clients,
}: Props) {
  const recordId = record.id;

  const boundUpdate = updateServiceRecord.bind(null, recordId);
  const [metaState, metaAction, metaPending] = useActionState<
    ActionState | undefined,
    FormData
  >(boundUpdate, undefined);

  const [uploadState, uploadAction, uploadPending] = useActionState<
    ActionState | undefined,
    FormData
  >(uploadServiceAttachment.bind(null, recordId), undefined);

  const [taskState, taskAction, taskPending] = useActionState<
    ActionState | undefined,
    FormData
  >(addServiceTaskFromForm, undefined);

  useEffect(() => {
    if (uploadState?.ok) {
      const el = document.getElementById("upload-form") as HTMLFormElement | null;
      el?.reset();
    }
  }, [uploadState?.ok]);

  useEffect(() => {
    if (taskState?.ok) {
      const el = document.getElementById("add-task-form") as HTMLFormElement | null;
      el?.reset();
    }
  }, [taskState?.ok]);

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow={
          <>
            <Link href="/admin/boletins" className="text-primary hover:underline">
              Boletins
            </Link>
            <span className="text-muted-foreground"> · </span>
            <span>
              {mota.brand} {mota.model}
            </span>
          </>
        }
        title="Editor de boletim"
        description={`${mota.plate ? `Matrícula ${mota.plate} · ` : "Sem matrícula · "}Progresso ${record.progress_percent}%`}
        actions={
          <Link
            href="/admin/boletins"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1.5 border-white/15",
            )}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Voltar à lista
          </Link>
        }
      />

      <section className={cn(adminSurface, "p-6 sm:p-8")}>
        <h2 className="font-heading text-lg font-semibold">Dados do boletim</h2>
        <form action={metaAction} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              defaultValue={record.title ?? ""}
              className="border-white/15 bg-[#1a1a1a]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <select
              id="status"
              name="status"
              defaultValue={record.status}
              className="flex h-9 w-full rounded-md border border-white/15 bg-[#1a1a1a] px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="draft">Rascunho</option>
              <option value="in_progress">Em curso</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="shop_notes">Notas da oficina</Label>
            <Textarea
              id="shop_notes"
              name="shop_notes"
              rows={6}
              defaultValue={record.shop_notes ?? ""}
              className="border-white/15 bg-[#1a1a1a]"
            />
          </div>
          {metaState?.error ? (
            <p className="text-sm text-destructive">{metaState.error}</p>
          ) : null}
          {metaState?.ok ? (
            <p className="text-sm text-primary">Alterações guardadas.</p>
          ) : null}
          <Button type="submit" disabled={metaPending} className="font-heading">
            {metaPending ? "A guardar…" : "Guardar boletim"}
          </Button>
        </form>
      </section>

      <section className={cn(adminSurface, "p-6 sm:p-8")}>
        <h2 className="font-heading text-lg font-semibold">Tarefas</h2>
        <ul className="mt-4 space-y-2">
          {tasks.length === 0 ? (
            <li className="text-sm text-muted-foreground">Sem tarefas.</li>
          ) : (
            tasks.map((t) => <TaskRow key={t.id} recordId={recordId} task={t} />)
          )}
        </ul>
        <form id="add-task-form" action={taskAction} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <input type="hidden" name="record_id" value={recordId} />
          <div className="flex-1 space-y-2">
            <Label htmlFor="label">Nova tarefa</Label>
            <Input
              id="label"
              name="label"
              placeholder="Ex.: Óleo e filtro"
              className="border-white/15 bg-[#1a1a1a]"
            />
          </div>
          <Button type="submit" disabled={taskPending} variant="outline" className="border-white/15">
            {taskPending ? "…" : "Adicionar"}
          </Button>
        </form>
        {taskState?.error ? (
          <p className="mt-2 text-sm text-destructive">{taskState.error}</p>
        ) : null}
      </section>

      <section className={cn(adminSurface, "p-6 sm:p-8")}>
        <h2 className="font-heading text-lg font-semibold">Anexos (Storage)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Faturas: escolhe o cliente que pode ver o ficheiro (
          <code className="text-xs">visible_to_owner_id</code>). Fotos e outros
          seguem o dono atual da mota.
        </p>

        <ul className="mt-4 space-y-2">
          {attachments.length === 0 ? (
            <li className="text-sm text-muted-foreground">Sem ficheiros.</li>
          ) : (
            attachments.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm"
              >
                <span className="font-mono text-xs text-muted-foreground">
                  {a.kind} · {a.storage_path.slice(-48)}
                </span>
                <form action={deleteServiceAttachmentForm}>
                  <input type="hidden" name="attachment_id" value={a.id} />
                  <input type="hidden" name="record_id" value={recordId} />
                  <input type="hidden" name="storage_path" value={a.storage_path} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    Apagar
                  </Button>
                </form>
              </li>
            ))
          )}
        </ul>

        <form id="upload-form" action={uploadAction} className="mt-6 space-y-4 border-t border-white/10 pt-6">
          <div className="space-y-2">
            <Label htmlFor="file">Ficheiro</Label>
            <Input
              id="file"
              name="file"
              type="file"
              required
              className="border-white/15 bg-[#1a1a1a]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kind">Tipo</Label>
            <select
              id="kind"
              name="kind"
              defaultValue="photo"
              className="flex h-9 w-full rounded-md border border-white/15 bg-[#1a1a1a] px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="photo">Foto</option>
              <option value="invoice">Fatura</option>
              <option value="other">Outro</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="visible_to_owner_id">
              Visível a (só faturas)
            </Label>
            <select
              id="visible_to_owner_id"
              name="visible_to_owner_id"
              className="flex h-9 w-full rounded-md border border-white/15 bg-[#1a1a1a] px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">— Para faturas: escolher cliente —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name ?? c.id.slice(0, 8)}
                </option>
              ))}
            </select>
          </div>
          {uploadState?.error ? (
            <p className="text-sm text-destructive">{uploadState.error}</p>
          ) : null}
          {uploadState?.ok ? (
            <p className="text-sm text-primary">Upload concluído.</p>
          ) : null}
          <Button type="submit" disabled={uploadPending} variant="secondary">
            {uploadPending ? "A enviar…" : "Enviar para Storage"}
          </Button>
        </form>
      </section>
    </div>
  );
}
