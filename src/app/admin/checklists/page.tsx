import Link from "next/link";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { adminSurface } from "@/components/admin/admin-styles";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { loadServiceTaskTemplates } from "@/lib/service-task-templates";
import {
  addTaskTemplateForm,
  deleteTaskTemplateForm,
  moveTaskTemplateForm,
  updateTaskTemplateLabelForm,
} from "@/app/admin/checklists/actions";

export default async function AdminTaskTemplatesPage() {
  const supabase = await createClient();
  const templates = await loadServiceTaskTemplates(supabase);

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Configuração"
        title="Lista de tarefas padrão"
        description="Uma única lista para toda a oficina. Ao abrires um novo boletim para qualquer mota, estas linhas são copiadas para esse serviço (podes marcar vistos e acrescentar tarefas extra no boletim). Na garagem do cliente só aparecem as tarefas já concluídas."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/boletins"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "border-border font-heading",
              )}
            >
              Boletins
            </Link>
          </div>
        }
      />

      <section className={cn(adminSurface, "p-6 sm:p-8")}>
        <h2 className="font-heading text-lg font-semibold">Adicionar linha</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Novas entradas ficam no fim da lista. Usa as setas em cada linha para reordenar.
        </p>
        <form action={addTaskTemplateForm} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 space-y-2">
            <Label htmlFor="new_label">Descrição da tarefa</Label>
            <Input
              id="new_label"
              name="label"
              required
              placeholder="Ex.: Verificar níveis de fluidos"
              className="border-input bg-background text-foreground"
            />
          </div>
          <Button type="submit" className="font-heading sm:shrink-0">
            Adicionar
          </Button>
        </form>
      </section>

      <section className={cn(adminSurface, "p-0")}>
        <div className="border-b border-border px-6 py-5 sm:px-8">
          <h2 className="font-heading text-lg font-semibold">Linhas ({templates.length})</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Alterações aqui só afectam <strong className="text-foreground">novos</strong> boletins. Serviços
            antigos mantêm a cópia que tinham no momento da abertura.
          </p>
        </div>
        {templates.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground sm:px-8">
            Lista vazia. Adiciona a primeira tarefa acima — será copiada para o próximo boletim que
            criares.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {templates.map((t, i) => (
              <li
                key={t.id}
                className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-8"
              >
                <div className="flex shrink-0 gap-1">
                  <form action={moveTaskTemplateForm}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="direction" value="up" />
                    <Button
                      type="submit"
                      variant="outline"
                      size="icon-sm"
                      className="border-border"
                      disabled={i === 0}
                      aria-label="Subir"
                    >
                      <ChevronUp className="size-4" />
                    </Button>
                  </form>
                  <form action={moveTaskTemplateForm}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="direction" value="down" />
                    <Button
                      type="submit"
                      variant="outline"
                      size="icon-sm"
                      className="border-border"
                      disabled={i === templates.length - 1}
                      aria-label="Descer"
                    >
                      <ChevronDown className="size-4" />
                    </Button>
                  </form>
                </div>
                <form
                  action={updateTaskTemplateLabelForm}
                  className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center"
                >
                  <input type="hidden" name="id" value={t.id} />
                  <Input
                    name="label"
                    defaultValue={t.label}
                    required
                    className="border-input bg-background text-foreground sm:flex-1"
                  />
                  <Button type="submit" variant="secondary" size="sm" className="font-heading sm:shrink-0">
                    Guardar texto
                  </Button>
                </form>
                <form action={deleteTaskTemplateForm} className="shrink-0">
                  <input type="hidden" name="id" value={t.id} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remover linha"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
