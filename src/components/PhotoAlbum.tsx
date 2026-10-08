"use client";

import { useState } from "react";

type Photo = { id: string; photoData: string; caption: string | null };

// Álbum fotográfico de respaldo visible para el tutor (solo lectura).
export default function PhotoAlbum({ photos }: { photos: Photo[] }) {
  const [active, setActive] = useState<Photo | null>(null);
  if (photos.length === 0) return null;

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
      <div className="bg-navy px-5 py-3">
        <p className="text-sm font-black text-white">📸 Archivo fotográfico</p>
        <p className="text-[11px] text-white/60">Fotos de respaldo de tu mascota</p>
      </div>
      <div className="grid grid-cols-3 gap-2 p-4 sm:grid-cols-4">
        {photos.map((p) => (
          <button
            key={p.id}
            onClick={() => setActive(p)}
            className="overflow-hidden rounded-lg ring-1 ring-slate-200 transition hover:opacity-90"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.photoData} alt={p.caption || "Foto"} className="aspect-square w-full object-cover" />
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4"
          onClick={() => setActive(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active.photoData}
            alt={active.caption || "Foto"}
            className="max-h-[80vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {active.caption && <p className="mt-3 text-center text-sm text-white/80">{active.caption}</p>}
          <button
            onClick={() => setActive(null)}
            className="mt-4 rounded-lg border border-white/40 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}
