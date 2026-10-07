"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}
function optStr(v: FormDataEntryValue | null): string | null {
  const s = str(v);
  return s.length ? s : null;
}
function optDate(v: FormDataEntryValue | null): Date | null {
  const s = str(v);
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

// Registra un proceso realizado en una visita (vacuna o desparasitación).
// Guarda el evento en el historial y actualiza los campos "última/próxima"
// de la ficha para que la cédula y el carnet reflejen lo más reciente.
export async function addHealthEvent(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;

  const petRecordId = str(formData.get("petRecordId"));
  const type = str(formData.get("type")) === "desparasitacion" ? "desparasitacion" : "vacuna";
  const date = optDate(formData.get("date")) || new Date();
  const nextDate = optDate(formData.get("nextDate"));
  const product = optStr(formData.get("product"));
  const lot = optStr(formData.get("lot"));
  const mvz = optStr(formData.get("mvz"));
  const notes = optStr(formData.get("notes"));
  let photoData = optStr(formData.get("photoData"));
  if (photoData && photoData.length > 2_500_000) photoData = null; // foto demasiado pesada: se descarta

  if (!petRecordId) return;

  await prisma.healthEvent.create({
    data: { petRecordId, type, date, nextDate, product, lot, mvz, notes, photoData },
  });

  // Sincroniza los campos "resumen" de la ficha con el último proceso.
  if (type === "vacuna") {
    await prisma.petRecord.update({
      where: { id: petRecordId },
      data: {
        lastVaccineDate: date,
        nextVaccineDate: nextDate,
        ...(product ? { vaccines: product } : {}),
      },
    });
  } else {
    await prisma.petRecord.update({
      where: { id: petRecordId },
      data: { lastDewormDate: date, nextDewormDate: nextDate },
    });
  }

  revalidatePath(`/admin/${petRecordId}`);
}

// Elimina un evento del historial (solo administradores).
export async function deleteHealthEvent(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = str(formData.get("eventId"));
  const petRecordId = str(formData.get("petRecordId"));
  if (!id) return;
  await prisma.healthEvent.delete({ where: { id } });
  if (petRecordId) revalidatePath(`/admin/${petRecordId}`);
}
