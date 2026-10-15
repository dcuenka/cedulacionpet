"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { addHealthBatch } from "@/lib/actions/health";

function todayLocal(): string {
  const d = new Date();
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 10);
}

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-teal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:opacity-60"
    >
      {pending ? "Guardando…" : "Guardar novedades"}
    </button>
  );
}

const ROWS = [0, 1, 2, 3, 4];

// Carga rápida de hasta 5 vacunas / desparasitaciones en una sola operación.
export default function HealthBatchForm({ petRecordId }: { petRecordId: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await addHealthBatch(fd);
        formRef.current?.reset();
      }}
      className="rounded-xl border-2 border-navy/20 bg-navy/5 p-5"
    >
      <h3 className="font-bold text-navy">🗂️ Carga múltiple (hasta 5 novedades)</h3>
      <p className="mt-0.5 text-xs text-slate-500">
        Registra varias vacunas o desparasitaciones de una vez. Deja en blanco las
        filas que no uses.
      </p>

      <input type="hidden" name="petRecordId" value={petRecordId} />

      <label className="mt-4 block text-sm sm:max-w-xs">
        <span className="text-slate-500">Firma (veterinario o entidad) para todas</span>
        <input
          name="mvz"
          placeholder="Vacío = Cedulación Pet Carnet"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-navy outline-none focus:border-teal"
        />
      </label>

      <div className="mt-4 space-y-3">
        {ROWS.map((i) => (
          <div
            key={i}
            className="grid gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-[130px_1fr_140px_140px_90px]"
          >
            <label className="text-xs">
              <span className="text-slate-400">Tipo</span>
              <select
                name={`type${i}`}
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm text-navy outline-none focus:border-teal"
              >
                <option value="vacuna">Vacuna</option>
                <option value="desparasitacion">Desparasitación</option>
              </select>
            </label>
            <label className="text-xs">
              <span className="text-slate-400">Producto / vacuna</span>
              <input
                name={`product${i}`}
                placeholder={i === 0 ? "Ej: Rabia, Óctuple, Drontal…" : ""}
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm text-navy outline-none focus:border-teal"
              />
            </label>
            <label className="text-xs">
              <span className="text-slate-400">Fecha aplicada</span>
              <input
                type="date"
                name={`date${i}`}
                defaultValue={i === 0 ? todayLocal() : undefined}
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm text-navy outline-none focus:border-teal"
              />
            </label>
            <label className="text-xs">
              <span className="text-slate-400">Próxima dosis</span>
              <input
                type="date"
                name={`nextDate${i}`}
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm text-navy outline-none focus:border-teal"
              />
            </label>
            <label className="text-xs">
              <span className="text-slate-400">Peso (kg)</span>
              <input
                name={`weight${i}`}
                inputMode="decimal"
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm text-navy outline-none focus:border-teal"
              />
            </label>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <SubmitBtn />
      </div>
    </form>
  );
}
