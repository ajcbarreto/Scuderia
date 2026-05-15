import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { createClient } from "@/lib/supabase/server";
import {
  formatBoletimDisplayDate,
  formatNextServiceSummary,
  formatOdometerKm,
  formatRepairOrderRef,
  formatRevisionAndTitle,
} from "@/lib/garagem/service-record-display";
import type { Motorcycle, ServiceRecord, ServiceTask } from "@/types/database";

export const dynamic = "force-dynamic";

const DUCATI_RED = rgb(0.77, 0.07, 0.19);
const INK = rgb(0.1, 0.1, 0.11);
const MUTED = rgb(0.42, 0.42, 0.45);
const HAIRLINE = rgb(0.85, 0.85, 0.87);

/** WinAnsi (fontes standard pdf-lib) não cobre alguns chars; normaliza-os. */
function ascii(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/ /g, " ");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ recordId: string }> },
) {
  const { recordId } = await params;
  const supabase = await createClient();

  // RLS garante que só o admin ou o dono atual da mota lê este registo.
  const { data: recordData } = await supabase
    .from("service_records")
    .select("*")
    .eq("id", recordId)
    .maybeSingle();

  if (!recordData) {
    return NextResponse.json({ error: "Boletim não encontrado." }, { status: 404 });
  }
  const record = recordData as ServiceRecord;

  const [{ data: motoData }, { data: taskData }] = await Promise.all([
    supabase
      .from("motorcycles")
      .select("*")
      .eq("id", record.motorcycle_id)
      .maybeSingle(),
    supabase
      .from("service_tasks")
      .select("*")
      .eq("service_record_id", recordId)
      .order("sort_order", { ascending: true }),
  ]);

  if (!motoData) {
    return NextResponse.json({ error: "Mota não encontrada." }, { status: 404 });
  }
  const moto = motoData as Motorcycle;
  const tasks = (taskData ?? []) as ServiceTask[];
  const doneTasks = tasks.filter((t) => t.completed);

  // --- Construção do PDF -----------------------------------------------------
  const pdf = await PDFDocument.create();
  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const margin = 56;
  let y = height - margin;

  function ensureSpace(needed: number) {
    if (y - needed < margin) {
      page = pdf.addPage([595.28, 841.89]);
      y = height - margin;
    }
  }

  function text(
    value: string,
    opts: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; x?: number } = {},
  ) {
    const size = opts.size ?? 10;
    const font = opts.font ?? helv;
    page.drawText(ascii(value), {
      x: opts.x ?? margin,
      y,
      size,
      font,
      color: opts.color ?? INK,
    });
  }

  function hr() {
    page.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: 0.75,
      color: HAIRLINE,
    });
  }

  /** Par etiqueta/valor numa grelha de 2 colunas. */
  function pair(
    label: string,
    value: string,
    col: 0 | 1,
    rowTop: number,
  ): PDFPage {
    const colX = col === 0 ? margin : width / 2 + 8;
    page.drawText(ascii(label.toUpperCase()), {
      x: colX,
      y: rowTop,
      size: 7,
      font: helvBold,
      color: MUTED,
    });
    page.drawText(ascii(value), {
      x: colX,
      y: rowTop - 14,
      size: 11,
      font: helv,
      color: INK,
    });
    return page;
  }

  // Cabeçalho
  page.drawRectangle({
    x: 0,
    y: height - 6,
    width,
    height: 6,
    color: DUCATI_RED,
  });
  text("SCUDERIA itTECH", { size: 9, font: helvBold, color: DUCATI_RED });
  y -= 26;
  text("Boletim de Manutenção", { size: 22, font: helvBold });
  y -= 16;
  const refCompact = record.id.replace(/-/g, "").slice(0, 6).toUpperCase();
  const refYear = new Date(record.opened_at).getFullYear();
  text(`Ref. #SLT-${refCompact}-${refYear}`, { size: 9, color: MUTED });
  page.drawText(
    ascii(
      `Gerado: ${new Date().toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}`,
    ),
    {
      x: width - margin - 160,
      y,
      size: 9,
      font: helv,
      color: MUTED,
    },
  );
  y -= 16;
  hr();
  y -= 28;

  // Veículo
  text("VEÍCULO", { size: 8, font: helvBold, color: DUCATI_RED });
  y -= 18;
  text(`${moto.brand} ${moto.model}`, { size: 16, font: helvBold });
  y -= 26;
  pair("Ano", moto.year != null ? String(moto.year) : "—", 0, y);
  pair("Matrícula", moto.plate ?? "—", 1, y);
  y -= 38;
  pair("VIN", moto.vin ?? "—", 0, y);
  pair("Quilometragem", formatOdometerKm(record), 1, y);
  y -= 44;
  hr();
  y -= 26;

  // Intervenção
  text("INTERVENÇÃO", { size: 8, font: helvBold, color: DUCATI_RED });
  y -= 18;
  text(formatRevisionAndTitle(record), { size: 13, font: helvBold });
  y -= 24;
  pair("Data do serviço", formatBoletimDisplayDate(record), 0, y);
  pair("Ordem de reparação", formatRepairOrderRef(record), 1, y);
  y -= 38;
  const statusPt: Record<ServiceRecord["status"], string> = {
    draft: "Rascunho",
    in_progress: "Em curso",
    completed: "Concluído",
    cancelled: "Cancelado",
  };
  pair("Estado", statusPt[record.status], 0, y);
  pair(
    "Próxima revisão",
    formatNextServiceSummary(record) ?? "Não planeada",
    1,
    y,
  );
  y -= 44;
  hr();
  y -= 26;

  // Tarefas concluídas
  text("TRABALHO REALIZADO", { size: 8, font: helvBold, color: DUCATI_RED });
  y -= 20;
  if (doneTasks.length === 0) {
    text("Sem tarefas concluídas registadas neste boletim.", {
      size: 10,
      color: MUTED,
    });
    y -= 18;
  } else {
    for (const task of doneTasks) {
      ensureSpace(20);
      page.drawCircle({
        x: margin + 3,
        y: y + 3,
        size: 3,
        color: DUCATI_RED,
      });
      text(task.label, { size: 10, x: margin + 14 });
      y -= 18;
    }
  }
  y -= 10;

  // Notas da oficina
  const notes = record.shop_notes?.trim();
  if (notes) {
    ensureSpace(60);
    hr();
    y -= 24;
    text("NOTAS DA OFICINA", { size: 8, font: helvBold, color: DUCATI_RED });
    y -= 18;
    // Quebra de linhas simples por largura.
    const maxWidth = width - margin * 2;
    for (const rawLine of notes.split("\n")) {
      const words = ascii(rawLine).split(/\s+/);
      let line = "";
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (helv.widthOfTextAtSize(test, 10) > maxWidth && line) {
          ensureSpace(16);
          text(line, { size: 10, color: rgb(0.25, 0.25, 0.27) });
          y -= 15;
          line = word;
        } else {
          line = test;
        }
      }
      ensureSpace(16);
      text(line, { size: 10, color: rgb(0.25, 0.25, 0.27) });
      y -= 15;
    }
  }

  // Rodapé
  const footerY = margin - 18;
  page.drawText(
    ascii("Documento gerado pela garagem digital Scuderia itTech."),
    { x: margin, y: footerY, size: 8, font: helv, color: MUTED },
  );

  const bytes = await pdf.save();
  const fileName = `boletim-${moto.brand}-${moto.model}-${refCompact}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
