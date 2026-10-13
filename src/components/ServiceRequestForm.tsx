"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createServiceRequest } from "@/lib/actions/service-request";

const PROVINCIAS = [
  "Azuay", "Bolívar", "Cañar", "Carchi", "Chimborazo", "Cotopaxi", "El Oro",
  "Esmeraldas", "Galápagos", "Guayas", "Imbabura", "Loja", "Los Ríos", "Manabí",
  "Morona Santiago", "Napo", "Orellana", "Pastaza", "Pichincha", "Santa Elena",
  "Santo Domingo de los Tsáchilas", "Sucumbíos", "Tungurahua", "Zamora Chinchipe",
];

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
      className="w-full rounded-lg bg-ec-yellow px-6 py-3 font-bold text-navy shadow-lg transition hover:brightness-95 disabled:opacity-60"
    >
      {pending ? "Enviando…" : "Enviar solicitud"}
    </button>
  );
}

function PhotoField({
  name,
  label,
  hint,
}: {
  name: string;
  label: string;
  hint: string;
}) {
  const [photo, setPhoto] = useState("");
  const camRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhoto(await shrinkImage(file));
    } catch {
      alert("No se pudo procesar la imagen.");
    }
  }
  const btn =
    "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-navy transition hover:bg-slate-50";
  return (
    <div>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="text-xs text-slate-400">{hint}</p>
      <input type="hidden" name={name} value={photo} />
      <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={onFile} className="hidden" />
      <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => camRef.current?.click()} className={btn}>
          📷 Tomar foto
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} className={btn}>
          🖼️ Cargar foto
        </button>
        {photo && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt={label} className="h-14 w-14 rounded object-cover ring-1 ring-slate-200" />
            <button type="button" onClick={() => setPhoto("")} className="text-xs text-slate-400 hover:text-red-500">
              Quitar
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Datos de la cuenta para el pago (botón que despliega la información).
function PaymentInfo() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  async function copyAccount() {
    try {
      await navigator.clipboard.writeText("2100342325");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* sin portapapeles */
    }
  }
  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700"
      >
        💳 Ver datos para el pago
      </button>
      {open && (
        <div className="mt-3 rounded-xl border border-teal/30 bg-teal/5 p-4 text-sm text-navy">
          <p className="font-bold">Datos para la transferencia / depósito</p>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            <dt className="text-slate-500">Banco</dt>
            <dd className="font-semibold">Banco del Pichincha</dd>
            <dt className="text-slate-500">Tipo de cuenta</dt>
            <dd className="font-semibold">Cuenta Corriente</dd>
            <dt className="text-slate-500">N.º de cuenta</dt>
            <dd className="flex items-center gap-2 font-mono font-bold">
              2100342325
              <button
                type="button"
                onClick={copyAccount}
                className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-navy hover:bg-slate-50"
              >
                {copied ? "✓ Copiado" : "Copiar"}
              </button>
            </dd>
            <dt className="text-slate-500">RUC</dt>
            <dd className="font-semibold">179321366001</dd>
            <dt className="text-slate-500">Titular</dt>
            <dd className="font-semibold">VETPLAN S.A.S.</dd>
          </dl>
          <p className="mt-3 text-xs text-slate-500">
            Después de pagar, adjunta aquí la foto del comprobante.
          </p>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20";

export default function ServiceRequestForm() {
  return (
    <form action={createServiceRequest} className="space-y-6">
      {/* Datos del tutor */}
      <section className="rounded-xl border border-black/5 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-navy">Tus datos</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-sm sm:col-span-2">
            <span className="text-slate-500">Nombre completo *</span>
            <input name="ownerName" required className={inputCls} />
          </label>
          <label className="text-sm">
            <span className="text-slate-500">Cédula</span>
            <input name="ownerId" inputMode="numeric" className={inputCls} />
          </label>
          <label className="text-sm">
            <span className="text-slate-500">Teléfono / WhatsApp *</span>
            <input name="phone" required inputMode="tel" className={inputCls} />
          </label>
          <label className="text-sm">
            <span className="text-slate-500">Teléfono adicional</span>
            <input name="phoneAlt" inputMode="tel" className={inputCls} />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="text-slate-500">Correo electrónico</span>
            <input name="email" type="email" className={inputCls} />
          </label>
          <label className="text-sm">
            <span className="text-slate-500">Provincia *</span>
            <select name="province" required defaultValue="" className={inputCls}>
              <option value="" disabled>Selecciona…</option>
              {PROVINCIAS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="text-slate-500">Ciudad</span>
            <input name="city" className={inputCls} />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="text-slate-500">Dirección</span>
            <input name="address" className={inputCls} />
          </label>
        </div>
      </section>

      {/* Datos de la mascota */}
      <section className="rounded-xl border border-black/5 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-navy">Tu mascota</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="text-slate-500">Nombre de la mascota</span>
            <input name="petName" className={inputCls} />
          </label>
          <label className="text-sm">
            <span className="text-slate-500">Especie</span>
            <select name="species" defaultValue="" className={inputCls}>
              <option value="">Selecciona…</option>
              <option value="Canina">Perro</option>
              <option value="Felina">Gato</option>
              <option value="Otra">Otra</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="text-slate-500">Raza</span>
            <input name="breed" className={inputCls} />
          </label>
          <label className="text-sm">
            <span className="text-slate-500">Sexo</span>
            <select name="sex" defaultValue="" className={inputCls}>
              <option value="">Selecciona…</option>
              <option value="Macho">Macho</option>
              <option value="Hembra">Hembra</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="text-slate-500">Color</span>
            <input name="color" className={inputCls} />
          </label>
          <label className="text-sm">
            <span className="text-slate-500">Fecha de nacimiento</span>
            <input type="date" name="birthDate" className={inputCls} />
          </label>
          <label className="text-sm">
            <span className="text-slate-500">N.º de microchip (si lo tiene)</span>
            <input name="microchip" inputMode="numeric" placeholder="N.º de serie" className={inputCls} />
          </label>
          <label className="flex items-center gap-2 pt-6 text-sm text-slate-600">
            <input type="checkbox" name="hasChip" className="h-4 w-4 rounded border-slate-300" />
            Tiene microchip (sin número a la mano)
          </label>
          <label className="text-sm">
            <span className="text-slate-500">Alimentación</span>
            <select name="feeding" defaultValue="" className={inputCls}>
              <option value="">Selecciona…</option>
              <option value="Balanceado">Balanceado</option>
              <option value="Casera">Casera</option>
              <option value="Mixta">Mixta</option>
            </select>
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="text-slate-500">Señas particulares</span>
            <input name="distinctiveMarks" placeholder="Manchas, cicatrices, marcas distintivas" className={inputCls} />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="text-slate-500">Enfermedades / notas de salud</span>
            <input name="diseases" placeholder="Ninguna / detalle" className={inputCls} />
          </label>
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1 text-sm text-slate-600 sm:col-span-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="sterilized" className="h-4 w-4 rounded border-slate-300" />
              Esterilizado/a
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="training" className="h-4 w-4 rounded border-slate-300" />
              Con adiestramiento
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="aggressionHistory" className="h-4 w-4 rounded border-slate-300" />
              Antecedentes de agresión
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <PhotoField name="petPhoto" label="Foto de la mascota" hint="Para la ficha e identificación." />
          <PhotoField name="carnetPhoto" label="Foto del carnet de vacunas" hint="Para actualizar su historial de salud." />
        </div>
      </section>

      {/* Comprobante de pago */}
      <section className="rounded-xl border border-black/5 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-navy">Comprobante de pago</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Realiza el pago a nuestra cuenta y adjunta la foto del comprobante para agilizar tu trámite.
        </p>
        <div className="mt-3">
          <PaymentInfo />
          <PhotoField name="paymentPhoto" label="Foto del pago realizado" hint="Transferencia, depósito o recibo." />
        </div>
      </section>

      {/* Mensaje */}
      <section className="rounded-xl border border-black/5 bg-white p-5 shadow-sm">
        <label className="text-sm">
          <span className="text-slate-500">¿Qué necesitas? (opcional)</span>
          <textarea
            name="message"
            rows={3}
            placeholder="Cuéntanos qué servicio necesitas o cómo nos conociste."
            className={inputCls}
          />
        </label>
      </section>

      <SubmitBtn />
      <p className="text-center text-xs text-slate-400">
        Al enviar, nuestro equipo te contactará para darte el servicio en tu provincia.
      </p>
    </form>
  );
}
