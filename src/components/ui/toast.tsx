"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: number;
  variant: ToastVariant;
  message: string;
  duration: number;
};

/**
 * Store ao nível do módulo — `toast()` é chamável de qualquer client
 * component sem precisar de Provider em árvore. `<Toaster />` é montado
 * uma vez no layout e subscreve as alterações.
 */
let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<(items: ToastItem[]) => void>();

function emit() {
  for (const l of listeners) l(items);
}

function dismiss(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}

function push(variant: ToastVariant, message: string, duration = 4000) {
  const id = nextId++;
  items = [...items, { id, variant, message, duration }];
  emit();
  if (duration > 0) {
    setTimeout(() => dismiss(id), duration);
  }
  return id;
}

export const toast = {
  success: (message: string, duration?: number) => push("success", message, duration),
  error: (message: string, duration?: number) => push("error", message, duration),
  info: (message: string, duration?: number) => push("info", message, duration),
  dismiss,
};

const variantStyle: Record<
  ToastVariant,
  { ring: string; icon: React.ReactNode }
> = {
  success: {
    ring: "border-emerald-500/40",
    icon: <CheckCircle2 className="size-5 text-emerald-500" aria-hidden />,
  },
  error: {
    ring: "border-destructive/40",
    icon: <AlertTriangle className="size-5 text-destructive" aria-hidden />,
  },
  info: {
    ring: "border-primary/40",
    icon: <Info className="size-5 text-primary" aria-hidden />,
  },
};

export function Toaster() {
  const [list, setList] = useState<ToastItem[]>(items);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    listeners.add(setList);
    return () => {
      listeners.delete(setList);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-[min(92vw,22rem)] flex-col gap-2 print:hidden"
      role="region"
      aria-label="Notificações"
    >
      {list.map((t) => {
        const v = variantStyle[t.variant];
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border bg-card px-4 py-3 text-sm text-foreground shadow-lg shadow-foreground/10 ring-1 ring-foreground/5",
              "animate-in slide-in-from-bottom-2 fade-in-0 duration-200",
              v.ring,
            )}
          >
            <span className="mt-0.5 shrink-0">{v.icon}</span>
            <p className="flex-1 leading-relaxed">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Dispensar notificação"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
