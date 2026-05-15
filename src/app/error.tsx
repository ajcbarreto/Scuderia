"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[app/error]", error);
    }
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-16 text-center">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" aria-hidden />
        </span>
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Algo correu mal
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Tivemos um problema a carregar esta página. Tenta de novo ou volta ao início.
            Se persistir, contacta a oficina.
          </p>
          {error.digest ? (
            <p className="font-mono text-[10px] text-muted-foreground/70">
              ref: {error.digest}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button onClick={reset} className="font-heading">
            <RotateCw className="size-4" />
            Tentar de novo
          </Button>
          <Link
            href="/"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
