// Identidad de marca del proyecto.
export const BRAND = {
  name: "Cedulación Pet",
  shortName: "Cedulación Pet",
  tagline: "Registro Nacional de Mascotas del Ecuador",
  authority: "Sistema Nacional de Identificación y Registro de Mascotas",
  prefix: "CP", // prefijo del número de ficha interno: CP-2026-000123
  emailSupport: "registro@cedulacionpet.ec",
} as const;

export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}
