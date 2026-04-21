import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createClient } from "@/lib/supabase/server";
import type { Motorcycle, ServiceRecord } from "@/types/database";

type RouteParams = { params: Promise<{ motorcycleId: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { motorcycleId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: mota } = await supabase
    .from("motorcycles")
    .select("*")
    .eq("id", motorcycleId)
    .maybeSingle();

  if (!mota) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const m = mota as Motorcycle;
  if (m.current_owner_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: records } = await supabase
    .from("service_records")
    .select("*")
    .eq("motorcycle_id", motorcycleId)
    .order("opened_at", { ascending: false });

  const recs = (records ?? []) as ServiceRecord[];

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([595.28, 841.89]);
  const { height } = page.getSize();
  let y = height - 48;

  const draw = (text: string, size: number, bold = false, color = rgb(0.1, 0.1, 0.1)) => {
    page.drawText(text, {
      x: 48,
      y,
      size,
      font: bold ? fontBold : font,
      color,
    });
    y -= size + 8;
    if (y < 72) {
      page = pdf.addPage([595.28, 841.89]);
      y = height - 48;
    }
  };

  draw("Scuderia itTECH — Livro de revisões digital", 14, true);
  draw(`${m.brand} ${m.model} · ${m.plate ?? "—"} · ${m.year ?? "—"}`, 11);
  y -= 8;
  draw("Registos de manutenção", 12, true);

  if (recs.length === 0) {
    draw("Sem intervenções registadas.", 10);
  } else {
    for (const r of recs) {
      const line = `${r.opened_at.slice(0, 10)} — ${r.title ?? "Manutenção"} — ${r.progress_percent}% — ${r.status}`;
      draw(line, 10);
    }
  }

  y -= 12;
  draw(
    "Documento gerado automaticamente. As faturas associadas a donos anteriores não são incluídas neste relatório.",
    8,
    false,
    rgb(0.4, 0.4, 0.4),
  );

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="livro-revisoes-${motorcycleId.slice(0, 8)}.pdf"`,
    },
  });
}
