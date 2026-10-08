import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BRAND } from "@/lib/brand";
import { qrDataUrl, lookupCode } from "@/lib/qr";
import CedulaPresenter from "@/components/CedulaPresenter";
import ShareBar from "@/components/ShareBar";
import InstallButton from "@/components/InstallButton";
import HealthEventSubmit from "@/components/HealthEventSubmit";
import PhotoAlbum from "@/components/PhotoAlbum";

export const metadata: Metadata = { title: "Localización de mascota" };

// Normaliza un teléfono ecuatoriano a formato internacional para WhatsApp.
function waLink(phone?: string | null): string | null {
  if (!phone) return null;
  let d = phone.replace(/\D/g, "");
  if (!d) return null;
  if (d.length === 10 && d.startsWith("0")) d = "593" + d.slice(1);
  else if (d.length === 9) d = "593" + d;
  return `https://wa.me/${d}`;
}

function fmt(d?: Date | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "long", timeZone: "UTC" }).format(new Date(d));
}

export default async function LocalizarCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: raw } = await params;
  const code = decodeURIComponent(raw);

  // Busca por microchip, código QR, certificado, N.º de ficha o cédula/RUC del tutor.
  const matches = await prisma.petRecord.findMany({
    where: {
      status: "activo",
      OR: [
        { microchip: code },
        { qrCode: code },
        { certificateNo: code },
        { registrationNo: code },
        { ownerId: code },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      healthEvents: { orderBy: { date: "desc" } },
      photos: { orderBy: { createdAt: "desc" } },
    },
  });

  // Varias mascotas registradas a nombre del mismo tutor: se elige cuál ver.
  if (matches.length > 1) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-lg">
          <h1 className="text-xl font-black text-navy">
            {matches.length} mascotas encontradas
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Este tutor tiene varias mascotas registradas. Elige una para ver su ficha.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            {matches.map((m) => (
              <Link
                key={m.id}
                href={`/m/${encodeURIComponent(m.microchip || m.registrationNo)}`}
                className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-teal hover:bg-teal/5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                  {m.photoData ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photoData} alt={m.petName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl">🐾</span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-navy">{m.petName}</p>
                  <p className="text-xs text-slate-500">
                    {m.species}
                    {m.breed ? ` · ${m.breed}` : ""}
                    {m.lost ? " · ⚠ Perdida" : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const record = matches[0];

  if (!record) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
          <p className="text-4xl">🐾</p>
          <h1 className="mt-4 text-xl font-black text-navy">Sin coincidencias</h1>
          <p className="mt-2 text-sm text-slate-600">
            No encontramos una mascota registrada con el código{" "}
            <span className="font-mono font-semibold">{code}</span>.
          </p>
          <Link
            href="/localizar"
            className="mt-6 inline-block rounded-lg bg-navy px-6 py-2.5 font-semibold text-white"
          >
            Intentar de nuevo
          </Link>
        </div>
      </div>
    );
  }

  const wa = waLink(record.ownerPhone) || waLink(record.ownerPhoneAlt);
  const petCode = lookupCode(record);
  const qr = await qrDataUrl(petCode);
  const validatedEvents = record.healthEvents.filter((e) => e.status === "validado");
  const pendingEvents = record.healthEvents.filter((e) => e.status === "pendiente");
  const hasHealth =
    record.vaccines ||
    record.lastVaccineDate ||
    record.nextVaccineDate ||
    record.lastDewormDate ||
    record.nextDewormDate ||
    validatedEvents.length > 0;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      {/* Estado */}
      {record.lost ? (
        <div className="mb-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-5 text-center">
          <p className="text-2xl">🚨</p>
          <h1 className="mt-1 text-lg font-black text-amber-900">
            ¡Esta mascota está reportada como PERDIDA!
          </h1>
          <p className="text-sm text-amber-800">
            Si la encontraste, por favor contacta a su tutor. ¡Gracias por ayudar!
          </p>
        </div>
      ) : (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
          <p className="text-sm font-semibold text-emerald-800">
            ✅ Mascota registrada en {BRAND.name}
          </p>
        </div>
      )}

      {/* Identificación digital: esto es lo que el tutor muestra en el celular */}
      <CedulaPresenter record={record} qr={qr} />

      {/* Acciones: compartir / instalar app (no se imprime) */}
      <div className="no-print mt-3 flex flex-wrap items-center justify-center gap-2">
        <ShareBar petName={record.petName} />
        <InstallButton className="rounded-md border border-navy/30 px-4 py-2 text-sm font-semibold text-navy transition hover:bg-navy/5" />
      </div>
      <p className="no-print mt-2 text-center text-xs text-slate-400">
        Guarda esta página o instala la app para mostrar la identificación y el
        carnet de {record.petName} desde tu celular, sin papeles.
      </p>

      {/* Carnet de salud y comportamiento (documento de apoyo para el veterinario) */}
      {(hasHealth || record.training || record.aggressionHistory || record.diseases) && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          <div className="bg-navy px-5 py-3">
            <p className="text-sm font-black text-white">💉 Carnet de salud</p>
            <p className="text-[11px] text-white/60">
              Información para tu veterinario
            </p>
          </div>
          <div className="p-5">
            {record.aggressionHistory && (
              <div className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
                ⚠ Antecedentes de agresión — manéjala con precaución
              </div>
            )}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Item label="Esterilizado" value={record.sterilized ? "Sí" : "No"} />
              <Item label="Adiestramiento" value={record.training ? "Sí" : "No"} />
              {hasHealth && (
                <>
                  <Item label="Última vacuna" value={fmt(record.lastVaccineDate)} />
                  <Item label="Próxima vacuna" value={fmt(record.nextVaccineDate)} />
                  <Item label="Última desparasitación" value={fmt(record.lastDewormDate)} />
                  <Item label="Próxima desparasitación" value={fmt(record.nextDewormDate)} />
                </>
              )}
            </div>
            {record.vaccines && (
              <p className="mt-3 text-sm text-navy">
                <span className="font-semibold">Vacunas aplicadas:</span> {record.vaccines}
              </p>
            )}
            {record.diseases && (
              <p className="mt-2 text-sm text-navy">
                <span className="font-semibold">Enfermedades / notas:</span> {record.diseases}
              </p>
            )}

            {validatedEvents.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-teal">
                  Historial de procesos
                </p>
                <ul className="mt-2 space-y-2">
                  {validatedEvents.map((ev) => (
                    <li
                      key={ev.id}
                      className="flex items-start gap-2 border-b border-slate-100 pb-2 text-sm last:border-0"
                    >
                      <span
                        className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                          ev.type === "vacuna"
                            ? "bg-teal/10 text-teal"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {ev.type === "vacuna" ? "VACUNA" : "DESPARAS."}
                      </span>
                      <span className="text-navy">
                        <span className="font-semibold">{fmt(ev.date)}</span>
                        {ev.product ? ` · ${ev.product}` : ""}
                        {ev.nextDate ? (
                          <span className="block text-xs text-slate-500">
                            Próxima: {fmt(ev.nextDate)}
                          </span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reportes del tutor: pendientes + nuevo reporte */}
      <div className="mt-4">
        {pendingEvents.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
              ⏳ Pendiente de validación
            </p>
            <ul className="mt-2 space-y-1">
              {pendingEvents.map((ev) => (
                <li key={ev.id} className="text-sm text-amber-900">
                  <span className="font-semibold">
                    {ev.type === "vacuna" ? "Vacuna" : "Desparasitación"}
                  </span>
                  {ev.product ? ` · ${ev.product}` : ""} · {fmt(ev.date)}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-amber-700/80">
              El equipo veterinario revisará este reporte antes de incluirlo en el carnet oficial.
            </p>
          </div>
        )}
        <HealthEventSubmit petRecordId={record.id} />
      </div>

      {/* Archivo fotográfico (respaldo) */}
      <PhotoAlbum photos={record.photos} />

      {/* Contacto del tutor */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <div className="bg-slate-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-teal">
            Contacto del tutor
          </p>
          <p className="mt-1 text-lg font-bold text-navy">{record.ownerName}</p>
          <p className="text-sm text-slate-500">
            {[record.city, record.province].filter(Boolean).join(", ") || "Ecuador"}
          </p>

          <div className="mt-4 flex flex-col gap-2">
            {record.ownerPhone && (
              <a href={`tel:${record.ownerPhone}`} className="rounded-lg bg-navy px-4 py-3 text-center font-semibold text-white transition hover:bg-navy-700">
                📞 Llamar {record.ownerPhone}
              </a>
            )}
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-teal px-4 py-3 text-center font-semibold text-white transition hover:bg-teal-600">
                💬 Escribir por WhatsApp
              </a>
            )}
            {record.ownerEmail && (
              <a href={`mailto:${record.ownerEmail}`} className="rounded-lg border border-slate-300 px-4 py-3 text-center font-semibold text-navy transition hover:bg-white">
                ✉ {record.ownerEmail}
              </a>
            )}
            {!record.ownerPhone && !wa && !record.ownerEmail && (
              <p className="text-sm text-slate-500">
                No hay datos de contacto públicos. Comunícate con {BRAND.name}.
              </p>
            )}
          </div>
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-slate-400">
        Ficha N.º <span className="font-mono">{record.registrationNo}</span> ·{" "}
        {BRAND.tagline}
      </p>
    </div>
  );
}

function Item({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-teal">{label}</p>
      <p className={`font-medium text-navy ${mono ? "font-mono" : ""}`}>
        {value || "—"}
      </p>
    </div>
  );
}
