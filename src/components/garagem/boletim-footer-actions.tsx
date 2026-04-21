"use client";

import Link from "next/link";
import { Download, FileText, MessageCircle } from "lucide-react";

type Props = {
  whatsappHref: string;
};

export function BoletimFooterActions({ whatsappHref }: Props) {
  return (
    <div className="flex flex-wrap gap-4">
      <Link
        href="#anexos-faturas"
        className="flex min-w-[140px] flex-1 items-center justify-center gap-2 rounded-full bg-[#348017] px-5 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:brightness-110"
      >
        <Download className="size-4 shrink-0" aria-hidden />
        Faturas
      </Link>
      <button
        type="button"
        onClick={() => window.print()}
        className="flex min-w-[140px] flex-1 items-center justify-center gap-2 rounded-full bg-[#348017] px-5 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:brightness-110"
      >
        <FileText className="size-4 shrink-0" aria-hidden />
        Download PDF
      </button>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-w-[140px] flex-1 items-center justify-center gap-2 rounded-full bg-[#348017] px-5 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:brightness-110"
      >
        <MessageCircle className="size-4 shrink-0" aria-hidden />
        WhatsApp
      </a>
    </div>
  );
}
