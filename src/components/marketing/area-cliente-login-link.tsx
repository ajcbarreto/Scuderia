"use client";

import { PendingLink } from "@/components/ui/pending-link";

export function AreaClienteLoginLink() {
  return (
    <PendingLink
      href="/login"
      pendingText="A abrir…"
      className="mt-12 inline-flex items-center gap-2 rounded-md bg-primary px-10 py-4 font-heading font-semibold tracking-wide text-primary-foreground shadow-[0_12px_36px_color-mix(in_oklch,var(--primary)_30%,transparent)] transition-all hover:bg-primary/92"
    >
      ENTRAR NA ÁREA CLIENTE
    </PendingLink>
  );
}
