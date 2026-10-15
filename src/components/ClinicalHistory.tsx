import { addClinicalEntry, deleteClinicalEntry } from "@/lib/actions/clinical";

type Entry = {
  id: string;
  date: Date;
  weight: string | null;
  reason: string | null;
  diagnosis: string | null;
  treatment: string | null;
  notes: string | null;
  mvz: string | null;
};

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(d));
}

function todayLocal(): string {
  const d = new Date();
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 10);
}

// Historia clínica: registro de consultas / atenciones veterinarias (solo admin).
export default function ClinicalHistory({
  petRecordId,
  entries,
}: {
  petRecordId: string;
  entries: Entry[];
}) {
  return (
    <div>
      <form
        action={addClinicalEntry}
        className="rounded-xl border-2 border-navy/20 bg-navy/5 p-5"
      >
        <h3 className="font-bold text-navy">➕ Registrar atención clínica</h3>
        <input type="hidden" name="petRecordId" value={petRecordId} />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="text-slate-500">Fecha</span>
            <input
              type="date"
              name="date"
              defaultValue={todayLocal()}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-navy outline-none focus:border-teal"
            />
          </label>
          <label className="text-sm">
            <span className="text-slate-500">Peso (kg)</span>
            <input
              name="weight"
              inputMode="decimal"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-navy outline-none focus:border-teal"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="text-slate-500">Motivo de consulta</span>
            <input
              name="reason"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-navy outline-none focus:border-teal"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="text-slate-500">Diagnóstico</span>
            <textarea
              name="diagnosis"
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-navy outline-none focus:border-teal"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="text-slate-500">Tratamiento</span>
            <textarea
              name="treatment"
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-navy outline-none focus:border-teal"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="text-slate-500">Observaciones</span>
            <textarea
              name="notes"
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-navy outline-none focus:border-teal"
            />
          </label>
          <label className="text-sm">
            <span className="text-slate-500">Firma (veterinario)</span>
            <input
              name="mvz"
              placeholder="Vacío = Cedulación Pet Carnet"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-navy outline-none focus:border-teal"
            />
          </label>
        </div>
        <button className="mt-4 rounded-lg bg-teal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-600">
          Guardar atención
        </button>
      </form>

      {entries.length > 0 ? (
        <div className="mt-4 space-y-3">
          {entries.map((e) => (
            <div key={e.id} className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-navy">
                  {fmtDate(e.date)}
                  {e.weight ? <span className="ml-2 font-normal text-slate-500">· {e.weight} kg</span> : null}
                </p>
                <form action={deleteClinicalEntry}>
                  <input type="hidden" name="entryId" value={e.id} />
                  <input type="hidden" name="petRecordId" value={petRecordId} />
                  <button className="text-xs text-slate-400 transition hover:text-red-500">Eliminar</button>
                </form>
              </div>
              <dl className="mt-2 space-y-1 text-sm">
                {e.reason && (
                  <div className="flex gap-2">
                    <dt className="shrink-0 text-slate-400">Motivo:</dt>
                    <dd className="text-slate-700">{e.reason}</dd>
                  </div>
                )}
                {e.diagnosis && (
                  <div className="flex gap-2">
                    <dt className="shrink-0 text-slate-400">Diagnóstico:</dt>
                    <dd className="text-slate-700">{e.diagnosis}</dd>
                  </div>
                )}
                {e.treatment && (
                  <div className="flex gap-2">
                    <dt className="shrink-0 text-slate-400">Tratamiento:</dt>
                    <dd className="text-slate-700">{e.treatment}</dd>
                  </div>
                )}
                {e.notes && (
                  <div className="flex gap-2">
                    <dt className="shrink-0 text-slate-400">Obs.:</dt>
                    <dd className="text-slate-700">{e.notes}</dd>
                  </div>
                )}
              </dl>
              {e.mvz && <p className="mt-2 text-xs text-slate-400">Firma: {e.mvz}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-400">Aún no hay atenciones registradas.</p>
      )}
    </div>
  );
}
