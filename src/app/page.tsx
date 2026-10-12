import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BRAND } from "@/lib/brand";
import CedulaCard from "@/components/CedulaCard";
import ShareApp from "@/components/ShareApp";
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
              La <span className="text-ec-yellow">cédula</span> y el{" "}
              <span className="text-ec-yellow">carnet digital</span> de tu mascota
            </h1>
            <p className="mt-4 max-w-lg text-lg text-white/70">
              Le damos su <strong className="text-white">cédula digital</strong>, su{" "}
              <strong className="text-white">carnet de salud</strong> y un{" "}
              <strong className="text-white">código QR</strong> para identificarla,
              recuperarla si se pierde y llevar sus vacunas al día — todo desde el
              celular, sin instalar nada.
            </p>
            <ul className="mt-6 space-y-2 text-white/85">
              <li className="flex gap-3"><span className="font-black text-ec-yellow">✔</span> Cédula digital con foto, datos y QR de verificación</li>
              <li className="flex gap-3"><span className="font-black text-ec-yellow">✔</span> Carnet de salud: vacunas y desparasitación, siempre actualizado</li>
              <li className="flex gap-3"><span className="font-black text-ec-yellow">✔</span> Si se pierde, quien la encuentre contacta al tutor al instante</li>
              <li className="flex gap-3"><span className="font-black text-ec-yellow">✔</span> <strong className="text-white">Con o sin microchip</strong> — el microchip es opcional</li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/solicitar"
                className="rounded-lg bg-ec-yellow px-6 py-3 font-bold text-navy shadow-lg transition hover:brightness-95"
              >
                📝 Solicitar el servicio
              </Link>
              <Link
                href="/localizar"
                className="rounded-lg border border-white/40 px-6 py-3 font-bold text-white transition hover:bg-white/10"
              >
                🔎 Consultar mascota
              </Link>
            </div>
            <p className="mt-5 text-sm text-white/60">
              ⏱ Aprobación en máximo 24 horas · 🇪🇨 En todo el Ecuador
            </p>
            <p className="mt-2 text-sm text-white/50">
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

        {/* Compartir la app (al final de la presentación) */}
        <div className="relative mx-auto max-w-6xl px-4 pb-14 text-center">
          <p className="mb-3 text-sm text-white/70">
            ¿Te gusta? Comparte {BRAND.name} e invita a otros tutores a identificar a su mascota.
          </p>
          <ShareApp className="justify-center" />
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
            <h2 className="text-3xl font-black text-navy">Su cédula digital</h2>
            <p className="mt-3 text-lg text-slate-600">
              Cada mascota tiene su{" "}
              <strong className="text-navy">Cédula de Identidad Animal</strong> digital: foto,
              datos y un código QR de verificación, siempre a la mano en el celular. El{" "}
              <strong className="text-navy">microchip es opcional</strong>: se incluye su número solo si lo tiene.
            </p>
            <p className="mt-4 text-base font-semibold text-slate-500">
              📷 Foto · ▣ QR de verificación · 🔖 Microchip (opcional)
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
              t: "Solicitas el servicio",
              d: "Llenas la ficha con los datos de tu mascota y los tuyos; puedes adjuntar su foto y su carnet de vacunas. Aprobación en máximo 24 horas.",
            },
            {
              n: "2",
              t: "Recibe su identidad digital",
              d: "Le entregamos su cédula digital, su carnet de salud y el código QR. Si lo deseas, también implantamos un microchip (opcional).",
            },
            {
              n: "3",
              t: "Siempre al día y protegida",
              d: "Actualizas sus vacunas y datos cuando quieras y, si se pierde, quien la encuentre escanea el QR y te contacta al instante.",
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

      {/* Cierre comercial: contratar el servicio */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="flag-bar" />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h2 className="text-3xl font-black md:text-4xl">
            Dale a tu mascota su <span className="text-ec-yellow">identidad digital</span> hoy
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Cédula digital, carnet de salud y código QR — con o sin microchip.
            En todo el Ecuador, con aprobación en máximo 24 horas.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/solicitar"
              className="rounded-lg bg-ec-yellow px-7 py-3.5 font-bold text-navy shadow-lg transition hover:brightness-95"
            >
              📝 Solicitar el servicio
            </Link>
          </div>
        </div>
      </section>

      {/* Consulta pública (buscador) */}
      <section className="mx-auto max-w-2xl px-4 py-14">
        <div className="rounded-2xl border border-black/5 bg-white p-6 text-center shadow-sm">
          <h3 className="text-base font-bold text-navy">
            🔎 ¿Encontraste una mascota o quieres verificar una ficha?
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">
            Consulta por cédula del tutor, número de microchip o escaneando el código QR.
          </p>
          <Link
            href="/localizar"
            className="mt-4 inline-block rounded-lg border border-slate-300 px-6 py-2.5 font-semibold text-navy transition hover:bg-slate-50"
          >
            Consultar mascota
          </Link>
        </div>
      </section>
    </div>
  );
}
