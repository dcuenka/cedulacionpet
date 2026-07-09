import { PDFDocument, StandardFonts, rgb, type PDFImage, type PDFPage } from "pdf-lib";
import { BRAND } from "@/lib/brand";
import { qrPngBuffer, lookupCode } from "@/lib/qr";

// Colores tipo pasaporte (vino/borgoña) + dorado y bandera del Ecuador.
const BURGUNDY = rgb(0.42, 0.12, 0.16); // #6b1f2a
const BURGUNDY_D = rgb(0.32, 0.08, 0.12);
const GOLD = rgb(0.83, 0.68, 0.32); // dorado sello
const PAPER = rgb(0.96, 0.945, 0.9); // papel de seguridad
const INK = rgb(0.12, 0.13, 0.18);
const GRAY = rgb(0.45, 0.47, 0.52);
const WHITE = rgb(1, 1, 1);
const EC_YELLOW = rgb(1, 0.819, 0);
const EC_BLUE = rgb(0.039, 0.2, 0.478);
const EC_RED = rgb(0.839, 0, 0.11);

type PassportData = {
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
  photoData?: string | null;
  ownerName: string;
  ownerId: string;
  city?: string | null;
  province?: string | null;
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

// Sello dorado con huella.
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

// Normaliza texto a caracteres MRZ (A-Z, 0-9, <) y ajusta a 44.
function mrz(parts: string): string {
  const clean = parts
    .toUpperCase()
    .replace(/[^A-Z0-9<]/g, "<")
    .replace(/<{2,}/g, "<");
  return (clean + "<".repeat(44)).slice(0, 44);
}

export async function buildPassportPdf(data: PassportData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const W = 420;
  const H = 298;
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const mono = await pdf.embedFont(StandardFonts.Courier);

  // ---------- PÁGINA 1: PORTADA ----------
  const cover = pdf.addPage([W, H]);
  cover.drawRectangle({ x: 0, y: 0, width: W, height: H, color: BURGUNDY });
  cover.drawRectangle({ x: 0, y: 0, width: W, height: H, color: BURGUNDY });
  // marco dorado
  cover.drawRectangle({ x: 16, y: 16, width: W - 32, height: H - 32, borderColor: GOLD, borderWidth: 1 });

  cover.drawText("REGISTRO NACIONAL DE MASCOTAS DEL ECUADOR", {
    x: W / 2 - bold.widthOfTextAtSize("REGISTRO NACIONAL DE MASCOTAS DEL ECUADOR", 8) / 2,
    y: H - 44,
    size: 8,
    font: bold,
    color: GOLD,
  });

  drawSeal(cover, W / 2, H / 2 + 18, 46);

  const t1 = "PASAPORTE";
  cover.drawText(t1, { x: W / 2 - bold.widthOfTextAtSize(t1, 26) / 2, y: 92, size: 26, font: bold, color: GOLD });
  const t2 = "DE MASCOTA · PET PASSPORT";
  cover.drawText(t2, { x: W / 2 - font.widthOfTextAtSize(t2, 8) / 2, y: 78, size: 8, font, color: GOLD });
  const t3 = BRAND.name.toUpperCase();
  cover.drawText(t3, { x: W / 2 - bold.widthOfTextAtSize(t3, 11) / 2, y: 44, size: 11, font: bold, color: WHITE });

  // ---------- PÁGINA 2: DATOS ----------
  const p = pdf.addPage([W, H]);
  p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: PAPER });

  // Franja tricolor superior
  const third = W / 3;
  p.drawRectangle({ x: 0, y: H - 6, width: third, height: 6, color: EC_YELLOW });
  p.drawRectangle({ x: third, y: H - 6, width: third, height: 6, color: EC_BLUE });
  p.drawRectangle({ x: third * 2, y: H - 6, width: W - third * 2, height: 6, color: EC_RED });

  // Cabecera
  p.drawRectangle({ x: 0, y: H - 40, width: W, height: 34, color: BURGUNDY });
  drawSeal(p, 26, H - 23, 13);
  p.drawText("PASAPORTE DE MASCOTA / PET PASSPORT", { x: 44, y: H - 22, size: 9, font: bold, color: GOLD });
  p.drawText("ECUADOR", { x: W - 20 - bold.widthOfTextAtSize("ECUADOR", 9), y: H - 22, size: 9, font: bold, color: WHITE });

  // Foto
  const photoX = 20;
  const photoY = 96;
  const photoW = 96;
  const photoH = 120;
  p.drawRectangle({ x: photoX - 2, y: photoY - 2, width: photoW + 4, height: photoH + 4, color: WHITE, borderColor: GRAY, borderWidth: 0.8 });
  const photo = await embedPhoto(pdf, data.photoData);
  if (photo) {
    const scale = Math.max(photoW / photo.width, photoH / photo.height);
    const dw = photo.width * scale;
    const dh = photo.height * scale;
    p.drawImage(photo, { x: photoX + (photoW - dw) / 2, y: photoY + (photoH - dh) / 2, width: dw, height: dh });
  } else {
    p.drawText("SIN FOTO", { x: photoX + 24, y: photoY + photoH / 2, size: 8, font, color: GRAY });
  }

  // QR bajo la foto
  const qrPng = await pdf.embedPng(await qrPngBuffer(lookupCode(data)));
  p.drawImage(qrPng, { x: photoX + 8, y: 30, width: 52, height: 52 });
  p.drawText("Escanea si me encuentras", { x: photoX - 2, y: 22, size: 5.5, font, color: GRAY });

  // Campos bilingües
  const colX = photoX + photoW + 22;
  const col2X = colX + 150;
  let yy = H - 58;

  const field = (x: number, label: string, value: string) => {
    p.drawText(label, { x, y: yy, size: 5.8, font, color: GRAY });
    p.drawText(value || "—", { x, y: yy - 11, size: 9.5, font: bold, color: INK });
  };
  const row = (l1: string, v1: string, l2: string, v2: string) => {
    field(colX, l1, v1);
    field(col2X, l2, v2);
    yy -= 26;
  };

  row("Tipo / Type", "PET", "Cód. país / Country", "ECU");
  row("Pasaporte N.º / Passport No.", data.certificateNo || data.registrationNo, "Sexo / Sex", data.sex.charAt(0).toUpperCase());
  row("Nombre / Name", data.petName, "F. nac. / Date of birth", fmtDate(data.birthDate));
  row("Especie / Species", data.species, "Raza / Breed", data.breed || "—");
  row("Color / Colour", data.color || "—", "Microchip N.º", data.microchip || "—");
  row("Tutor / Owner", data.ownerName, "Cédula / ID", data.ownerId);

  // Zona MRZ (lectura mecánica)
  const mrzY = 44;
  p.drawRectangle({ x: 0, y: 0, width: W, height: mrzY, color: rgb(0.9, 0.885, 0.84) });
  p.drawLine({ start: { x: 0, y: mrzY }, end: { x: W, y: mrzY }, thickness: 0.6, color: GRAY });
  const line1 = mrz(`P<ECU${data.petName}`);
  const line2 = mrz(
    `${(data.certificateNo || data.registrationNo).replace(/-/g, "")}ECU${
      data.microchip || ""
    }`,
  );
  p.drawText(line1, { x: 16, y: mrzY - 18, size: 10, font: mono, color: INK });
  p.drawText(line2, { x: 16, y: mrzY - 34, size: 10, font: mono, color: INK });

  return pdf.save();
}
