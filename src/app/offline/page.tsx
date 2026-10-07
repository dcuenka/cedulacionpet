import Link from "next/link";
import Paw from "@/components/Paw";
import { BRAND } from "@/lib/brand";

export const metadata = { title: "Sin conexión" };

export default function OfflinePage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-navy ring-4 ring-ec-yellow/60">
        <Paw className="h-9 w-9 text-ec-yellow" />
      </span>
      <h1 className="mt-6 text-2xl font-black text-navy">Sin conexión</h1>
      <p className="mt-2 text-slate-600">
        No pudimos conectarnos a {BRAND.name}. Revisa tu conexión a internet e
        inténtalo de nuevo. La consulta de mascotas necesita conexión para
        mostrar datos actualizados.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-ec-yellow px-6 py-3 font-semibold text-navy transition hover:brightness-95"
      >
        Reintentar
      </Link>
    </div>
  );
}
