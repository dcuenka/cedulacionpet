import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BRAND } from "@/lib/brand";
import DogPhoto from "@/components/DogPhoto";
import Paw from "@/components/Paw";

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

          {/* Vista previa: cédula + pasaporte */}
          <div className="relative mx-auto h-[400px] w-full max-w-sm">
            {/* Brillo pulsante */}
            <div className="cred-glow pointer-events-none absolute inset-6 rounded-[40%] bg-ec-yellow/25 blur-3xl" />
            {/* Pasaporte (detrás) */}
            <div className="cred-back absolute right-0 top-0 w-60 rounded-xl bg-[#6b1f2a] p-3 text-[#e8cf96] shadow-2xl ring-1 ring-black/20">
              <div className="flex items-center gap-2 border-b border-[#e8cf96]/25 pb-2">
                <Paw className="h-5 w-5 text-[#e8cf96]" />
                <div className="leading-tight">
                  <p className="text-[9px] font-black tracking-wide">PASAPORTE DE MASCOTA</p>
                  <p className="text-[7px] tracking-widest opacity-80">PET PASSPORT · ECUADOR</p>
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <div className="h-16 w-14 overflow-hidden rounded ring-1 ring-[#e8cf96]/30">
                  <DogPhoto className="h-full w-full" />
                </div>
                <div className="text-[8px] leading-tight">
                  <p className="opacity-70">Nombre / Name</p>
                  <p className="text-[11px] font-bold text-white">ROCKY</p>
                  <p className="mt-1 opacity-70">Tipo / Type</p>
                  <p className="font-bold text-white">PET · ECU</p>
                </div>
              </div>
              <p className="mt-2 font-mono text-[7px] tracking-wider text-white/80">
                {"P<ECUROCKY<<<<<<<<<<<<<<"}
              </p>
            </div>

            {/* Cédula (delante) */}
            <div className="cred-front absolute bottom-0 left-0 w-[19rem] rounded-xl bg-white p-1 shadow-2xl ring-1 ring-black/10">
              <div className="rounded-lg bg-[#f8fbfc] p-3 text-navy">
                <div className="flex items-center gap-2">
                  <span className="flex h-4 w-6 flex-col overflow-hidden rounded-sm ring-1 ring-black/10">
                    <span className="h-1/2 bg-ec-yellow" />
                    <span className="h-1/4 bg-ec-blue" />
                    <span className="h-1/4 bg-ec-red" />
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-wide">
                    Cédula de Identidad Animal
                  </p>
                </div>
                <div className="mt-2 flag-bar" />
                <div className="mt-3 flex gap-3">
                  <div className="h-24 w-20 overflow-hidden rounded-md ring-1 ring-slate-200">
                    <DogPhoto className="h-full w-full" />
                  </div>
                  <div className="grid flex-1 grid-cols-2 gap-x-2 gap-y-1.5">
                    <div>
                      <p className="text-[8px] uppercase text-slate-400">Nombre</p>
                      <p className="text-sm font-bold leading-none text-slate-800">ROCKY</p>
                    </div>
                    <div>
                      <p className="text-[8px] uppercase text-slate-400">Sexo</p>
                      <p className="text-[11px] font-bold text-slate-800">Macho</p>
                    </div>
                    <div>
                      <p className="text-[8px] uppercase text-slate-400">Especie</p>
                      <p className="text-[11px] font-bold text-slate-800">Canina</p>
                    </div>
                    <div>
                      <p className="text-[8px] uppercase text-slate-400">Raza</p>
                      <p className="text-[11px] font-bold text-slate-800">Golden</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[8px] uppercase text-slate-400">Nacionalidad</p>
                      <p className="text-[11px] font-bold text-slate-800">Ecuatoriana</p>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <p className="text-[9px]">
                    <span className="text-slate-400">NUI.</span>{" "}
                    <span className="font-mono font-bold text-navy">985100200300</span>
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="h-4 w-6 rounded-sm bg-gradient-to-br from-amber-300 to-amber-500" />
                    <div className="grid h-11 w-11 grid-cols-4 grid-rows-4 gap-px rounded bg-white p-0.5 ring-1 ring-slate-200">
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
