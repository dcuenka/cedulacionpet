"use client";

import { useEffect, useState } from "react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// Botón "Instalar app" (PWA). Aparece solo cuando el navegador permite
// instalar; en iPhone/iPad (Safari) muestra las instrucciones manuales.
export default function InstallButton({ className = "" }: { className?: string }) {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    if (standalone) {
      setInstalled(true);
      return;
    }
    const ua = window.navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) && !/crios|fxios/i.test(ua);
    setIsIOS(ios);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;
  // En Android/desktop solo mostramos cuando el navegador lo permite.
  if (!deferred && !isIOS) return null;

  async function handleClick() {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
      return;
    }
    if (isIOS) setShowHelp(true);
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={
          className ||
          "rounded-md border border-ec-yellow/60 px-3 py-2 text-sm font-semibold text-ec-yellow transition hover:bg-white/10"
        }
      >
        📲 Instalar app
      </button>

      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-slate-700 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-black text-navy">Instalar en tu iPhone</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
              <li>
                Toca el botón <strong>Compartir</strong> (el cuadro con la flecha
                hacia arriba).
              </li>
              <li>
                Elige <strong>“Agregar a pantalla de inicio”</strong>.
              </li>
              <li>
                Confirma con <strong>Agregar</strong>. El ícono quedará junto a
                tus apps.
              </li>
            </ol>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-5 w-full rounded-lg bg-navy py-2.5 font-semibold text-white transition hover:bg-navy-700"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
