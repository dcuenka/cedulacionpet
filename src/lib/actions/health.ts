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

// Sincroniza los campos "resumen" de la ficha con el último proceso validado.
async function syncSummary(
  petRecordId: string,
  type: string,
  date: Date,
  nextDate: Date | null,
  product: string | null,
) {
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
}

function readEvent(formData: FormData) {
  return {
    petRecordId: str(formData.get("petRecordId")),
    type: str(formData.get("type")) === "desparasitacion" ? "desparasitacion" : "vacuna",
    date: optDate(formData.get("date")) || new Date(),
    nextDate: optDate(formData.get("nextDate")),
    product: optStr(formData.get("product")),
    weight: optStr(formData.get("weight")),
    lot: optStr(formData.get("lot")),
    mvz: optStr(formData.get("mvz")),
    notes: optStr(formData.get("notes")),
    photoData: (() => {
      const p = optStr(formData.get("photoData"));
      return p && p.length > 2_500_000 ? null : p; // foto demasiado pesada: se descarta
    })(),
  };
}

// Registra un proceso realizado en una visita (solo admin) -> queda VALIDADO.
export async function addHealthEvent(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const e = readEvent(formData);
  if (!e.petRecordId) return;

  await prisma.healthEvent.create({
    data: { ...e, status: "validado", source: "admin" },
  });
  await syncSummary(e.petRecordId, e.type, e.date, e.nextDate, e.product);
  revalidatePath(`/admin/${e.petRecordId}`);
}

// El tutor reporta un proceso aplicado en otro lugar -> queda PENDIENTE.
// No requiere admin y NO actualiza el resumen de la ficha hasta validarse.
export async function submitHealthEvent(formData: FormData): Promise<void> {
  const e = readEvent(formData);
  if (!e.petRecordId) return;
  // El reporte del tutor no lleva MVZ ni se considera oficial.
  await prisma.healthEvent.create({
    data: { ...e, mvz: null, status: "pendiente", source: "tutor" },
  });
  revalidatePath(`/admin/${e.petRecordId}`);
  revalidatePath("/admin/validaciones");
}

// Valida un evento pendiente (solo admin) -> pasa a oficial y actualiza el resumen.
export async function validateHealthEvent(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = str(formData.get("eventId"));
  if (!id) return;
  const ev = await prisma.healthEvent.update({
    where: { id },
    data: { status: "validado" },
  });
  await syncSummary(ev.petRecordId, ev.type, ev.date, ev.nextDate, ev.product);
  revalidatePath(`/admin/${ev.petRecordId}`);
  revalidatePath("/admin/validaciones");
}

// Elimina / rechaza un evento (solo administradores).
export async function deleteHealthEvent(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = str(formData.get("eventId"));
  const petRecordId = str(formData.get("petRecordId"));
  if (!id) return;
  await prisma.healthEvent.delete({ where: { id } });
  if (petRecordId) revalidatePath(`/admin/${petRecordId}`);
  revalidatePath("/admin/validaciones");
}
