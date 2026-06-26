"use client";

/**
 * Atalho para reabrir o banner de consentimento e mudar/retirar a decisão.
 * Retirar deve ser tão fácil como dar — remove a escolha guardada e recarrega,
 * o que faz o banner aparecer de novo.
 */
export function ConsentSettingsLink() {
  function reopen() {
    try {
      localStorage.removeItem("sc_consent");
    } catch {
      // sem persistência — nada a limpar.
    }
    location.reload();
  }

  return (
    <button
      type="button"
      onClick={reopen}
      className="cursor-pointer font-sans text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
    >
      Gerir cookies
    </button>
  );
}
