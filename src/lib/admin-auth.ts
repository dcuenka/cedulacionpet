import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE = "cp_admin";

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || "insecure-dev-secret-change-me";
}

// Token = valor.firma(HMAC). No necesitamos usuarios, solo demostrar que se
// conoció la contraseña del panel.
function sign(value: string): string {
  const sig = createHmac("sha256", secret()).update(value).digest("hex");
  return `${value}.${sig}`;
}

function verify(token: string | undefined): boolean {
  if (!token) return false;
  const idx = token.lastIndexOf(".");
  if (idx < 0) return false;
  const value = token.slice(0, idx);
  const expected = sign(value);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function createAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, sign(`admin-${Date.now()}`), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 horas
  });
}

export async function destroyAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verify(jar.get(COOKIE)?.value);
}
