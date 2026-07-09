import { PDFDocument, StandardFonts, rgb, type PDFImage, type PDFPage } from "pdf-lib";
import { BRAND } from "@/lib/brand";
import { qrPngBuffer, lookupCode } from "@/lib/qr";

// Paleta tipo cédula de identidad (fondo claro, azul institucional).
const BG = rgb(0.955, 0.973, 0.976);
const BLUE = rgb(0.09, 0.28, 0.5); // azul de títulos "CÉDULA DE IDENTIDAD"
const LABEL = rgb(0.42, 0.45, 0.5); // etiquetas gris
const INK = rgb(0.11, 0.13, 0.17); // valores casi negro
const GUILLOCHE = rgb(0.82, 0.9, 0.92); // líneas de seguridad tenues
const LINE = rgb(0.72, 0.76, 0.8);
const GOLD = rgb(0.82, 0.66, 0.28); // chip
const WHITE = rgb(1, 1, 1);
const EC_YELLOW = rgb(1, 0.819, 0);
const EC_BLUE = rgb(0.039, 0.2, 0.478);
const EC_RED = rgb(0.839, 0, 0.11);

type CedulaData = {
  registrationNo: string;
  certificateNo?: string | null;
  qrCode?: string | null;
  microchip?: string | null;
  petName: string;
  species: string;
  breed?: string | null;
  sex: string;
  color?: string | null;
  birthDate?: Date | null;
  sterilized: boolean;
  photoData?: string | null;
  ownerName: string;
  ownerIdType: string;
  ownerId: string;
  city?: string | null;
  province?: string | null;
  createdAt: Date;
};

function fmtDate(d?: Date | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("es-EC", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })
    .format(d)
    .replace(".", "")
    .toUpperCase();
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

// Bandera del Ecuador (bandas horizontales: amarillo mitad, azul, rojo).
function drawFlag(page: PDFPage, x: number, y: number, w: number, h: number) {
  page.drawRectangle({ x, y: y + h / 2, width: w, height: h / 2, color: EC_YELLOW });
  page.drawRectangle({ x, y: y + h / 4, width: w, height: h / 4, color: EC_BLUE });
  page.drawRectangle({ x, y, width: w, height: h / 4, color: EC_RED });
  page.drawRectangle({ x, y, width: w, height: h, borderColor: LINE, borderWidth: 0.4 });
}

// Onda de seguridad (guilloché).
function wave(page: PDFPage, W: number, y: number, amp: number, phase: number) {
  let prev: { x: number; y: number } | null = null;
  for (let x = 0; x <= W; x += 6) {
    const yy = y + Math.sin(x / 17 + phase) * amp;
    if (prev) page.drawLine({ start: prev, end: { x, y: yy }, thickness: 0.4, color: GUILLOCHE });
    prev = { x, y: yy };
  }
}

// Chip dorado (icono de autenticidad).
function drawChip(page: PDFPage, x: number, y: number, w: number, h: number) {
  page.drawRectangle({ x, y, width: w, height: h, color: GOLD, borderColor: rgb(0.6, 0.48, 0.18), borderWidth: 0.5 });
  page.drawLine({ start: { x, y: y + h * 0.5 }, end: { x: x + w, y: y + h * 0.5 }, thickness: 0.5, color: rgb(0.6, 0.48, 0.18) });
  page.drawLine({ start: { x: x + w * 0.4, y }, end: { x: x + w * 0.4, y: y + h }, thickness: 0.5, color: rgb(0.6, 0.48, 0.18) });
  page.drawRectangle({ x: x + w * 0.28, y: y + h * 0.32, width: w * 0.24, height: h * 0.36, borderColor: rgb(0.6, 0.48, 0.18), borderWidth: 0.5 });
}

