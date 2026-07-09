import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { qrDataUrl, lookupCode, localizeUrl } from "@/lib/qr";
import { toggleLost } from "@/lib/actions/records";
import { toggleStatusAction } from "@/lib/actions/admin";
import CedulaCard from "@/components/CedulaCard";

export const metadata: Metadata = { title: "Ficha" };

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-navy">{value || "—"}</span>
    </div>
  );
}

export default async function FichaAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const r = await prisma.petRecord.findUnique({ where: { id } });
  if (!r) notFound();

  const code = lookupCode(r);
  const qr = await qrDataUrl(code);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin" className="text-sm font-semibold text-teal hover:underline">
          ← Volver al panel
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/${id}/editar`}
            className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700"
          >
            Editar ficha
          </Link>
          <a
            href={`/api/cedula/${encodeURIComponent(r.registrationNo)}`}
            className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-600"
          >
            ⬇ Cédula PDF
          </a>
          <a
            href={`/api/pasaporte/${encodeURIComponent(r.registrationNo)}`}
            className="rounded-lg bg-[#6b1f2a] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            ⬇ Pasaporte PDF
          </a>
        </div>
      </div>

      {(r.lost || r.status === "anulado") && (
        <div className="mt-4 flex flex-wrap gap-2">
          {r.lost && (
            <span className="rounded-lg bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">
              ⚠ Marcada como PERDIDA
            </span>
          )}
          {r.status === "anulado" && (
            <span className="rounded-lg bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
              Registro ANULADO
            </span>
          )}
        </div>
      )}

      <div className="mt-5">
        <CedulaCard record={r} qr={qr} />
      </div>

      {/* Acciones de estado */}
      <div className="mt-4 flex flex-wrap gap-2">
        <form action={toggleLost}>
          <input type="hidden" name="id" value={r.id} />
          <input type="hidden" name="current" value={String(r.lost)} />
          <button className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100">
            {r.lost ? "Marcar como encontrada" : "Reportar como perdida"}
          </button>
        </form>
        <form action={toggleStatusAction}>
          <input type="hidden" name="id" value={r.id} />
          <input type="hidden" name="current" value={r.status} />
          <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
            {r.status === "activo" ? "Anular registro" : "Reactivar registro"}
          </button>
        </form>
      </div>

      {/* Detalle completo */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="mb-3 font-bold text-navy">Números e identificación</h2>
          <Row label="N.º de ficha" value={r.registrationNo} />
          <Row label="Certificado N.º" value={r.certificateNo} />
          <Row label="Código QR N.º" value={r.qrCode} />
          <Row label="Microchip (serie)" value={r.microchip || "No registra"} />
          <Row label="Especie" value={r.species} />
          <Row label="Raza" value={r.breed} />
          <Row label="Sexo" value={r.sex} />
          <Row label="Color" value={r.color} />
          <Row label="Nacimiento" value={r.birthDate ? new Intl.DateTimeFormat("es-EC", { dateStyle: "long" }).format(r.birthDate) : null} />
        </div>

        <div className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="mb-3 font-bold text-navy">Salud y comportamiento</h2>
          <Row label="Esterilizado" value={r.sterilized ? "Sí" : "No"} />
          <Row label="Adiestramiento" value={r.training ? "Sí" : "No"} />
          <Row label="Antecedentes de agresión" value={r.aggressionHistory ? "Sí" : "No"} />
          <Row label="Alimentación" value={r.feeding} />
          <Row label="Última vacuna" value={r.lastVaccineDate ? new Intl.DateTimeFormat("es-EC", { dateStyle: "long" }).format(r.lastVaccineDate) : null} />
          <Row label="Enfermedades" value={r.diseases} />
        </div>

        <div className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="mb-3 font-bold text-navy">Tutor responsable</h2>
          <Row label="Nombre" value={r.ownerName} />
          <Row label="Identificación" value={`${r.ownerIdType}: ${r.ownerId}`} />
          <Row label="Teléfono 1" value={r.ownerPhone} />
          <Row label="Teléfono 2" value={r.ownerPhoneAlt} />
          <Row label="Correo" value={r.ownerEmail} />
          <Row label="Dirección" value={r.ownerAddress} />
          <Row label="Ciudad / Provincia" value={[r.city, r.province].filter(Boolean).join(", ")} />
        </div>

        <div className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="mb-3 font-bold text-navy">Datos internos</h2>
          <Row label="MVZ responsable" value={r.mvz} />
          <Row label="Origen" value={r.clientType} />
          <Row label="Estado" value={r.status} />
          <Row label="Notas" value={r.notes} />
          <Row label="Creada" value={new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(r.createdAt)} />
          <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs">
            <p className="font-semibold text-navy">Enlace de localización (QR):</p>
            <a href={localizeUrl(code)} className="break-all text-teal hover:underline">
              {localizeUrl(code)}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
