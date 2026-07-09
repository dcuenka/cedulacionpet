import { PDFDocument, StandardFonts, rgb, type PDFImage } from "pdf-lib";
import { BRAND } from "@/lib/brand";
import { qrPngBuffer, localizeUrl, lookupCode } from "@/lib/qr";

// Paleta institucional (colores del Ecuador).
const NAVY = rgb(0.039, 0.2, 0.478); // azul #0a337a
const TEAL = rgb(0.071, 0.341, 0.69); // azul medio (etiquetas) #1257b0
const YELLOW = rgb(1, 0.819, 0); // amarillo #ffd100
const RED = rgb(0.839, 0, 0.11); // rojo #d6001c
const LIGHT = rgb(0.96, 0.98, 0.99);
const GRAY = rgb(0.42, 0.45, 0.5);
const WHITE = rgb(1, 1, 1);

// Dibuja una huella de mascota (centrada en cx, cy).
function drawPaw(
  page: import("pdf-lib").PDFPage,
  cx: number,
  cy: number,
  s: number,
  color: ReturnType<typeof rgb>,
) {
  page.drawEllipse({ x: cx, y: cy, xScale: 6.5 * s, yScale: 5 * s, color });
  page.drawEllipse({ x: cx - 6 * s, y: cy + 6.5 * s, xScale: 2.4 * s, yScale: 3.2 * s, color });
  page.drawEllipse({ x: cx - 2 * s, y: cy + 9 * s, xScale: 2.4 * s, yScale: 3.4 * s, color });
  page.drawEllipse({ x: cx + 2 * s, y: cy + 9 * s, xScale: 2.4 * s, yScale: 3.4 * s, color });
  page.drawEllipse({ x: cx + 6 * s, y: cy + 6.5 * s, xScale: 2.4 * s, yScale: 3.2 * s, color });
}

