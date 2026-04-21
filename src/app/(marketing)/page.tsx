import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BarChart3,
  Bike,
  CheckCircle2,
  RefreshCw,
  Wrench,
} from "lucide-react";
/* Hero com branding SCUDERIA / ItTech no cenário — export Stitch */
const HERO_MAIN =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD22sl-i1KuhGMMALc08T-7SQuk3bgT-F28_db0A6IKeS3wtpe1w7TouhE-2ghJplZPCMT-BMmOqzDs2NJcmQzmKWrP_bQIggFKo8uF8701vRAtlRWgd4jLqqQSKkVMQNQCvT_edepFyscHVLOFscSWexCi6RaVG7AUNdI3KiaSqzq6sTRVUfM6Ru4735Ugfjl8YN4m6aqlfBOfJ8bISOdiKWL2hyvfTF2s1OrB5zMfm4Q-7j-sFPznDscUdjvaWoRxkQpDeYFJXfw";

const HERO_ENGINE =
  "https://lh3.googleusercontent.com/aida/ADBb0ujZLCMjlUnb8j4xrf1g2zEdD8G7URde8-dFtZiIxMR46XGtv4bzvHYxw0jI8_jM9zoABi02LX7-kQmBKfFU9u2clb-HcnLlln-xwD2hzFNdIQOAnfx2LTr8jkECnEHQUDhwvosOZxkXRgobyZeZy8ysAp28Mvm10ANQc351-3DxuXCALNMhCooj0rF96VJOSYWsIho8_OOZDhir5EL5z2CvN20ey-uOUt7UDHqiGfhwKaNm2Jp8VYbIqqU";

const EMPRESA_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBxhk8r0nqC7ZpGdhrDvI1h2VMR61BUDVgs87GrRp3wAeLzf2j7QX-YCaVL9kmWGi4oNkDhc14VeOVU-4hoquuafeaQvsdq-49Ncqf9wT7zSI8jIHKNdYtzmPp1LPsutMF1BYC4TOXonEJ5NQcEmRFD2tJLryMDqDeudk1nrz2NsOoa9jnCUbIa-XMAIjhFJWuLxBM_ctKzKG7xenDomGA3Jg_QHBtIuSnAVCYZg650AITpMlZ6sKsy0_INXgR9X0C5d9jWw_rpYUE";

