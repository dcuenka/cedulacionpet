"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { addHealthEvent } from "@/lib/actions/health";

// Reduce la foto a un JPEG liviano en el navegador (misma técnica que la ficha).
function shrinkImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1000;
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
        resolve(canvas.toDataURL("image/jpeg", 0.8));
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

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-teal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:opacity-60"
    >
      {pending ? "Guardando…" : "Registrar proceso"}
    </button>
  );
}

export default function HealthEventForm({ petRecordId }: { petRecordId: string }) {
  const [photo, setPhoto] = useState("");
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
    <form
      ref={formRef}
      action={async (fd) => {
        await addHealthEvent(fd);
        setPhoto("");
        formRef.current?.reset();
      }}
      className="rounded-xl border-2 border-teal/40 bg-teal/5 p-5"
    >
      <h3 className="font-bold text-navy">➕ Registrar vacuna o desparasitación</h3>
      <p className="mt-0.5 text-xs text-slate-500">
        Registra el proceso realizado en la visita. Puedes tomar una foto de la
        etiqueta del frasco como respaldo.
      </p>

      <input type="hidden" name="petRecordId" value={petRecordId} />
      <input type="hidden" name="photoData" value={photo} />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="text-slate-500">Tipo</span>
          <select
            name="type"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-navy outline-none focus:border-teal"
          >
            <option value="vacuna">Vacuna</option>
            <option value="desparasitacion">Desparasitación</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="text-slate-500">Producto / vacuna</span>
          <input
            name="product"
            placeholder="Ej: Rabia, Óctuple, Drontal…"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-navy outline-none focus:border-teal"
          />
        </label>
        <label className="text-sm">
          <span className="text-slate-500">Fecha aplicada</span>
          <input
            type="date"
            name="date"
            defaultValue={todayLocal()}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-navy outline-none focus:border-teal"
          />
        </label>
        <label className="text-sm">
          <span className="text-slate-500">Próxima dosis / refuerzo</span>
          <input
            type="date"
            name="nextDate"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-navy outline-none focus:border-teal"
          />
        </label>
        <label className="text-sm">
          <span className="text-slate-500">Peso (kg)</span>
          <input
            name="weight"
            inputMode="decimal"
            placeholder="Ej: 15"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-navy outline-none focus:border-teal"
          />
        </label>
        <label className="text-sm">
          <span className="text-slate-500">Lote (opcional)</span>
          <input
            name="lot"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-navy outline-none focus:border-teal"
          />
        </label>
        <label className="text-sm">
          <span className="text-slate-500">Veterinario (MVZ)</span>
          <input
            name="mvz"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-navy outline-none focus:border-teal"
          />
        </label>
      </div>

      {/* Foto de la etiqueta (cámara en celular) */}
      <div className="mt-3 flex items-center gap-3">
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
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="Etiqueta" className="h-12 w-12 rounded object-cover ring-1 ring-slate-200" />
            <button
              type="button"
              onClick={() => setPhoto("")}
              className="text-xs text-slate-400 hover:text-red-500"
            >
              Quitar
            </button>
          </div>
        )}
      </div>

      <div className="mt-4">
        <SubmitBtn />
      </div>
    </form>
  );
}
