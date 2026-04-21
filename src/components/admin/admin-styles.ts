import { cn } from "@/lib/utils";

/** Superfícies e painéis do backoffice — usar com `className={cn(adminSurface, "p-6")}` */
export const adminSurface =
  "rounded-2xl border border-white/[0.08] bg-[#141414] shadow-sm shadow-black/30";

export const adminTableWrap = cn(adminSurface, "overflow-hidden");

/** Alinhar com `Card` do shadcn (substitui ring/border por defeito). */
export const adminCardClass =
  "rounded-2xl border-0 bg-[#141414] py-5 shadow-sm shadow-black/30 ring-1 ring-white/[0.06]";
