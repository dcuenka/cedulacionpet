"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateRegistrationNumber } from "@/lib/registration";
import { isAdmin } from "@/lib/admin-auth";
import { computeEmbedding } from "@/lib/image-embedding";

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
    distinctiveMarks: optStr(formData.get("distinctiveMarks")),
    sterilized: str(formData.get("sterilized")) === "on",
    training: str(formData.get("training")) === "on",
    aggressionHistory: str(formData.get("aggressionHistory")) === "on",
    feeding: optStr(formData.get("feeding")),
    lastVaccineDate: optDate(formData.get("lastVaccineDate")),
    nextVaccineDate: optDate(formData.get("nextVaccineDate")),
    vaccines: optStr(formData.get("vaccines")),
    lastDewormDate: optDate(formData.get("lastDewormDate")),
    nextDewormDate: optDate(formData.get("nextDewormDate")),
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
  const embedding = f.photoData ? await computeEmbedding(f.photoData) : null;

  let createdId = "";
  try {
    const created = await prisma.petRecord.create({
      data: { registrationNo, ...f, ...(embedding ? { embedding } : {}) },
      select: { id: true },
    });
    createdId = created.id;
  } catch (e) {
    const ue = uniqueError(e);
    if (ue) return { error: ue };
    throw e;
  }

  // Si la ficha se creó a partir de una solicitud: copiamos las fotos del
  // estudio biométrico y marcamos la solicitud como atendida.
  const fromRequest = str(formData.get("fromRequest"));
  if (fromRequest && createdId) {
    try {
      const sr = await prisma.serviceRequest.findUnique({
        where: { id: fromRequest },
        select: { bioFront: true, bioNose: true, bioRight: true, bioLeft: true, bioMark: true },
      });
      if (sr) {
        const bio = [
          { kind: "bio-frente", data: sr.bioFront },
          { kind: "bio-nariz", data: sr.bioNose },
          { kind: "bio-perfil-der", data: sr.bioRight },
          { kind: "bio-perfil-izq", data: sr.bioLeft },
          { kind: "bio-rasgo", data: sr.bioMark },
        ].filter((b) => b.data && b.data.startsWith("data:image"));
        if (bio.length) {
          await prisma.petPhoto.createMany({
            data: bio.map((b) => ({ petRecordId: createdId, kind: b.kind, photoData: b.data as string })),
          });
        }
      }
      await prisma.serviceRequest.update({ where: { id: fromRequest }, data: { status: "atendida" } });
    } catch {
      /* no bloquea la creación de la ficha */
    }
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

  const embedding = f.photoData ? await computeEmbedding(f.photoData) : null;

  try {
    await prisma.petRecord.update({ where: { id }, data: { ...f, ...(embedding ? { embedding } : {}) } });
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
