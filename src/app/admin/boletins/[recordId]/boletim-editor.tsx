"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CircleDot,
  Download,
  EyeOff,
  Info,
  Pencil,
  X,
} from "lucide-react";
import {
  addServiceTaskFromForm,
  deleteServiceAttachment,
  updateServiceRecord,
  uploadServiceAttachment,
  type ActionState,
} from "@/app/admin/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/toast";
import { ShopNotesEditor } from "@/components/admin/shop-notes-editor";
import { parseShopNotes, type NoteColor } from "@/lib/garagem/shop-notes";
import { SERVICE_REVISION_TYPES } from "@/lib/garagem/service-record-display";
import type { Motorcycle, Profile, ServiceAttachment, ServiceRecord, ServiceTask } from "@/types/database";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { adminSurface } from "@/components/admin/admin-styles";
import { cn } from "@/lib/utils";
import { TaskChecklist } from "./task-checklist";

type Props = {
  record: ServiceRecord;
  mota: Pick<Motorcycle, "id" | "brand" | "model" | "plate" | "year">;
  tasks: ServiceTask[];
  attachments: ServiceAttachment[];
  clients: Pick<Profile, "id" | "full_name" | "phone">[];
};

const STATUS_LABEL: Record<ServiceRecord["status"], string> = {
  draft: "Rascunho",
  in_progress: "Em curso",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const NOTE_VIEW: Record<NoteColor, { wrap: string; icon: typeof CheckCircle2 }> = {
  green: {
    wrap: "border-emerald-300 bg-emerald-50/50 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-200",
    icon: CheckCircle2,
  },
  red: {
    wrap: "border-red-300 bg-red-50/50 text-red-900 dark:border-red-800/60 dark:bg-red-950/30 dark:text-red-200",
    icon: AlertTriangle,
  },
  orange: {
    wrap: "border-orange-300 bg-orange-50/50 text-orange-900 dark:border-orange-800/60 dark:bg-orange-950/30 dark:text-orange-200",
    icon: AlertTriangle,
  },
  blue: {
    wrap: "border-blue-300 bg-blue-50/50 text-blue-900 dark:border-blue-800/60 dark:bg-blue-950/30 dark:text-blue-200",
    icon: Info,
  },
  default: {
    wrap: "border-border bg-muted/40 text-foreground",
    icon: CircleDot,
  },
};

function formatPtDate(iso: string | null) {
  if (!iso) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`);
  return new Intl.DateTimeFormat("pt-PT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

function formatKm(n: number | null) {
  if (n == null) return "—";
  return `${n.toLocaleString("pt-PT")} km`;
}

function addOneYear(isoDate: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
  if (!m) return "";
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  d.setFullYear(d.getFullYear() + 1);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function defaultNextServiceDate(record: ServiceRecord): string {
  if (record.next_service_due_date) return record.next_service_due_date;
  if (!record.service_date) return "";
  return addOneYear(record.service_date);
}

function ReadField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-heading text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-foreground">{children}</p>
    </div>
  );
}

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

  const ERROR_TOAST_MS = 6000;

  useEffect(() => {
    if (uploadState?.ok) {
      const el = document.getElementById("upload-form") as HTMLFormElement | null;
      el?.reset();
      toast.success("Anexo carregado.");
    } else if (uploadState?.error) {
      toast.error(uploadState.error, ERROR_TOAST_MS);
    }
  }, [uploadState]);

  useEffect(() => {
    if (taskState?.ok) {
      const el = document.getElementById("add-task-form") as HTMLFormElement | null;
      el?.reset();
      toast.success("Tarefa adicionada.");
    } else if (taskState?.error) {
      toast.error(taskState.error, ERROR_TOAST_MS);
    }
  }, [taskState]);

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (metaState?.ok) {
      toast.success("Boletim guardado.");
      setEditing(false);
    } else if (metaState?.error) {
      toast.error(metaState.error, ERROR_TOAST_MS);
    }
  }, [metaState]);

  const completedTaskCount = tasks.filter((t) => t.completed).length;
  const metaFormId = "boletim-meta-form";
  const shopNotes = parseShopNotes(record.shop_notes);

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
            ? `Matrícula ${mota.plate} — checklist e próxima revisão à esquerda; dados do boletim e anexos à direita.`
            : "Checklist e próxima revisão à esquerda; dados e anexos à direita."
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`/api/boletim/${recordId}/pdf`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5 border-border",
              )}
              download
            >
              <Download className="size-4" aria-hidden />
              PDF
            </a>
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
          </div>
        }
      />

      <div className="flex flex-col gap-10 xl:grid xl:grid-cols-12 xl:items-start xl:gap-8">
        <div className="flex flex-col gap-6 xl:col-span-7">
          <section
            className={cn(
              adminSurface,
              "border-primary/20 p-6 shadow-sm ring-1 ring-primary/15 sm:p-8",
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="font-heading text-lg font-semibold tracking-tight">
                  Lista de tarefas
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tasks.length === 0
                    ? "Sem linhas neste boletim — adiciona abaixo ou gere a lista em «Tarefas padrão»."
                    : `${completedTaskCount} de ${tasks.length} concluídas · cada visto atualiza o progresso.`}
                </p>
              </div>
              <p className="shrink-0 font-heading text-3xl font-semibold tabular-nums text-primary sm:text-4xl">
                {record.progress_percent}%
              </p>
            </div>
            <Progress value={record.progress_percent} className="mt-4">
              <span className="sr-only">{record.progress_percent}% concluído</span>
            </Progress>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              <span className="text-foreground">Manutenção</span>: o dono vê na garagem só as linhas
              com visto. <span className="text-foreground">Serviço (só oficina)</span>: registo
              oculto ao cliente.
            </p>

            <div className="mt-6 border-t border-border/80 pt-6">
              <TaskChecklist recordId={recordId} tasks={tasks} />
              <form
                id="add-task-form"
                action={taskAction}
                className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
              >
                <input type="hidden" name="record_id" value={recordId} />
                <div className="min-w-0 flex-1 space-y-2">
                  <Label htmlFor="label">Nova tarefa</Label>
                  <Input
                    id="label"
                    name="label"
                    placeholder="Ex.: Óleo e filtro"
                    className="border-input bg-background text-foreground"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={taskPending}
                  variant="outline"
                  className="shrink-0 border-border"
                >
                  {taskPending ? "…" : "Adicionar"}
                </Button>
              </form>
            </div>
          </section>

          <section
            className={cn(
              "rounded-xl border-2 p-6 shadow-sm sm:p-8",
              "border-primary/35 bg-primary/[0.06]",
              "dark:border-primary/40 dark:bg-primary/[0.08]",
            )}
          >
            <h2 className="font-heading text-lg font-semibold">Próxima revisão (cliente)</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Opcional. Aparece no boletim na garagem. Os campos fazem parte do mesmo
              guardar que «Dados do boletim».
            </p>
            {editing ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="next_service_due_date">Data alvo</Label>
                  <Input
                    id="next_service_due_date"
                    form={metaFormId}
                    name="next_service_due_date"
                    type="date"
                    defaultValue={defaultNextServiceDate(record)}
                    className="border-2 border-primary/40 bg-background text-foreground focus-visible:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="next_service_due_km">Quilometragem alvo (km)</Label>
                  <Input
                    id="next_service_due_km"
                    form={metaFormId}
                    name="next_service_due_km"
                    type="number"
                    min={0}
                    step={1}
                    placeholder={
                      record.odometer_km != null
                        ? record.odometer_km.toLocaleString("pt-PT")
                        : undefined
                    }
                    defaultValue={record.next_service_due_km ?? ""}
                    className="border-2 border-primary/40 bg-background text-foreground focus-visible:border-primary"
                  />
                </div>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <ReadField label="Data alvo">{formatPtDate(record.next_service_due_date)}</ReadField>
                <ReadField label="Quilometragem alvo">{formatKm(record.next_service_due_km)}</ReadField>
              </div>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-10 xl:sticky xl:top-6 xl:col-span-5 xl:self-start">
          <form id={metaFormId} action={metaAction} className="flex flex-col gap-6">
            <section className={cn(adminSurface, "p-6 sm:p-8")}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-heading text-lg font-semibold">Dados do boletim</h2>
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
                )}
              </div>
              {editing ? (
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      name="title"
                      defaultValue={record.title ?? ""}
                      className="border-input bg-background text-foreground"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="service_date">Data do serviço</Label>
                      <Input
                        id="service_date"
                        name="service_date"
                        type="date"
                        defaultValue={record.service_date ?? ""}
                        className="border-input bg-background text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="repair_order_ref">N.º ordem de reparação</Label>
                      <Input
                        id="repair_order_ref"
                        name="repair_order_ref"
                        placeholder="Ex.: OR-2026-0042"
                        defaultValue={record.repair_order_ref ?? ""}
                        className="border-input bg-background text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="odometer_km">Quilometragem (km)</Label>
                      <Input
                        id="odometer_km"
                        name="odometer_km"
                        type="number"
                        min={0}
                        step={1}
                        placeholder="Ex.: 12450"
                        defaultValue={record.odometer_km ?? ""}
                        className="border-input bg-background text-foreground"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="revision_type">Tipo de revisão</Label>
                      <select
                        id="revision_type"
                        name="revision_type"
                        defaultValue={record.revision_type ?? ""}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        <option value="">— Não indicado —</option>
                        {SERVICE_REVISION_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <select
                      id="status"
                      name="status"
                      defaultValue={record.status}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      <option value="draft">Rascunho</option>
                      <option value="in_progress">Em curso</option>
                      <option value="completed">Concluído</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                  <div className="space-y-2 rounded-lg border border-border/80 bg-muted/30 p-4">
                    <label
                      htmlFor="record_kind_shop"
                      className="flex items-start gap-3 text-sm font-medium text-foreground"
                    >
                      <Checkbox
                        id="record_kind_shop"
                        name="record_kind_shop"
                        defaultChecked={record.record_kind === "shop_service"}
                        className="mt-0.5"
                      />
                      <span>Não mostrar ao próximo dono</span>
                    </label>
                    <p className="pl-7 text-xs text-muted-foreground">
                      Marca quando este serviço é só da oficina ou do proprietário anterior — não
                      aparece na garagem do cliente atual nem após transferência.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Notas da oficina</Label>
                    <p className="text-xs text-muted-foreground">
                      Cada nota pode ter uma cor diferente. Aparece no boletim da garagem do cliente.
                    </p>
                    <ShopNotesEditor name="shop_notes" defaultNotes={shopNotes} />
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-5">
                  <ReadField label="Título">{record.title ?? "—"}</ReadField>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ReadField label="Data do serviço">{formatPtDate(record.service_date)}</ReadField>
                    <ReadField label="N.º ordem de reparação">
                      {record.repair_order_ref ?? "—"}
                    </ReadField>
                    <ReadField label="Quilometragem">{formatKm(record.odometer_km)}</ReadField>
                    <ReadField label="Tipo de revisão">
                      {record.revision_type ?? "—"}
                    </ReadField>
                  </div>
                  <ReadField label="Estado">{STATUS_LABEL[record.status]}</ReadField>
                  <div className="flex items-start gap-3 rounded-lg border border-border/80 bg-muted/30 p-4 text-sm">
                    {record.record_kind === "shop_service" ? (
                      <>
                        <EyeOff className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                        <span className="text-foreground">
                          <span className="font-medium">Oculto ao cliente.</span> Este serviço não
                          aparece na garagem do dono atual nem após transferência.
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2
                          className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                          aria-hidden
                        />
                        <span className="text-foreground">
                          <span className="font-medium">Visível ao dono atual.</span> Aparece no
                          histórico de manutenção da mota.
                        </span>
                      </>
                    )}
                  </div>
                  <div>
                    <p className="font-heading text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Notas da oficina
                    </p>
                    {shopNotes.length === 0 ? (
                      <p className="mt-1 text-sm text-muted-foreground">Sem notas.</p>
                    ) : (
                      <ul className="mt-2 space-y-2">
                        {shopNotes.map((n, idx) => {
                          const view = NOTE_VIEW[n.color];
                          const Icon = view.icon;
                          return (
                            <li
                              key={idx}
                              className={cn(
                                "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
                                view.wrap,
                              )}
                            >
                              <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
                              <p className="whitespace-pre-wrap leading-relaxed">{n.text}</p>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </section>

            {editing ? (
              <Button type="submit" disabled={metaPending} className="font-heading w-full sm:w-auto">
                {metaPending ? "A guardar…" : "Guardar boletim"}
              </Button>
            ) : null}
          </form>

          <section className={cn(adminSurface, "p-6 sm:p-8")}>
        <h2 className="font-heading text-lg font-semibold">Anexos (Storage)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Faturas: escolhe o cliente que pode ver o ficheiro (
          <code className="text-xs">visible_to_owner_id</code>). Fotos e outros seguem o dono atual
          da mota.
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
                <ConfirmDialog
                  title="Apagar anexo?"
                  description="O ficheiro é removido do armazenamento e deixa de aparecer no boletim. Esta acção não pode ser anulada."
                  confirmLabel="Apagar"
                  tone="destructive"
                  onConfirm={async () => {
                    const res = await deleteServiceAttachment(
                      a.id,
                      recordId,
                      a.storage_path,
                    );
                    if (res?.error) {
                      toast.error(res.error, 6000);
                    } else {
                      toast.success("Anexo apagado.");
                    }
                  }}
                  trigger={
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      Apagar
                    </Button>
                  }
                />
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
              className="border-input bg-background text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kind">Tipo</Label>
            <select
              id="kind"
              name="kind"
              defaultValue="photo"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="photo">Foto</option>
              <option value="invoice">Fatura</option>
              <option value="other">Outro</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="visible_to_owner_id">Visível a (só faturas)</Label>
            <select
              id="visible_to_owner_id"
              name="visible_to_owner_id"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
          <Button type="submit" disabled={uploadPending} variant="secondary" className="font-heading">
            {uploadPending ? "A enviar…" : "Enviar para Storage"}
          </Button>
        </form>
      </section>
        </div>
      </div>
    </div>
  );
}
