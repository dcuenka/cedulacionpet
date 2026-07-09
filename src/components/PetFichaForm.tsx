"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  createRecord,
  updateRecord,
  type RecordState,
} from "@/lib/actions/records";

const PROVINCES = [
  "Azuay", "Bolívar", "Cañar", "Carchi", "Chimborazo", "Cotopaxi", "El Oro",
  "Esmeraldas", "Galápagos", "Guayas", "Imbabura", "Loja", "Los Ríos",
  "Manabí", "Morona Santiago", "Napo", "Orellana", "Pastaza", "Pichincha",
  "Santa Elena", "Santo Domingo de los Tsáchilas", "Sucumbíos", "Tungurahua",
  "Zamora Chinchipe",
];

export type FichaDefaults = {
  id?: string;
  certificateNo?: string | null;
  qrCode?: string | null;
  microchip?: string | null;
  petName?: string;
  species?: string;
  breed?: string | null;
  birthDate?: Date | string | null;
  sex?: string;
  color?: string | null;
  sterilized?: boolean;
  training?: boolean;
  aggressionHistory?: boolean;
  feeding?: string | null;
  lastVaccineDate?: Date | string | null;
  diseases?: string | null;
  photoData?: string | null;
  ownerName?: string;
  ownerIdType?: string;
  ownerId?: string;
  ownerPhone?: string | null;
  ownerPhoneAlt?: string | null;
  ownerEmail?: string | null;
  ownerAddress?: string | null;
  province?: string | null;
  city?: string | null;
  mvz?: string | null;
  clientType?: string;
  notes?: string | null;
};

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-navy outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";

function Label({ children, req }: { children: React.ReactNode; req?: boolean }) {
  return (
    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children} {req && <span className="text-teal">*</span>}
    </span>
  );
}

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-navy">{title}</h2>
      {desc && <p className="mb-4 mt-0.5 text-sm text-slate-500">{desc}</p>}
      <div className={desc ? "" : "mt-4"}>{children}</div>
    </section>
  );
}

function Check({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-teal" />
      <span className="text-sm text-navy">{label}</span>
    </label>
  );
}

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-teal px-6 py-3 font-semibold text-white transition hover:bg-teal-600 disabled:opacity-60"
    >
      {pending ? "Guardando…" : editing ? "Guardar cambios" : "Crear ficha y generar cédula"}
    </button>
  );
}

function shrinkImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 700;
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

function dateValue(d?: Date | string | null): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dt.getTime())) return "";
  return dt.toISOString().slice(0, 10);
}

