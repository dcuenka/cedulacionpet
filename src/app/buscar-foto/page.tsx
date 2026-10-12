import type { Metadata } from "next";
import Link from "next/link";
import BuscarFotoForm from "@/components/BuscarFotoForm";

export const metadata: Metadata = { title: "Buscar por foto" };

export default function BuscarFotoPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-2xl bg-navy p-6 text-white">
        <span className="text-3xl">🧬</span>
        <h1 className="mt-2 text-2xl font-black">Buscar una mascota por foto</h1>
        <p className="mt-1 text-sm text-white/70">
          ¿Encontraste una mascota? Súbele o tómale una foto y te mostramos las{" "}
          <strong className="text-white">coincidencias más parecidas</strong> entre las
          mascotas registradas. Confírmala visualmente y contacta a su tutor.
        </p>
      </div>

      <div className="mt-6">
        <BuscarFotoForm />
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        La búsqueda por parecido es una ayuda; la identidad oficial es el microchip o el QR.{" "}
        <Link href="/localizar" className="font-semibold text-teal hover:underline">
          Buscar por microchip o cédula del tutor
        </Link>
      </p>
    </div>
  );
}
