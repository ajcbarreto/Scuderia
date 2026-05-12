"use client";

import Link from "next/link";
import { FileText } from "lucide-react";

/** Atalho para a secção de faturas no boletim completo (vista da mota). */
export function BoletimFooterActions() {
  return (
    <div className="flex flex-wrap gap-4">
      <Link
        href="#anexos-faturas"
        className="inline-flex min-h-12 min-w-[200px] flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
      >
        <FileText className="size-4 shrink-0" aria-hidden />
        Faturas e documentos
      </Link>
    </div>
  );
}
