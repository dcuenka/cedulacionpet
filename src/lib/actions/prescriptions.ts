"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}
function optDate(v: FormDataEntryValue | null): Date | null {
  const s = str(v);
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

// Agrega una receta (el tutor puede fotografiarla; también el equipo).
export async function addPrescription(formData: FormData): Promise<void> {
  const petRecordId = str(formData.get("petRecordId"));
  const photoData = str(formData.get("photoData"));
  const note = str(formData.get("note")) || null;
  const date = optDate(formData.get("date")) || new Date();
  if (!petRecordId || !photoData.startsWith("data:image")) return;
  if (photoData.length > 2_500_000) return; // imagen demasiado pesada
  const source = (await isAdmin()) ? "admin" : "tutor";
  await prisma.prescription.create({ data: { petRecordId, photoData, note, date, source } });
  revalidatePath(`/admin/${petRecordId}`);
}

// Elimina una receta (solo administradores).
export async function deletePrescription(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = str(formData.get("prescriptionId"));
  const petRecordId = str(formData.get("petRecordId"));
  if (!id) return;
  await prisma.prescription.delete({ where: { id } });
  if (petRecordId) revalidatePath(`/admin/${petRecordId}`);
}