export const metadata: Metadata = {
  title: "Scuderia ITTECH | Técnica, Precisão e Confiança",
  description:
    "Oficina independente especializada em motos premium. Onde a alma da tua máquina encontra o rigor da engenharia.",
  openGraph: {
    title: "Scuderia ITTECH | Excelência em engenharia",
    description:
      "Manutenção, diagnóstico digital e boletim de manutenção digital.",
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
        className="relative flex h-screen w-full items-center justify-start overflow-hidden"
      >
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#0e0e0e] via-[#0e0e0e]/40 to-transparent" />
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent" />
          <Image
            src={HERO_MAIN}
            alt="Oficina high-tech com branding Scuderia ITTECH — ambiente premium"
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
          <Image
            src={HERO_ENGINE}
            alt=""
            fill
            className="pointer-events-none object-cover mix-blend-screen opacity-0 md:opacity-[0.35]"
            sizes="100vw"
            aria-hidden
          />
        </div>
        <div className="relative z-20 max-w-4xl px-8 md:px-20">
          <div className="mb-6 flex items-center gap-4">
            <span className="h-px w-12 bg-[#e80f16]" />
            <span className="font-heading text-sm font-bold tracking-[0.3em] text-[#e80f16] uppercase">
              Excelência em engenharia
            </span>
          </div>
          <h1 className="mb-6 font-heading text-6xl leading-none font-black tracking-tighter text-white md:text-7xl lg:text-8xl">
            Técnica.
            <br />
            Precisão.
            <br />
            Confiança.
          </h1>
          <p className="mb-10 max-w-xl font-sans text-xl leading-relaxed text-[#adaaaa] md:text-2xl">
            Oficina independente especializada em motos premium. Onde a alma da
            tua máquina encontra o rigor da engenharia.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/#servicos"
              className="flex items-center gap-3 rounded-md bg-[#e80f16] px-8 py-4 font-heading font-bold text-white transition-all hover:bg-white hover:text-black active:scale-95"
            >
              EXPLORAR SERVIÇOS
            </Link>
            <Link
              href="/#empresa"
              className="rounded-md border border-[#484847]/40 bg-white/5 px-8 py-4 font-heading font-bold text-white backdrop-blur-md transition-all hover:bg-white/10"
            >
              TOUR TÉCNICO
            </Link>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 opacity-50">
          <span className="font-heading text-[10px] tracking-[0.5em] uppercase">
            Desliza para descobrir
          </span>
          <div className="h-12 w-px animate-pulse bg-gradient-to-b from-[#e80f16] to-transparent" />
        </div>
      </section>

      {/* A Empresa */}
      <section
        id="empresa"
        className="technical-grid relative overflow-hidden bg-[#131313] py-32"
      >
        <div className="mx-auto max-w-7xl px-8">
          <div className="grid items-center gap-20 md:grid-cols-2">
            <div className="relative">
              <div className="pointer-events-none absolute -top-10 -left-10 font-heading text-[12rem] leading-none font-black text-[#e80f16]/10 select-none">
                16
              </div>
              <h2 className="relative z-10 mb-8 font-heading text-5xl font-bold text-white">
                A Empresa
              </h2>
              <p className="mb-6 font-sans text-xl leading-relaxed text-[#adaaaa]">
                Cuidamos da tua moto com rigor. Na Scuderia ITTECH, a manutenção
                não é apenas um serviço; é um compromisso com a performance.
              </p>
              <p className="mb-10 font-sans text-lg text-[#adaaaa]/80">
                Com mais de 16 anos de paixão e especialização técnica,
                tornámo-nos o santuário para entusiastas que exigem o melhor das
                suas máquinas. Cada parafuso, cada diagnóstico, cada afinação é
                executada com a precisão de uma equipa de competição.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div className="border-l-2 border-[#e80f16] pl-6">
                  <div className="font-heading text-3xl font-bold text-white">
                    16 Anos
                  </div>
                  <div className="font-heading text-sm tracking-widest text-[#adaaaa] uppercase">
                    Experiência
                  </div>
                </div>
                <div className="border-l-2 border-[#e80f16] pl-6">
                  <div className="font-heading text-3xl font-bold text-white">
                    4500+
                  </div>
                  <div className="font-heading text-sm tracking-widest text-[#adaaaa] uppercase">
                    Motos Assistidas
                  </div>
                </div>
              </div>
            </div>
            <div className="group relative">
              <div className="absolute inset-0 rounded-xl bg-[#e80f16]/20 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-40" />
              <div className="relative aspect-square overflow-hidden rounded-xl border border-[#484847]/20">
                <Image
                  src={EMPRESA_IMG}
                  alt="Pormenor de engenharia — precisão mecânica"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-[#0e0e0e] to-transparent p-8">
                  <span className="font-heading text-xl font-black tracking-tighter text-white uppercase">
                    Precisão de engenharia
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços — grelha tipo bento */}
      <section id="servicos" className="bg-[#0e0e0e] py-32">
        <div className="mx-auto max-w-7xl px-8">
          <div className="mb-20 text-center">
            <h2 className="mb-4 font-heading text-4xl font-black tracking-tight text-white uppercase">
              Serviços Especializados
            </h2>
            <div className="mx-auto h-1 w-24 bg-[#e80f16]" />
          </div>
          <div className="grid h-auto gap-6 md:h-[700px] md:grid-cols-12">
            <div className="group flex flex-col justify-between border-t border-l border-[#484847]/20 bg-[#1a1a1a] p-10 transition-colors hover:bg-[#20201f] md:col-span-6 lg:col-span-7">
              <div>
                <Wrench
                  className="mb-6 size-14 text-[#e80f16]"
                  strokeWidth={1.25}
                />
                <h3 className="mb-4 font-heading text-3xl font-bold text-white">
                  Manutenção Geral
                </h3>
                <p className="max-w-md text-[#adaaaa]">
                  Serviços preventivos e corretivos realizados sob os mais
                  restritos padrões de qualidade internacional.
                </p>
              </div>
              <Link
                href="/#servicos"
                className="mt-8 flex items-center gap-4 font-heading font-bold tracking-widest text-[#e80f16] transition-all group-hover:gap-6"
              >
                SABER MAIS <ArrowRight className="size-5" />
              </Link>
            </div>
            <div className="grid grid-rows-2 gap-6 md:col-span-6 lg:col-span-5">
              <div className="flex items-center gap-6 border-t border-[#484847]/20 bg-[#20201f] p-8 transition-all hover:bg-[#2c2c2c]">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#0e0e0e] shadow-inner">
                  <BarChart3 className="size-8 text-[#ff8e80]" />
                </div>
                <div>
                  <h4 className="font-heading text-xl font-bold text-white">
                    Diagnóstico Digital
                  </h4>
                  <p className="text-sm text-[#adaaaa]">
                    Sistemas avançados de leitura de telemetria e erros.
                  </p>
                </div>
              </div>
              <div
                id="pista"
                className="flex items-center gap-6 border-t border-[#484847]/20 bg-[#20201f] p-8 transition-all hover:bg-[#2c2c2c]"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#0e0e0e] shadow-inner">
                  <RefreshCw className="size-8 text-[#ff8e80]" />
                </div>
                <div>
                  <h4 className="font-heading text-xl font-bold text-white">
                    Reparação Profunda
                  </h4>
                  <p className="text-sm text-[#adaaaa]">
                    Reconstrução de motores e componentes estruturais.
                  </p>
                </div>
              </div>
            </div>
            <div
              id="inventory"
              className="flex flex-col justify-center border-t border-[#484847]/20 bg-[#131313] p-8 md:col-span-6"
            >
              <h4 className="mb-4 font-heading text-2xl font-bold text-white">
                Venda & Aconselhamento
              </h4>
              <p className="mb-6 text-[#adaaaa]">
                Encontramos a moto perfeita para o teu perfil de condução.
              </p>
              <div className="h-1 w-12 bg-[#e80f16]" />
            </div>
            <div className="flex items-center justify-between border-t border-[#484847]/20 bg-[#1a1a1a] p-8 md:col-span-6">
              <div>
                <h4 className="font-heading text-2xl font-bold text-white">
                  Aluguer Premium
                </h4>
                <p className="text-[#adaaaa]">
                  Experiências de condução exclusivas.
                </p>
              </div>
              <Bike className="size-14 text-[#484847]/40" strokeWidth={1} />
            </div>
          </div>
        </div>
      </section>

      {/* Área Cliente */}
      <section
        id="area-cliente"
        className="relative overflow-hidden bg-[#000000] py-32"
      >
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e80f16]/5 blur-[120px]" />
        <div className="relative z-10 mx-auto max-w-7xl px-8">
          <div className="flex flex-col items-center gap-16 rounded-2xl border border-[#484847]/10 bg-[#1a1a1a] p-12 shadow-2xl md:flex-row md:p-20">
            <div className="flex-1">
              <div className="mb-6 inline-block rounded-full border border-[#e80f16]/20 bg-[#e80f16]/10 px-4 py-1">
                <span className="font-heading text-xs font-bold tracking-widest text-[#e80f16] uppercase">
                  Tecnologia Exclusiva
                </span>
              </div>
              <h2 className="mb-8 font-heading text-4xl font-black text-white md:text-5xl">
                Área Cliente
              </h2>
              <p className="mb-8 text-xl leading-relaxed text-[#adaaaa]">
                Acede ao teu{" "}
                <strong className="text-white">boletim de manutenção</strong>{" "}
                digital e acompanha todo o histórico da tua moto em tempo real.
                Fotos, diagnósticos e faturas — tudo num só lugar.
              </p>
              <ul className="space-y-4">
                {[
                  "Histórico Completo de Intervenções",
                  "Alertas de Próxima Manutenção",
                  "Galeria Técnica de Reparação",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-4 text-white">
                    <CheckCircle2
                      className="size-6 shrink-0 text-[#e80f16]"
                      strokeWidth={1.5}
                    />
                    <span className="font-heading font-medium">{t}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="mt-12 inline-block rounded-md bg-white px-10 py-4 font-heading font-black text-black transition-all hover:bg-[#e80f16] hover:text-white"
              >
                ENTRAR NA ÁREA CLIENTE
              </Link>
            </div>
            <div className="w-full flex-1">
              <div className="scale-105 rotate-3 rounded-xl border border-[#484847]/20 bg-[#0e0e0e] p-6 shadow-2xl">
                <div className="mb-8 flex items-center justify-between">
                  <span className="font-heading text-sm font-bold tracking-widest opacity-50 uppercase">
                    Diagnóstico ativo
                  </span>
                  <span className="size-3 animate-pulse rounded-full bg-[#9df898]" />
                </div>
                <div className="space-y-6">
                  <div className="flex h-12 items-center rounded border-l-4 border-[#e80f16] bg-[#262626] px-4">
                    <span className="mr-4 font-heading text-xs opacity-50">
                      VIN:
                    </span>
                    <span className="font-heading font-bold">ZD12…9901</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 rounded bg-[#262626] p-4">
                      <span className="font-heading text-[10px] tracking-widest opacity-50 uppercase">
                        Estado do motor
                      </span>
                      <div className="mt-1 text-xl font-bold text-[#9df898]">
                        OTIMIZADO
                      </div>
                    </div>
                    <div className="h-24 rounded bg-[#262626] p-4">
                      <span className="font-heading text-[10px] tracking-widest opacity-50 uppercase">
                        Próxima Revisão
                      </span>
                      <div className="mt-1 text-xl font-bold">12 400 km</div>
                    </div>
                  </div>
                  <div className="rounded border border-[#484847]/20 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-heading text-xs">Óleo e filtros</span>
                      <span className="font-heading text-xs text-[#e80f16]">
                        98%
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-[#262626]">
                      <div className="h-full w-[98%] bg-[#e80f16]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
