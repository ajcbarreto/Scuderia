"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  addServiceTaskFromForm,
  applyChecklistPresetToServiceRecord,
  deleteServiceAttachmentForm,
  updateServiceRecord,
  uploadServiceAttachment,
  type ActionState,
} from "@/app/admin/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import type { Motorcycle, Profile, ServiceAttachment, ServiceRecord, ServiceTask } from "@/types/database";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { adminSurface } from "@/components/admin/admin-styles";
import { cn } from "@/lib/utils";
import {
  type ChecklistPresetWithItems,
  formatPresetYearRange,
} from "@/lib/maintenance-checklist";
import { TaskRow } from "./task-row";

type Props = {
  record: ServiceRecord;
  mota: Pick<Motorcycle, "id" | "brand" | "model" | "plate" | "year">;
  tasks: ServiceTask[];
  attachments: ServiceAttachment[];
  clients: Pick<Profile, "id" | "full_name" | "phone">[];
  checklistPresets: ChecklistPresetWithItems[];
};

export function BoletimEditor({
  record,
  mota,
  tasks,
  attachments,
  clients,
  checklistPresets,
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

  const [applyState, applyAction, applyPending] = useActionState<
    ActionState | undefined,
    FormData
  >(applyChecklistPresetToServiceRecord, undefined);

  const linkedPresetLabel = record.checklist_preset_id
    ? checklistPresets.find((p) => p.id === record.checklist_preset_id)
        ?.service_type_name ?? "Preset associado (marca/modelo já não coincide com a lista)"
    : null;

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
        title="Intervenção na oficina"
        description={
          mota.plate
            ? `Matrícula ${mota.plate} — regista o trabalho em tarefas; o progresso segue a checklist.`
            : "Regista o trabalho em tarefas; o progresso segue a checklist."
        }
        actions={
          <Link
            href="/admin/boletins"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1.5 border-border",
            )}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Lista de boletins
          </Link>
        }
      />

      <section className={cn(adminSurface, "p-6 sm:p-8")}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold">Progresso do serviço</h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Cada tarefa concluída aumenta a percentagem. Em boletins de{" "}
              <span className="text-foreground">manutenção</span>, o dono atual vê o progresso na
              garagem; em <span className="text-foreground">serviço (só oficina)</span> o cliente não
              vê este registo.
            </p>
          </div>
          <p className="font-heading text-4xl font-semibold tabular-nums text-primary sm:text-right">
            {record.progress_percent}%
          </p>
        </div>
        <Progress value={record.progress_percent} className="mt-5">
          <span className="sr-only">{record.progress_percent}% concluído</span>
        </Progress>
      </section>

      <section className={cn(adminSurface, "p-6 sm:p-8")}>
        <h2 className="font-heading text-lg font-semibold">Dados do boletim</h2>
        <form action={metaAction} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              defaultValue={record.title ?? ""}
              className="border-input bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <select
              id="status"
              name="status"
              defaultValue={record.status}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="draft">Rascunho</option>
              <option value="in_progress">Em curso</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="record_kind">Manutenção ou serviço</Label>
            <select
              id="record_kind"
              name="record_kind"
              defaultValue={record.record_kind}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="maintenance">
                Manutenção — aparece na garagem do dono atual (histórico da mota)
              </option>
              <option value="shop_service">
                Serviço (só oficina) — não aparece ao cliente; útil para trabalho interno ou do
                proprietário anterior
              </option>
            </select>
            <p className="text-xs text-muted-foreground">
              Após transferência de propriedade, o novo dono continua a ver apenas os boletins
              marcados como manutenção.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="shop_notes">Notas da oficina</Label>
            <Textarea
              id="shop_notes"
              name="shop_notes"
              rows={6}
              defaultValue={record.shop_notes ?? ""}
              className="border-input bg-background"
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
        <h2 className="font-heading text-lg font-semibold">Checklist a partir do modelo</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Escolhe o tipo de serviço configurado para{" "}
          <span className="text-foreground">
            {mota.brand} {mota.model}
            {mota.year != null ? ` (${mota.year})` : " (sem ano na ficha — só presets «todos os anos»)"}
          </span>{" "}
          e aplica as linhas ao boletim. Podes editar a lista em{" "}
          <Link href="/admin/checklists" className="text-primary hover:underline">
            Checklists
          </Link>
          .
        </p>
        {linkedPresetLabel ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Último preset aplicado:{" "}
            <span className="font-medium text-foreground">{linkedPresetLabel}</span>
          </p>
        ) : null}
        {checklistPresets.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Não há presets para esta marca, modelo e ano. Cria ou ajusta presets em{" "}
            <Link href="/admin/checklists/motas" className="text-primary hover:underline">
              Motas & presets
            </Link>
            .
          </p>
        ) : (
          <form action={applyAction} className="mt-4 space-y-4">
            <input type="hidden" name="record_id" value={recordId} />
            <div className="space-y-2">
              <Label htmlFor="preset_id">Tipo de serviço (preset)</Label>
              <select
                id="preset_id"
                name="preset_id"
                required
                className="flex h-9 w-full max-w-xl rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                defaultValue={
                  record.checklist_preset_id &&
                  checklistPresets.some((p) => p.id === record.checklist_preset_id)
                    ? record.checklist_preset_id
                    : ""
                }
              >
                <option value="" disabled>
                  Escolher…
                </option>
                {checklistPresets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.service_type_name} · {formatPresetYearRange(p.year_min, p.year_max)} (
                    {p.items.length} linhas)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="update_title"
                name="update_title"
                value="1"
                defaultChecked
                className="mt-1 size-4 rounded border border-border bg-card"
              />
              <Label htmlFor="update_title" className="font-normal leading-snug">
                Atualizar o título do boletim para o nome do tipo de serviço
              </Label>
            </div>
            {applyState?.error ? (
              <p className="text-sm text-destructive">{applyState.error}</p>
            ) : null}
            {applyState?.info ? (
              <p className="text-sm text-muted-foreground">{applyState.info}</p>
            ) : null}
            {applyState?.ok && !applyState?.error && !applyState?.info ? (
              <p className="text-sm text-primary">Checklist aplicada.</p>
            ) : null}
            <Button type="submit" disabled={applyPending} variant="secondary" className="font-heading">
              {applyPending ? "A aplicar…" : "Aplicar ao boletim"}
            </Button>
          </form>
        )}
      </section>

      <section className={cn(adminSurface, "p-6 sm:p-8")}>
        <div>
          <h2 className="font-heading text-lg font-semibold">Trabalho realizado</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Lista o que foi feito e marca como concluído — o progresso atualiza em cima.
          </p>
        </div>
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
              className="border-input bg-background"
            />
          </div>
          <Button type="submit" disabled={taskPending} variant="outline" className="border-border">
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
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/80 bg-card px-3 py-2 text-sm"
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

        <form id="upload-form" action={uploadAction} className="mt-6 space-y-4 border-t border-border/80 pt-6">
          <div className="space-y-2">
            <Label htmlFor="file">Ficheiro</Label>
            <Input
              id="file"
              name="file"
              type="file"
              required
              className="border-input bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kind">Tipo</Label>
            <select
              id="kind"
              name="kind"
              defaultValue="photo"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
