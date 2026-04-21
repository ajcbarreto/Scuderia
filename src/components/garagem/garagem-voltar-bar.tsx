import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  /** Ex.: "Voltar ao boletim" */
  label: string;
  /** Opcional: subtítulo (ex. marca e modelo) */
  subtitle?: string | null;
};

export function GaragemVoltarBar({ href, label, subtitle }: Props) {
  return (
    <div
      className={cn(
        "print:hidden sticky top-14 z-30 -mx-4 mb-6 border-b border-white/10 bg-background/95 px-4 py-3 backdrop-blur-md",
        "sm:-mx-0 sm:mb-8 sm:rounded-xl sm:border sm:px-4 sm:py-3",
      )}
    >
      <Link
        href={href}
        className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-lg border border-white/15 bg-[#1a1a1a] px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-[#222] hover:text-primary"
      >
        <ChevronLeft className="size-5 shrink-0" aria-hidden />
        <span className="flex min-w-0 flex-col items-start gap-0.5 text-left leading-tight">
          <span>{label}</span>
          {subtitle ? (
            <span className="text-xs font-normal text-muted-foreground">{subtitle}</span>
          ) : null}
        </span>
      </Link>
    </div>
  );
}
