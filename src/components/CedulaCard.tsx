import { BRAND } from "@/lib/brand";
import Paw from "@/components/Paw";

type Record = {
  registrationNo: string;
  certificateNo?: string | null;
  petName: string;
  species: string;
  breed?: string | null;
  sex: string;
  color?: string | null;
  birthDate?: Date | null;
  microchip?: string | null;
  sterilized: boolean;
  photoData?: string | null;
  ownerName: string;
  ownerIdType: string;
  ownerId: string;
  city?: string | null;
  province?: string | null;
  status?: string;
  createdAt: Date;
};

function fmt(d?: Date | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(d));
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-teal">
        {label}
      </p>
      <p className="text-sm font-semibold text-navy">{value || "—"}</p>
    </div>
  );
}

export default function CedulaCard({
  record,
  qr,
}: {
  record: Record;
  qr: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl">
      {/* Barra tricolor del Ecuador */}
      <div className="flag-bar" />
      {/* Cabecera */}
      <div className="paw-watermark bg-navy px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-2 ring-ec-yellow/70">
              <Paw className="h-5 w-5 text-ec-yellow" />
            </span>
            <div>
              <p className="text-base font-black uppercase tracking-wide">{BRAND.name}</p>
              <p className="text-[10px] uppercase tracking-widest text-white/60">
                {BRAND.tagline}
              </p>
            </div>
          </div>
          <p className="text-right text-[10px] font-bold uppercase tracking-widest text-ec-yellow">
            Cédula de
            <br />
            Identificación Animal
          </p>
        </div>
      </div>

      <div className="grid gap-6 p-6 sm:grid-cols-[130px_1fr_auto]">
        {/* Foto */}
        <div className="mx-auto sm:mx-0">
          <div className="flex h-40 w-32 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            {record.photoData ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={record.photoData}
                alt={record.petName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-4xl">🐾</span>
            )}
          </div>
        </div>

        {/* Datos */}
        <div>
          <h2 className="text-2xl font-black text-navy">{record.petName}</h2>
          {record.status === "anulado" && (
            <span className="mt-1 inline-block rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
              REGISTRO ANULADO
            </span>
          )}
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
            <Field label="Especie" value={record.species} />
            <Field label="Sexo" value={record.sex} />
            <Field label="Raza" value={record.breed} />
            <Field label="Color" value={record.color} />
            <Field label="Nacimiento" value={fmt(record.birthDate)} />
            <Field label="Esterilizado" value={record.sterilized ? "Sí" : "No"} />
            <Field label="Microchip" value={record.microchip || "No registra"} />
          </div>
        </div>

        {/* QR */}
        <div className="flex flex-col items-center justify-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="Código QR" className="h-28 w-28" />
          <p className="mt-1 text-center text-[9px] text-slate-400">
            Escanea si me
            <br />
            encuentras
          </p>
        </div>
      </div>

      {/* Pie: propietario y número de registro */}
      <div className="grid gap-4 bg-navy px-6 py-4 text-white sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-teal">
            Tutor responsable
          </p>
          <p className="text-sm font-bold">{record.ownerName}</p>
          <p className="text-xs text-white/60">
            {record.ownerIdType}: {record.ownerId}
            {(record.city || record.province) &&
              ` · ${[record.city, record.province].filter(Boolean).join(", ")}`}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider text-teal">
            Certificado N.º
          </p>
          <p className="font-mono text-lg font-black">
            {record.certificateNo || record.registrationNo}
          </p>
          <p className="text-xs text-white/60">Emitida: {fmt(record.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}
