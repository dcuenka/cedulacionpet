"use server";

import Anthropic from "@anthropic-ai/sdk";

export type ExtractResult = {
  type?: "vacuna" | "desparasitacion";
  product?: string | null;
  date?: string | null; // yyyy-mm-dd
  mvz?: string | null;
  weight?: string | null;
  error?: string;
};

const PROMPT = `Eres un asistente veterinario que lee documentos de salud de mascotas en español (recetas, etiquetas de vacunas o páginas de un carnet de vacunación/desparasitación).
Extrae ÚNICAMENTE lo que esté visible en la imagen y devuélvelo en JSON con EXACTAMENTE estas claves:
{
  "type": "vacuna" | "desparasitacion" | null,   // tipo de proceso
  "product": string | null,                        // nombre de la vacuna o del producto/antiparasitario
  "date": "YYYY-MM-DD" | null,                      // fecha de aplicación (convierte D/M/A a ISO; si el año tiene 2 dígitos asume 20AA)
  "mvz": string | null,                             // nombre del médico veterinario / firma, si se lee con claridad
  "weight": string | null                           // peso en kg (solo el número, ej "15")
}
Reglas: si un dato no aparece o no se lee con seguridad, pon null (no inventes). Responde SOLO el JSON, sin texto adicional ni explicaciones.`;

function pickJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) return text.slice(start, end + 1);
  return text.trim();
}

// Analiza una foto (receta / etiqueta / carnet) y extrae tipo, producto,
// fecha, médico y peso para prellenar el formulario. La IA PROPONE; el
// equipo valida antes de que sea oficial.
export async function extractHealthFromPhoto(dataUrl: string): Promise<ExtractResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { error: "La lectura con IA no está configurada (falta ANTHROPIC_API_KEY)." };
  }
  if (!dataUrl || !dataUrl.startsWith("data:image")) {
    return { error: "Imagen inválida." };
  }
  const comma = dataUrl.indexOf(",");
  const meta = dataUrl.slice(0, comma);
  const base64 = dataUrl.slice(comma + 1);
  const mediaMatch = meta.match(/data:(image\/(?:jpeg|png|webp|gif))/);
  const media = (mediaMatch?.[1] || "image/jpeg") as "image/jpeg" | "image/png" | "image/webp" | "image/gif";

  try {
    const client = new Anthropic();
    const model = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";
    const response = await client.messages.create({
      model,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: media, data: base64 } },
            { type: "text", text: PROMPT },
          ],
        },
      ],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    const parsed = JSON.parse(pickJson(text)) as Record<string, unknown>;

    const type =
      parsed.type === "desparasitacion" || parsed.type === "vacuna" ? parsed.type : undefined;
    const asStr = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
    const weightRaw = asStr(parsed.weight);
    const weight = weightRaw ? weightRaw.replace(/[^0-9.,]/g, "").replace(",", ".") || null : null;

    return {
      type,
      product: asStr(parsed.product),
      date: asStr(parsed.date),
      mvz: asStr(parsed.mvz),
      weight,
    };
  } catch {
    return { error: "No se pudo leer la imagen. Intenta con una foto más clara o escribe los datos a mano." };
  }
}
