import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import Paw from "@/components/Paw";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} · ${BRAND.tagline}`,
    template: `%s · ${BRAND.name}`,
  },
  description: `${BRAND.tagline}. Identifica y registra a tu mascota con cédula oficial y código QR de verificación.`,
};

function Header() {
  return (
    <header className="no-print sticky top-0 z-30">
      {/* Barra tricolor del Ecuador */}
      <div className="flag-bar" />
      <div className="border-b border-white/10 bg-navy text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-2 ring-ec-yellow/70">
              <Paw className="h-6 w-6 text-ec-yellow" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-black uppercase tracking-wide">
                {BRAND.name}
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-white/60">
                {BRAND.tagline}
              </span>
            </span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/admin"
              className="rounded-md px-3 py-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              Acceso administrador
            </Link>
            <Link
              href="/localizar"
              className="rounded-md bg-ec-yellow px-4 py-2 font-semibold text-navy transition hover:brightness-95"
            >
              Consultar mascota
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="no-print border-t border-black/5 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy">
            <Paw className="h-5 w-5 text-ec-yellow" />
          </span>
          <div>
            <p className="font-black uppercase tracking-wide text-navy">{BRAND.name}</p>
            <p className="text-xs">{BRAND.authority}</p>
          </div>
        </div>
        <div className="flex gap-4 text-xs">
          <Link href="/localizar" className="hover:text-teal">
            Consultar mascota
          </Link>
          <Link href="/admin" className="hover:text-teal">
            Acceso administrador
          </Link>
        </div>
      </div>
      <div className="flag-bar" />
      <div className="bg-navy py-3 text-center text-[11px] text-white/70">
        © {new Date().getFullYear()} {BRAND.name} · {BRAND.tagline}
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
