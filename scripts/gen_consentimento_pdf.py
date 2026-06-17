#!/usr/bin/env python3
"""Gera o PDF de consentimento RGPD para os clientes assinarem.

Uso: python3 scripts/gen_consentimento_pdf.py
Saída: public/documentos/consentimento-dados-rgpd.pdf
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable,
)

DUCATI_RED = colors.Color(0.77, 0.07, 0.19)
INK = colors.Color(0.12, 0.12, 0.13)
MUTED = colors.Color(0.40, 0.40, 0.43)
HAIR = colors.Color(0.82, 0.82, 0.85)

OUT_DIR = os.path.join("public", "documentos")
OUT_PATH = os.path.join(OUT_DIR, "consentimento-dados-rgpd.pdf")

styles = getSampleStyleSheet()
body = ParagraphStyle(
    "body", parent=styles["Normal"], fontName="Helvetica", fontSize=9.5,
    leading=14, textColor=INK, alignment=TA_JUSTIFY, spaceAfter=4,
)
small = ParagraphStyle(
    "small", parent=body, fontSize=8, textColor=MUTED, leading=11,
    alignment=TA_JUSTIFY,
)
h2 = ParagraphStyle(
    "h2", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=9,
    textColor=DUCATI_RED, spaceBefore=10, spaceAfter=4,
    leading=12,
)
brand = ParagraphStyle(
    "brand", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=9,
    textColor=DUCATI_RED, leading=12,
)
title = ParagraphStyle(
    "title", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=18,
    textColor=INK, leading=22, spaceBefore=2, spaceAfter=2,
)
li = ParagraphStyle(
    "li", parent=body, leftIndent=10, bulletIndent=0, spaceAfter=2,
)


def bullet(text):
    return Paragraph(f"<bullet>&bull;</bullet> {text}", li)


def field_table(rows, label_w=46 * mm):
    """Tabela de campos a preencher: label à esquerda, linha de escrita à direita."""
    data = [[Paragraph(f"<b>{lbl}</b>", body), ""] for lbl in rows]
    t = Table(data, colWidths=[label_w, None], rowHeights=[11 * mm] * len(rows))
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
        ("LINEBELOW", (1, 0), (1, -1), 0.7, HAIR),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t


def consent_row(text):
    """Linha de consentimento com uma checkbox desenhada (quadrado bordado)."""
    box = Table([[""]], colWidths=[4.5 * mm], rowHeights=[4.5 * mm])
    box.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.9, INK),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    row = Table([[box, Paragraph(text, body)]], colWidths=[8 * mm, None])
    row.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return row


def build():
    os.makedirs(OUT_DIR, exist_ok=True)
    doc = SimpleDocTemplate(
        OUT_PATH, pagesize=A4,
        leftMargin=20 * mm, rightMargin=20 * mm,
        topMargin=16 * mm, bottomMargin=16 * mm,
        title="Consentimento para o Tratamento de Dados Pessoais",
        author="Scuderia itTech",
    )
    s = []
    s.append(Paragraph("SCUDERIA itTECH", brand))
    s.append(Paragraph("Consentimento para o Tratamento de Dados Pessoais", title))
    s.append(Paragraph(
        "Ao abrigo do Regulamento Geral sobre a Proteção de Dados (RGPD).", small))
    s.append(Spacer(1, 4))
    s.append(HRFlowable(width="100%", thickness=0.8, color=DUCATI_RED, spaceAfter=8))

    s.append(Paragraph("Responsável pelo tratamento", h2))
    s.append(Paragraph(
        "Scuderia itTech (nome fiscal: scuderiaittech), NIF 519202643, com sede "
        "em Praceta Gomes Eanes de Zurara, n.º 103, 1.º A, 4810-482 Guimarães. "
        "Contacto para questões de privacidade: gerencia@scuderiaittech.pt.", body))

    s.append(Paragraph("Finalidade", h2))
    s.append(Paragraph(
        "A Scuderia itTech pretende criar uma conta de acesso em seu nome na "
        "plataforma digital da oficina, onde poderá consultar o histórico de "
        "manutenção da(s) sua(s) mota(s), boletins de serviço, faturas e "
        "agendamentos. Para o efeito, necessitamos do seu consentimento para "
        "tratar os dados pessoais indicados abaixo.", body))

    s.append(Paragraph("Dados tratados", h2))
    s.append(bullet("<b>Identificação e contacto:</b> nome, email e telefone."))
    s.append(bullet("<b>Dados da(s) mota(s):</b> marca, modelo, ano, matrícula e número de chassi (VIN)."))
    s.append(bullet("<b>Histórico de serviço:</b> boletins de manutenção, faturas e documentos associados."))

    s.append(Paragraph("Conservação, partilha e direitos", h2))
    s.append(Paragraph(
        "Os dados são conservados enquanto durar a relação de cliente e pelos "
        "prazos legais aplicáveis. São alojados em prestadores de serviço que "
        "atuam por nossa conta (Supabase, Vercel) e nunca são vendidos a "
        "terceiros. Tem o direito de aceder, retificar, apagar, limitar ou opor-se "
        "ao tratamento dos seus dados, e de apresentar reclamação à Comissão "
        "Nacional de Proteção de Dados (CNPD). Mais informação na nossa Política "
        "de Privacidade, disponível em scuderiaittech.pt/privacidade.", body))

    s.append(Spacer(1, 4))
    s.append(Paragraph("Declaração de consentimento", h2))
    s.append(consent_row(
        "Declaro que li e compreendi a informação acima e <b>autorizo</b> a "
        "Scuderia itTech a criar uma conta de acesso em meu nome e a tratar os "
        "meus dados pessoais para as finalidades descritas. <i>(obrigatório)</i>"))
    s.append(consent_row(
        "Autorizo também o envio de comunicações sobre o estado do serviço e "
        "lembretes de manutenção da minha mota. <i>(opcional)</i>"))

    s.append(Spacer(1, 6))
    s.append(Paragraph("Dados do titular", h2))
    s.append(field_table([
        "Nome completo",
        "Email",
        "Telefone",
        "Mota (marca e modelo)",
        "Matrícula",
    ]))

    s.append(Spacer(1, 6))
    sign = Table(
        [[Paragraph("<b>Local e data</b>", body), Paragraph("<b>Assinatura</b>", body)]],
        colWidths=[None, None], rowHeights=[18 * mm],
    )
    sign.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
        ("LINEBELOW", (0, 0), (0, 0), 0.7, HAIR),
        ("LINEBELOW", (1, 0), (1, 0), 0.7, HAIR),
        ("RIGHTPADDING", (0, 0), (0, 0), 14),
        ("LEFTPADDING", (1, 0), (1, 0), 14),
    ]))
    s.append(sign)

    s.append(Spacer(1, 10))
    s.append(HRFlowable(width="100%", thickness=0.5, color=HAIR, spaceAfter=4))
    s.append(Paragraph(
        "Documento de consentimento — Scuderia itTech. O consentimento é "
        "voluntário e pode ser retirado a qualquer momento, sem afetar a "
        "licitude do tratamento efetuado até essa data.", small))

    doc.build(s)
    print("PDF gerado:", OUT_PATH)


if __name__ == "__main__":
    build()
