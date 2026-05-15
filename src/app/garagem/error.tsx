"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GaragemError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[garagem/error]", error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-2xl border border-border bg-card p-8">
        <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" aria-hidden />
        </span>
        <div className="space-y-2">
          <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
            Não foi possível carregar a garagem
          </h2>
          <p className="text-sm text-muted-foreground">
            Tenta de novo. Se persistir, contacta a oficina.
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
