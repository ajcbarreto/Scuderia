import { cn } from "@/lib/utils";

/** Superfícies e painéis do backoffice — usar com `className={cn(adminSurface, "p-6")}` */
export const adminSurface =
  "rounded-2xl border border-white/[0.08] bg-[#141414] shadow-sm shadow-black/30";

/** Cartão Stitch: tonal #131313, limite suave (sem caixa “genérica”). */
export const adminSurfaceLow =
  "rounded-xl border border-[#484847]/15 bg-[#131313] shadow-sm shadow-black/25";

export const adminTableWrap = cn(adminSurface, "overflow-hidden");

/** Alinhar com `Card` do shadcn (substitui ring/border por defeito). */
export const adminCardClass =
  "rounded-2xl border-0 bg-[#141414] py-5 shadow-sm shadow-black/30 ring-1 ring-white/[0.06]";

export const adminGlassPanel =
  "rounded-lg border border-[#484847]/10 bg-[#262626]/80 shadow-[0_4px_32px_rgba(232,15,22,0.06)] backdrop-blur-xl";

export const adminNavLinkBase =
  "flex items-center gap-3 px-6 py-3.5 font-heading text-xs font-medium uppercase tracking-wider transition-colors";

export const adminNavLinkActive =
  "border-r-4 border-primary bg-[#1a1a1a] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]";

export const adminNavLinkIdle =
  "text-[#adaaaa] hover:bg-[#262626] hover:text-white";
