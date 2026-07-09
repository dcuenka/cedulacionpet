import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BRAND } from "@/lib/brand";

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
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "long" }).format(new Date(d));
}

export default async function LocalizarCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: raw } = await params;
  const code = decodeURIComponent(raw);

  const record = await prisma.petRecord.findFirst({
    where: {
      OR: [
        { microchip: code },
        { qrCode: code },
        { certificateNo: code },
        { registrationNo: code },
      ],
    },
  });

  if (!record || record.status === "anulado") {
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

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg">
        {/* Foto + nombre */}
        <div className="flex items-center gap-4 bg-navy p-5 text-white">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10">
            {record.photoData ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={record.photoData} alt={record.petName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl">🐾</span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-black">{record.petName}</h2>
            <p className="text-sm text-white/70">
              {record.species}
              {record.breed ? ` · ${record.breed}` : ""}
            </p>
          </div>
        </div>

        {/* Datos visibles */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 p-5 text-sm">
          <Item label="Sexo" value={record.sex} />
          <Item label="Color" value={record.color} />
          <Item label="Raza" value={record.breed} />
          <Item label="Nacimiento" value={fmt(record.birthDate)} />
          <Item label="Esterilizado" value={record.sterilized ? "Sí" : "No"} />
          <Item label="Adiestramiento" value={record.training ? "Sí" : "No"} />
          <div className="col-span-2">
            <Item label="N.º de microchip" value={record.microchip || "No registra"} mono />
          </div>
          {record.aggressionHistory && (
            <div className="col-span-2 rounded-lg bg-amber-50 px-3 py-2">
              <Item label="⚠ Antecedentes de agresión" value="Sí — manéjala con precaución" />
            </div>
          )}
          {record.diseases && (
            <div className="col-span-2">
              <Item label="Enfermedades / notas de salud" value={record.diseases} />
            </div>
          )}
        </div>

        {/* Contacto del tutor */}
        <div className="border-t border-slate-100 bg-slate-50 p-5">
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
