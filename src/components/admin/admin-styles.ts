import { cn } from "@/lib/utils";

/** Superfícies e painéis do backoffice — usar com `className={cn(adminSurface, "p-6")}` */
export const adminSurface =
  "rounded-2xl border border-border bg-card shadow-sm shadow-foreground/5";

/** Cartão compacto / listas */
export const adminSurfaceLow =
  "rounded-xl border border-border bg-muted/60 shadow-sm shadow-foreground/4";

export const adminTableWrap = cn(adminSurface, "overflow-hidden");

/** Alinhar com `Card` do shadcn (substitui ring/border por defeito). */
export const adminCardClass =
  "rounded-2xl border border-border bg-card py-5 shadow-sm shadow-foreground/5";

export const adminGlassPanel =
  "rounded-lg border border-border bg-card/95 shadow-md shadow-foreground/6 backdrop-blur-md";

export const adminNavLinkBase =
  "flex items-center gap-3 px-6 py-3.5 font-heading text-xs font-medium uppercase tracking-wider transition-colors";

export const adminNavLinkActive =
  "border-r-4 border-primary bg-primary/[0.08] text-foreground";

export const adminNavLinkIdle =
  "text-muted-foreground hover:bg-muted hover:text-foreground";
