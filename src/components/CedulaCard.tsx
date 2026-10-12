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
    <span className="flex h-6 w-9 flex-col overflow-hidden rounded-[2px] ring-1 ring-black/10">
      <span className="h-1/2 w-full bg-ec-yellow" />
      <span className="h-1/4 w-full bg-ec-blue" />
      <span className="h-1/4 w-full bg-ec-red" />
    </span>
  );
}

// Campo etiqueta + valor, al estilo de la cédula ecuatoriana.
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
      <p className="text-[7px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p
        className={`break-words font-bold uppercase leading-tight text-slate-800 ${
          big ? "text-[15px] sm:text-[17px]" : "text-[10px] sm:text-[11px]"
        }`}
      >
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
  const documento = record.certificateNo || record.registrationNo;
  const lugar = [record.city, record.province].filter(Boolean).join(" · ") || "Ecuador";

  return (
    <div className="relative mx-auto max-w-[560px] overflow-hidden rounded-xl bg-[#eef4f1] text-slate-800 shadow-xl ring-1 ring-black/10">
      {/* Fondo de seguridad: mapa del Ecuador muy tenue */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "url(/ecuador-map.svg)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right center",
          backgroundSize: "auto 90%",
        }}
      />

      <div className="relative px-3.5 pb-2.5 pt-2.5">
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <p className="text-[8px] font-black uppercase leading-[1.1] tracking-wide text-emerald-700">
              Cédula de<br />Identidad<br />Animal
            </p>
            <Flag />
            <div className="pt-0.5">
              <p className="text-[11px] font-black uppercase leading-none tracking-wide text-navy sm:text-[12px]">
                Registro Nacional de Mascotas
              </p>
              <p className="mt-0.5 text-[6.5px] uppercase tracking-wide text-slate-500">
                República del Ecuador · {BRAND.name}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[6.5px] uppercase tracking-wide text-slate-500">Condición</p>
            <p className={`text-[10px] font-black ${record.status === "anulado" ? "text-red-600" : "text-emerald-700"}`}>
              {record.status === "anulado" ? "ANULADA" : "REGISTRADA"}
            </p>
          </div>
        </div>

        <div className="mt-1.5 h-[2px] w-full rounded bg-gradient-to-r from-ec-yellow via-ec-blue to-ec-red" />

        {/* Cuerpo: foto | campos | columna derecha */}
        <div className="mt-2 grid grid-cols-[80px_1fr_84px] gap-3 sm:grid-cols-[94px_1fr_94px]">
          {/* Foto */}
          <div>
            <div className="aspect-[3/4] w-full overflow-hidden rounded border border-slate-300 bg-white">
              {record.photoData ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={record.photoData} alt={record.petName} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center text-3xl">🐾</span>
              )}
            </div>
          </div>

          {/* Campos principales */}
          <div className="min-w-0 space-y-1.5">
            <Field label="Nombre" value={record.petName} big />
            <div className="grid grid-cols-2 gap-2">
              <Field label="Especie" value={record.species} />
              <Field label="Raza" value={record.breed} />
            </div>
            <Field label="Nacionalidad" value="ECUATORIANA" />
            <Field label="Fecha de nacimiento" value={fmt(record.birthDate)} />
            <Field label="Lugar de nacimiento" value={lugar} />
          </div>

          {/* Columna derecha: foto fantasma + datos */}
          <div className="flex flex-col items-end gap-1.5 text-right">
            <div className="h-14 w-12 overflow-hidden rounded border border-slate-200 bg-white/60 opacity-60">
              {record.photoData ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={record.photoData} alt="" className="h-full w-full object-cover grayscale" />
              ) : null}
            </div>
            <Field label="Sexo" value={record.sex} />
            <Field label="Color" value={record.color} />
            <Field label="N° Documento" value={documento} />
          </div>
        </div>

        {/* Pie: microchip + tutor + chip + QR */}
        <div className="mt-1.5 flex items-end justify-between gap-3 border-t border-slate-200/70 pt-1.5">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px]">
              <span className="text-slate-400">MicroChip:</span>{" "}
              <span className="break-all font-mono font-bold text-navy">{record.microchip || nui}</span>
            </p>
            <p className="mt-0.5 truncate text-[7px] uppercase tracking-wide text-slate-500">
              Tutor: <span className="font-semibold text-slate-700">{record.ownerName}</span> · {record.ownerIdType} {record.ownerId}
            </p>
            <p className="text-[7px] uppercase tracking-wide text-slate-400">
              Emisión {fmt(record.createdAt)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="h-6 w-8 rounded-sm bg-gradient-to-br from-amber-300 to-amber-500 ring-1 ring-amber-600/40" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="Código QR" className="h-14 w-14" />
          </div>
        </div>
      </div>
    </div>
  );
}
