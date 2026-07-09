import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import PetFichaForm from "@/components/PetFichaForm";

export const metadata: Metadata = { title: "Nueva ficha" };

export default async function NuevaFichaPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/admin" className="text-sm font-semibold text-teal hover:underline">
        ← Volver al panel
      </Link>
      <h1 className="mt-2 text-3xl font-black text-navy">Nueva ficha de mascota</h1>
      <p className="mb-8 mt-2 text-slate-600">
        Registra la información de la mascota y su tutor. Los campos marcados con{" "}
        <span className="font-bold text-teal">*</span> son obligatorios. Al guardar
        se genera la cédula y el código QR de localización.
      </p>
      <PetFichaForm />
    </div>
  );
}
