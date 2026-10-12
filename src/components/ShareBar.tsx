"use client";

import { useState } from "react";

// Comparte el enlace de la ficha digital (identificación + carnet):
// - WhatsApp: lo envía directamente a un contacto.
// - Compartir: menú nativo del celular (o copiar el enlace como respaldo).
export default function ShareBar({ petName }: { petName: string }) {
  const [copied, setCopied] = useState(false);

  function whatsapp() {
    const url = window.location.href;
    const text = `Identificación y carnet digital de ${petName} · Cedulación Pet Carnet\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  async function share() {
    const url = window.location.href;
    const data = {
      title: `Identificación de ${petName}`,
      text: `Identificación y carnet digital de ${petName} · Cedulación Pet Carnet`,
      url,
    };
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(data);
        return;
      } catch {
        /* el usuario canceló: seguimos al respaldo de copiar */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* sin permisos de portapapeles */
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={whatsapp}
        className="rounded-md bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
      >
        💬 Enviar por WhatsApp
      </button>
      <button
        onClick={share}
        className="rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700"
      >
        {copied ? "✓ Enlace copiado" : "📤 Compartir"}
      </button>
    </div>
  );
}
