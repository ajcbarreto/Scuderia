"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type MotaOption = {
  id: string;
  brand: string;
  model: string;
  plate: string | null;
};

type Props = {
  motas: MotaOption[];
  /** ID pré-selecionado (ex.: `?mota=...`). */
  defaultId?: string | null;
  /** Nome do campo escondido submetido (motorcycle_id). */
  name?: string;
  /** ID do input para `<label htmlFor>`. */
  inputId?: string;
  required?: boolean;
};

function matches(m: MotaOption, q: string) {
  if (!q) return true;
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return (
    m.brand.toLowerCase().includes(needle) ||
    m.model.toLowerCase().includes(needle) ||
    (m.plate ?? "").toLowerCase().includes(needle)
  );
}

function formatLabel(m: MotaOption) {
  const base = `${m.brand} ${m.model}`;
  return m.plate ? `${base} · ${m.plate}` : base;
}

export function MotaSearchCombobox({
  motas,
  defaultId,
  name = "motorcycle_id",
  inputId = "mota-search",
  required,
}: Props) {
  const initial = defaultId ? motas.find((m) => m.id === defaultId) ?? null : null;
  const [selected, setSelected] = useState<MotaOption | null>(initial);
  const [query, setQuery] = useState(initial ? formatLabel(initial) : "");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Quando o texto coincide exatamente com a label do selecionado, mantemos
  // a seleção; senão, o utilizador está a procurar e a lista vira-se ativa.
  const filtered = useMemo(() => {
    const isSelectedLabel = selected && query === formatLabel(selected);
    if (isSelectedLabel) return motas;
    return motas.filter((m) => matches(m, query));
  }, [motas, query, selected]);

  useEffect(() => {
    setHighlight(0);
  }, [filtered.length]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function commit(m: MotaOption) {
    setSelected(m);
    setQuery(formatLabel(m));
    setOpen(false);
  }

  function clear() {
    setSelected(null);
    setQuery("");
    setOpen(true);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && open && filtered[highlight]) {
      e.preventDefault();
      commit(filtered[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <input type="hidden" name={name} value={selected?.id ?? ""} required={required} />

      <div
        className={cn(
          "flex h-10 w-full items-center rounded-lg border bg-background pl-3 pr-2 text-sm text-foreground shadow-xs transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
          selected ? "border-primary/40" : "border-input",
        )}
      >
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <input
          id={inputId}
          autoComplete="off"
          placeholder="Pesquisar por matrícula, marca ou modelo…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="flex-1 bg-transparent px-2 py-2 outline-none placeholder:text-muted-foreground"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${inputId}-listbox`}
          role="combobox"
        />
        {selected || query ? (
          <button
            type="button"
            onClick={clear}
            aria-label="Limpar"
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir lista"
          className="ml-1 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronDown
            className={cn("size-4 transition-transform", open && "rotate-180")}
            aria-hidden
          />
        </button>
      </div>

      {open ? (
        <ul
          id={`${inputId}-listbox`}
          role="listbox"
          className="absolute z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-border bg-popover p-1 text-sm shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-muted-foreground">Sem resultados.</li>
          ) : (
            filtered.map((m, idx) => {
              const isSelected = selected?.id === m.id;
              const isHighlighted = idx === highlight;
              return (
                <li
                  key={m.id}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    commit(m);
                  }}
                  onMouseEnter={() => setHighlight(idx)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded px-3 py-2",
                    isHighlighted ? "bg-muted text-foreground" : "text-foreground",
                  )}
                >
                  <Check
                    className={cn(
                      "size-4 shrink-0",
                      isSelected ? "text-primary opacity-100" : "opacity-0",
                    )}
                    aria-hidden
                  />
                  <span className="flex-1">
                    <span className="font-medium">
                      {m.brand} {m.model}
                    </span>
                    {m.plate ? (
                      <span className="ml-2 font-mono text-xs text-muted-foreground">
                        {m.plate}
                      </span>
                    ) : null}
                  </span>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
