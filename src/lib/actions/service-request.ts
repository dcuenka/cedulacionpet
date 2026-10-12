"use server";

import { redirect } from "next/navigation";
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
function optPhoto(v: FormDataEntryValue | null): string | null {
  const s = str(v);
  if (!s.startsWith("data:image")) return null;
  if (s.length > 2_500_000) return null; // imagen demasiado pesada
  return s;
}

// Crea una solicitud de servicio desde el formulario público.
export async function createServiceRequest(formData: FormData): Promise<void> {
  const ownerName = str(formData.get("ownerName"));
  const phone = str(formData.get("phone"));
  const province = str(formData.get("province"));
  // Obligatorios mínimos; si faltan, regresa al formulario con aviso.
  if (!ownerName || !phone || !province) {
    redirect("/solicitar?error=1");
  }

  const microchip = optStr(formData.get("microchip"));
  await prisma.serviceRequest.create({
    data: {
      ownerName,
      phone,
      province,
      phoneAlt: optStr(formData.get("phoneAlt")),
      ownerId: optStr(formData.get("ownerId")),
      email: optStr(formData.get("email")),
      city: optStr(formData.get("city")),
      address: optStr(formData.get("address")),
      petName: optStr(formData.get("petName")),
      species: optStr(formData.get("species")),
      breed: optStr(formData.get("breed")),
      sex: optStr(formData.get("sex")),
      color: optStr(formData.get("color")),
      birthDate: optDate(formData.get("birthDate")),
      microchip,
      hasChip: str(formData.get("hasChip")) === "on" || !!microchip,
      petPhoto: optPhoto(formData.get("petPhoto")),
      carnetPhoto: optPhoto(formData.get("carnetPhoto")),
      message: optStr(formData.get("message")),
    },
  });

  revalidatePath("/admin/solicitudes");
  redirect("/solicitar?ok=1");
}

// Cambia el estado de una solicitud (solo administradores).
export async function updateServiceRequestStatus(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = str(formData.get("id"));
  const status = str(formData.get("status"));
  if (!id || !status) return;
  await prisma.serviceRequest.update({ where: { id }, data: { status } });
  revalidatePath("/admin/solicitudes");
}

// Elimina una solicitud (solo administradores).
export async function deleteServiceRequest(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = str(formData.get("id"));
  if (!id) return;
  await prisma.serviceRequest.delete({ where: { id } });
  revalidatePath("/admin/solicitudes");
}
