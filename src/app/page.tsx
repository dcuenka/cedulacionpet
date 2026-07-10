import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BRAND } from "@/lib/brand";
import { qrDataUrl } from "@/lib/qr";
import CedulaCard from "@/components/CedulaCard";

// Revalida el contador cada 60 s en producción (no queda congelado del build).
export const revalidate = 60;

export default async function HomePage() {
  let total = 0;
  try {
    total = await prisma.petRecord.count();
  } catch {
    total = 0;
  }

  // Cédula de muestra para la portada (datos ficticios).
  const demoQr = await qrDataUrl("985141002233417");
  const demoCedula = {
    registrationNo: "CP-2026-000042",
    certificateNo: "0042",
    microchip: "985141002233417",
    petName: "TOBY",
    species: "Canina",
    breed: "Mestizo",
    sex: "Macho",
    color: "Café y blanco",
    birthDate: new Date("2023-03-15"),
    sterilized: true,
    photoData: "/perro-cedula.png",
    ownerName: "Andrés Vega",
    ownerIdType: "Cédula",
    ownerId: "0912345678",
    city: "Guayaquil",
    province: "Guayas",
    status: "activo",
    createdAt: new Date("2026-07-09"),
  };

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

          {/* Imagen principal: cédula (diseño completo, datos ficticios) */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="cred-glow pointer-events-none absolute -inset-6 rounded-[36px] bg-ec-yellow/20 blur-3xl" />
            <div className="float-soft relative">
              <CedulaCard record={demoCedula} qr={demoQr} />
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
