import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BRAND } from "@/lib/brand";

// Revalida el contador cada 60 s en producción (no queda congelado del build).
export const revalidate = 60;

export default async function HomePage() {
  let total = 0;
  try {
    total = await prisma.petRecord.count();
  } catch {
    total = 0;
  }

  return (
    <div>
      {/* Hero institucional */}
      <section className="paw-watermark relative overflow-hidden bg-navy text-white">
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-widest text-white/80">
              <span className="inline-flex h-4 w-6 overflow-hidden rounded-sm">
                <span className="h-full w-1/3 bg-ec-yellow" />
                <span className="h-full w-1/3 bg-ec-blue" />
                <span className="h-full w-1/3 bg-ec-red" />
              </span>
              {BRAND.authority}
            </span>
            <h1 className="mt-5 text-4xl font-black leading-tight md:text-5xl">
              Identificación y <span className="text-ec-yellow">localización</span> de tu mascota
            </h1>
            <p className="mt-4 max-w-lg text-lg text-white/70">
              Registramos la ficha técnica completa de tu mascota, implantamos un{" "}
              <strong className="text-white">microchip</strong> con número de serie único y
              entregamos su <strong className="text-white">cédula física</strong>, su{" "}
              <strong className="text-white">pasaporte de mascota</strong> y un{" "}
              <strong className="text-white">código QR</strong>. Si se pierde, quien la
              encuentre puede escanear el QR o ingresar el número de serie y contactarte al
              instante.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/localizar"
                className="rounded-lg bg-ec-yellow px-6 py-3 font-bold text-navy shadow-lg transition hover:brightness-95"
              >
                🔎 Consultar / localizar mascota
              </Link>
              <Link
                href="/admin"
                className="rounded-lg border border-white/25 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Acceso administrador
              </Link>
            </div>
            <p className="mt-6 text-sm text-white/50">
              <strong className="text-white">{total.toLocaleString("es-EC")}</strong> mascotas ya cuentan con su ficha e identificación.
            </p>
          </div>

          {/* Vista previa de cédula */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="rotate-2 rounded-2xl bg-white p-1 shadow-2xl transition hover:rotate-0">
              <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-5 text-navy">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-teal">
                    Cédula de Identificación Animal
                  </span>
                  <span className="text-xs font-black">🐾</span>
                </div>
                <div className="mt-3 flex gap-3">
                  <div className="flex h-24 w-20 items-center justify-center rounded-lg bg-slate-200 text-3xl">
                    🐾
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="text-lg font-black leading-none">MIA</p>
                    <p className="mt-2 text-[10px] uppercase text-teal">Especie</p>
                    <p className="font-semibold">Canina</p>
                    <p className="mt-1 text-[10px] uppercase text-teal">Microchip</p>
                    <p className="font-mono text-[10px] font-semibold">985141000123456</p>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <div className="grid h-16 w-16 grid-cols-4 grid-rows-4 gap-0.5 rounded bg-white p-1">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <span
                          key={i}
                          className={(i * 7) % 3 === 0 ? "bg-navy" : "bg-transparent"}
                        />
                      ))}
                    </div>
                    <span className="mt-1 text-[7px] text-slate-400">Escanéame</span>
                  </div>
                </div>
                <div className="mt-3 rounded-lg bg-navy px-3 py-2 text-white">
                  <p className="text-[9px] uppercase tracking-widest text-white/60">
                    Certificado N.º
                  </p>
                  <p className="font-mono text-sm font-bold">CP-2026-000001</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-navy">Cómo funciona</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              n: "1",
              t: "Creamos la ficha",
              d: "Registramos los datos de la mascota (ficha técnica y de salud) y del tutor responsable en la plataforma.",
            },
            {
              n: "2",
              t: "Microchip, cédula y pasaporte",
              d: "Implantamos el microchip, leemos su número de serie y lo registramos. Entregamos la cédula física, el pasaporte de mascota y el código QR.",
            },
            {
              n: "3",
              t: "Recuperación",
              d: "Si la mascota se pierde, quien la encuentre escanea el QR o ingresa el número de serie y contacta al tutor.",
            },
          ].map((s) => (
            <div key={s.n} className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal text-lg font-black text-white">
                {s.n}
              </span>
              <h3 className="mt-4 font-bold text-navy">{s.t}</h3>
              <p className="mt-2 text-sm text-slate-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dos accesos */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
            <p className="text-2xl">🔎</p>
            <h3 className="mt-3 text-lg font-bold text-navy">
              ¿Encontraste una mascota?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Tutores, veterinarios y cualquier persona puede consultar una ficha
              ingresando el número de serie del microchip o escaneando el QR.
            </p>
            <Link
              href="/localizar"
              className="mt-4 inline-block rounded-lg bg-navy px-6 py-2.5 font-semibold text-white transition hover:bg-navy-700"
            >
              Consultar mascota
            </Link>
          </div>
          <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
            <p className="text-2xl">🛡️</p>
            <h3 className="mt-3 text-lg font-bold text-navy">Equipo administrador</h3>
            <p className="mt-2 text-sm text-slate-600">
              Acceso exclusivo del equipo para crear y gestionar fichas, registrar
              microchips y emitir cédulas. Requiere contraseña.
            </p>
            <Link
              href="/admin"
              className="mt-4 inline-block rounded-lg border border-slate-300 px-6 py-2.5 font-semibold text-navy transition hover:bg-slate-50"
            >
              Ingresar
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
