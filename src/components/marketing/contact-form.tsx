"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const wa = process.env.NEXT_PUBLIC_WHATSAPP_URL;

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const [suggestWhatsapp, setSuggestWhatsapp] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setFeedback("");
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as { error?: string; ok?: boolean; delivered?: boolean };
      if (!res.ok) {
        setStatus("error");
        setFeedback(json.error ?? "Não foi possível enviar. Tente novamente.");
        return;
      }
      setStatus("success");
      setSuggestWhatsapp(!json.delivered);
      setFeedback(
        json.delivered
          ? "Obrigado! Recebemos a sua mensagem e responderemos o mais breve possível."
          : "Obrigado! Responderemos em breve. Para assuntos urgentes, use o WhatsApp.",
      );
      form.reset();
    } catch {
      setStatus("error");
      setFeedback("Erro de ligação. Tente de novo em instantes.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {status === "success" && (
        <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
          <p>{feedback}</p>
          {suggestWhatsapp && wa && (
            <p>
              <Link
                href={wa}
                className="font-medium text-primary underline-offset-2 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir WhatsApp
              </Link>
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setStatus("idle");
              setFeedback("");
              setSuggestWhatsapp(false);
            }}
          >
            Enviar nova mensagem
          </Button>
        </div>
      )}

      {status === "error" && (
        <p className="text-sm text-destructive" role="alert">
          {feedback}
        </p>
      )}

      {status !== "success" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="contact-name">Nome</Label>
            <Input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="min-h-9"
              disabled={status === "submitting"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-email">Email</Label>
            <Input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="min-h-9"
              disabled={status === "submitting"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-phone">Telefone (opcional)</Label>
            <Input
              id="contact-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              className="min-h-9"
              disabled={status === "submitting"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-message">Mensagem</Label>
            <Textarea
              id="contact-message"
              name="message"
              required
              rows={5}
              className="min-h-32"
              disabled={status === "submitting"}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full font-heading font-semibold tracking-wide sm:w-auto"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "A enviar…" : "Enviar mensagem"}
          </Button>
        </>
      )}
    </form>
  );
}
