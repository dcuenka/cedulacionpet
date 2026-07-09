import QRCode from "qrcode";
import { siteUrl } from "@/lib/brand";

// Código de localización: se prefiere el número de serie del microchip;
// luego el código QR físico; si no, el número de ficha.
export function lookupCode(record: {
  microchip?: string | null;
  qrCode?: string | null;
  registrationNo: string;
}): string {
  return (
    record.microchip?.trim() ||
    record.qrCode?.trim() ||
    record.registrationNo
  );
}

// URL pública de localización a la que apunta el QR de cada mascota.
export function localizeUrl(code: string): string {
  return `${siteUrl()}/m/${encodeURIComponent(code)}`;
}

// Genera el QR como data URL (para mostrar en pantalla).
export async function qrDataUrl(code: string): Promise<string> {
  return QRCode.toDataURL(localizeUrl(code), {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
    color: { dark: "#0f2f4a", light: "#ffffff" },
  });
}

// Genera el QR como buffer PNG (para incrustar en el PDF).
export async function qrPngBuffer(code: string): Promise<Buffer> {
  return QRCode.toBuffer(localizeUrl(code), {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 600,
    color: { dark: "#0f2f4a", light: "#ffffff" },
  });
}
