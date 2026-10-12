"use client";

import { useRef, useState } from "react";
import { addPetPhoto, deletePetPhoto } from "@/lib/actions/photos";

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

type Photo = { id: string; photoData: string; kind: string };

const SLOTS: { kind: string; label: string; hint: string }[] = [
  { kind: "bio-frente", label: "Frente (cara)", hint: "De frente, ojos visibles" },
  { kind: "bio-perfil-izq", label: "Perfil izquierdo", hint: "Lado izquierdo de la cara" },
  { kind: "bio-perfil-der", label: "Perfil derecho", hint: "Lado derecho de la cara" },
  { kind: "bio-nariz", label: "Nariz / trufa", hint: "Primer plano nítido" },
  { kind: "bio-cuerpo", label: "Cuerpo completo", hint: "De pie, cuerpo entero" },
];

function BioSlot({
  petRecordId,
  kind,
  label,
  hint,
  existing,
}: {
  petRecordId: string;
  kind: string;
  label: string;
  hint: string;
  existing?: Photo;
}) {
  const [photo, setPhoto] = useState("");
  const camRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const current = photo || existing?.photoData || "";

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await shrinkImage(file);
      setPhoto(data);
      // Guardar automáticamente la toma.
      requestAnimationFrame(() => formRef.current?.requestSubmit());
    } catch {
      alert("No se pudo procesar la imagen.");
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-lg bg-slate-100">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span className="text-3xl text-slate-300">🐾</span>
        )}
      </div>
      <p className="mt-2 text-sm font-semibold text-navy">{label}</p>
      <p className="text-[11px] text-slate-400">{hint}</p>

      <form action={addPetPhoto} ref={formRef} className="mt-2">
        <input type="hidden" name="petRecordId" value={petRecordId} />
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="photoData" value={photo} />
        <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={onFile} className="hidden" />
        <input ref={galRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => camRef.current?.click()} className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-navy hover:bg-slate-50">
            📷 Tomar
          </button>
          <button type="button" onClick={() => galRef.current?.click()} className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-navy hover:bg-slate-50">
            🖼️ Cargar
          </button>
        </div>
      </form>
      {existing && (
        <form action={deletePetPhoto} className="mt-1">
          <input type="hidden" name="photoId" value={existing.id} />
          <input type="hidden" name="petRecordId" value={petRecordId} />
          <button className="text-[11px] text-slate-400 hover:text-red-500">Quitar</button>
        </form>
      )}
    </div>
  );
}

export default function BiometricStudy({
  petRecordId,
  photos,
}: {
  petRecordId: string;
  photos: Photo[];
}) {
  const byKind = (k: string) => photos.find((p) => p.kind === k);
  const done = SLOTS.filter((s) => byKind(s.kind)).length;
  return (
    <div className="rounded-xl border-2 border-teal/40 bg-teal/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-bold text-navy">🧬 Estudio biométrico</h3>
          <p className="text-xs text-slate-500">
            Set de fotos estandarizadas para identificación y recuperación por pérdida.
          </p>
        </div>
        <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold text-white">
          {done} / {SLOTS.length} tomas
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {SLOTS.map((s) => (
          <BioSlot
            key={s.kind}
            petRecordId={petRecordId}
            kind={s.kind}
            label={s.label}
            hint={s.hint}
            existing={byKind(s.kind)}
          />
        ))}
      </div>
    </div>
  );
}
