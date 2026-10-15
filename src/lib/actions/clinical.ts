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

const MODULES = new Set(["showCedula", "showCarnet", "showHistoria"]);

// Activa/desactiva un módulo que el tutor ve (cédula, carnet, historia clínica).
export async function toggleModule(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = str(formData.get("id"));
  const field = str(formData.get("field"));
  const value = str(formData.get("value")) === "true";
  if (!id || !MODULES.has(field)) return;
  await prisma.petRecord.update({ where: { id }, data: { [field]: value } });
  revalidatePath(`/admin/${id}`);
}

// Agrega una atención a la historia clínica (solo admin).
export async function addClinicalEntry(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const petRecordId = str(formData.get("petRecordId"));
  if (!petRecordId) return;
  await prisma.clinicalEntry.create({
    data: {
      petRecordId,
      date: optDate(formData.get("date")) || new Date(),
      weight: optStr(formData.get("weight")),
      reason: optStr(formData.get("reason")),
      diagnosis: optStr(formData.get("diagnosis")),
      treatment: optStr(formData.get("treatment")),
      notes: optStr(formData.get("notes")),
      mvz: optStr(formData.get("mvz")),
    },
  });
  revalidatePath(`/admin/${petRecordId}`);
}

export async function deleteClinicalEntry(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = str(formData.get("entryId"));
  const petRecordId = str(formData.get("petRecordId"));
  if (!id) return;
  await prisma.clinicalEntry.delete({ where: { id } });
  if (petRecordId) revalidatePath(`/admin/${petRecordId}`);
}
