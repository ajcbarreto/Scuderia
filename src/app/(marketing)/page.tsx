import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  MessageCircle,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { LandingLoginForm } from "@/components/marketing/landing-login-form";

const HERO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDN9gVlqZUhR6CeBEctXlkn0n4hdGSEPViQ3X0sxk8s-wMP4RwlNJNITU5AeVfOMdtfHRZn--fnLgpOHmtqxavNyvt6YyjzHZIm5Fk9OV2kXBp1n55dwmnWfJyIG5VxErL61pBJ3YqhS65yjdeiQAbEaD5CHFHUNSoeISsBD0XTpWl2XQs1Dyh9rAsn32MVv2L56jE41BbK5GHpAlAiyb6VuE3PKQHOMiwPKkylbvj61kdScBR7m5HTLSUQpyA_3I41_CLr8mQ3Tyg";

const EMPRESA_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC2162ITm0JV84qaGahWeg7H4sdzOH67XGdU3sBPgERenml3BLMBPi5bI9MVloygGp_0cKzHdyX5B1fnvMRPn1ubUQds5-PRi0GcOPsGNT19dRiDZnFtlVY-B5opCNLxumfX0PchChYSTgb_LEFH68KSep0WLQiJu9nxOYvalmpqBQrZ42pu550jjvkcBod0_gLB7wHZNFI0TsBeHiHIojSKjkKH6P2_hO9dIQt4OzIGNUZoTc85lnesL10cxHISCtZJD4YK4owKW4";

const whatsappHref =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ??
  "https://wa.me/?text=Ol%C3%A1%20Scuderia%20itTECH";

export const metadata: Metadata = {
  title: "Scuderia itTECH | Engenharia & Precisão Ducati",
  description:
    "Oficina independente especializada em Ducati usadas. Performance italiana elevada ao próximo nível técnico.",
  openGraph: {
    title: "Scuderia itTECH | Engenharia & Precisão Ducati",
    description:
      "Oficina independente especializada em Ducati usadas. Performance italiana elevada ao próximo nível técnico.",
    locale: "pt_PT",
    type: "website",
  },
};

const servicos = [
  {
    title: "Revisões Periódicas",
    sub: "Manutenção rigorosa conforme o plano de fábrica.",
  },
  {
    title: "Diagnóstico Eletrónico",
    sub: "Leitura e calibração de sistemas avançados.",
  },
  {
    title: "Preparação Técnica",
    sub: "Otimização de performance e suspensões.",
  },
  {
    title: "Venda de Motos Selecionadas",
    sub: "Ducatis usadas certificadas pela nossa equipa.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="technical-grid relative flex min-h-screen items-center justify-center overflow-hidden pt-8">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-[#0e0e0e]/60 to-[#0e0e0e]" />
          <Image
            src={HERO_IMG}
            alt="Oficina Ducati — ambiente técnico profissional"
            fill
            className="object-cover opacity-40"
            sizes="100vw"
            priority
          />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <h1 className="mb-6 font-heading text-5xl font-bold uppercase tracking-tighter text-white md:text-7xl lg:text-8xl">
            Engenharia.
            <br />
            <span className="text-[#e80f16]">Precisão.</span> Confiança.
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-xl font-light text-[#adaaaa] md:text-2xl">
            Oficina independente especializada em Ducati usadas. Performance
            italiana elevada ao próximo nível técnico.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-md bg-[#0b6b1d] px-8 py-4 text-sm font-bold text-[#004b0f] shadow-lg shadow-green-900/20 transition-all hover:bg-[#0d7a22] hover:shadow-lg hover:shadow-[#9df898]/20"
            >
              <MessageCircle className="size-5" strokeWidth={2} />
              Marcar Serviço via WhatsApp
            </a>
            <Link
              href="/#empresa"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className:
                  "border-[#484847]/40 bg-transparent font-bold text-white hover:bg-white/5",
              })}
            >
              Explorar Oficina
            </Link>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 animate-bounce opacity-40">
          <ChevronDown className="size-8" aria-hidden />
        </div>
      </section>

      {/* Bento */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Empresa */}
          <div
            id="empresa"
            className="group flex flex-col overflow-hidden rounded-xl bg-[#1a1a1a] lg:col-span-4"
          >
            <div className="relative h-64 overflow-hidden">
              <Image
                src={EMPRESA_IMG}
                alt="Showroom Ducati"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>
            <div className="flex flex-1 flex-col justify-between p-8">
              <div>
                <h2 className="mb-4 font-heading text-2xl font-bold uppercase tracking-tight">
                  A Empresa
                </h2>
                <p className="mb-6 text-sm leading-relaxed text-[#adaaaa]">
                  Nascida da paixão pela excelência mecânica de Borgo Panigale. A
                  nossa Scuderia é o santuário para a sua Ducati, onde cada
                  parafuso é tratado com o rigor de competição.
                </p>
              </div>
              <Link
                href="/register"
                className="group/btn flex items-center gap-2 self-start font-bold text-[#e80f16]"
              >
                Saiba Mais
                <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Serviços */}
          <div
            id="servicos"
            className="flex flex-col rounded-xl bg-[#1a1a1a] p-8 lg:col-span-4"
          >
            <h2 className="mb-8 font-heading text-2xl font-bold uppercase tracking-tight">
              Os Nossos Serviços
            </h2>
            <ul className="flex-1 space-y-6">
              {servicos.map((s) => (
                <li key={s.title} className="flex items-start gap-4">
                  <CheckCircle2
                    className="mt-0.5 size-6 shrink-0 fill-[#e80f16] text-[#e80f16]"
                    strokeWidth={1.5}
                  />
                  <div>
                    <span className="block font-bold">{s.title}</span>
                    <span className="text-xs text-[#adaaaa]">{s.sub}</span>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              href="/#servicos"
              className="mt-8 rounded-md border border-[#484847]/40 py-3 text-center text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-white/5"
            >
              Ver Serviços
            </Link>
          </div>

          {/* Área cliente — login */}
          <div id="area-cliente" className="lg:col-span-4">
            <LandingLoginForm />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/5 bg-black">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4 md:px-8">
          {[
            { v: "15+", l: "Anos de Experiência" },
            { v: "2.4k", l: "Ducatis Assistidas" },
            { v: "100%", l: "Peças Originais" },
            { v: "05", l: "Especialistas Master" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <span className="mb-1 block font-heading text-3xl font-bold text-[#e80f16]">
                {s.v}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#adaaaa]">
                {s.l}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
