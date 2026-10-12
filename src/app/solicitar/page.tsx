import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import ServiceRequestForm from "@/components/ServiceRequestForm";

export const metadata: Metadata = { title: "Solicitar el servicio" };

export default async function SolicitarPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;

  if (ok) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-10 shadow-sm">
          <p className="text-4xl">✅</p>
          <h1 className="mt-4 text-2xl font-black text-navy">¡Solicitud enviada!</h1>
          <p className="mt-2 text-slate-600">
            Gracias por contactarte con {BRAND.name}. Nuestro equipo te llamará o
            escribirá para darte el servicio en tu provincia.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-navy px-6 py-2.5 font-semibold text-white transition hover:bg-navy-700"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Barra tricolor + encabezado */}
      <div className="rounded-2xl bg-navy p-6 text-white">
        <span className="inline-flex h-4 w-6 overflow-hidden rounded-sm">
          <span className="h-full w-1/3 bg-ec-yellow" />
          <span className="h-full w-1/3 bg-ec-blue" />
          <span className="h-full w-1/3 bg-ec-red" />
        </span>
        <h1 className="mt-3 text-2xl font-black">Solicita el servicio en todo el Ecuador</h1>
        <p className="mt-1 text-sm text-white/70">
          Déjanos los datos de tu mascota y los tuyos —puedes adjuntar su foto, la
          del carnet de vacunas y el comprobante de pago— y te contactamos para
          darte el servicio.
        </p>
        <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-ec-yellow px-3 py-1 text-xs font-bold text-navy">
          ⏱ Aprobación en máximo 24 horas
        </span>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          Completa al menos tu nombre, teléfono y provincia.
        </div>
      )}

      <div className="mt-6">
        <ServiceRequestForm />
      </div>
    </div>
  );
}
