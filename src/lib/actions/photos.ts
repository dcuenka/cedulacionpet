"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

// Agrega una foto al archivo fotográfico de una ficha (solo administradores).
export async function addPetPhoto(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const petRecordId = str(formData.get("petRecordId"));
  const photoData = str(formData.get("photoData"));
  const caption = str(formData.get("caption")) || null;
  if (!petRecordId || !photoData.startsWith("data:image")) return;
  if (photoData.length > 2_500_000) return; // imagen demasiado pesada
  await prisma.petPhoto.create({ data: { petRecordId, photoData, caption } });
  revalidatePath(`/admin/${petRecordId}`);
}

// Elimina una foto del archivo (solo administradores).
export async function deletePetPhoto(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = str(formData.get("photoId"));
  const petRecordId = str(formData.get("petRecordId"));
  if (!id) return;
  await prisma.petPhoto.delete({ where: { id } });
  if (petRecordId) revalidatePath(`/admin/${petRecordId}`);
}
