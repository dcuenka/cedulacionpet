"use client";

import { useState } from "react";
import CedulaCard from "./CedulaCard";

type Props = React.ComponentProps<typeof CedulaCard>;

// Muestra la cédula y, al tocarla, la abre a pantalla completa para
// presentarla y compartirla (igual que se muestra el carnet).
export default function CedulaPresenter({ record, qr }: Props) {
  const [open, setOpen] = useState(false);

  async function share() {
    const url = window.location.href;
    const data = {
      title: `Cédula de ${record.petName}`,
      text: `Cédula de identidad de ${record.petName} · Cedulación Pet Carnet`,
      url,
    };
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(data);
        return;
      } catch {
        /* cancelado: respaldo copiar */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* sin portapapeles */
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full cursor-zoom-in text-left"
        aria-label="Presentar la cédula en grande"
      >
        <CedulaCard record={record} qr={qr} />
        <p className="no-print mt-1.5 text-center text-xs text-slate-400">
          👆 Toca la cédula para presentarla en grande
        </p>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col overflow-auto bg-navy/95 p-4"
          onClick={() => setOpen(false)}
        >
          <div className="flex min-h-full items-center justify-center">
            <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <CedulaCard record={record} qr={qr} />
              <div className="mt-5 flex justify-center gap-2">
                <button
                  onClick={share}
                  className="rounded-lg bg-ec-yellow px-5 py-2.5 text-sm font-bold text-navy transition hover:brightness-95"
                >
                  📤 Compartir
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
