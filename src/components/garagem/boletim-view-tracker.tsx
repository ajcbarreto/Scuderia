"use client";

import { useEffect, useRef } from "react";
import { recordBoletimView } from "@/lib/analytics/actions";

/**
 * Regista uma visualização do boletim pelo cliente. Renderiza nada — dispara
 * a server action no mount. O `useRef` evita o duplo registo do StrictMode em
 * desenvolvimento. Best-effort: erros são ignorados.
 */
export function BoletimViewTracker({ recordId }: { recordId: string }) {
  const logged = useRef(false);
  useEffect(() => {
    if (logged.current) return;
    logged.current = true;
    void recordBoletimView(recordId);
  }, [recordId]);
  return null;
}
