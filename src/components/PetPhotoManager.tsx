"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
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
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-teal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:opacity-60"
    >
      {pending ? "Subiendo…" : "Agregar al archivo"}
    </button>
  );
}

type Photo = { id: string; photoData: string; caption: string | null };

export default function PetPhotoManager({
  petRecordId,
  photos,
}: {
  petRecordId: string;
  photos: Photo[];
}) {
  const [photo, setPhoto] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhoto(await shrinkImage(file));
    } catch {
      alert("No se pudo procesar la imagen.");
    }
  }

  return (
    <div>
      <form
        ref={formRef}
        action={async (fd) => {
          await addPetPhoto(fd);
          setPhoto("");
          formRef.current?.reset();
        }}
        className="rounded-xl border-2 border-teal/40 bg-teal/5 p-5"
      >
        <h3 className="font-bold text-navy">📸 Agregar foto al archivo</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Fotos de respaldo de la mascota, documentos o exámenes. El tutor las verá
          en su carnet digital.
        </p>

        <input type="hidden" name="petRecordId" value={petRecordId} />
        <input type="hidden" name="photoData" value={photo} />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-navy transition hover:bg-slate-50"
          >
            📷 Tomar / subir foto
          </button>
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="Nueva" className="h-14 w-14 rounded object-cover ring-1 ring-slate-200" />
          )}
          <input
            name="caption"
            placeholder="Descripción (opcional)"
            className="min-w-[180px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy outline-none focus:border-teal"
          />
          <SubmitBtn />
        </div>
      </form>

      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((p) => (
            <div key={p.id} className="group relative overflow-hidden rounded-lg ring-1 ring-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.photoData} alt={p.caption || "Foto"} className="aspect-square w-full object-cover" />
              {p.caption && (
                <p className="truncate bg-white px-2 py-1 text-xs text-slate-600">{p.caption}</p>
              )}
              <form action={deletePetPhoto} className="absolute right-1 top-1">
                <input type="hidden" name="photoId" value={p.id} />
                <input type="hidden" name="petRecordId" value={petRecordId} />
                <button
                  className="rounded-full bg-black/55 px-2 py-0.5 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100"
                  title="Eliminar foto"
                >
                  ✕
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
