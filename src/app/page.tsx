import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BRAND } from "@/lib/brand";
import { qrDataUrl } from "@/lib/qr";

// Revalida el contador cada 60 s en producción (no queda congelado del build).
export const revalidate = 60;

// Campo compacto para la cédula de muestra de la portada.
function CedField({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div>
      <p className="text-[6px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`font-bold leading-tight text-slate-800 ${big ? "text-[15px]" : "text-[9px]"}`}>
        {value}
      </p>
    </div>
  );
}

export default async function HomePage() {
  let total = 0;
  try {
    total = await prisma.petRecord.count();
  } catch {
    total = 0;
  }

  // QR de muestra para la cédula de la portada (datos ficticios).
  const demoQr = await qrDataUrl("985141002233417");

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

          {/* Imagen principal: cédula (proporción real de cédula) + perro asomándose */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="cred-glow pointer-events-none absolute -inset-6 rounded-[36px] bg-ec-yellow/20 blur-3xl" />
            <div className="float-soft relative">
              {/* Perro asomando detrás de la cédula */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/portada-perro.png"
                alt="Perro — Cedulación Pet"
                className="pointer-events-none absolute -top-[11.5rem] left-1/2 z-0 w-44 -translate-x-1/2 drop-shadow-xl"
              />
              {/* Cédula (proporción tipo cédula de ciudadanía, ~1.586:1) */}
              <div
                className="relative z-10 flex flex-col overflow-hidden rounded-xl bg-white text-navy shadow-2xl ring-1 ring-black/10"
                style={{ aspectRatio: "1.586 / 1" }}
              >
                <div className="flex items-center gap-2 px-3 pt-2">
                  <span className="flex h-4 w-6 flex-col overflow-hidden rounded-[2px] ring-1 ring-black/10">
                    <span className="h-1/2 bg-ec-yellow" />
                    <span className="h-1/4 bg-ec-blue" />
                    <span className="h-1/4 bg-ec-red" />
                  </span>
                  <div>
                    <p className="text-[10px] font-black uppercase leading-none tracking-wide">
                      Cédula de Identidad Animal
                    </p>
                    <p className="mt-0.5 text-[6px] uppercase tracking-widest text-slate-400">
                      {BRAND.name} · {BRAND.tagline}
                    </p>
                  </div>
                </div>
                <div className="mt-1.5 flag-bar" />
                <div
                  className="flex flex-1 gap-3 bg-[#f8fbfc] px-3 py-2"
                  style={{
                    backgroundImage: "url(/ecuador-map.svg)",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "auto 82%",
                  }}
                >
                  <div className="flex w-[27%] shrink-0 flex-col">
                    <div className="flex-1 overflow-hidden rounded bg-slate-100 ring-1 ring-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/perro-cedula.png" alt="TOBY" className="h-full w-full object-cover" />
                    </div>
                    <p className="mt-1 text-[6.5px]">
                      <span className="text-slate-400">NUI.</span>{" "}
                      <span className="font-mono font-bold text-navy">985141002233417</span>
                    </p>
                  </div>
                  <div className="grid flex-1 content-start grid-cols-2 gap-x-3 gap-y-1">
                    <div className="col-span-2">
                      <CedField label="Nombre" value="TOBY" big />
                    </div>
                    <CedField label="Especie" value="Canina" />
                    <CedField label="Condición" value="Registrada" />
                    <CedField label="Sexo" value="Macho" />
                    <CedField label="Raza" value="Mestizo" />
                    <CedField label="Color" value="Café y blanco" />
                    <CedField label="Nacionalidad" value="Ecuatoriana" />
                    <CedField label="Nacimiento" value="15 MAR 2023" />
                    <CedField label="Esterilizado" value="Sí" />
                    <CedField label="No. Documento" value="0042" />
                    <CedField label="Microchip N.º" value="985141002233417" />
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 bg-white px-3 py-1.5">
                  <div>
                    <p className="text-[6px] font-medium uppercase tracking-wide text-slate-400">
                      Tutor responsable
                    </p>
                    <p className="text-[10px] font-bold text-slate-800">Andrés Vega</p>
                    <p className="text-[6px] text-slate-400">
                      Cédula: 0912345678 · Emisión 09 JUL 2026
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-4 w-6 rounded-sm bg-gradient-to-br from-amber-300 to-amber-500 ring-1 ring-amber-600/30" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={demoQr} alt="QR" className="h-11 w-11" />
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
