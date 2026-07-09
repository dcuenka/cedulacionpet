import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { logoutAdmin } from "@/lib/actions/admin";

export const metadata: Metadata = { title: "Panel de administración" };

function fmt(d: Date) {
  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(d));
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const { q } = await searchParams;
  const query = (q || "").trim();

  const where = query
    ? {
        OR: [
          { registrationNo: { contains: query } },
          { microchip: { contains: query } },
          { petName: { contains: query } },
          { ownerName: { contains: query } },
          { ownerId: { contains: query } },
        ],
      }
    : {};

  const [records, total, lost] = await Promise.all([
    prisma.petRecord.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.petRecord.count(),
    prisma.petRecord.count({ where: { lost: true } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-navy">Panel de administración</h1>
          <p className="text-sm text-slate-500">
            {total.toLocaleString("es-EC")} fichas registradas
            {lost > 0 && (
              <>
                {" · "}
                <span className="font-semibold text-amber-700">{lost} perdida(s)</span>
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/nueva"
            className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-600"
          >
            + Nueva ficha
          </Link>
          <form action={logoutAdmin}>
            <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-navy transition hover:bg-slate-50">
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>

      <form method="get" className="mt-6 flex gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="Buscar por nombre, tutor, cédula, microchip o N.º de ficha…"
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
        />
        <button className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700">
          Buscar
        </button>
        {query && (
          <Link
            href="/admin"
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-slate-50"
          >
            Limpiar
          </Link>
        )}
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-black/5 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">N.º Ficha</th>
              <th className="px-4 py-3">Microchip</th>
              <th className="px-4 py-3">Mascota</th>
              <th className="px-4 py-3">Tutor</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  No hay fichas{query ? " que coincidan con la búsqueda" : " todavía"}.
                </td>
              </tr>
            )}
            {records.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-navy">
                  {r.registrationNo}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                  {r.microchip || "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-navy">{r.petName}</span>
                  <span className="block text-xs text-slate-400">
                    {r.species}
                    {r.breed ? ` · ${r.breed}` : ""}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-navy">{r.ownerName}</span>
                  <span className="block text-xs text-slate-400">
                    {r.ownerPhone || `${r.ownerIdType}: ${r.ownerId}`}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{fmt(r.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {r.lost && (
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                        perdida
                      </span>
                    )}
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-bold ${
                        r.status === "anulado"
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/${r.id}`}
                    className="text-xs font-semibold text-teal hover:underline"
                  >
                    Abrir ficha →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {records.length === 200 && (
        <p className="mt-3 text-center text-xs text-slate-400">
          Mostrando las primeras 200 fichas. Usa la búsqueda para filtrar.
        </p>
      )}
    </div>
  );
}
