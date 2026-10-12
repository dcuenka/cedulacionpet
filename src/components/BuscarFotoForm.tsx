"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { searchByPhoto, type PhotoMatch } from "@/lib/actions/search-photo";

function shrinkImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 900;
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

export default function BuscarFotoForm() {
  const [photo, setPhoto] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [matches, setMatches] = useState<PhotoMatch[]>([]);
  const [error, setError] = useState("");
  const camRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhoto(await shrinkImage(file));
      setDone(false);
      setMatches([]);
      setError("");
    } catch {
      setError("No se pudo procesar la imagen.");
    }
  }

  async function search() {
    if (!photo) return;
    setLoading(true);
    setError("");
    try {
      const r = await searchByPhoto(photo);
      if (r.error) setError(r.error);
      else setMatches(r.matches || []);
      setDone(true);
    } catch {
      setError("No se pudo completar la búsqueda.");
    } finally {
      setLoading(false);
    }
  }

  const btn =
    "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-navy transition hover:bg-slate-50";

  return (
    <div>
      <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
        <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={onFile} className="hidden" />
        <input ref={galRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => camRef.current?.click()} className={btn}>📷 Tomar foto</button>
          <button type="button" onClick={() => galRef.current?.click()} className={btn}>🖼️ Cargar foto</button>
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="Foto a buscar" className="h-16 w-16 rounded-lg object-cover ring-1 ring-slate-200" />
          )}
        </div>
        {photo && (
          <button
            onClick={search}
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-navy px-6 py-3 font-bold text-white transition hover:bg-navy-700 disabled:opacity-60"
          >
            {loading ? "Buscando coincidencias…" : "🔎 Buscar coincidencias"}
          </button>
        )}
        {error && <p className="mt-3 text-sm font-medium text-red-500">{error}</p>}
      </div>

      {done && !error && (
        <div className="mt-6">
          {matches.length === 0 ? (
            <p className="text-center text-sm text-slate-500">
              No encontramos coincidencias por parecido. Prueba con otra foto o consulta por
              microchip / cédula del tutor.
            </p>
          ) : (
            <>
              <p className="mb-3 text-sm text-slate-500">
                Posibles coincidencias por parecido —{" "}
                <strong className="text-navy">confirma visualmente</strong> antes de contactar.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {matches.map((m) => (
                  <Link
                    key={m.registrationNo}
                    href={`/m/${encodeURIComponent(m.code)}`}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-teal hover:shadow-md"
                  >
                    <div className="relative aspect-square w-full bg-slate-100">
                      {m.photoData ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.photoData} alt={m.petName} className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full items-center justify-center text-3xl">🐾</span>
                      )}
                      <span className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {m.score}%
                      </span>
                      {m.lost && (
                        <span className="absolute left-1 top-1 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          PERDIDA
                        </span>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="truncate text-sm font-bold text-navy">{m.petName}</p>
                      <p className="truncate text-xs text-slate-500">{m.species}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
