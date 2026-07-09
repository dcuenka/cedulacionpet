"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  checkPassword,
  createAdminSession,
  destroyAdminSession,
  isAdmin,
} from "@/lib/admin-auth";

export type LoginState = { error?: string } | undefined;

export async function loginAdmin(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") || "");
  if (!checkPassword(password)) {
    return { error: "Contraseña incorrecta." };
  }
  await createAdminSession();
  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  await destroyAdminSession();
  redirect("/admin/login");
}

// Anula o reactiva un registro desde el panel.
export async function toggleStatusAction(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") || "");
  const current = String(formData.get("current") || "activo");
  if (!id) return;
  await prisma.petRecord.update({
    where: { id },
    data: { status: current === "activo" ? "anulado" : "activo" },
  });
  revalidatePath("/admin");
}
