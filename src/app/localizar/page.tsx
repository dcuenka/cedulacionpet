import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Consultar / localizar mascota" };

async function search(formData: FormData) {
  "use server";
  const q = String(formData.get("q") || "").trim();
  if (q) redirect(`/m/${encodeURIComponent(q)}`);
}

export default function LocalizarPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
        <span className="text-3xl">🔎</span>
        <h1 className="mt-3 text-2xl font-black text-navy">
          Consultar una mascota
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          ¿Encontraste una mascota o quieres verificar su ficha? Ingresa el{" "}
          <strong>número de serie del microchip</strong> (o el número de cédula que
          aparece en la placa) o <strong>escanea el código QR</strong> de su cédula.
        </p>
        <form action={search} className="mt-6 flex gap-2">
          <input
            name="q"
            required
            placeholder="N.º de microchip o de cédula"
            className="flex-1 rounded-lg border border-slate-300 px-4 py-3 font-mono text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
          <button className="rounded-lg bg-navy px-6 py-3 font-semibold text-white transition hover:bg-navy-700">
            Consultar
          </button>
        </form>
        <p className="mt-4 text-xs text-slate-400">
          Este acceso es solo de consulta. Únicamente el equipo administrador puede
          registrar o modificar información.
        </p>
      </div>
    </div>
  );
}
