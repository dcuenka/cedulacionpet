import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { updateServiceRequestStatus, deleteServiceRequest } from "@/lib/actions/service-request";

export const metadata: Metadata = { title: "Solicitudes de servicio" };

function fmt(d: Date) {
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(d));
}

function waLink(phone?: string | null): string | null {
  if (!phone) return null;
  let d = phone.replace(/\D/g, "");
  if (!d) return null;
  if (d.length === 10 && d.startsWith("0")) d = "593" + d.slice(1);
  else if (d.length === 9) d = "593" + d;
  return `https://wa.me/${d}`;
}

const STATUS_STYLE: Record<string, string> = {
  nueva: "bg-amber-100 text-amber-800",
  contactado: "bg-sky-100 text-sky-800",
  atendida: "bg-emerald-100 text-emerald-700",
  descartada: "bg-slate-200 text-slate-600",
};

export default async function SolicitudesPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const requests = await prisma.serviceRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-navy">📨 Solicitudes de servicio</h1>
          <p className="text-sm text-slate-500">
            Personas que pidieron el servicio desde el formulario público.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-navy transition hover:bg-slate-50"
        >
          ← Volver al panel
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="mt-8 rounded-xl border border-black/5 bg-white p-10 text-center shadow-sm">
          <p className="text-3xl">📭</p>
          <p className="mt-2 font-semibold text-navy">Aún no hay solicitudes</p>
          <p className="text-sm text-slate-500">
            Comparte el enlace <span className="font-mono">/solicitar</span> para recibir solicitudes.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {requests.map((r) => {
            const wa = waLink(r.phone);
            return (
              <div key={r.id} className="rounded-xl border border-black/5 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-navy">{r.ownerName}</h3>
                      <span className={`rounded px-2 py-0.5 text-xs font-bold ${STATUS_STYLE[r.status] || "bg-slate-100 text-slate-600"}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {r.province}{r.city ? ` · ${r.city}` : ""} · {fmt(r.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a href={`tel:${r.phone}`} className="rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-navy-700">
                      📞 {r.phone}
                    </a>
                    {wa && (
                      <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-teal px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-600">
                        💬 WhatsApp
                      </a>
                    )}
                    {r.email && (
                      <a href={`mailto:${r.email}`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-navy transition hover:bg-slate-50">
                        ✉ Email
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="space-y-1 text-slate-600">
                    {r.ownerId && <p><span className="text-slate-400">Cédula:</span> {r.ownerId}</p>}
                    {r.email && <p><span className="text-slate-400">Correo:</span> {r.email}</p>}
                    {r.address && <p><span className="text-slate-400">Dirección:</span> {r.address}</p>}
                    <p>
                      <span className="text-slate-400">Mascota:</span>{" "}
                      {[r.petName, r.species, r.breed].filter(Boolean).join(" · ") || "—"}
                      {r.hasChip ? " · con microchip" : ""}
                    </p>
                    {r.message && <p className="rounded bg-slate-50 px-2 py-1"><span className="text-slate-400">Mensaje:</span> {r.message}</p>}
                  </div>
                  <div className="flex gap-3">
                    {r.petPhoto && (
                      <figure className="text-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.petPhoto} alt="Mascota" className="h-24 w-24 rounded-lg object-cover ring-1 ring-slate-200" />
                        <figcaption className="text-[10px] text-slate-400">Mascota</figcaption>
                      </figure>
                    )}
                    {r.carnetPhoto && (
                      <figure className="text-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.carnetPhoto} alt="Carnet" className="h-24 w-24 rounded-lg object-cover ring-1 ring-slate-200" />
                        <figcaption className="text-[10px] text-slate-400">Carnet</figcaption>
                      </figure>
                    )}
                    {r.paymentPhoto && (
                      <figure className="text-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.paymentPhoto} alt="Pago" className="h-24 w-24 rounded-lg object-cover ring-1 ring-emerald-300" />
                        <figcaption className="text-[10px] font-semibold text-emerald-600">💳 Pago</figcaption>
                      </figure>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                  <Link
                    href={`/admin/nueva?from=${r.id}`}
                    className="rounded-lg bg-teal px-3 py-1.5 text-xs font-bold text-white transition hover:bg-teal-600"
                  >
                    ➕ Crear ficha
                  </Link>
                  <span className="mx-1 h-4 w-px bg-slate-200" />
                  {["nueva", "contactado", "atendida", "descartada"].map((s) => (
                    <form key={s} action={updateServiceRequestStatus}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value={s} />
                      <button
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                          r.status === s
                            ? "bg-navy text-white"
                            : "border border-slate-300 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {s}
                      </button>
                    </form>
                  ))}
                  <form action={deleteServiceRequest} className="ml-auto">
                    <input type="hidden" name="id" value={r.id} />
                    <button className="text-xs text-slate-400 transition hover:text-red-500">Eliminar</button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
