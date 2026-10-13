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

// Alguien encontró una mascota y sube su foto para verificación (público).
export async function submitFoundReport(formData: FormData): Promise<{ ok?: boolean; error?: string }> {
  const photoData = str(formData.get("photoData"));
  if (!photoData.startsWith("data:image")) return { error: "Adjunta una foto de la mascota." };
  if (photoData.length > 2_500_000) return { error: "La foto es demasiado pesada." };
  await prisma.foundReport.create({
    data: {
      photoData,
      phone: optStr(formData.get("phone")),
      note: optStr(formData.get("note")),
    },
  });
  revalidatePath("/admin/verificaciones");
  return { ok: true };
}

export async function updateFoundReportStatus(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = str(formData.get("id"));
  const status = str(formData.get("status"));
  if (!id || !status) return;
  await prisma.foundReport.update({ where: { id }, data: { status } });
  revalidatePath("/admin/verificaciones");
}

export async function deleteFoundReport(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = str(formData.get("id"));
  if (!id) return;
  await prisma.foundReport.delete({ where: { id } });
  revalidatePath("/admin/verificaciones");
}
