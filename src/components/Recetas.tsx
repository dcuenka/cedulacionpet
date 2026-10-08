"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { addPrescription, deletePrescription } from "@/lib/actions/prescriptions";

function shrinkImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1400; // las recetas tienen texto: conservamos algo más de detalle
        let { width, height } = img;
        if (width > height && width > max) {
          height = (height * max) / width;
          width = max;
        } else if (height > max) {
          width = (width * max) / height;
          height = max;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no ctx"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function todayLocal(): string {
  const d = new Date();
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 10);
}

function fmt(d: string | Date) {
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(d));
}

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-teal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:opacity-60"
    >
      {pending ? "Guardando…" : "Guardar receta"}
    </button>
  );
}

type Item = { id: string; photoData: string; note: string | null; date: string | Date };

export default function Recetas({
  petRecordId,
  items,
  canDelete = false,
}: {
  petRecordId: string;
  items: Item[];
  canDelete?: boolean;
}) {
  const [photo, setPhoto] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Item | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhoto(await shrinkImage(file));
    } catch {
      alert("No se pudo procesar la imagen.");
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
      <div className="bg-navy px-5 py-3">
        <p className="text-sm font-black text-white">📋 Recetas médicas</p>
        <p className="text-[11px] text-white/60">Historial de lo que le recetaron</p>
      </div>

      <div className="p-4">
        {items.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {items.map((it, i) => (
              <button
                key={it.id}
                onClick={() => setActive(it)}
                className="group relative overflow-hidden rounded-lg text-left ring-1 ring-slate-200 transition hover:opacity-95"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.photoData} alt="Receta" className="aspect-square w-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                  {i === 0 ? "Última · " : ""}{fmt(it.date)}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            Aún no hay recetas. Toma una foto de la receta para guardarla.
          </p>
        )}

        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="mt-3 w-full rounded-xl border border-dashed border-teal/50 bg-teal/5 px-4 py-3 text-sm font-semibold text-teal transition hover:bg-teal/10"
          >
            📷 Agregar una receta (tomar foto)
          </button>
        ) : (
          <form
            ref={formRef}
            action={async (fd) => {
              await addPrescription(fd);
              setPhoto("");
              setOpen(false);
              formRef.current?.reset();
            }}
            className="mt-3 rounded-xl border-2 border-teal/40 bg-teal/5 p-4"
          >
            <input type="hidden" name="petRecordId" value={petRecordId} />
            <input type="hidden" name="photoData" value={photo} />
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={onFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-navy transition hover:bg-slate-50"
              >
                📷 Tomar / subir foto
              </button>
              {photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="Receta" className="h-14 w-14 rounded object-cover ring-1 ring-slate-200" />
              )}
              <label className="text-sm">
                <input
                  type="date"
                  name="date"
                  defaultValue={todayLocal()}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-navy outline-none focus:border-teal"
                />
              </label>
            </div>
            <input
              name="note"
              placeholder="¿Qué le recetaron? (opcional)"
              className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy outline-none focus:border-teal"
            />
            <div className="mt-3 flex gap-2">
              <SubmitBtn />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-white"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4"
          onClick={() => setActive(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active.photoData}
            alt="Receta"
            className="max-h-[78vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="mt-3 text-center text-sm text-white/80">
            {fmt(active.date)}
            {active.note ? ` · ${active.note}` : ""}
          </p>
          <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
            {canDelete && (
              <form action={deletePrescription}>
                <input type="hidden" name="prescriptionId" value={active.id} />
                <input type="hidden" name="petRecordId" value={petRecordId} />
                <button
                  onClick={() => setActive(null)}
                  className="rounded-lg border border-red-300 px-5 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
                >
                  Eliminar
                </button>
              </form>
            )}
            <button
              onClick={() => setActive(null)}
              className="rounded-lg border border-white/40 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
