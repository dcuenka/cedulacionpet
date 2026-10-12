"use server";

import { prisma } from "@/lib/prisma";
import { computeEmbedding, distance } from "@/lib/image-embedding";

export type PhotoMatch = {
  code: string; // para abrir /m/<code>
  registrationNo: string;
  petName: string;
  species: string;
  photoData: string | null;
  microchip: string | null;
  lost: boolean;
  score: number; // 0-100 parecido aproximado
};

// Distancia máxima posible de una firma 8x8x3 (192 valores en [0,1]).
const MAX_D = Math.sqrt(192);

// Busca mascotas con foto parecida (color/patrón). La IA/algoritmo propone;
// quien busca confirma visualmente. No reemplaza al microchip/QR.
export async function searchByPhoto(
  dataUrl: string,
): Promise<{ matches?: PhotoMatch[]; error?: string }> {
  const q = await computeEmbedding(dataUrl);
  if (!q) return { error: "No se pudo procesar la imagen. Intenta con otra foto." };

  const pets = await prisma.petRecord.findMany({
    where: { status: "activo" },
    select: { id: true, embedding: true },
    take: 3000,
  });

  const scored = pets
    .map((p) => ({ id: p.id, emb: p.embedding as unknown as number[] | null }))
    .filter((p) => Array.isArray(p.emb) && p.emb.length > 0)
    .map((p) => ({ id: p.id, d: distance(q, p.emb as number[]) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 8);

  if (scored.length === 0) return { matches: [] };

  const top = await prisma.petRecord.findMany({
    where: { id: { in: scored.map((s) => s.id) } },
    select: {
      id: true,
      registrationNo: true,
      petName: true,
      species: true,
      photoData: true,
      microchip: true,
      lost: true,
    },
  });

  const matches: PhotoMatch[] = scored.map((s) => {
    const r = top.find((t) => t.id === s.id)!;
    return {
      code: r.microchip || r.registrationNo,
      registrationNo: r.registrationNo,
      petName: r.petName,
      species: r.species,
      photoData: r.photoData,
      microchip: r.microchip,
      lost: r.lost,
      score: Math.max(0, Math.min(100, Math.round((1 - s.d / MAX_D) * 100))),
    };
  });

  return { matches };
}
