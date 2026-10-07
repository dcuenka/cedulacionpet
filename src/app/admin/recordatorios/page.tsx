import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Recordatorios" };

function fmt(d: Date) {
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(d));
}

// Días desde hoy hasta la fecha (negativo = vencida).
function daysUntil(d: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function waLink(phone?: string | null): string | null {
  if (!phone) return null;
  let s = phone.replace(/\D/g, "");
  if (!s) return null;
  if (s.length === 10 && s.startsWith("0")) s = "593" + s.slice(1);
  else if (s.length === 9) s = "593" + s;
  return `https://wa.me/${s}`;
}

export default async function RecordatoriosPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const soon = new Date();
  soon.setHours(23, 59, 59, 999);
  soon.setDate(soon.getDate() + 30);

  const pets = await prisma.petRecord.findMany({
    where: {
      status: "activo",
      OR: [{ nextVaccineDate: { lte: soon } }, { nextDewormDate: { lte: soon } }],
    },
    select: {
      registrationNo: true,
      petName: true,
      species: true,
      breed: true,
      ownerName: true,
      ownerPhone: true,
      ownerPhoneAlt: true,
      nextVaccineDate: true,
      nextDewormDate: true,
    },
  });

  type Item = {
    pet: (typeof pets)[number];
    tipo: "Vacuna" | "Desparasitación";
    date: Date;
  };
  const items: Item[] = [];
  for (const p of pets) {
    if (p.nextVaccineDate && p.nextVaccineDate <= soon)
      items.push({ pet: p, tipo: "Vacuna", date: p.nextVaccineDate });
    if (p.nextDewormDate && p.nextDewormDate <= soon)
      items.push({ pet: p, tipo: "Desparasitación", date: p.nextDewormDate });
  }
  items.sort((a, b) => a.date.getTime() - b.date.getTime());

  const vencidas = items.filter((i) => daysUntil(i.date) < 0).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin" className="text-sm font-semibold text-teal hover:underline">
            ← Volver al panel
          </Link>
          <h1 className="mt-1 text-2xl font-black text-navy">Recordatorios de salud</h1>
          <p className="text-sm text-slate-500">
            Próximos 30 días · {items.length} pendiente(s)
            {vencidas > 0 && (
              <>
                {" · "}
                <span className="font-semibold text-red-600">{vencidas} vencida(s)</span>
              </>
            )}
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-navy transition hover:bg-slate-50"
        >
          Panel
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {items.length === 0 && (
          <div className="rounded-xl border border-black/5 bg-white p-10 text-center text-slate-400 shadow-sm">
            🎉 No hay vacunas ni desparasitaciones pendientes en los próximos 30 días.
          </div>
        )}
        {items.map((it, idx) => {
          const d = daysUntil(it.date);
          const vencida = d < 0;
          const hoy = d === 0;
          const wa = waLink(it.pet.ownerPhone) || waLink(it.pet.ownerPhoneAlt);
          return (
            <div
              key={idx}
              className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4 shadow-sm ${
                vencida ? "border-red-200" : "border-black/5"
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-navy">{it.pet.petName}</span>
                  <span className="rounded bg-teal/10 px-2 py-0.5 text-xs font-semibold text-teal-600">
                    {it.tipo === "Vacuna" ? "💉 Vacuna" : "🪱 Desparasitación"}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-bold ${
                      vencida
                        ? "bg-red-100 text-red-700"
                        : hoy
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {vencida ? `Vencida hace ${Math.abs(d)} día(s)` : hoy ? "Es hoy" : `En ${d} día(s)`}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {fmt(it.date)} · Tutor: {it.pet.ownerName}
                  {it.pet.ownerPhone ? ` · ${it.pet.ownerPhone}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {it.pet.ownerPhone && (
                  <a
                    href={`tel:${it.pet.ownerPhone}`}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-navy transition hover:bg-slate-50"
                  >
                    📞 Llamar
                  </a>
                )}
                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-teal px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-600"
                  >
                    💬 WhatsApp
                  </a>
                )}
                <Link
                  href={`/admin?q=${encodeURIComponent(it.pet.registrationNo)}`}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-navy transition hover:bg-slate-50"
                >
                  Ficha
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
