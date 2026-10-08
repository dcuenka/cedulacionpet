import { BRAND } from "@/lib/brand";

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
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(new Date(d))
    .replace(".", "")
    .toUpperCase();
}

function Flag() {
  return (
    <span className="flex h-5 w-8 flex-col overflow-hidden rounded-sm ring-1 ring-black/10">
      <span className="h-1/2 w-full bg-ec-yellow" />
      <span className="h-1/4 w-full bg-ec-blue" />
      <span className="h-1/4 w-full bg-ec-red" />
    </span>
  );
}

function Field({
  label,
  value,
  big,
}: {
  label: string;
  value?: string | null;
  big?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className={`break-words font-bold text-slate-800 ${big ? "text-lg leading-tight sm:text-xl" : "text-[11px] sm:text-sm"}`}>
        {value || "—"}
      </p>
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
  const nui = record.microchip || record.certificateNo || record.registrationNo;
  return (
    <div className="mx-auto max-w-[560px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl">
      {/* Cabecera */}
      <div className="flex items-center gap-3 px-5 pt-4">
        <Flag />
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-navy">
            Cédula de Identidad Animal
          </p>
          <p className="text-[10px] uppercase tracking-widest text-slate-400">
            {BRAND.name} · {BRAND.tagline}
          </p>
        </div>
      </div>
      <div className="mt-3 flag-bar" />

      {/* Cuerpo */}
      <div
        className="grid grid-cols-[104px_1fr] gap-4 bg-[#f8fbfc] p-4 sm:grid-cols-[132px_1fr] sm:gap-5 sm:p-5"
        style={{
          backgroundImage: "url(/ecuador-map.svg)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "auto 80%",
        }}
      >
        {/* Foto + NUI */}
        <div>
          <div className="flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            {record.photoData ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={record.photoData} alt={record.petName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-4xl">🐾</span>
            )}
          </div>
          <p className="mt-2 text-[10px] sm:text-sm">
            <span className="text-slate-400">NUI.</span>{" "}
            <span className="break-all font-mono font-bold text-navy">{nui}</span>
          </p>
          {record.status === "anulado" && (
            <span className="mt-2 inline-block rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
              ANULADA
            </span>
          )}
        </div>

        {/* Campos esenciales (como una cédula real) */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-2 self-start">
          <div className="col-span-2">
            <Field label="Nombre" value={record.petName} big />
          </div>
          <Field label="Especie" value={record.species} />
          <Field label="Sexo" value={record.sex} />
          <Field label="Raza" value={record.breed} />
          <Field label="Color" value={record.color} />
          <Field label="Nacimiento" value={fmt(record.birthDate)} />
          <Field label="Esterilizado" value={record.sterilized ? "Sí" : "No"} />
          <div className="col-span-2">
            <Field label="Microchip N.º" value={record.microchip || "No registra"} />
          </div>
        </div>
      </div>

      {/* Pie: tutor + chip + QR */}
      <div className="flex items-end justify-between gap-4 border-t border-slate-100 px-4 py-3">
        <div>
          <p className="text-[9px] font-medium uppercase tracking-wider text-slate-400">
            Tutor responsable
          </p>
          <p className="text-sm font-bold text-slate-800">{record.ownerName}</p>
          <p className="text-xs text-slate-500">
            {record.ownerIdType}: {record.ownerId} · Emisión {fmt(record.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-6 w-8 rounded-sm bg-gradient-to-br from-amber-300 to-amber-500 ring-1 ring-amber-600/40" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="Código QR" className="h-16 w-16" />
        </div>
      </div>
    </div>
  );
}
