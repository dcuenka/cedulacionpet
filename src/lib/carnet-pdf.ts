import { PDFDocument, StandardFonts, rgb, type PDFImage, type PDFPage } from "pdf-lib";
import { BRAND } from "@/lib/brand";

// Carnet tipo pasaporte de vacunación (librito vino/dorado), inspirado en el
// Certificado de Vacunación físico.
const BURGUNDY = rgb(0.42, 0.12, 0.16);
const GOLD = rgb(0.83, 0.68, 0.32);
const PAPER = rgb(0.97, 0.975, 0.985);
const GUILLOCHE = rgb(0.8, 0.86, 0.93);
const INK = rgb(0.12, 0.13, 0.18);
const LABEL = rgb(0.42, 0.45, 0.5);
const LINE = rgb(0.72, 0.76, 0.8);
const WHITE = rgb(1, 1, 1);

type CarnetData = {
  registrationNo: string;
  certificateNo?: string | null;
  microchip?: string | null;
  qrCode?: string | null;
  petName: string;
  species: string;
  breed?: string | null;
  sex: string;
  color?: string | null;
  birthDate?: Date | null;
  distinctiveMarks?: string | null;
  photoData?: string | null;
  vaccines?: string | null;
  lastVaccineDate?: Date | null;
  nextVaccineDate?: Date | null;
  lastDewormDate?: Date | null;
  nextDewormDate?: Date | null;
  healthEvents?: {
    type: string;
    date: Date;
    nextDate?: Date | null;
    product?: string | null;
    mvz?: string | null;
  }[];
  mvz?: string | null;
  ownerName: string;
  ownerIdType: string;
  ownerId: string;
  ownerAddress?: string | null;
  ownerPhone?: string | null;
  ownerEmail?: string | null;
  createdAt: Date;
};

function fmtDate(d?: Date | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("es-EC", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(d);
}

async function embedPhoto(pdf: PDFDocument, dataUrl?: string | null): Promise<PDFImage | null> {
  if (!dataUrl || !dataUrl.startsWith("data:image")) return null;
  try {
    const [, base64] = dataUrl.split(",");
    if (!base64) return null;
    const bytes = Uint8Array.from(Buffer.from(base64, "base64"));
    if (dataUrl.includes("image/png")) return await pdf.embedPng(bytes);
    return await pdf.embedJpg(bytes);
  } catch {
    return null;
  }
}

// Huella dorada en sello.
function drawSeal(page: PDFPage, cx: number, cy: number, r: number) {
  page.drawCircle({ x: cx, y: cy, size: r, borderColor: GOLD, borderWidth: 2 });
  page.drawCircle({ x: cx, y: cy, size: r - 5, borderColor: GOLD, borderWidth: 0.8 });
  const s = r / 14;
  page.drawEllipse({ x: cx, y: cy - 3 * s, xScale: 6.5 * s, yScale: 5 * s, color: GOLD });
  page.drawEllipse({ x: cx - 6 * s, y: cy + 3.5 * s, xScale: 2.4 * s, yScale: 3.2 * s, color: GOLD });
  page.drawEllipse({ x: cx - 2 * s, y: cy + 6 * s, xScale: 2.4 * s, yScale: 3.4 * s, color: GOLD });
  page.drawEllipse({ x: cx + 2 * s, y: cy + 6 * s, xScale: 2.4 * s, yScale: 3.4 * s, color: GOLD });
  page.drawEllipse({ x: cx + 6 * s, y: cy + 3.5 * s, xScale: 2.4 * s, yScale: 3.2 * s, color: GOLD });
}

// Fondo de papel de seguridad con ondas tenues.
function paperBg(page: PDFPage, W: number, H: number) {
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: PAPER });
  for (let i = 0; i < 14; i++) {
    let prev: { x: number; y: number } | null = null;
    const base = 20 + i * 28;
    for (let x = 0; x <= W; x += 6) {
      const yy = base + Math.sin(x / 15 + i) * 5;
      if (prev) page.drawLine({ start: prev, end: { x, y: yy }, thickness: 0.4, color: GUILLOCHE });
      prev = { x, y: yy };
    }
  }
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, borderColor: LINE, borderWidth: 1 });
}

