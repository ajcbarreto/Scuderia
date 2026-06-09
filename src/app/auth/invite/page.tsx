import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { InviteActivateForm } from "@/components/auth/invite-activate-form";

export default function InvitePage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_55%)]"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 py-14 sm:px-6">
        <Link
          href="/"
          className="group mb-10 flex items-center gap-3 text-foreground transition-opacity hover:opacity-90"
          aria-label="Scuderia itTech"
        >
          <ArrowLeft className="size-4 shrink-0" />
          <BrandLogo size="md" priority />
        </Link>

        <div className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          <div className="px-8 pb-10 pt-9 sm:px-10">
            <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-primary">
              Convite
            </p>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              Área de Cliente
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Bem-vindo à Scuderia itTECH. Falta só definires a tua palavra-passe.
            </p>
            <div className="mt-9">
              <Suspense
                fallback={
                  <p className="text-sm text-muted-foreground">A carregar…</p>
                }
              >
                <InviteActivateForm />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
