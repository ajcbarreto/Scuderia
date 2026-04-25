import { NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(200),
  email: z
    .string()
    .trim()
    .email("Email inválido")
    .max(320),
  phone: z
    .string()
    .max(40)
    .default("")
    .transform((s) => s.trim() || undefined),
  message: z.string().trim().min(1, "Mensagem é obrigatória").max(10000),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Formato de pedido inválido" },
      { status: 400 },
    );
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Dados inválidos" },
      { status: 400 },
    );
  }

  const { name, email, phone, message } = parsed.data;
  const resendKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.RESEND_FROM;

  if (resendKey && to && from) {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `Contacto Scuderia itTech — ${name}`,
        reply_to: email,
        text: `Nome: ${name}\nEmail: ${email}\nTelefone: ${phone ?? "—"}\n\nMensagem:\n${message}\n`,
      }),
    });
    if (!r.ok) {
      const errText = await r.text();
      if (process.env.NODE_ENV === "development") {
        console.error("[contact] Resend", r.status, errText);
      }
      return NextResponse.json(
        { error: "Não foi possível enviar a mensagem. Tente mais tarde." },
        { status: 502 },
      );
    }
  } else if (process.env.NODE_ENV === "development") {
    console.log("[contact] (sem Resend) ", { name, email, phone, message });
  }

  return NextResponse.json({
    ok: true,
    delivered: Boolean(resendKey && to && from),
  } as const);
}
