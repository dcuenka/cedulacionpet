import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import PetFichaForm, { type FichaDefaults } from "@/components/PetFichaForm";

export const metadata: Metadata = { title: "Nueva ficha" };

export default async function NuevaFichaPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const { from } = await searchParams;

  // Si viene de una solicitud, precargamos los datos del tutor y la mascota.
  let defaults: FichaDefaults | undefined;
  let solicitud: { id: string; carnetPhoto: string | null } | null = null;
  if (from) {
    const sr = await prisma.serviceRequest.findUnique({ where: { id: from } });
    if (sr) {
      solicitud = { id: sr.id, carnetPhoto: sr.carnetPhoto };
      defaults = {
        petName: sr.petName || "",
        species: sr.species || "",
        breed: sr.breed,
        photoData: sr.petPhoto,
        ownerName: sr.ownerName,
        ownerId: sr.ownerId || "",
        ownerPhone: sr.phone,
        ownerEmail: sr.email,
        ownerAddress: sr.address,
        province: sr.province,
        city: sr.city,
        clientType: "externo",
      };
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href={from ? "/admin/solicitudes" : "/admin"} className="text-sm font-semibold text-teal hover:underline">
        ← Volver{from ? " a solicitudes" : " al panel"}
      </Link>
      <h1 className="mt-2 text-3xl font-black text-navy">Nueva ficha de mascota</h1>
      <p className="mb-6 mt-2 text-slate-600">
        Registra la información de la mascota y su tutor. Los campos marcados con{" "}
        <span className="font-bold text-teal">*</span> son obligatorios. Al guardar
        se genera la cédula y el código QR de localización.
      </p>

      {defaults && (
        <div className="mb-6 rounded-lg border border-teal/30 bg-teal/5 px-4 py-3 text-sm text-slate-700">
          ✓ Datos precargados desde la solicitud de <strong>{defaults.ownerName}</strong>.
          Revísalos, completa lo que falte y guarda para crear la ficha.
          {solicitud?.carnetPhoto && (
            <span className="mt-1 block text-xs text-slate-500">
              La solicitud incluye una foto del carnet de vacunas (visible en Solicitudes) para cargar el historial después.
            </span>
          )}
        </div>
      )}

      <PetFichaForm record={defaults} fromRequest={solicitud?.id} />
    </div>
  );
}
