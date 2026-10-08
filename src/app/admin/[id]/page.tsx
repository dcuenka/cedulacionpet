import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { qrDataUrl, lookupCode, localizeUrl } from "@/lib/qr";
import { toggleLost } from "@/lib/actions/records";
import { toggleStatusAction } from "@/lib/actions/admin";
import CedulaCard from "@/components/CedulaCard";
import HealthEventForm from "@/components/HealthEventForm";
import PetPhotoManager from "@/components/PetPhotoManager";
import { deleteHealthEvent, validateHealthEvent } from "@/lib/actions/health";

export const metadata: Metadata = { title: "Ficha" };

function fmtDate(d?: Date | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(d));
}

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
  const r = await prisma.petRecord.findUnique({
    where: { id },
    include: {
      healthEvents: { orderBy: { date: "desc" } },
      photos: { orderBy: { createdAt: "desc" } },
    },
  });
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
            href={`/api/carnet/${encodeURIComponent(r.registrationNo)}`}
            className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700"
          >
            ⬇ Carnet PDF
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
          <Row label="Próxima vacuna" value={r.nextVaccineDate ? new Intl.DateTimeFormat("es-EC", { dateStyle: "long" }).format(r.nextVaccineDate) : null} />
          <Row label="Vacunas aplicadas" value={r.vaccines} />
          <Row label="Última desparasitación" value={r.lastDewormDate ? new Intl.DateTimeFormat("es-EC", { dateStyle: "long" }).format(r.lastDewormDate) : null} />
          <Row label="Próxima desparasitación" value={r.nextDewormDate ? new Intl.DateTimeFormat("es-EC", { dateStyle: "long" }).format(r.nextDewormDate) : null} />
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

      {/* Carnet de salud: historial de procesos + registro rápido */}
      <div className="mt-8">
        <h2 className="mb-3 font-bold text-navy">💉 Carnet de salud · historial</h2>
        <HealthEventForm petRecordId={r.id} />

        {r.healthEvents.length > 0 ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2">Fecha</th>
                  <th className="px-4 py-2">Tipo</th>
                  <th className="px-4 py-2">Producto</th>
                  <th className="px-4 py-2">Próxima</th>
                  <th className="px-4 py-2">Foto</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {r.healthEvents.map((ev) => (
                  <tr
                    key={ev.id}
                    className={`border-t border-slate-100 align-middle ${
                      ev.status === "pendiente" ? "bg-amber-50/60" : ""
                    }`}
                  >
                    <td className="px-4 py-2 font-medium text-navy">{fmtDate(ev.date)}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-semibold ${
                          ev.type === "vacuna"
                            ? "bg-teal/10 text-teal"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {ev.type === "vacuna" ? "Vacuna" : "Desparasitación"}
                      </span>
                      {ev.status === "pendiente" && (
                        <span className="ml-1 rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                          ⏳ PENDIENTE{ev.source === "tutor" ? " · TUTOR" : ""}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-slate-700">
                      {ev.product || "—"}
                      {ev.lot ? <span className="text-xs text-slate-400"> · Lote {ev.lot}</span> : null}
                      {ev.mvz ? <span className="block text-xs text-slate-400">MVZ {ev.mvz}</span> : null}
                    </td>
                    <td className="px-4 py-2 text-slate-600">{fmtDate(ev.nextDate)}</td>
                    <td className="px-4 py-2">
                      {ev.photoData ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ev.photoData} alt="Etiqueta" className="h-10 w-10 rounded object-cover ring-1 ring-slate-200" />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {ev.status === "pendiente" && (
                          <form action={validateHealthEvent}>
                            <input type="hidden" name="eventId" value={ev.id} />
                            <button className="rounded bg-teal px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-teal-600">
                              Validar
                            </button>
                          </form>
                        )}
                        <form action={deleteHealthEvent}>
                          <input type="hidden" name="eventId" value={ev.id} />
                          <input type="hidden" name="petRecordId" value={r.id} />
                          <button className="text-xs text-slate-400 transition hover:text-red-500">
                            {ev.status === "pendiente" ? "Rechazar" : "Eliminar"}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-400">
            Aún no hay procesos registrados. Usa el formulario de arriba en cada visita.
          </p>
        )}
      </div>

      {/* Archivo fotográfico */}
      <div className="mt-8">
        <h2 className="mb-3 font-bold text-navy">📸 Archivo fotográfico</h2>
        <PetPhotoManager petRecordId={r.id} photos={r.photos} />
      </div>
    </div>
  );
}
