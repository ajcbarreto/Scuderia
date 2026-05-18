"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type NoteColor,
  type ShopNote,
  serializeShopNotes,
} from "@/lib/garagem/shop-notes";
import { cn } from "@/lib/utils";

const NOTE_COLORS: {
  value: NoteColor;
  label: string;
  dot: string;
  textarea: string;
}[] = [
  {
    value: "green",
    label: "Verde — feito / positivo",
    dot: "bg-emerald-500",
    textarea:
      "border-emerald-300 bg-emerald-50/60 text-emerald-900 placeholder:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100",
  },
  {
    value: "orange",
    label: "Laranja — atenção",
    dot: "bg-orange-500",
    textarea:
      "border-orange-300 bg-orange-50/60 text-orange-900 placeholder:text-orange-400 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-100",
  },
  {
    value: "red",
    label: "Vermelho — urgente",
    dot: "bg-red-500",
    textarea:
      "border-red-300 bg-red-50/60 text-red-900 placeholder:text-red-400 dark:border-red-800 dark:bg-red-950/30 dark:text-red-100",
  },
  {
    value: "blue",
    label: "Azul — informação",
    dot: "bg-blue-500",
    textarea:
      "border-blue-300 bg-blue-50/60 text-blue-900 placeholder:text-blue-400 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-100",
  },
  {
    value: "default",
    label: "Neutro",
    dot: "bg-slate-400",
    textarea: "border-input bg-background text-foreground",
  },
];

type Props = {
  /** Nome do campo hidden que será submetido no formulário. */
  name: string;
  defaultNotes: ShopNote[];
};

export function ShopNotesEditor({ name, defaultNotes }: Props) {
  const [notes, setNotes] = useState<ShopNote[]>(defaultNotes);

  function addNote() {
    setNotes((prev) => [...prev, { text: "", color: "default" }]);
  }

  function removeNote(idx: number) {
    setNotes((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateText(idx: number, text: string) {
    setNotes((prev) => prev.map((n, i) => (i === idx ? { ...n, text } : n)));
  }

  function updateColor(idx: number, color: NoteColor) {
    setNotes((prev) => prev.map((n, i) => (i === idx ? { ...n, color } : n)));
  }

  return (
    <div className="space-y-3">
      {/* Hidden field sincronizado com o estado — submetido no form pai */}
      <input type="hidden" name={name} value={serializeShopNotes(notes)} />

      {notes.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
          Sem notas. Clica em «Adicionar nota» para começar.
        </p>
      ) : (
        <ul className="space-y-3">
          {notes.map((note, idx) => {
            const colorDef =
              NOTE_COLORS.find((c) => c.value === note.color) ??
              NOTE_COLORS[4];
            return (
              <li key={idx} className="flex items-start gap-2">
                {/* Color picker — dots verticais */}
                <div
                  className="flex flex-col gap-1.5 pt-2.5"
                  role="group"
                  aria-label="Cor da nota"
                >
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      title={c.label}
                      onClick={() => updateColor(idx, c.value)}
                      className={cn(
                        "size-3.5 rounded-full transition-all",
                        c.dot,
                        note.color === c.value
                          ? "scale-125 ring-2 ring-ring ring-offset-1"
                          : "opacity-35 hover:opacity-70",
                      )}
                    />
                  ))}
                </div>

                {/* Textarea com cor dinâmica */}
                <textarea
                  rows={2}
                  value={note.text}
                  onChange={(e) => updateText(idx, e.target.value)}
                  placeholder="Texto da nota…"
                  className={cn(
                    "flex-1 resize-y rounded-md border px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    colorDef.textarea,
                  )}
                />

                {/* Remover */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-1 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeNote(idx)}
                  aria-label="Remover nota"
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addNote}
        className="gap-1.5 border-border"
      >
        <Plus className="size-4" />
        Adicionar nota
      </Button>

      {/* Legenda */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
        {NOTE_COLORS.map((c) => (
          <span key={c.value} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn("size-2 rounded-full", c.dot)} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}
