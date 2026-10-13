"use client";

import { useRef, useState } from "react";
import { submitFoundReport } from "@/lib/actions/found-report";

function shrinkImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1200;
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

export default function VerificarForm() {
  const [photo, setPhoto] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const camRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhoto(await shrinkImage(file));
      setError("");
    } catch {
      setError("No se pudo procesar la imagen.");
    }
  }

  async function submit() {
    if (!photo) return;
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("photoData", photo);
      if (phoneRef.current?.value) fd.set("phone", phoneRef.current.value);
      const r = await submitFoundReport(fd);
      if (r.error) setError(r.error);
      else setDone(true);
    } catch {
      setError("No se pudo enviar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl bg-white/10 p-5 text-center ring-1 ring-white/20">
        <p className="text-2xl">✅</p>
        <p className="mt-2 font-bold text-white">¡Foto recibida!</p>
        <p className="mt-1 text-sm text-white/70">
          Nuestro equipo la verificará internamente contra las mascotas registradas y te contactará
          si hay coincidencia. Gracias por ayudar a recuperarla.
        </p>
      </div>
    );
  }

  const btn =
    "rounded-lg border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20";

  return (
    <div className="rounded-xl bg-white/10 p-5 ring-1 ring-white/20">
      <p className="text-sm font-bold text-white">¿Encontraste una mascota? Súbenos su foto para verificación</p>
      <p className="mt-0.5 text-xs text-white/60">Nuestro equipo la verifica internamente y te contacta.</p>

      <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={onFile} className="hidden" />
      <input ref={galRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => camRef.current?.click()} className={btn}>📷 Tomar foto</button>
        <button type="button" onClick={() => galRef.current?.click()} className={btn}>🖼️ Cargar foto</button>
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="Foto" className="h-14 w-14 rounded-lg object-cover ring-1 ring-white/30" />
        )}
      </div>

      <input
        ref={phoneRef}
        inputMode="tel"
        placeholder="Tu teléfono / WhatsApp (opcional)"
        className="mt-3 w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/50 outline-none focus:border-ec-yellow"
      />

      {photo && (
        <button
          onClick={submit}
          disabled={loading}
          className="mt-3 w-full rounded-lg bg-ec-yellow px-6 py-3 font-bold text-navy transition hover:brightness-95 disabled:opacity-60"
        >
          {loading ? "Enviando…" : "Enviar para verificación"}
        </button>
      )}
      {error && <p className="mt-2 text-sm font-medium text-amber-300">{error}</p>}
    </div>
  );
}
