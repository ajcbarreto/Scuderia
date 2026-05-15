"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  /** Nome do `searchParam` que controlamos (ex.: "q"). */
  paramName?: string;
  placeholder?: string;
  /** Debounce em ms antes de atualizar o URL. 250ms é confortável. */
  debounceMs?: number;
  className?: string;
};

/**
 * Input de pesquisa que serializa o termo no URL. O server component pai
 * lê `searchParams[paramName]` e filtra a query Supabase — assim a pesquisa
 * é partilhável por URL e sobrevive a refresh.
 */
export function AdminSearch({
  paramName = "q",
  placeholder = "Pesquisar…",
  debounceMs = 250,
  className,
}: Props) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const initial = searchParams.get(paramName) ?? "";
  const [value, setValue] = useState(initial);
  const [, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resync se o URL mudar de fora (ex.: utilizador navegar para outra página).
  useEffect(() => {
    setValue(searchParams.get(paramName) ?? "");
  }, [searchParams, paramName]);

  function commit(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.trim()) {
      params.set(paramName, next.trim());
    } else {
      params.delete(paramName);
    }
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setValue(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => commit(next), debounceMs);
  }

  function onClear() {
    setValue("");
    if (timerRef.current) clearTimeout(timerRef.current);
    commit("");
  }

  return (
    <div className={cn("relative max-w-sm", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-10 border-input bg-background pl-9 pr-9"
        aria-label={placeholder}
      />
      {value ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Limpar pesquisa"
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
