import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { searchByPhoto } from "@/lib/actions/search-photo";
import { updateFoundReportStatus, deleteFoundReport } from "@/lib/actions/found-report";

export const metadata: Metadata = { title: "Verificaciones por foto" };

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

export default async function VerificacionesPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const reports = await prisma.foundReport.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  // Búsqueda interna de coincidencias para cada reporte.
  const withMatches = await Promise.all(
    reports.map(async (r) => ({ r, matches: (await searchByPhoto(r.photoData)).matches || [] })),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-navy">📷 Verificaciones por foto</h1>
          <p className="text-sm text-slate-500">
            Fotos enviadas por quienes encuentran una mascota. Revisa las coincidencias y contacta.
          </p>
        </div>
        <Link href="/admin" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-navy transition hover:bg-slate-50">
          ← Volver al panel
        </Link>
      </div>

      {withMatches.length === 0 ? (
        <div className="mt-8 rounded-xl border border-black/5 bg-white p-10 text-center shadow-sm">
          <p className="text-3xl">📭</p>
          <p className="mt-2 font-semibold text-navy">No hay fotos para verificar</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {withMatches.map(({ r, matches }) => {
            const wa = waLink(r.phone);
            return (
              <div key={r.id} className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.photoData} alt="Encontrada" className="h-28 w-28 shrink-0 rounded-lg object-cover ring-1 ring-slate-200" />
                  <div className="min-w-[180px] flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy">Mascota encontrada</span>
                      <span className={`rounded px-2 py-0.5 text-xs font-bold ${r.status === "revisada" ? "bg-emerald-100 text-emerald-700" : r.status === "descartada" ? "bg-slate-200 text-slate-600" : "bg-amber-100 text-amber-800"}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{fmt(r.createdAt)}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {r.phone && (
                        <a href={`tel:${r.phone}`} className="rounded bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-700">📞 {r.phone}</a>
                      )}
                      {wa && (
                        <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded bg-teal px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-600">💬 WhatsApp</a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 border-t border-slate-100 pt-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Posibles coincidencias</p>
                  {matches.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-400">Sin coincidencias por parecido.</p>
                  ) : (
                    <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {matches.map((m) => (
                        <Link key={m.registrationNo} href={`/m/${encodeURIComponent(m.code)}`} className="overflow-hidden rounded-lg ring-1 ring-slate-200 hover:ring-teal">
                          <div className="relative aspect-square w-full bg-slate-100">
                            {m.photoData ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={m.photoData} alt={m.petName} className="h-full w-full object-cover" />
                            ) : <span className="flex h-full items-center justify-center text-2xl">🐾</span>}
                            <span className="absolute right-0.5 top-0.5 rounded bg-black/60 px-1 text-[9px] font-bold text-white">{m.score}%</span>
                          </div>
                          <p className="truncate px-1 py-0.5 text-[11px] font-semibold text-navy">{m.petName}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                  {["nueva", "revisada", "descartada"].map((s) => (
                    <form key={s} action={updateFoundReportStatus}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value={s} />
                      <button className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${r.status === s ? "bg-navy text-white" : "border border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
                        {s}
                      </button>
                    </form>
                  ))}
                  <form action={deleteFoundReport} className="ml-auto">
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