export default function PetFichaForm({ record }: { record?: FichaDefaults }) {
  const editing = Boolean(record?.id);
  const action = editing ? updateRecord.bind(null, record!.id!) : createRecord;

  const [state, formAction] = useActionState<RecordState, FormData>(action, undefined);
  const [photo, setPhoto] = useState<string>(record?.photoData || "");
  const fileRef = useRef<HTMLInputElement>(null);
  const d = record || {};

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
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="photoData" value={photo} />

      {/* Números de registro */}
      <section className="rounded-xl border-2 border-teal/40 bg-teal/5 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-navy">Números de registro</h2>
        <p className="mb-4 mt-0.5 text-sm text-slate-600">
          El microchip es la clave de localización y lo que codifica el QR generado.
          Puedes registrarlo luego, al implantarlo.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <label>
            <Label>Microchip N°</Label>
            <input name="microchip" defaultValue={d.microchip || ""} className={`${inputCls} font-mono`} placeholder="985141000123456" />
          </label>
          <label>
            <Label>Certificado N°</Label>
            <input name="certificateNo" defaultValue={d.certificateNo || ""} className={inputCls} placeholder="—" />
          </label>
          <label>
            <Label>Código QR N°</Label>
            <input name="qrCode" defaultValue={d.qrCode || ""} className={inputCls} placeholder="Etiqueta física" />
          </label>
        </div>
      </section>

      {/* Foto */}
      <Section title="Fotografía de la mascota">
        <div className="flex items-center gap-5">
          <div className="flex h-28 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="Vista previa" className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl">🐾</span>
            )}
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-navy transition hover:bg-slate-50"
            >
              {photo ? "Cambiar foto" : "Subir foto"}
            </button>
            <p className="mt-2 text-xs text-slate-500">Opcional. Se ajusta automáticamente.</p>
          </div>
        </div>
      </Section>

      {/* Información del animalito de compañía */}
      <Section title="Información del animalito de compañía">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <Label req>Nombre</Label>
            <input name="petName" required defaultValue={d.petName || ""} className={inputCls} placeholder="Mia" />
          </label>
          <label>
            <Label req>Especie</Label>
            <select name="species" required defaultValue={d.species || ""} className={inputCls}>
              <option value="" disabled>Selecciona…</option>
              <option>Canina</option>
              <option>Felina</option>
              <option>Ave</option>
              <option>Conejo</option>
              <option>Otra</option>
            </select>
          </label>
          <label>
            <Label>Raza</Label>
            <input name="breed" defaultValue={d.breed || ""} className={inputCls} placeholder="Husky" />
          </label>
          <label>
            <Label>Fecha de nacimiento</Label>
            <input name="birthDate" type="date" defaultValue={dateValue(d.birthDate)} className={inputCls} />
          </label>
          <label>
            <Label req>Sexo</Label>
            <select name="sex" required defaultValue={d.sex || ""} className={inputCls}>
              <option value="" disabled>Selecciona…</option>
              <option>Macho</option>
              <option>Hembra</option>
            </select>
          </label>
          <label>
            <Label>Color</Label>
            <input name="color" defaultValue={d.color || ""} className={inputCls} placeholder="Blanco y gris" />
          </label>
          <label>
            <Label>Alimentación</Label>
            <select name="feeding" defaultValue={d.feeding || ""} className={inputCls}>
              <option value="">Selecciona…</option>
              <option>Balanceado</option>
              <option>Casera</option>
              <option>Mixta</option>
            </select>
          </label>
          <label>
            <Label>Fecha última vacuna</Label>
            <input name="lastVaccineDate" type="date" defaultValue={dateValue(d.lastVaccineDate)} className={inputCls} />
          </label>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-slate-200 p-3 sm:col-span-2">
            <Check name="sterilized" label="Esterilizado" defaultChecked={d.sterilized} />
            <Check name="training" label="Adiestramiento" defaultChecked={d.training} />
            <Check name="aggressionHistory" label="Antecedentes de agresión" defaultChecked={d.aggressionHistory} />
          </div>

          <label className="sm:col-span-2">
            <Label>Enfermedades</Label>
            <input name="diseases" defaultValue={d.diseases || ""} className={inputCls} placeholder="Ninguna / detalle" />
          </label>
        </div>
      </Section>

      {/* Información del tutor responsable */}
      <Section title="Información del tutor responsable" desc="Datos de contacto para la recuperación en caso de pérdida.">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <Label req>Nombre</Label>
            <input name="ownerName" required defaultValue={d.ownerName || ""} className={inputCls} placeholder="Nombres y apellidos" />
          </label>
          <label>
            <Label>Tipo de identificación</Label>
            <select name="ownerIdType" defaultValue={d.ownerIdType || "Cédula"} className={inputCls}>
              <option>Cédula</option>
              <option>Pasaporte</option>
              <option>RUC</option>
            </select>
          </label>
          <label>
            <Label req>Cédula / identificación</Label>
            <input name="ownerId" required defaultValue={d.ownerId || ""} className={inputCls} placeholder="1761447011" />
          </label>
          <label>
            <Label>Teléfono 1</Label>
            <input name="ownerPhone" defaultValue={d.ownerPhone || ""} className={inputCls} placeholder="0999999999" />
          </label>
          <label>
            <Label>Teléfono 2</Label>
            <input name="ownerPhoneAlt" defaultValue={d.ownerPhoneAlt || ""} className={inputCls} placeholder="Contacto adicional" />
          </label>
          <label className="sm:col-span-2">
            <Label>Correo electrónico</Label>
            <input name="ownerEmail" type="email" defaultValue={d.ownerEmail || ""} className={inputCls} placeholder="correo@ejemplo.com" />
          </label>
          <label className="sm:col-span-2">
            <Label>Dirección</Label>
            <input name="ownerAddress" defaultValue={d.ownerAddress || ""} className={inputCls} placeholder="Calderón, calle, conjunto…" />
          </label>
          <label>
            <Label>Provincia</Label>
            <select name="province" defaultValue={d.province || ""} className={inputCls}>
              <option value="">Selecciona…</option>
              {PROVINCES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label>
            <Label>Ciudad</Label>
            <input name="city" defaultValue={d.city || ""} className={inputCls} placeholder="Quito" />
          </label>
        </div>
      </Section>

      {/* Datos internos */}
      <Section title="Datos internos">
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <Label>Médico veterinario (MVZ)</Label>
            <input name="mvz" defaultValue={d.mvz || ""} className={inputCls} placeholder="Quién registra / firma" />
          </label>
          <div>
            <Label>Origen del registro</Label>
            <div className="flex flex-wrap gap-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm has-[:checked]:border-teal has-[:checked]:bg-teal/5">
                <input type="radio" name="clientType" value="interno" defaultChecked={(d.clientType || "interno") !== "externo"} className="accent-teal" />
                Cliente interno
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm has-[:checked]:border-teal has-[:checked]:bg-teal/5">
                <input type="radio" name="clientType" value="externo" defaultChecked={d.clientType === "externo"} className="accent-teal" />
                Cliente externo
              </label>
            </div>
          </div>
          <label className="sm:col-span-2">
            <Label>Notas internas</Label>
            <input name="notes" defaultValue={d.notes || ""} className={inputCls} placeholder="Observaciones (no se muestran al público)" />
          </label>
        </div>
      </Section>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}

      <SubmitButton editing={editing} />
    </form>
  );
}
