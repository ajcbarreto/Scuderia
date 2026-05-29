"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  /** Texto do botão quando o formulário está fechado. */
  triggerLabel: string;
  /** Título a mostrar no cartão quando o formulário está aberto. */
  openTitle: string;
  /** Descrição/subtítulo quando aberto. */
  openDescription?: string;
  /** Conteúdo do formulário. */
  children: React.ReactNode;
  className?: string;
  /** Quando true, o formulário começa aberto (ex.: pré-seleção via query). */
  defaultOpen?: boolean;
};

/**
 * Botão "Adicionar" que abre uma secção colapsável com um formulário.
 * Mantém o ecrã focado na listagem; o formulário só aparece quando pedido.
 */
export function CollapsibleAddSection({
  triggerLabel,
  openTitle,
  openDescription,
  children,
  className,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  if (!open) {
    return (
      <div className={cn("flex justify-end", className)}>
        <Button
          type="button"
          onClick={() => setOpen(true)}
          className="font-heading"
        >
          <Plus className="size-4" aria-hidden />
          {triggerLabel}
        </Button>
      </div>
    );
  }

  return (
    <Card className={cn("border-border/80 bg-card shadow-none ring-0", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="font-heading text-lg text-foreground">
            {openTitle}
          </CardTitle>
          {openDescription ? (
            <CardDescription className="text-muted-foreground">
              {openDescription}
            </CardDescription>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setOpen(false)}
          aria-label="Fechar"
        >
          <X className="size-4" aria-hidden />
        </Button>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
