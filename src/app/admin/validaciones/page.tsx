import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { validateHealthEvent, deleteHealthEvent } from "@/lib/actions/health";

export const metadata: Metadata = { title: "Validaciones pendientes" };

function fmt(d?: Date | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(d));
}

export default async function ValidacionesPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const events = await prisma.healthEvent.findMany({
    where: { status: "pendiente" },
    orderBy: { createdAt: "desc" },
    include: {
      pet: { select: { id: true, petName: true, registrationNo: true, ownerName: true } },
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-navy">⏳ Validaciones pendientes</h1>
          <p className="text-sm text-slate-500">
            Reportes de salud enviados por los tutores, a la espera de confirmación.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-navy transition hover:bg-slate-50"
        >
          ← Volver al panel
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="mt-8 rounded-xl border border-black/5 bg-white p-10 text-center shadow-sm">
          <p className="text-3xl">✅</p>
          <p className="mt-2 font-semibold text-navy">No hay reportes pendientes</p>
          <p className="text-sm text-slate-500">
            Cuando un tutor reporte una vacuna o desparasitación, aparecerá aquí para validarla.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-amber-200 bg-amber-50/50 p-4"
            >
              {ev.photoData ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ev.photoData} alt="Respaldo" className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-slate-200" />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-2xl">
                  {ev.type === "vacuna" ? "💉" : "🪱"}
                </div>
              )}

              <div className="min-w-[180px] flex-1">
                <p className="font-bold text-navy">
                  {ev.type === "vacuna" ? "Vacuna" : "Desparasitación"}
                  {ev.product ? ` · ${ev.product}` : ""}
                </p>
                <p className="text-sm text-slate-600">
                  Aplicada: <span className="font-medium">{fmt(ev.date)}</span>
                  {ev.nextDate ? <> · Próxima: {fmt(ev.nextDate)}</> : null}
                </p>
                <p className="text-xs text-slate-400">
                  <Link href={`/admin/${ev.pet.id}`} className="font-semibold text-teal hover:underline">
                    {ev.pet.petName}
                  </Link>{" "}
                  · {ev.pet.registrationNo} · Tutor: {ev.pet.ownerName}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <form action={validateHealthEvent}>
                  <input type="hidden" name="eventId" value={ev.id} />
                  <button className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-600">
                    Validar
                  </button>
                </form>
                <form action={deleteHealthEvent}>
                  <input type="hidden" name="eventId" value={ev.id} />
                  <input type="hidden" name="petRecordId" value={ev.pet.id} />
                  <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white">
                    Rechazar
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
