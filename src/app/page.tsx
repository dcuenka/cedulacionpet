import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BRAND } from "@/lib/brand";
import CedulaCard from "@/components/CedulaCard";
import { qrDataUrl } from "@/lib/qr";

// Revalida el contador cada 60 s en producción (no queda congelado del build).
export const revalidate = 60;

export default async function HomePage() {
  // Cifra comercial: base de 20.000 + las mascotas reales registradas.
  let total = 0;
  try {
    total = await prisma.petRecord.count();
  } catch {
    total = 0;
  }
  const registered = 20000 + total;

  // QR de muestra para la cédula de la portada (datos ficticios).
  const demoQr = await qrDataUrl("985141002233417");

  // Mascota de muestra para la cédula de la portada.
  const demoPet = {
    registrationNo: "CP-2026-000042",
    certificateNo: "1375.19.239",
    petName: "TOMMY",
    species: "Canina",
    breed: "Shih Tzu",
    sex: "Macho",
    color: "Blanco/Gris",
    birthDate: new Date("2023-03-15"),
    microchip: "985141002233417",
    sterilized: true,
    photoData: "/tommy.jpg",
    ownerName: "Jennifer Itziar",
    ownerIdType: "Cédula",
    ownerId: "1753904059",
    city: "Quito",
    province: "Pichincha",
    status: "activo",
    createdAt: new Date("2026-07-09"),
  };

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
              <Link
                href="/solicitar"
                className="rounded-lg border border-white/40 px-6 py-3 font-bold text-white transition hover:bg-white/10"
              >
                📝 Solicitar el servicio
              </Link>
            </div>
            <p className="mt-6 text-sm text-white/50">
              <strong className="text-white">{registered.toLocaleString("es-EC")}+</strong> mascotas ya cuentan con su ficha e identificación.
            </p>
          </div>

          {/* Imagen principal: carnet de vacunas abierto (tipo libro) */}
          <div className="relative mx-auto w-full max-w-[620px]">
            <div className="cred-glow pointer-events-none absolute -inset-10 rounded-[48px] bg-ec-yellow/25 blur-3xl" />
            <div className="float-soft grid grid-cols-[1.75fr_1fr] rounded-lg ring-1 ring-[#6b1f29]/30 shadow-[0_45px_90px_-25px_rgba(0,0,0,0.65)] [perspective:2200px]">
              {/* Página izquierda: tabla de vacunación */}
              <div className="book-open-left relative rounded-l-lg bg-[#f3ead9] p-5 text-left [box-shadow:inset_-28px_0_46px_-26px_rgba(90,40,20,0.6)]">
                <p className="text-center text-[15px] font-black uppercase tracking-widest text-[#6b1f29]">
                  Vacunación
                </p>
                <div className="mt-4 overflow-hidden rounded border border-[#c9b79a]">
                  <div className="grid grid-cols-[0.95fr_1.3fr_0.7fr_1fr] bg-[#6b1f29] text-[9px] font-bold uppercase tracking-wide text-[#f3ead9]">
                    <span className="px-1.5 py-2.5">Fecha</span>
                    <span className="border-l border-[#f3ead9]/30 px-1.5 py-2.5">Vacuna</span>
                    <span className="border-l border-[#f3ead9]/30 px-1.5 py-2.5">Peso</span>
                    <span className="border-l border-[#f3ead9]/30 px-1.5 py-2.5">Firma M.V.</span>
                  </div>
                  {[
                    { f: "06/10/2026", v: "Antirrábica", p: "5 kg" },
                    { f: "06/10/2026", v: "Óctuple", p: "5 kg" },
                    { f: "06/10/2027", v: "Refuerzo", p: "—" },
                    { f: "", v: "", p: "" },
                    { f: "", v: "", p: "" },
                  ].map((r, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[0.95fr_1.3fr_0.7fr_1fr] border-t border-[#c9b79a] text-[10px] text-[#5a4631]"
                    >
                      <span className="px-1.5 py-3 font-semibold">{r.f || "D/M/A"}</span>
                      <span className="border-l border-[#c9b79a] px-1.5 py-3">{r.v}</span>
                      <span className="border-l border-[#c9b79a] px-1.5 py-3">{r.p}</span>
                      <span className="border-l border-[#c9b79a] px-1.5 py-3" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Página derecha: "Mis viajes por Ecuador" — girada como si se cerrara */}
              <div className="relative flex origin-left flex-col rounded-r-lg bg-[#f6efe2] p-3 text-center [box-shadow:inset_28px_0_46px_-26px_rgba(90,40,20,0.6)] [transform:rotateY(-52deg)]">
                <p className="text-sm font-black italic leading-tight text-[#6b1f29]">Mis viajes por Ecuador</p>
                <div
                  className="mx-auto mt-1 h-32 w-full flex-1"
                  style={{
                    backgroundImage: "url(/ecuador-map.svg)",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "contain",
                  }}
                />
                <div className="mt-1 flex items-center justify-center gap-2 text-[8px] text-[#5a4631]">
                  <span>❤ Mi hogar</span>
                  <span>📍 Visitados</span>
                </div>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <p className="text-[9px] font-bold leading-tight text-[#6b1f29]">¿Dudas?</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={demoQr} alt="QR" className="h-12 w-12 rounded-sm" />
                </div>
                {/* Sombra de pliegue (borde que se cierra) */}
                <div className="pointer-events-none absolute inset-0 rounded-r-lg bg-gradient-to-l from-black/30 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cédula física (complemento) */}
      <section className="relative overflow-hidden border-b border-black/5 bg-gradient-to-b from-[#e8eff9] via-[#eef3fb] to-white">
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-10 px-4 py-16 md:flex-row">
          {/* Cédula de muestra (misma estructura que la del tutor) */}
          <div className="relative w-full max-w-[450px] shrink-0">
            <div className="pointer-events-none absolute -inset-5 rounded-[36px] bg-ec-yellow/25 blur-2xl" />
            <div className="float-soft relative">
              <CedulaCard record={demoPet} qr={demoQr} />
            </div>
          </div>

          {/* Resumen de la cédula digital */}
          <div>
            <h2 className="text-3xl font-black text-navy">Y su cédula digital</h2>
            <p className="mt-3 text-lg text-slate-600">
              Cada mascota tiene su{" "}
              <strong className="text-navy">Cédula de Identidad Animal</strong> digital: foto oficial,
              número de microchip y un código QR de verificación, siempre a la mano en el celular.
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
