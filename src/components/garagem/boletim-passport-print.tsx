"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const DUCATI_RED = "#C41230";
const PASSPORT_GOLD = "#E3B337";

export type PassportTableRow = {
  date: string;
  km: string;
  service: string;
  parts: string;
  technician: string;
};

type Props = {
  className?: string;
  vehicleTitle: string;
  plate: string;
  vin: string;
  ownerName: string;
  bulletinRef: string;
  generatedLabel: string;
  tableRows: PassportTableRow[];
  totalRecords: number;
  notesLines: string[];
  nextServiceHeadline: string;
  recommendedLabel: string;
  /** Fotos do serviço (URLs assinadas) ou placeholders */
  antesSrc: string;
  depoisSrc: string;
};

const MAX_TABLE_ROWS = 9;

export function BoletimPassportPrint({
  className,
  vehicleTitle,
  plate,
  vin,
  ownerName,
  bulletinRef,
  generatedLabel,
  tableRows,
  totalRecords,
  notesLines,
  nextServiceHeadline,
  recommendedLabel,
  antesSrc,
  depoisSrc,
}: Props) {
  const [qrMain, setQrMain] = useState<string | null>(null);
  const [qrHist, setQrHist] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const url =
      typeof window !== "undefined" ? window.location.href : "";
    if (!url) return;

    import("qrcode")
      .then((QR) =>
        Promise.all([
          QR.toDataURL(url, {
            margin: 1,
            width: 200,
            color: { dark: "#111111", light: "#ffffff" },
          }),
          QR.toDataURL(url, {
            margin: 1,
            width: 120,
            color: { dark: "#111111", light: "#ffffff" },
          }),
        ]),
      )
      .then(([a, b]) => {
        if (!cancelled) {
          setQrMain(a);
          setQrHist(b);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrMain(null);
          setQrHist(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const rows = tableRows.slice(0, MAX_TABLE_ROWS);
  const overflow = totalRecords > MAX_TABLE_ROWS;

  return (
    <div
      className={cn(
        "boletim-passport-print text-black",
        "hidden print:block",
        className,
      )}
      aria-hidden
    >
      {/* Página 1 — Capa */}
      <section
        className="passport-sheet passport-sheet-break flex flex-col overflow-hidden bg-white"
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        <div
          className="relative flex min-h-[125mm] flex-col items-center justify-center px-8 pb-6 pt-10"
          style={{ backgroundColor: DUCATI_RED }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)",
              backgroundSize: "14px 14px",
            }}
          />
          <div className="relative z-10 text-center">
            <p className="font-heading text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Scuderia{" "}
              <span className="font-light italic text-white/95">it</span>
              <span className="font-black">TECH</span>
            </p>
            <h1
              className="mt-8 font-heading text-3xl font-black uppercase tracking-[0.18em] sm:text-[2.1rem]"
              style={{ color: PASSPORT_GOLD }}
            >
              Passaporte Ducati
            </h1>
            <p className="mt-4 text-xs font-medium tracking-[0.25em] text-white/90">
              — Serviço premium independente —
            </p>
            <p className="mx-auto mt-8 max-w-md text-center text-[11px] leading-relaxed text-white/85">
              {vehicleTitle}
              <br />
              <span className="text-white/70">
                {plate ? `Matrícula ${plate}` : "Matrícula —"} ·{" "}
                {vin ? `VIN ${vin}` : "VIN —"}
              </span>
            </p>
          </div>
        </div>

        <div
          className="relative h-14 w-full shrink-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, transparent 100%)",
          }}
        >
          <svg
            className="absolute bottom-0 left-0 w-full"
            viewBox="0 0 1200 64"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M0,32 C200,64 400,0 600,32 C800,64 1000,0 1200,32 L1200,64 L0,64 Z"
              fill="#009246"
            />
            <path
              d="M0,36 C200,68 400,4 600,36 C800,68 1000,4 1200,36 L1200,64 L0,64 Z"
              fill="#ffffff"
            />
            <path
              d="M0,40 C200,72 400,8 600,40 C800,72 1000,8 1200,40 L1200,64 L0,64 Z"
              fill="#CE2B37"
            />
          </svg>
        </div>

        <div className="passport-carbon flex flex-1 flex-col items-center justify-center px-8 pb-12 pt-6">
          {qrMain ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrMain}
              alt=""
              width={160}
              height={160}
              className="h-40 w-40 bg-white p-2"
            />
          ) : (
            <div className="h-40 w-40 border-2 border-dashed border-white/30 bg-white/5" />
          )}
          <p className="mt-4 font-heading text-[10px] font-bold uppercase tracking-[0.45em] text-white">
            Acesso digital
          </p>
          <p className="mt-6 font-mono text-[9px] text-white/45">{bulletinRef}</p>
          <p className="mt-1 text-[9px] text-white/40">Gerado em {generatedLabel}</p>
          <p className="mt-4 text-center text-[9px] text-white/50">
            {ownerName ? `Proprietário: ${ownerName}` : " "}
          </p>
        </div>
      </section>

      {/* Página 2 — Histórico */}
      <section
        className="passport-sheet passport-sheet-break flex flex-col bg-white"
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        <header
          className="flex items-center justify-between px-6 py-3"
          style={{ backgroundColor: DUCATI_RED }}
        >
          <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-white">
            Histórico de serviços
          </h2>
          <span className="text-[10px] font-medium text-white/80">{vehicleTitle}</span>
        </header>

        <div className="relative flex flex-1 flex-col px-5 pb-4 pt-4">
          <div
            className="absolute right-4 top-4 z-10 flex h-24 w-24 rotate-[-8deg] items-center justify-center rounded-full border-4 border-dashed p-2 text-center"
            style={{ borderColor: DUCATI_RED, color: DUCATI_RED }}
          >
            <span className="font-heading text-[9px] font-black uppercase leading-tight">
              Scuderia
              <br />
              itTECH
            </span>
          </div>

          <div className="overflow-x-auto pr-28">
            <table className="w-full border-collapse text-[8.5px] leading-tight">
              <thead>
                <tr className="border-b border-neutral-400 bg-neutral-100 text-left text-[7px] font-bold uppercase tracking-wide text-neutral-600">
                  <th className="border border-neutral-300 px-1.5 py-1.5">Data</th>
                  <th className="border border-neutral-300 px-1.5 py-1.5">Km</th>
                  <th className="border border-neutral-300 px-1.5 py-1.5">
                    Serviço
                  </th>
                  <th className="border border-neutral-300 px-1.5 py-1.5">
                    Peças / tarefas
                  </th>
                  <th className="border border-neutral-300 px-1.5 py-1.5">
                    Técnico
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      className="border border-neutral-300 px-1.5 py-2 text-neutral-500"
                      colSpan={5}
                    >
                      Sem intervenções registadas.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-white" : "bg-neutral-50"}
                    >
                      <td className="border border-neutral-300 px-1.5 py-1 font-medium text-neutral-800">
                        {row.date}
                      </td>
                      <td className="border border-neutral-300 px-1.5 py-1 text-neutral-600">
                        {row.km}
                      </td>
                      <td className="border border-neutral-300 px-1.5 py-1 font-semibold text-neutral-900">
                        {row.service}
                      </td>
                      <td className="max-w-[52mm] border border-neutral-300 px-1.5 py-1 text-neutral-700">
                        {row.parts}
                      </td>
                      <td className="border border-neutral-300 px-1.5 py-1 text-neutral-800">
                        {row.technician}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {overflow ? (
              <p className="mt-2 text-[8px] text-neutral-500">
                + {totalRecords - MAX_TABLE_ROWS} registo(s) adicional(is) — consulta
                o histórico online (QR).
              </p>
            ) : null}
          </div>

          <div className="mt-4 grid flex-1 grid-cols-2 gap-3">
            <div className="relative overflow-hidden rounded-md border border-neutral-300">
              <div className="absolute bottom-0 left-0 right-0 bg-black/75 py-1 text-center text-[8px] font-bold uppercase tracking-wider text-white">
                Antes
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={antesSrc}
                alt=""
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="relative overflow-hidden rounded-md border border-neutral-300">
              <div className="absolute bottom-0 left-0 right-0 bg-black/75 py-1 text-center text-[8px] font-bold uppercase tracking-wider text-white">
                Depois
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={depoisSrc}
                alt=""
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>

          <div className="mt-auto flex items-end justify-end gap-3 pt-3">
            {qrHist ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrHist} alt="" width={72} height={72} className="h-[72px] w-[72px]" />
            ) : null}
            <div className="pb-1 text-right">
              <p className="font-heading text-[8px] font-bold uppercase tracking-[0.2em] text-neutral-600">
                Histórico online
              </p>
              <p className="text-[7px] text-neutral-400">Digital · Scuderia itTECH</p>
            </div>
          </div>
        </div>
      </section>

      {/* Página 3 — Próxima revisão & notas */}
      <section
        className="passport-sheet flex flex-col bg-white"
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        <div className="passport-brushed px-6 py-4">
          <p className="font-heading text-[10px] font-bold uppercase tracking-[0.35em] text-white/90">
            Próxima revisão
          </p>
          <p className="mt-3 font-heading text-lg font-bold text-white">
            Manutenção preventiva Ducati
          </p>
        </div>

        <div
          className="px-6 py-3"
          style={{ backgroundColor: DUCATI_RED }}
        >
          <p className="text-center text-xs font-semibold text-white">
            {nextServiceHeadline}
          </p>
        </div>

        <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            Serviço recomendado
          </p>
          <div className="mt-3 inline-flex rounded-md border border-neutral-300 bg-neutral-200 px-6 py-2 shadow-inner">
            <span
              className="font-heading text-sm font-black uppercase tracking-wide"
              style={{ color: DUCATI_RED }}
            >
              {recommendedLabel}
            </span>
          </div>
          <p className="mt-4 max-w-prose text-[10px] leading-relaxed text-neutral-600">
            Agenda com a oficina para manter o programa de revisões e o desempenho
            nominal da tua unidade. A equipa Scuderia itTECH segue as referências
            Desmo e boas práticas de oficina independente.
          </p>
        </div>

        <div className="passport-notes flex flex-1 flex-col px-6 py-5">
          <div
            className="mb-4 inline-flex px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-widest text-white"
            style={{ backgroundColor: DUCATI_RED }}
          >
            Notas técnicas
          </div>
          {notesLines.length > 0 ? (
            <ul className="list-disc space-y-2 pl-5 text-[10px] leading-relaxed text-white/95 marker:text-white/70">
              {notesLines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          ) : (
            <p className="text-[10px] text-white/70">
              Sem notas adicionais neste documento. Para detalhe completo, consulta
              o boletim na garagem ou o QR de acesso digital.
            </p>
          )}
        </div>

        <footer className="mt-auto border-t border-white/10 px-6 py-5 text-center">
          <p className="font-heading text-lg font-semibold text-neutral-800">
            Scuderia <span className="italic font-light">it</span>
            <span className="font-black">TECH</span>
          </p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.25em] text-neutral-500">
            Serviço premium independente
          </p>
          <div
            className="mx-auto mt-4 flex h-1.5 max-w-xs overflow-hidden rounded-sm"
            aria-hidden
          >
            <div className="flex-1 bg-[#009246]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#CE2B37]" />
          </div>
        </footer>
      </section>
    </div>
  );
}
