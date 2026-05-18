export type NoteColor = "green" | "red" | "orange" | "blue" | "default";

export type ShopNote = {
  text: string;
  color: NoteColor;
};

const VALID_COLORS: NoteColor[] = ["green", "red", "orange", "blue", "default"];

function isValidNote(x: unknown): x is ShopNote {
  return (
    typeof x === "object" &&
    x !== null &&
    "text" in x &&
    typeof (x as Record<string, unknown>).text === "string" &&
    "color" in x &&
    VALID_COLORS.includes((x as Record<string, unknown>).color as NoteColor)
  );
}

/**
 * Tenta parsear `shop_notes` como JSON (novo formato com cores).
 * Se falhar ou o valor não começar com `[`, trata como texto simples
 * e devolve cada parágrafo como uma nota "default" — retrocompatível.
 */
export function parseShopNotes(raw: string | null | undefined): ShopNote[] {
  if (!raw?.trim()) return [];
  const trimmed = raw.trim();

  if (trimmed.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.every(isValidNote)) {
        return parsed;
      }
    } catch {
      // fall through to plain-text path
    }
  }

  // Texto simples legado: divide por parágrafo duplo.
  return trimmed
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((text) => ({ text, color: "default" as NoteColor }));
}

export function serializeShopNotes(notes: ShopNote[]): string {
  return JSON.stringify(notes);
}