export async function buildCedulaPdf(data: CedulaData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const W = 486;
  const H = 306; // proporción tipo tarjeta ID-1
  const page = pdf.addPage([W, H]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // Fondo + guilloché.
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: BG });
  for (let i = 0; i < 9; i++) wave(page, W, 40 + i * 30, 5, i * 0.7);
  // Roseta de seguridad tenue.
  for (let r = 8; r <= 78; r += 6)
    page.drawCircle({ x: W * 0.66, y: 120, size: r, borderColor: GUILLOCHE, borderWidth: 0.4 });
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, borderColor: LINE, borderWidth: 1 });

  // ---------- Cabecera ----------
  drawFlag(page, 20, H - 32, 26, 17);
  page.drawText("CÉDULA DE IDENTIDAD ANIMAL", { x: 54, y: H - 20, size: 10, font: bold, color: BLUE });
  page.drawText(BRAND.name.toUpperCase() + " · " + BRAND.tagline, {
    x: 54,
    y: H - 31,
    size: 6.2,
    font,
    color: LABEL,
  });
  // Franja tricolor fina bajo la cabecera.
  const third = W / 3;
  page.drawRectangle({ x: 0, y: H - 40, width: third, height: 2.5, color: EC_YELLOW });
  page.drawRectangle({ x: third, y: H - 40, width: third, height: 2.5, color: EC_BLUE });
  page.drawRectangle({ x: third * 2, y: H - 40, width: W - third * 2, height: 2.5, color: EC_RED });

  // ---------- Foto principal ----------
  const px = 22, py = 96, pw = 104, ph = 128;
  const photo = await embedPhoto(pdf, data.photoData);
  page.drawRectangle({ x: px - 2, y: py - 2, width: pw + 4, height: ph + 4, color: WHITE, borderColor: LINE, borderWidth: 0.8 });
  if (photo) {
    const sc = Math.max(pw / photo.width, ph / photo.height);
    page.drawImage(photo, { x: px + (pw - photo.width * sc) / 2, y: py + (ph - photo.height * sc) / 2, width: photo.width * sc, height: photo.height * sc });
  } else {
    page.drawText("SIN FOTO", { x: px + 28, y: py + ph / 2, size: 8, font, color: LABEL });
  }

  // NUI (número único de identificación = microchip o ficha).
  const nui = data.microchip || data.certificateNo || data.registrationNo;
  page.drawText("NUI.", { x: px, y: 74, size: 8, font, color: LABEL });
  page.drawText(nui, { x: px + 22, y: 74, size: 9.5, font: bold, color: BLUE });

  // ---------- Foto fantasma (derecha) ----------
  if (photo) {
    const gw = 58, gh = 72, gx = W - gw - 20, gy = H - 42 - gh;
    const sc = Math.max(gw / photo.width, gh / photo.height);
    page.drawImage(photo, { x: gx + (gw - photo.width * sc) / 2, y: gy + (gh - photo.height * sc) / 2, width: photo.width * sc, height: photo.height * sc, opacity: 0.28 });
  }

  // ---------- Campos ----------
  const cX = px + pw + 20; // columna izquierda de datos
  const c2X = cX + 168; // columna derecha
  const field = (x: number, label: string, value: string, big = false) => (y: number) => {
    page.drawText(label, { x, y, size: 6, font, color: LABEL });
    page.drawText(value || "—", { x, y: y - (big ? 13 : 11), size: big ? 12 : 9, font: bold, color: INK });
  };

  let y = H - 58;
  field(cX, "NOMBRE", data.petName, true)(y);
  field(c2X, "CONDICIÓN", "REGISTRADA")(y);
  y -= 30;
  field(cX, "ESPECIE", data.species)(y);
  field(c2X, "SEXO", data.sex.toUpperCase())(y);
  y -= 26;
  field(cX, "RAZA", data.breed || "—")(y);
  field(c2X, "COLOR", data.color || "—")(y);
  y -= 26;
  field(cX, "NACIONALIDAD", "ECUATORIANA")(y);
  field(c2X, "ESTERILIZADO", data.sterilized ? "SÍ" : "NO")(y);
  y -= 26;
  field(cX, "FECHA DE NACIMIENTO", fmtDate(data.birthDate))(y);
  field(c2X, "No. DOCUMENTO", data.certificateNo || data.registrationNo)(y);
  y -= 26;
  field(cX, "PROCEDENCIA", [data.city, data.province].filter(Boolean).join(", ") || "ECUADOR")(y);
  field(c2X, "MICROCHIP N.º", data.microchip || "NO REGISTRA")(y);

  // ---------- Tutor + firma ----------
  const ty = 60;
  page.drawLine({ start: { x: cX, y: ty + 22 }, end: { x: c2X + 130, y: ty + 22 }, thickness: 0.5, color: LINE });
  page.drawText("TUTOR RESPONSABLE", { x: cX, y: ty + 10, size: 6, font, color: LABEL });
  page.drawText(data.ownerName, { x: cX, y: ty - 2, size: 9, font: bold, color: INK });
  page.drawText(`${data.ownerIdType}: ${data.ownerId}`, { x: cX, y: ty - 13, size: 7, font, color: LABEL });
  page.drawText(`EMISIÓN: ${fmtDate(data.createdAt)}`, { x: c2X, y: ty - 2, size: 7, font, color: LABEL });

  // ---------- Chip + QR (derecha inferior) ----------
  drawChip(page, W - 116, 22, 26, 20);
  const qrPng = await pdf.embedPng(await qrPngBuffer(lookupCode(data)));
  const qs = 62;
  page.drawRectangle({ x: W - qs - 18, y: 16, width: qs, height: qs, color: WHITE, borderColor: LINE, borderWidth: 0.6 });
  page.drawImage(qrPng, { x: W - qs - 16, y: 18, width: qs - 4, height: qs - 4 });

  return pdf.save();
}
