import sharp from "sharp";

// "Firma visual" de una imagen: miniatura 8x8 en RGB (192 valores 0-1).
// Sirve para buscar fotos parecidas por color/patrón, sin servicios externos.
export async function computeEmbedding(dataUrl: string): Promise<number[] | null> {
  if (!dataUrl || !dataUrl.startsWith("data:image")) return null;
  try {
    const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
    const buf = Buffer.from(base64, "base64");
    const N = 8;
    const raw = await sharp(buf)
      .resize(N, N, { fit: "cover" })
      .removeAlpha()
      .raw()
      .toBuffer();
    const vec: number[] = new Array(raw.length);
    for (let i = 0; i < raw.length; i++) vec[i] = raw[i] / 255;
    return vec; // longitud 192
  } catch {
    return null;
  }
}

// Distancia euclidiana entre dos firmas (menor = más parecidas).
export function distance(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let s = 0;
  for (let i = 0; i < n; i++) {
    const d = a[i] - b[i];
    s += d * d;
  }
  return Math.sqrt(s);
}
