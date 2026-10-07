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
            </div>
            <p className="mt-6 text-sm text-white/50">
              <strong className="text-white">{total.toLocaleString("es-EC")}</strong> mascotas ya cuentan con su ficha e identificación.
            </p>
          </div>

          {/* Imagen principal: cédula (proporción real de cédula) + perro asomándose */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="cred-glow pointer-events-none absolute -inset-6 rounded-[36px] bg-ec-yellow/20 blur-3xl" />
            <div className="float-soft relative">
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
                      <img src="/perro-cedula.png" alt="SAMY" className="h-full w-full object-cover" />
                    </div>
                    <p className="mt-1 text-[6.5px]">
                      <span className="text-slate-400">NUI.</span>{" "}
                      <span className="font-mono font-bold text-navy">985141002233417</span>
                    </p>
                  </div>
                  <div className="grid flex-1 content-start grid-cols-2 gap-x-3 gap-y-1">
                    <div className="col-span-2">
                      <CedField label="Nombre" value="SAMY" big />
                    </div>
                    <CedField label="Especie" value="Canina" />
                    <CedField label="Condición" value="Registrada" />
                    <CedField label="Sexo" value="Hembra" />
                    <CedField label="Raza" value="Labrador" />
                    <CedField label="Color" value="Dorado" />
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

      {/* Carnet Digital (punto principal) */}
      <section className="bg-navy text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-teal-100">
              📱 Carnet Digital
            </span>
            <h2 className="mt-4 text-3xl font-black leading-tight md:text-4xl">
              El <span className="text-teal">carnet digital</span> de tu mascota, siempre a la mano
            </h2>
            <p className="mt-4 text-lg text-white/70">
              Además de la cédula física, cada mascota tiene su carnet digital: se abre al
              instante escaneando el <strong className="text-white">QR</strong> o ingresando
              su número, desde cualquier celular y sin instalar nada.
            </p>
            <ul className="mt-6 space-y-3 text-white/85">
              <li className="flex gap-3"><span className="font-black text-teal">✔</span> Identificación: foto, datos y microchip</li>
              <li className="flex gap-3"><span className="font-black text-teal">✔</span> Salud: vacunas y desparasitación con fechas</li>
              <li className="flex gap-3"><span className="font-black text-teal">✔</span> Contacto del tutor para recuperarla si se pierde</li>
              <li className="flex gap-3"><span className="font-black text-teal">✔</span> Accesible 24/7 desde el navegador</li>
            </ul>
            <Link
              href="/localizar"
              className="mt-8 inline-block rounded-lg bg-ec-yellow px-6 py-3 font-bold text-navy shadow-lg transition hover:brightness-95"
            >
              🔎 Consultar un carnet
            </Link>
          </div>

          {/* Mock del carnet en celular */}
          <div className="mx-auto w-full max-w-[260px]">
            <div className="rounded-[2rem] border-[6px] border-slate-800 bg-slate-800 shadow-2xl">
              <div className="overflow-hidden rounded-[1.6rem] bg-white text-navy">
                <div className="flex items-center gap-3 bg-navy p-4 text-white">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/perro-cedula.png" alt="SAMY" className="h-full w-full object-cover" />
                  </span>
                  <div>
                    <p className="text-lg font-black leading-none">SAMY</p>
                    <p className="text-[11px] text-white/70">Canina · Labrador</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 p-4 text-[11px]">
                  <div><p className="uppercase text-slate-400">Sexo</p><p className="font-bold">Hembra</p></div>
                  <div><p className="uppercase text-slate-400">Color</p><p className="font-bold">Dorado</p></div>
                  <div className="col-span-2"><p className="uppercase text-slate-400">Microchip</p><p className="font-mono font-bold">985141002233417</p></div>
                </div>
                <div className="border-t border-slate-100 bg-teal/5 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-teal">💉 Carnet de salud</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                    <div><p className="uppercase text-slate-400">Última vacuna</p><p className="font-bold">10 MAR 2026</p></div>
                    <div><p className="uppercase text-slate-400">Próxima</p><p className="font-bold">10 MAR 2027</p></div>
                    <div><p className="uppercase text-slate-400">Desparasitación</p><p className="font-bold">01 AGO 2026</p></div>
                    <div><p className="uppercase text-slate-400">Próxima</p><p className="font-bold">01 NOV 2026</p></div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 bg-navy p-3 text-[11px] font-semibold text-white">
                  📞 Contactar al tutor
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

      {/* Consulta pública */}
      <section className="mx-auto max-w-2xl px-4 pb-20">
        <div>
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
        </div>
      </section>
    </div>
  );
}