type CedulaData = {
  registrationNo: string;
  certificateNo?: string | null;
  qrCode?: string | null;
  petName: string;
  species: string;
  breed?: string | null;
  sex: string;
  color?: string | null;
  birthDate?: Date | null;
  microchip?: string | null;
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
  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

// Incrusta la foto (data URL base64) detectando el formato.
async function embedPhoto(
  pdf: PDFDocument,
  dataUrl?: string | null,
): Promise<PDFImage | null> {
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

export async function buildCedulaPdf(data: CedulaData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();

  // Tarjeta horizontal tipo cédula (aprox. proporción ID, ampliada).
  const W = 470;
  const H = 300;
  const page = pdf.addPage([W, H]);

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // Fondo.
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: LIGHT });

  // Franja superior (cabecera institucional).
  const headerH = 52;
  page.drawRectangle({
    x: 0,
    y: H - headerH,
    width: W,
    height: headerH,
    color: NAVY,
  });
  // Franja tricolor del Ecuador (amarillo, azul, rojo) en el borde superior.
  const third = W / 3;
  page.drawRectangle({ x: 0, y: H - 5, width: third, height: 5, color: YELLOW });
  page.drawRectangle({ x: third, y: H - 5, width: third, height: 5, color: rgb(0.02, 0.14, 0.4) });
  page.drawRectangle({ x: third * 2, y: H - 5, width: W - third * 2, height: 5, color: RED });

  // Huella institucional a la izquierda del nombre.
  drawPaw(page, 30, H - 27, 0.9, YELLOW);

  page.drawText(BRAND.name.toUpperCase(), {
    x: 50,
    y: H - 26,
    size: 15,
    font: bold,
    color: WHITE,
  });
  page.drawText(BRAND.tagline, {
    x: 50,
    y: H - 42,
    size: 8,
    font,
    color: rgb(0.75, 0.85, 0.9),
  });
  page.drawText("CÉDULA DE IDENTIFICACIÓN ANIMAL", {
    x: W - 20 - bold.widthOfTextAtSize("CÉDULA DE IDENTIFICACIÓN ANIMAL", 8),
    y: H - 30,
    size: 8,
    font: bold,
    color: YELLOW,
  });

  // --- Foto de la mascota ---
  const photoX = 20;
  const photoY = 70;
  const photoW = 120;
  const photoH = 140;
  const photo = await embedPhoto(pdf, data.photoData);
  page.drawRectangle({
    x: photoX - 2,
    y: photoY - 2,
    width: photoW + 4,
    height: photoH + 4,
    color: WHITE,
    borderColor: rgb(0.8, 0.83, 0.86),
    borderWidth: 1,
  });
  if (photo) {
    // Escala la foto para cubrir el marco manteniendo proporción (centrada).
    const scale = Math.max(photoW / photo.width, photoH / photo.height);
    const drawW = photo.width * scale;
    const drawH = photo.height * scale;
    page.drawImage(photo, {
      x: photoX + (photoW - drawW) / 2,
      y: photoY + (photoH - drawH) / 2,
      width: drawW,
      height: drawH,
    });
  } else {
    page.drawText("SIN FOTO", {
      x: photoX + photoW / 2 - font.widthOfTextAtSize("SIN FOTO", 9) / 2,
      y: photoY + photoH / 2,
      size: 9,
      font,
      color: GRAY,
    });
  }

  // --- Datos de la mascota ---
  const colX = photoX + photoW + 22;
  let y = H - headerH - 22;

  page.drawText(data.petName.toUpperCase(), {
    x: colX,
    y,
    size: 16,
    font: bold,
    color: NAVY,
  });
  y -= 22;

  const field = (label: string, value: string) => {
    page.drawText(label.toUpperCase(), {
      x: colX,
      y,
      size: 6.5,
      font: bold,
      color: TEAL,
    });
    page.drawText(value || "—", {
      x: colX,
      y: y - 11,
      size: 9.5,
      font,
      color: NAVY,
    });
    y -= 26;
  };

  const twoCols = (
    l1: string,
    v1: string,
    l2: string,
    v2: string,
  ) => {
    const x2 = colX + 124;
    page.drawText(l1.toUpperCase(), { x: colX, y, size: 6.5, font: bold, color: TEAL });
    page.drawText(v1 || "—", { x: colX, y: y - 11, size: 9.5, font, color: NAVY });
    page.drawText(l2.toUpperCase(), { x: x2, y, size: 6.5, font: bold, color: TEAL });
    page.drawText(v2 || "—", { x: x2, y: y - 11, size: 9.5, font, color: NAVY });
    y -= 26;
  };

  twoCols("Especie", data.species, "Sexo", data.sex);
  twoCols("Raza", data.breed || "—", "Color", data.color || "—");
  twoCols(
    "Nacimiento",
    fmtDate(data.birthDate),
    "Esterilizado",
    data.sterilized ? "Sí" : "No",
  );
  field("Microchip", data.microchip || "No registra");

  // --- Franja de propietario y registro (parte inferior) ---
  const footerH = 58;
  page.drawRectangle({ x: 0, y: 0, width: W, height: footerH, color: NAVY });

  page.drawText("TUTOR RESPONSABLE", {
    x: 20,
    y: footerH - 16,
    size: 6.5,
    font: bold,
    color: YELLOW,
  });
  page.drawText(data.ownerName, {
    x: 20,
    y: footerH - 30,
    size: 10,
    font: bold,
    color: WHITE,
  });
  page.drawText(
    `${data.ownerIdType}: ${data.ownerId}   ·   ${[data.city, data.province]
      .filter(Boolean)
      .join(", ") || "Ecuador"}`,
    { x: 20, y: footerH - 44, size: 7.5, font, color: rgb(0.8, 0.86, 0.9) },
  );

  // Número de certificado (centro-inferior, destacado).
  page.drawText("CERTIFICADO N.º", {
    x: 250,
    y: footerH - 16,
    size: 6.5,
    font: bold,
    color: YELLOW,
  });
  page.drawText(data.certificateNo || data.registrationNo, {
    x: 250,
    y: footerH - 34,
    size: 14,
    font: bold,
    color: WHITE,
  });
  page.drawText(`Emitida: ${fmtDate(data.createdAt)}`, {
    x: 250,
    y: footerH - 48,
    size: 7,
    font,
    color: rgb(0.8, 0.86, 0.9),
  });

  // --- QR de localización (esquina inferior derecha, sobre fondo blanco) ---
  const code = lookupCode(data);
  const qrPng = await pdf.embedPng(await qrPngBuffer(code));
  const qrSize = 80;
  const qrX = W - qrSize - 16;
  const qrY = footerH + 24;
  page.drawRectangle({
    x: qrX - 6,
    y: qrY - 6,
    width: qrSize + 12,
    height: qrSize + 12,
    color: WHITE,
    borderColor: rgb(0.8, 0.83, 0.86),
    borderWidth: 1,
  });
  page.drawImage(qrPng, { x: qrX, y: qrY, width: qrSize, height: qrSize });
  const qrLabel = "Escanea si me encuentras";
  page.drawText(qrLabel, {
    x: qrX + qrSize / 2 - font.widthOfTextAtSize(qrLabel, 6.5) / 2,
    y: qrY - 16,
    size: 6.5,
    font,
    color: GRAY,
  });

  // URL de localización al pie del QR (dentro de la franja azul).
  page.drawText(localizeUrl(code), {
    x: W - 20 - font.widthOfTextAtSize(localizeUrl(code), 5.5),
    y: 6,
    size: 5.5,
    font,
    color: rgb(0.6, 0.7, 0.78),
  });

  return pdf.save();
}
