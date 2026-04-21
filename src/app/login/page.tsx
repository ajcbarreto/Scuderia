import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#080808]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,rgba(232,15,22,0.18),transparent_55%),radial-gradient(ellipse_80%_50%_at_100%_20%,rgba(232,15,22,0.06),transparent_50%),radial-gradient(ellipse_60%_40%_at_0%_80%,rgba(255,255,255,0.03),transparent_45%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.2),rgba(0,0,0,0.65))]"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 py-14 sm:px-6">
        <Link
          href="/"
          className="group mb-10 flex items-center gap-2 font-heading text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Scuderia <span className="text-primary">itTECH</span>
        </Link>

        <div className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#1a1a1a]/95 to-[#141414]/90 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_25px_50px_-12px_rgba(0,0,0,0.65)] backdrop-blur-xl">
          <div
            className="h-[3px] bg-gradient-to-r from-transparent via-[#e80f16] to-transparent opacity-90"
            aria-hidden
          />
          <div className="px-8 pb-10 pt-9 sm:px-10">
            <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#e80f16]">
              Área reservada
            </p>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-[2rem]">
              Bem-vindo de volta
            </h1>
            <p className="mt-2 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
              Acede à tua garagem, ao histórico de manutenção e ao estado das
              revisões.
            </p>

            <div className="mt-9">
              <Suspense
                fallback={
                  <p className="text-sm text-muted-foreground">A carregar…</p>
                }
              >
                <LoginForm />
              </Suspense>
            </div>
          </div>
        </div>

        <p className="mt-10 max-w-sm text-center text-xs leading-relaxed text-muted-foreground/90">
          Precisas de uma conta? Fala com a oficina — o registo é feito pela
          equipa Scuderia.
        </p>
      </div>
    </div>
  );
}