export async function buildCarnetPdf(data: CarnetData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const W = 300;
  const H = 420;
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const centerText = (page: PDFPage, text: string, y: number, size: number, f = bold, color = GOLD) => {
    page.drawText(text, { x: W / 2 - f.widthOfTextAtSize(text, size) / 2, y, size, font: f, color });
  };
  const field = (page: PDFPage, x: number, y: number, label: string, value: string) => {
    page.drawText(label, { x, y, size: 7.5, font, color: LABEL });
    page.drawText(value || "—", { x: x + f_w(label), y, size: 8.5, font: bold, color: INK });
  };
  const f_w = (label: string) => font.widthOfTextAtSize(label + " ", 7.5) + 4;

  // ---------- PÁGINA 1: PORTADA ----------
  const cover = pdf.addPage([W, H]);
  cover.drawRectangle({ x: 0, y: 0, width: W, height: H, color: BURGUNDY });
  cover.drawRectangle({ x: 16, y: 16, width: W - 32, height: H - 32, borderColor: GOLD, borderWidth: 1.2 });
  centerText(cover, "REGISTRO NACIONAL DE MASCOTAS", H - 70, 10);
  centerText(cover, "DEL ECUADOR", H - 84, 10);
  drawSeal(cover, W / 2, H / 2 + 20, 52);
  centerText(cover, BRAND.name.toUpperCase(), 150, 15);
  centerText(cover, "CERTIFICADO DE VACUNACIÓN", 70, 12);
  centerText(cover, "ANIMALES DE COMPAÑÍA", 56, 9);

  // ---------- PÁGINA 2: DATOS DE LA MASCOTA + DUEÑO ----------
  const p2 = pdf.addPage([W, H]);
  paperBg(p2, W, H);
  // cabecera
  p2.drawRectangle({ x: 20, y: H - 44, width: W - 40, height: 22, color: rgb(0.9, 0.93, 0.97), borderColor: LINE, borderWidth: 0.5 });
  centerText(p2, "Datos de la Mascota", H - 38, 11, bold, BURGUNDY);
  // foto
  const photo = await embedPhoto(pdf, data.photoData);
  const pw = 90, ph = 108, pxc = W / 2 - pw / 2, pyc = H - 44 - 12 - ph;
  p2.drawRectangle({ x: pxc - 2, y: pyc - 2, width: pw + 4, height: ph + 4, color: WHITE, borderColor: LINE, borderWidth: 0.8 });
  if (photo) {
    const sc = Math.max(pw / photo.width, ph / photo.height);
    p2.drawImage(photo, { x: pxc + (pw - photo.width * sc) / 2, y: pyc + (ph - photo.height * sc) / 2, width: photo.width * sc, height: photo.height * sc });
  } else {
    p2.drawText("FOTO", { x: pxc + pw / 2 - 12, y: pyc + ph / 2, size: 8, font, color: LABEL });
  }
  // campos de la mascota
  let y = pyc - 22;
  field(p2, 24, y, "Nombre:", data.petName); y -= 17;
  field(p2, 24, y, "Color:", data.color || "—");
  field(p2, 165, y, "Especie:", data.species); y -= 17;
  field(p2, 24, y, "Sexo:", data.sex);
  field(p2, 165, y, "Raza:", data.breed || "—"); y -= 17;
  field(p2, 24, y, "Señales particulares:", data.distinctiveMarks || "—"); y -= 17;
  field(p2, 24, y, "N.º Historia Clínica:", data.certificateNo || data.registrationNo); y -= 17;
  field(p2, 24, y, "N.º Microchip:", data.microchip || "—"); y -= 17;
  field(p2, 24, y, "Fecha de Nacimiento:", fmtDate(data.birthDate)); y -= 24;

  // dueño
  p2.drawRectangle({ x: 20, y: y - 4, width: W - 40, height: 22, color: rgb(0.9, 0.93, 0.97), borderColor: LINE, borderWidth: 0.5 });
  centerText(p2, "Datos del Dueño", y + 2, 11, bold, BURGUNDY);
  y -= 24;
  field(p2, 24, y, "Nombre:", data.ownerName); y -= 17;
  field(p2, 24, y, `${data.ownerIdType}:`, data.ownerId); y -= 17;
  field(p2, 24, y, "Dirección:", data.ownerAddress || "—"); y -= 17;
  field(p2, 24, y, "Teléfono:", data.ownerPhone || "—"); y -= 17;
  field(p2, 24, y, "Email:", data.ownerEmail || "—");

  // ---------- PÁGINA 3: VACUNACIÓN ----------
  const p3 = pdf.addPage([W, H]);
  paperBg(p3, W, H);
  p3.drawRectangle({ x: 20, y: H - 44, width: W - 40, height: 22, color: rgb(0.9, 0.93, 0.97), borderColor: LINE, borderWidth: 0.5 });
  centerText(p3, "Vacunación", H - 38, 12, bold, BURGUNDY);

  // tabla
  const tx = 20, tw = W - 40;
  const col1 = tx + 62, col2 = tx + tw - 70; // divisores de columnas
  const thY = H - 58;
  p3.drawText("Fecha", { x: tx + 6, y: thY, size: 7, font: bold, color: BURGUNDY });
  p3.drawText("Vacuna", { x: col1 + 6, y: thY, size: 7, font: bold, color: BURGUNDY });
  p3.drawText("Firma MVZ", { x: col2 + 2, y: thY, size: 7, font: bold, color: BURGUNDY });

  const events = data.healthEvents || [];
  const vacEvents = events.filter((e) => e.type === "vacuna");
  const dewEvents = events.filter((e) => e.type === "desparasitacion");

  const rows: { fecha: string; vacuna: string }[] = [];
  if (vacEvents.length > 0) {
    // Historial real de vacunas (más reciente arriba).
    for (const ev of vacEvents.slice(0, 5)) {
      rows.push({ fecha: fmtDate(ev.date), vacuna: (ev.product || "Vacuna aplicada").slice(0, 40) });
    }
    const nextV = vacEvents[0].nextDate;
    if (nextV && rows.length < 6) rows.push({ fecha: fmtDate(nextV), vacuna: "PRÓXIMA VACUNA" });
  } else {
    // Respaldo: campos resumen de la ficha.
    if (data.lastVaccineDate || data.vaccines)
      rows.push({ fecha: fmtDate(data.lastVaccineDate), vacuna: (data.vaccines || "").slice(0, 40) || "Vacuna aplicada" });
    if (data.nextVaccineDate) rows.push({ fecha: fmtDate(data.nextVaccineDate), vacuna: "PRÓXIMA VACUNA" });
  }
  while (rows.length < 5) rows.push({ fecha: "", vacuna: "" });

  const rowH = 40;
  let ry = thY - 10;
  for (const r of rows) {
    ry -= rowH;
    p3.drawRectangle({ x: tx, y: ry, width: tw, height: rowH, borderColor: LINE, borderWidth: 0.5 });
    p3.drawLine({ start: { x: col1, y: ry }, end: { x: col1, y: ry + rowH }, thickness: 0.5, color: LINE });
    p3.drawLine({ start: { x: col2, y: ry }, end: { x: col2, y: ry + rowH }, thickness: 0.5, color: LINE });
    if (r.fecha) p3.drawText(r.fecha, { x: tx + 4, y: ry + rowH - 16, size: 7.5, font: bold, color: INK });
    if (r.vacuna) {
      const bigv = r.vacuna === "PRÓXIMA VACUNA";
      p3.drawText(r.vacuna, { x: col1 + 5, y: ry + rowH - 16, size: bigv ? 8 : 7.5, font: bigv ? bold : font, color: bigv ? BURGUNDY : INK });
    } else {
      p3.drawText("Pegue aquí la etiqueta", { x: col1 + 5, y: ry + rowH / 2 - 3, size: 5.5, font, color: LABEL });
    }
  }

  // Desparasitación
  ry -= 20;
  centerText(p3, "Desparasitación", ry, 9, bold, BURGUNDY);
  ry -= 16;
  const lastDew = dewEvents[0]?.date ?? data.lastDewormDate;
  const nextDew = dewEvents[0]?.nextDate ?? data.nextDewormDate;
  field(p3, 24, ry, "Última:", fmtDate(lastDew));
  field(p3, 165, ry, "Próxima:", fmtDate(nextDew));

  return pdf.save();
}
