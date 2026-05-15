import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { getSessionUser } from "@/lib/auth";
import { SetPasswordForm } from "./set-password-form";

/**
 * Página de aterragem após o cliente clicar no link de convite. O
 * `/auth/callback` já trocou o token por sessão; aqui o utilizador define
 * a sua palavra-passe pela primeira vez e segue para a garagem.
 */
export default async function SetPasswordPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/onboarding/set-password");
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_55%),radial-gradient(ellipse_80%_50%_at_100%_20%,color-mix(in_oklch,var(--primary)_7%,transparent),transparent_50%)]"
        aria-hidden
      />
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 py-14 sm:px-6">
        <Link
          href="/"
          className="group mb-10 flex items-center gap-3 text-foreground transition-opacity hover:opacity-90"
          aria-label="Scuderia itTech"
        >
          <ArrowLeft className="size-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
          <BrandLogo size="md" priority />
        </Link>

        <div className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-card/95 shadow-[0_0_0_1px_color-mix(in_oklch,var(--foreground)_5%,transparent),0_24px_48px_-16px_color-mix(in_oklch,var(--foreground)_8%,transparent)] backdrop-blur-xl">
          <div
            className="h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-90"
            aria-hidden
          />
          <div className="px-8 pb-10 pt-9 sm:px-10">
            <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-primary">
              Bem-vindo
            </p>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-[2rem]">
              Define a palavra-passe
            </h1>
            <p className="mt-2 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
              É a palavra que vais usar nos próximos inícios de sessão. Escolhe algo com pelo
              menos 8 caracteres.
            </p>

            <div className="mt-9">
              <SetPasswordForm userEmail={user.email ?? null} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
