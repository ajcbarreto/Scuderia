import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Bike, CheckCircle2 } from "lucide-react";
import { ContactForm } from "@/components/marketing/contact-form";
const EMPRESA_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBxhk8r0nqC7ZpGdhrDvI1h2VMR61BUDVgs87GrRp3wAeLzf2j7QX-YCaVL9kmWGi4oNkDhc14VeOVU-4hoquuafeaQvsdq-49Ncqf9wT7zSI8jIHKNdYtzmPp1LPsutMF1BYC4TOXonEJ5NQcEmRFD2tJLryMDqDeudk1nrz2NsOoa9jnCUbIa-XMAIjhFJWuLxBM_ctKzKG7xenDomGA3Jg_QHBtIuSnAVCYZg650AITpMlZ6sKsy0_INXgR9X0C5d9jWw_rpYUE";

export const metadata: Metadata = {
  title: "Scuderia itTech | Técnica, Precisão e Confiança",
  description:
    "Oficina independente dedicada à manutenção, reparação e comercialização de motociclos usados, com especial foco na marca Ducati.",
  openGraph: {
    title: "Scuderia itTech | Excelência em engenharia",
    description:
      "Manutenção, reparação e comercialização de motociclos usados. Área de cliente e acompanhamento do estado da sua moto.",
    locale: "pt_PT",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section
        id="top"
        className="relative flex h-screen w-full scroll-mt-24 items-center justify-start overflow-hidden"
      >
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="hero-vignette pointer-events-none absolute inset-0 z-10" />
          <Image
            src="/images/hero-oficina.jpg"
            alt="Oficina Scuderia itTech — moto desportiva vermelha, néon e ambiente high-tech"
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
        </div>
        <div className="relative z-20 max-w-4xl px-8 md:px-20">
          <div className="mb-6 flex items-center gap-4">
            <span className="h-px w-12 bg-primary" />
            <span className="font-heading text-sm font-semibold tracking-[0.32em] text-primary uppercase">
              Excelência em engenharia
            </span>
          </div>
          <h1 className="mb-10 font-heading text-6xl leading-[0.92] font-bold tracking-tight text-foreground md:text-7xl lg:text-8xl">
            Técnica.
            <br />
            Precisão.
            <br />
            Confiança.
          </h1>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/#servicos"
              className="flex items-center gap-3 rounded-md bg-primary px-8 py-4 font-heading font-semibold tracking-wide text-primary-foreground shadow-[0_12px_40px_color-mix(in_oklch,var(--primary)_35%,transparent)] transition-all hover:bg-primary/90 hover:shadow-[0_16px_48px_color-mix(in_oklch,var(--primary)_42%,transparent)] active:scale-95"
            >
              EXPLORAR SERVIÇOS
            </Link>
            <Link
              href="/#empresa"
              className="rounded-md border border-foreground/15 bg-background/75 px-8 py-4 font-heading font-semibold tracking-wide text-foreground shadow-sm backdrop-blur-md transition-all hover:border-foreground/25 hover:bg-background"
            >
              TOUR TÉCNICO
            </Link>
          </div>
        </div>
      </section>

      {/* Scuderia itTech */}
      <section
        id="empresa"
        className="technical-grid relative scroll-mt-24 overflow-hidden bg-card py-32"
      >
        <div className="mx-auto max-w-7xl px-8">
          <div className="grid items-center gap-20 md:grid-cols-2">
            <div className="relative">
              <h2 className="relative z-10 mb-8 font-heading text-5xl font-semibold tracking-tight text-foreground">
                Scuderia itTech
              </h2>
              <p className="mb-6 font-sans text-xl leading-relaxed text-muted-foreground">
                A Scuderia itTech é uma oficina independente dedicada à
                manutenção, reparação e comercialização de motociclos usados, com
                especial foco na marca Ducati.
              </p>
              <p className="mb-10 font-sans text-lg leading-relaxed text-muted-foreground/85">
                Fundada em 2026, ano do centenário da Ducati, a empresa nasce da
                paixão pelas motas e foi criada por profundo respeito pela
                história e pelo passado que moldaram o motociclismo.
              </p>
            </div>
            <div className="group relative">
              <div className="absolute inset-0 rounded-xl bg-primary/20 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-40" />
              <div className="relative aspect-square overflow-hidden rounded-xl border border-border/60">
                <Image
                  src={EMPRESA_IMG}
                  alt="Pormenor de engenharia — precisão mecânica"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-background to-transparent p-8">
                  <span className="font-heading text-xl font-semibold tracking-tight text-foreground uppercase">
                    Precisão de engenharia
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços — grelha tipo bento */}
      <section id="servicos" className="scroll-mt-24 bg-background py-32">
        <div className="mx-auto max-w-7xl px-8">
          <div className="mb-20 text-left">
            <h2 className="mb-4 font-heading text-4xl font-semibold tracking-tight text-foreground uppercase">
              Serviços
            </h2>
            <div className="mb-8 h-1 w-24 bg-primary" />
            <p className="mb-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              Na Scuderia itTech, disponibilizamos um conjunto de serviços
              especializados para garantir o desempenho, a fiabilidade e a
              segurança do seu motociclo.
            </p>
            <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
              Cada serviço é executado com profissionalismo e respeito por cada
              máquina, assegurando que a sua moto está pronta para a pilotar com
              total confiança.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div
              id="inventory"
              className="flex flex-col justify-center border-t border-l border-border/50 bg-card p-8 md:p-10"
            >
              <h3 className="mb-4 font-heading text-2xl font-semibold text-foreground md:text-3xl">
                Venda & Aconselhamento
              </h3>
              <p className="mb-6 text-muted-foreground">
                Encontramos a moto perfeita para o teu perfil de condução.
              </p>
              <div className="h-1 w-12 bg-primary" />
            </div>
            <div className="flex items-center justify-between border-t border-border/50 bg-card p-8 md:p-10">
              <div>
                <h3 className="mb-2 font-heading text-2xl font-semibold text-foreground md:text-3xl">
                  Aluguer Premium
                </h3>
                <p className="text-muted-foreground">
                  Experiências de condução exclusivas.
                </p>
              </div>
              <Bike
                className="size-14 shrink-0 text-muted-foreground/35"
                strokeWidth={1}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Área Cliente */}
      <section
        id="area-cliente"
        className="technical-grid relative scroll-mt-24 overflow-hidden bg-muted py-32"
      >
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.12] blur-[120px]" />
        <div className="relative z-10 mx-auto max-w-7xl px-8">
          <div className="flex flex-col items-center gap-16 rounded-2xl border border-border bg-card p-12 shadow-[0_32px_64px_-24px_color-mix(in_oklch,var(--foreground)_12%,transparent)] md:flex-row md:p-20">
            <div className="flex-1">
              <div className="mb-6 inline-block rounded-full border border-primary/25 bg-primary/10 px-4 py-1">
                <span className="font-heading text-xs font-semibold tracking-widest text-primary uppercase">
                  Tecnologia Exclusiva
                </span>
              </div>
              <h2 className="mb-8 font-heading text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                Área de Cliente
              </h2>
              <p className="mb-6 text-xl leading-relaxed text-muted-foreground">
                A Área de Cliente da Scuderia itTech foi criada para oferecer
                maior comodidade, transparência e acompanhamento do estado do seu
                motociclo.
              </p>
              <p className="mb-8 text-xl leading-relaxed text-muted-foreground">
                O nosso objetivo é proporcionar uma experiência simples, clara e
                profissional, mantendo-o sempre informado e com total confiança no
                trabalho realizado.
              </p>
              <ul className="space-y-4">
                {[
                  "Histórico Completo de Intervenções",
                  "Alertas de Próxima Manutenção",
                  "Galeria Técnica de Reparação",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-4 text-foreground">
                    <CheckCircle2
                      className="size-6 shrink-0 text-primary"
                      strokeWidth={1.5}
                    />
                    <span className="font-heading font-medium">{t}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="mt-12 inline-block rounded-md bg-primary px-10 py-4 font-heading font-semibold tracking-wide text-primary-foreground shadow-[0_12px_36px_color-mix(in_oklch,var(--primary)_30%,transparent)] transition-all hover:bg-primary/92"
              >
                ENTRAR NA ÁREA CLIENTE
              </Link>
            </div>
            <div className="w-full flex-1">
              <div className="scale-105 rotate-3 rounded-xl border border-border bg-muted/80 p-6 shadow-lg">
                <div className="mb-8 flex items-center justify-between">
                  <span className="font-heading text-sm font-bold tracking-widest opacity-50 uppercase">
                    Diagnóstico ativo
                  </span>
                  <span className="size-3 animate-pulse rounded-full bg-[#9df898]" />
                </div>
                <div className="space-y-6">
                  <div className="flex h-12 items-center rounded border-l-4 border-primary bg-muted px-4">
                    <span className="mr-4 font-heading text-xs opacity-50">
                      VIN:
                    </span>
                    <span className="font-heading font-bold">ZD12…9901</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 rounded bg-muted p-4">
                      <span className="font-heading text-[10px] tracking-widest opacity-50 uppercase">
                        Estado do motor
                      </span>
                      <div className="mt-1 text-xl font-bold text-[#9df898]">
                        OTIMIZADO
                      </div>
                    </div>
                    <div className="h-24 rounded bg-muted p-4">
                      <span className="font-heading text-[10px] tracking-widest opacity-50 uppercase">
                        Próxima Revisão
                      </span>
                      <div className="mt-1 text-xl font-bold">12 400 km</div>
                    </div>
                  </div>
                  <div className="rounded border border-border/50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-heading text-xs">Óleo e filtros</span>
                      <span className="font-heading text-xs text-primary">
                        98%
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-[98%] bg-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section
        id="contacto"
        className="scroll-mt-24 border-t border-border bg-card py-24 md:py-32"
      >
        <div className="mx-auto max-w-7xl px-8">
          <div className="mb-12 text-center md:mb-16">
            <h2 className="mb-4 font-heading text-4xl font-semibold tracking-tight text-foreground">
              Contacto
            </h2>
            <div className="mx-auto h-1 w-24 bg-primary" />
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Escreva-nos — respondemos o mais breve possível. Indique o assunto
              e, se for o caso, a sua moto ou a matrícula.
            </p>
          </div>
          <div className="mx-auto max-w-xl">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
