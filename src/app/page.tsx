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
              <span className="text-ec-yellow">Identificación</span> y registro nacional de tu mascota
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
                🔎 Consultar / identificar mascota
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

          {/* Imagen principal: perro recortado + su cédula (proporción ID) */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="cred-glow pointer-events-none absolute inset-x-6 top-2 h-72 rounded-[45%] bg-ec-yellow/25 blur-3xl" />
            <div className="float-soft relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/portada-perro.png"
                alt="Perro con estetoscopio — Cedulación Pet"
                className="mx-auto w-[82%] drop-shadow-2xl"
              />
              {/* Cédula horizontal (proporción de cédula real), cubriendo las patas */}
              <div
                className="relative -mt-24 flex flex-col overflow-hidden rounded-xl bg-[#f8fbfc] text-navy shadow-2xl ring-1 ring-black/10"
                style={{ aspectRatio: "1.586 / 1" }}
              >
                <div className="flag-bar" />
                <div className="flex items-center gap-1.5 px-3 pt-2">
                  <span className="flex h-3.5 w-5 flex-col overflow-hidden rounded-[2px] ring-1 ring-black/10">
                    <span className="h-1/2 bg-ec-yellow" />
                    <span className="h-1/4 bg-ec-blue" />
                    <span className="h-1/4 bg-ec-red" />
                  </span>
                  <p className="text-[9px] font-black uppercase tracking-wide">
                    Cédula de Identidad Animal
                  </p>
                </div>
                <div className="flex flex-1 gap-2.5 px-3 py-2">
                  <div className="aspect-[3/4] h-full overflow-hidden rounded-md bg-slate-100 ring-1 ring-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/perro-cedula.png" alt="SAMY" className="h-full w-full object-cover" />
                  </div>
                  <div className="grid flex-1 content-start grid-cols-2 gap-x-2 gap-y-1">
                    <div className="col-span-2">
                      <p className="text-[7px] uppercase tracking-wide text-slate-400">Nombre</p>
                      <p className="text-sm font-black leading-none text-slate-800">SAMY</p>
                    </div>
                    <div>
                      <p className="text-[7px] uppercase tracking-wide text-slate-400">Especie</p>
                      <p className="text-[10px] font-bold text-slate-800">Canina</p>
                    </div>
                    <div>
                      <p className="text-[7px] uppercase tracking-wide text-slate-400">Sexo</p>
                      <p className="text-[10px] font-bold text-slate-800">Macho</p>
                    </div>
                    <div>
                      <p className="text-[7px] uppercase tracking-wide text-slate-400">Raza</p>
                      <p className="text-[10px] font-bold text-slate-800">Mestizo</p>
                    </div>
                    <div>
                      <p className="text-[7px] uppercase tracking-wide text-slate-400">Nacionalidad</p>
                      <p className="text-[10px] font-bold text-slate-800">Ecuatoriana</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-end justify-between px-3 pb-2">
                  <p className="text-[8px]">
                    <span className="text-slate-400">NUI.</span>{" "}
                    <span className="font-mono font-bold text-navy">985100200300</span>
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3.5 w-5 rounded-[2px] bg-gradient-to-br from-amber-300 to-amber-500" />
                    <div className="grid h-9 w-9 grid-cols-4 grid-rows-4 gap-px rounded bg-white p-0.5 ring-1 ring-slate-200">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <span key={i} className={(i * 7) % 3 === 0 ? "bg-navy" : "bg-transparent"} />
                      ))}
                    </div>
                  </div>
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
