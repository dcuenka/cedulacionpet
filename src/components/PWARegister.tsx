"use client";

import { useEffect } from "react";

// Registra el service worker una vez cargada la app (solo en producción
// y si el navegador lo soporta).
export default function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* silencioso: la app funciona igual sin SW */
      });
    };
    // Si la página ya terminó de cargar, registra de una; si no, espera 'load'.
    if (document.readyState === "complete") {
      register();
      return;
    }
    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
