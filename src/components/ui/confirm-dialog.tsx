"use client";

import { useState, useTransition } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  /** Elemento que abre o diálogo (ex.: um <Button> ou ícone). */
  trigger: React.ReactNode;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** `destructive` pinta o botão de confirmação a vermelho. */
  tone?: "default" | "destructive";
  /**
   * Acção a executar ao confirmar. Pode ser async — o diálogo mostra estado
   * "a processar" e só fecha quando resolver.
   */
  onConfirm: () => void | Promise<void>;
};

/**
 * Substitui o `window.confirm()` nativo por um diálogo dentro do design
 * system. Declarativo: embrulha-se o trigger e passa-se `onConfirm`.
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "default",
  onConfirm,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await onConfirm();
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span
              className={
                tone === "destructive"
                  ? "flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"
                  : "flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
              }
            >
              <AlertTriangle className="size-5" aria-hidden />
            </span>
            <div className="space-y-1">
              <DialogTitle>{title}</DialogTitle>
              {description ? (
                <DialogDescription>{description}</DialogDescription>
              ) : null}
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            render={
              <Button variant="outline" type="button" disabled={pending} />
            }
          >
            {cancelLabel}
          </DialogClose>
          <Button
            type="button"
            variant={tone === "destructive" ? "destructive" : "default"}
            disabled={pending}
            onClick={handleConfirm}
          >
            {pending ? "A processar…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
