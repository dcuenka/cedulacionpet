import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-lib y qrcode se ejecutan solo en el servidor (rutas API).
  serverExternalPackages: ["pdf-lib", "qrcode"],
};

export default nextConfig;
