"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateRegistrationNumber } from "@/lib/registration";
import { isAdmin } from "@/lib/admin-auth";

export type RecordState = { error?: string } | undefined;

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

// Campos comunes de mascota + tutor extraídos del formulario.
function readFields(formData: FormData) {
  return {
    certificateNo: optStr(formData.get("certificateNo")),
    qrCode: optStr(formData.get("qrCode")),
    microchip: optStr(formData.get("microchip")),
    petName: str(formData.get("petName")),
    species: str(formData.get("species")),
    breed: optStr(formData.get("breed")),
    birthDate: optDate(formData.get("birthDate")),
    sex: str(formData.get("sex")),
    color: optStr(formData.get("color")),
    sterilized: str(formData.get("sterilized")) === "on",
    training: str(formData.get("training")) === "on",
    aggressionHistory: str(formData.get("aggressionHistory")) === "on",
    feeding: optStr(formData.get("feeding")),
    lastVaccineDate: optDate(formData.get("lastVaccineDate")),
    diseases: optStr(formData.get("diseases")),
    photoData: optStr(formData.get("photoData")),
    ownerName: str(formData.get("ownerName")),
    ownerIdType: str(formData.get("ownerIdType")) || "Cédula",
    ownerId: str(formData.get("ownerId")),
    ownerPhone: optStr(formData.get("ownerPhone")),
    ownerPhoneAlt: optStr(formData.get("ownerPhoneAlt")),
    ownerEmail: optStr(formData.get("ownerEmail")),
    ownerAddress: optStr(formData.get("ownerAddress")),
    province: optStr(formData.get("province")),
    city: optStr(formData.get("city")),
    mvz: optStr(formData.get("mvz")),
    clientType: str(formData.get("clientType")) === "externo" ? "externo" : "interno",
    notes: optStr(formData.get("notes")),
  };
}

function validate(f: ReturnType<typeof readFields>): string | null {
  if (!f.petName || !f.species || !f.sex || !f.ownerName || !f.ownerId) {
    return "Completa los campos obligatorios (*).";
  }
  if (f.photoData && f.photoData.length > 3_500_000) {
    return "La foto es demasiado grande. Usa una imagen más liviana.";
  }
  return null;
}

function uniqueError(e: unknown): string | null {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
    const target = String((e.meta as { target?: string })?.target || "");
    if (target.includes("qrCode")) {
      return "Ese Código QR N° ya está registrado en otra ficha.";
    }
    return "Ese número de serie de microchip ya está registrado en otra ficha.";
  }
  return null;
}

// Crea una nueva ficha (solo administradores).
export async function createRecord(
  _prev: RecordState,
  formData: FormData,
): Promise<RecordState> {
  if (!(await isAdmin())) return { error: "Sesión expirada. Vuelve a ingresar." };

  const f = readFields(formData);
  const err = validate(f);
  if (err) return { error: err };

  const registrationNo = await generateRegistrationNumber();

  try {
    await prisma.petRecord.create({ data: { registrationNo, ...f } });
  } catch (e) {
    const ue = uniqueError(e);
    if (ue) return { error: ue };
    throw e;
  }

  redirect(`/cedula/${registrationNo}`);
}

// Actualiza una ficha existente (solo administradores).
export async function updateRecord(
  id: string,
  _prev: RecordState,
  formData: FormData,
): Promise<RecordState> {
  if (!(await isAdmin())) return { error: "Sesión expirada. Vuelve a ingresar." };

  const f = readFields(formData);
  const err = validate(f);
  if (err) return { error: err };

  try {
    await prisma.petRecord.update({ where: { id }, data: f });
  } catch (e) {
    const ue = uniqueError(e);
    if (ue) return { error: ue };
    throw e;
  }

  revalidatePath(`/admin/${id}`);
  redirect(`/admin/${id}`);
}

// Marca / desmarca una ficha como perdida (solo administradores).
export async function toggleLost(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = str(formData.get("id"));
  const current = str(formData.get("current")) === "true";
  if (!id) return;
  await prisma.petRecord.update({ where: { id }, data: { lost: !current } });
  revalidatePath(`/admin/${id}`);
  revalidatePath("/admin");
}
