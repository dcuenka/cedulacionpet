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
      <p className="text-[8px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`font-bold leading-tight text-slate-800 ${big ? "text-[22px]" : "text-[12px]"}`}>
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
      {/* Hero: carnet digital (principal) */}
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
              El <span className="text-ec-yellow">carnet digital</span> e identificación de tu mascota, siempre contigo
            </h1>
            <p className="mt-4 max-w-lg text-lg text-white/70">
              Registramos la ficha de tu mascota, implantamos un{" "}
              <strong className="text-white">microchip</strong> y le damos su{" "}
              <strong className="text-white">carnet digital</strong>: se abre al instante
              escaneando el <strong className="text-white">QR</strong> o ingresando su número,
              desde cualquier celular y sin instalar nada.
            </p>
            <ul className="mt-6 space-y-2 text-white/85">
              <li className="flex gap-3"><span className="font-black text-ec-yellow">✔</span> Identificación: foto, datos y microchip</li>
              <li className="flex gap-3"><span className="font-black text-ec-yellow">✔</span> Salud: vacunas y desparasitación con fechas</li>
              <li className="flex gap-3"><span className="font-black text-ec-yellow">✔</span> Contacto del tutor para recuperarla si se pierde</li>
              <li className="flex gap-3"><span className="font-black text-ec-yellow">✔</span> Accesible 24/7 desde el navegador</li>
            </ul>
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

          {/* Imagen principal: carnet de vacunas abierto (tipo libro) */}
          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="cred-glow pointer-events-none absolute -inset-8 rounded-[40px] bg-ec-yellow/20 blur-3xl" />
            <div className="float-soft grid grid-cols-2 rounded-md ring-1 ring-[#6b1f29]/30 shadow-[0_40px_80px_-25px_rgba(0,0,0,0.6)] [perspective:1800px]">
              {/* Página izquierda: tabla de vacunación */}
              <div className="book-open-left relative rounded-l-md bg-[#f3ead9] p-4 text-left [box-shadow:inset_-24px_0_40px_-24px_rgba(90,40,20,0.6)]">
                <p className="text-center text-[11px] font-black uppercase tracking-widest text-[#6b1f29]">
                  Vacunación
                </p>
                <div className="mt-3 overflow-hidden rounded-sm border border-[#c9b79a]">
                  <div className="grid grid-cols-[1fr_1.3fr_1fr] bg-[#6b1f29] text-[8px] font-bold uppercase tracking-wide text-[#f3ead9]">
                    <span className="px-2 py-1.5">Fecha</span>
                    <span className="border-l border-[#f3ead9]/30 px-2 py-1.5">Vacuna</span>
                    <span className="border-l border-[#f3ead9]/30 px-2 py-1.5">Firma M.V.</span>
                  </div>
                  {[
                    { f: "06/10/2026", v: "Antirrábica" },
                    { f: "06/10/2026", v: "Óctuple" },
                    { f: "06/10/2027", v: "Refuerzo" },
                    { f: "", v: "" },
                    { f: "", v: "" },
                  ].map((r, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_1.3fr_1fr] border-t border-[#c9b79a] text-[9px] text-[#5a4631]"
                    >
                      <span className="px-2 py-2.5 font-semibold">{r.f || "D/M/A"}</span>
                      <span className="border-l border-[#c9b79a] px-2 py-2.5">{r.v}</span>
                      <span className="border-l border-[#c9b79a] px-2 py-2.5" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Página derecha: mapa "Mis viajes por Ecuador" + QR */}
              <div className="book-open-right relative rounded-r-md bg-[#f6efe2] p-4 text-center [box-shadow:inset_24px_0_40px_-24px_rgba(90,40,20,0.6)]">
                <p className="text-lg font-black italic text-[#6b1f29]">Mis viajes por Ecuador</p>
                <div
                  className="mx-auto mt-1 h-36 w-full"
                  style={{
                    backgroundImage: "url(/ecuador-map.svg)",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "contain",
                  }}
                />
                <div className="mt-1 flex items-center justify-center gap-3 text-[8px] text-[#5a4631]">
                  <span>❤ Mi hogar</span>
                  <span>📍 Visitados</span>
                  <span>⭐ Por ir</span>
                </div>
                <div className="mt-3 flex items-center justify-center gap-3">
                  <div className="text-left">
                    <p className="text-[9px] font-bold text-[#6b1f29]">¿Tienes alguna duda?</p>
                    <p className="text-[8px] text-[#5a4631]">Escríbenos y te ayudamos</p>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={demoQr} alt="QR" className="h-14 w-14 rounded-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cédula física (complemento) */}
      <section className="relative overflow-hidden border-b border-black/5 bg-gradient-to-b from-[#e8eff9] via-[#eef3fb] to-white">
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-10 px-4 py-16 md:flex-row">
          {/* Cédula de muestra (ampliada y con resplandor) */}
          <div className="relative w-full max-w-[440px] shrink-0">
            <div className="pointer-events-none absolute -inset-5 rounded-[36px] bg-ec-yellow/25 blur-2xl" />
            <div className="float-soft relative flex flex-col overflow-hidden rounded-2xl bg-white text-navy shadow-2xl ring-1 ring-black/10">
              <div className="flex items-center gap-2.5 px-4 pt-3">
                <span className="flex h-6 w-9 flex-col overflow-hidden rounded-[3px] ring-1 ring-black/10">
                  <span className="h-1/2 bg-ec-yellow" />
                  <span className="h-1/4 bg-ec-blue" />
                  <span className="h-1/4 bg-ec-red" />
                </span>
                <div>
                  <p className="text-[14px] font-black uppercase leading-none tracking-wide">
                    Cédula de Identidad Animal
                  </p>
                  <p className="mt-0.5 text-[8px] uppercase tracking-widest text-slate-400">
                    {BRAND.name} · {BRAND.tagline}
                  </p>
                </div>
              </div>
              <div className="mt-2 flag-bar" />
              <div
                className="flex flex-1 gap-4 bg-[#f8fbfc] px-4 py-4"
                style={{
                  backgroundImage: "url(/ecuador-map.svg)",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundSize: "auto 82%",
                }}
              >
                <div className="flex w-[30%] shrink-0 flex-col">
                  <div className="aspect-[3/4] overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/perro-cedula.png" alt="SAMY" className="h-full w-full object-cover" />
                  </div>
                  <p className="mt-1.5 text-[9px]">
                    <span className="text-slate-400">NUI.</span>{" "}
                    <span className="font-mono font-bold text-navy">985141002233417</span>
                  </p>
                </div>
                <div className="grid flex-1 content-start grid-cols-2 gap-x-4 gap-y-2">
                  <div className="col-span-2">
                    <CedField label="Nombre" value="SAMY" big />
                  </div>
                  <CedField label="Especie" value="Canina" />
                  <CedField label="Sexo" value="Hembra" />
                  <CedField label="Raza" value="Labrador" />
                  <CedField label="Color" value="Dorado" />
                  <CedField label="Nacimiento" value="15 MAR 2023" />
                  <CedField label="Esterilizado" value="Sí" />
                  <div className="col-span-2">
                    <CedField label="Microchip N.º" value="985141002233417" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-3">
                <div>
                  <p className="text-[8px] font-medium uppercase tracking-wide text-slate-400">
                    Tutor responsable
                  </p>
                  <p className="text-[13px] font-bold text-slate-800">Andrés Vega</p>
                  <p className="text-[8px] text-slate-400">Cédula: 0912345678</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-6 w-9 rounded-sm bg-gradient-to-br from-amber-300 to-amber-500 ring-1 ring-amber-600/30" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={demoQr} alt="QR" className="h-16 w-16" />
                </div>
              </div>
            </div>
          </div>

          {/* Resumen de la cédula física */}
          <div>
            <h2 className="text-3xl font-black text-navy">Y su cédula de identidad física</h2>
            <p className="mt-3 text-lg text-slate-600">
              Junto al carnet entregamos impresa la{" "}
              <strong className="text-navy">Cédula de Identidad Animal</strong>: foto oficial,
              número de microchip y el mismo código QR que abre el carnet digital.
            </p>
            <p className="mt-4 text-base font-semibold text-slate-500">
              📷 Foto oficial · 🔖 Microchip N.º · ▣ QR de verificación
            </p>
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
              t: "Microchip, cédula y carnet",
              d: "Implantamos el microchip, leemos su número de serie y lo registramos. Entregamos la cédula física, el carnet de salud y el código QR.",
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
