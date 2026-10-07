"use client";

import { useState } from "react";

// Comparte/guarda el enlace de la ficha digital (identificación + carnet).
// Usa el menú nativo del celular (Web Share); si no está, copia el enlace.
export default function ShareBar({ petName }: { petName: string }) {
  const [copied, setCopied] = useState(false);

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
      /* sin permisos de portapapeles: no hacemos nada */
    }
  }

  return (
    <button
      onClick={share}
      className="rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700"
    >
      {copied ? "✓ Enlace copiado" : "📤 Compartir / guardar"}
    </button>
  );
}
