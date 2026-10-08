"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import CedulaCard from "./CedulaCard";

type Props = React.ComponentProps<typeof CedulaCard>;

// Ancho de diseño de la cédula: a este ancho la tarjeta tiene proporción
// de cédula real. Se escala para encajar en cualquier pantalla.
const DESIGN_W = 500;

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
        /* cancelado */
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
        <ScaledCard record={record} qr={qr} />
        <p className="no-print mt-1.5 text-center text-xs text-slate-400">
          👆 Toca la cédula para presentarla en grande
        </p>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-navy/95 p-3"
          onClick={() => setOpen(false)}
        >
          <LandscapeCard record={record} qr={qr} />
          <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
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
          <p className="text-center text-xs text-white/60">📱 Gira tu teléfono para verla más grande</p>
        </div>
      )}
    </>
  );
}

// Cédula escalada al ancho disponible (vista previa, vertical normal).
function ScaledCard({ record, qr }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | undefined>(undefined);

  const measure = useCallback(() => {
    const w = wrapRef.current?.clientWidth ?? DESIGN_W;
    const s = Math.min(1, w / DESIGN_W);
    setScale(s);
    const ch = cardRef.current?.offsetHeight ?? Math.round(DESIGN_W / 1.6);
    setHeight(ch * s);
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure]);
  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  return (
    <div ref={wrapRef} style={{ height }} className="w-full overflow-hidden">
      <div
        ref={cardRef}
        style={{ width: DESIGN_W, transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        <CedulaCard record={record} qr={qr} />
      </div>
    </div>
  );
}

// Cédula girada 90° (horizontal) y ampliada para presentarla; al girar el
// teléfono se ve en grande como una cédula real.
function LandscapeCard({ record, qr }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [st, setSt] = useState<{ scale: number; w: number; h: number }>({ scale: 0, w: 0, h: 0 });

  const measure = useCallback(() => {
    const h0 = cardRef.current?.offsetHeight ?? Math.round(DESIGN_W / 1.6);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Al girar 90°, el ancho visual = alto de la tarjeta (h0) y el alto
    // visual = ancho de diseño (DESIGN_W). Escalamos para que quepa.
    const s = Math.min((vw - 24) / h0, (vh - 150) / DESIGN_W);
    setSt({ scale: s, w: h0 * s, h: DESIGN_W * s });
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure]);
  useEffect(() => {
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [measure]);

  return (
    <div
      style={{ width: st.w || undefined, height: st.h || undefined }}
      className="relative"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        ref={cardRef}
        style={{
          width: DESIGN_W,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotate(90deg) scale(${st.scale || 0.0001})`,
          transformOrigin: "center",
          visibility: st.scale ? "visible" : "hidden",
        }}
      >
        <CedulaCard record={record} qr={qr} />
      </div>
    </div>
  );
}
