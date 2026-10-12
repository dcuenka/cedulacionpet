"use client";

import { useState } from "react";
import { BRAND } from "@/lib/brand";

// Comparte la aplicación (enlace de inicio) para invitar a otros a usarla.
export default function ShareApp({ className = "" }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  function appUrl() {
    // Enlace de inicio de la app (dominio actual).
    return window.location.origin + "/";
  }
  function message() {
    return `Registra e identifica a tu mascota con ${BRAND.name} — cédula digital, carnet de vacunas y QR.\n${appUrl()}`;
  }

  async function share() {
    // Menú nativo (elige WhatsApp u otro contacto); si no hay, WhatsApp; si no, copiar.
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: BRAND.name,
          text: `Registra e identifica a tu mascota con ${BRAND.name}.`,
          url: appUrl(),
        });
        return;
      } catch {
        /* cancelado */
      }
    }
    if (/android|iphone|ipad|ipod/i.test(navigator.userAgent)) {
      window.open(`https://wa.me/?text=${encodeURIComponent(message())}`, "_blank", "noopener,noreferrer");
      return;
    }
    try {
      await navigator.clipboard.writeText(appUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* sin portapapeles */
    }
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <button
        onClick={share}
        className="rounded-lg bg-[#25D366] px-6 py-3 font-bold text-white shadow-lg transition hover:brightness-95"
      >
        {copied ? "✓ Enlace copiado" : "📲 Compartir la app"}
      </button>
    </div>
  );
}
